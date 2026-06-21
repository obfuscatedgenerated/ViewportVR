let pc: RTCPeerConnection | null;
let iceCandidateQueue: RTCIceCandidateInit[] | null;
let stream: MediaStream | null = null;

// Listen for the stream ID from background
chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg.target !== "offscreen") return;

    if (msg.type === "START_STREAM") {
        if (pc) {
            pc.close();
        }
        if (stream) {
            stream.getTracks().forEach((t) => t.stop());
        }

        pc = new RTCPeerConnection();
        iceCandidateQueue = [];

        stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: "tab",
                    chromeMediaSourceId: msg.streamId
                }
            }
        });

        // use webrtc to send the stream to the cs
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                chrome.runtime.sendMessage({
                    type: "VVR_STREAM_CANDIDATE",
                    target: "cs",
                    candidate: e.candidate
                });
            }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        chrome.runtime.sendMessage({
            type: "VVR_STREAM_OFFER",
            offer,
            target: "cs"
        });
    }

    // handle answer from the content script
    if (msg.type === "VVR_STREAM_ANSWER") {
        console.log("Received answer from content script", msg.answer);
        await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));

        // Drain the queue now that the remote description is set
        while (iceCandidateQueue.length > 0) {
            pc.addIceCandidate(new RTCIceCandidate(iceCandidateQueue.shift()));
        }
    }

    // 3. Handle the CANDIDATE from Content Script
    if (msg.type === "VVR_STREAM_CANDIDATE") {
        console.log(
            "Received ICE candidate from content script",
            msg.candidate
        );

        // Only add if we have an answer applied, otherwise queue it
        if (pc.remoteDescription && pc.remoteDescription.type) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            } catch (e) {
                console.error("Error adding remote ICE candidate", e);
            }
        } else {
            iceCandidateQueue.push(msg.candidate);
        }
    }
});