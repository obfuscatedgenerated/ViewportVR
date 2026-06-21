import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export const DOMMirror = () => {
    const videoRef = useRef(document.createElement("video"));

    // Create the texture once and memoize it
    const texture = useMemo(() => {
        const video = videoRef.current;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        return new THREE.VideoTexture(video);
    }, []);

    useEffect(() => {
        // recieve and send VVR_STREAM_OFFER and VVR_STREAM_CANDIDATE messages to facilitate WebRTC connection for the video stream
        const pc = new RTCPeerConnection();
        const iceCandidateQueue = [];

        pc.ontrack = (event) => {
            console.log("Received track from offscreen", event.streams[0]);

            const video = videoRef.current;
            video.srcObject = event.streams[0];
            video.play();
        }

        const handleMessage = async (msg) => {
            if (msg.target !== "cs") return;

            if (msg.type === "VVR_STREAM_OFFER") {
                console.log("Received offer from offscreen", msg.offer);
                // After setRemoteDescription, process the queue
                await pc.setRemoteDescription(
                    new RTCSessionDescription(msg.offer)
                );
                console.log(
                    "Remote description set. Signaling state:",
                    pc.signalingState
                );

                while (iceCandidateQueue.length > 0) {
                    pc.addIceCandidate(iceCandidateQueue.shift());
                }

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                console.log(
                    "Local description set. Signaling state:",
                    pc.signalingState
                );
                chrome.runtime.sendMessage({
                    type: "VVR_STREAM_ANSWER",
                    answer,
                    target: "offscreen"
                });
            } else if (msg.type === "VVR_STREAM_CANDIDATE") {
                const candidate = new RTCIceCandidate(msg.candidate);
                // Only add candidate if remote description is set
                if (pc.remoteDescription && pc.remoteDescription.type) {
                    pc.addIceCandidate(candidate);
                } else {
                    iceCandidateQueue.push(candidate);
                }
            }
        };

        // be sure to send our own candidates to the offscreen script
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                chrome.runtime.sendMessage({ type: "VVR_STREAM_CANDIDATE", candidate: event.candidate, target: "offscreen" });
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);

        // tell the background script that we are ready to receive the offer
        chrome.runtime.sendMessage({ action: "VVR_START_STREAM" });

        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
            pc.close();
        };
    }, []);

    return (
        <mesh>
            <planeGeometry args={[16, 9]} />
            <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
    );
};
