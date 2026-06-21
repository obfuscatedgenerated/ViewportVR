import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import { useEffect, useRef, useState } from "react";



import { Storage } from "@plasmohq/storage";






import "~shared.css";



import type { PlasmoGetStyle } from "plasmo";



import { DOMMirror } from "~components/DOMMirror";
import { SpectatorCamera } from "~components/SpectatorCamera";





const storage = new Storage();

export const config = { matches: ["<all_urls>"], all_frames: true };

export const getStyle: PlasmoGetStyle = () => {
    const style = document.createElement("style");
    style.textContent = `
    :host {
        pointer-events: none;
    }
  `;
    return style;
};

const xrStore = createXRStore({});

const VREnvironment = () => {
    const [isSticky, setIsSticky] = useState(false);
    const [mount_mirror, setMountMirror] = useState(false);
    const canvas_ref = useRef(null);

    const streamToPopup = async () => {
        console.log("Spectator stream requested, starting WebRTC connection...");

        if (!canvas_ref.current) {
            console.error("Canvas ref is not available.");
            return;
        }

        // 1. Capture the 3D scene at 60fps
        const stream = canvas_ref.current.captureStream(60);

        // 2. Setup WebRTC specifically for the Spectator window
        const pc = new RTCPeerConnection();
        const iceCandidateQueue: RTCIceCandidateInit[] = [];

        // Add the canvas video track to the connection
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                chrome.runtime.sendMessage({
                    target: "spectator",
                    type: "VVR_SPECTATOR_CANDIDATE",
                    candidate: event.candidate
                });
            }
        };

        // Listen for the answer and candidates from the Popup window
        const handleMessage = async (msg: any) => {
            if (msg.target !== "cs") return;

            if (msg.type === "VVR_SPECTATOR_ANSWER") {
                await pc.setRemoteDescription(
                    new RTCSessionDescription(msg.answer)
                );
                while (iceCandidateQueue.length > 0) {
                    pc.addIceCandidate(
                        new RTCIceCandidate(iceCandidateQueue.shift()!)
                    );
                }
            } else if (msg.type === "VVR_SPECTATOR_CANDIDATE") {
                if (pc.remoteDescription && pc.remoteDescription.type) {
                    pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
                } else {
                    iceCandidateQueue.push(msg.candidate);
                }
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);

        // 3. Create the offer and send it to the popup
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        chrome.runtime.sendMessage({
            target: "spectator",
            type: "VVR_SPECTATOR_OFFER",
            offer
        });

        console.log("Streaming to popup offerred");
    };

    const enterVR = async () => {
        try {
            xrStore.enterVR();

            await storage.set("isInVRSession", true);

            setIsSticky(false); // Hide the resume button once active
            console.log("XR Session Started");

            setMountMirror(true); // Mount the DOMMirror component and therefore start the stream now interaciton is captured
        } catch (e) {
            console.error("Failed to enter VR:", e);
        }
    };

    // Also listen to the store's session state to clean up your extension flags when exiting VR
    useEffect(() => {
        // You can subscribe to changes in the XR store state
        const unsub = xrStore.subscribe((state) => {
            // If we were visible, but the active session is now null, the user exited VR
            if (!state.session) {
                storage.set("isInVRSession", false);
            }
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        // 1. Determine if we should show the "Resume" prompt
        const checkStickySession = async () => {
            const wasInVR = await storage.get("isInVRSession");
            if (wasInVR) {
                setIsSticky(true);
            }
        };
        checkStickySession();

        // 2. Listen for the Context Menu message
        const handleMessage = (message: any) => {
            console.log("Received message in content script:", message);
            if (message.action === "VVR_ACTIVATE") {
                setIsSticky(false);
                enterVR();
            } else if (message.action === "VVR_START_SPECTATE") {
                streamToPopup();
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, []);

    return (
        <>
            {/* Only show the button if we are in the 'Resume' state */}
            {isSticky && (
                <button
                    onClick={enterVR}
                    style={{
                        pointerEvents: "auto",
                        position: "absolute",
                        top: "20px",
                        left: "20px",
                        padding: "10px",
                        zIndex: 100
                    }}>
                    Resume Spatial Session
                </button>
            )}
            <div
                //className="hidden" why isnt tialwind working, whatever
                style={{
                    visibility: "hidden"
                }}>
                <Canvas style={{ pointerEvents: "auto" }} ref={canvas_ref} gl={{ preserveDrawingBuffer: true }}>
                    <XR store={xrStore}>
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} />
                        {mount_mirror && <DOMMirror position={[0, 1.5, -2]} /> }
                        <SpectatorCamera />
                    </XR>
                </Canvas>
            </div>
        </>
    );
};

export default VREnvironment;
