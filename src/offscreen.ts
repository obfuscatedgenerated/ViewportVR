const pc = new RTCPeerConnection();

// Listen for the stream ID from background
chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg.target !== "offscreen") return;

    if (msg.type === "START_STREAM") {
        const stream = await navigator.mediaDevices.getUserMedia({
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
    }

    // 3. Handle the CANDIDATE from Content Script
    if (msg.type === "VVR_STREAM_CANDIDATE") {
        console.log("Received ICE candidate from content script", msg.candidate);
        try {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
        } catch (e) {
            console.error("Error adding remote ICE candidate", e);
        }
    }
});