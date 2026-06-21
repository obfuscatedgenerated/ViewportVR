// This runs inside the popup window and receives the 3D canvas stream
const videoElement = document.getElementById(
    "spectator-video"
) as HTMLVideoElement;


let pc = new RTCPeerConnection();
let iceCandidateQueue: RTCIceCandidateInit[] = [];

pc.ontrack = (event) => {
    console.log("Popup received stream from Content Script!");
    videoElement.srcObject = event.streams[0];
};

pc.onicecandidate = (event) => {
    if (event.candidate) {
        console.log(event.candidate);
        chrome.runtime.sendMessage({
            target: "cs", // Send candidates back to the content script
            type: "VVR_SPECTATOR_CANDIDATE",
            candidate: event.candidate
        });
    }
};

chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg.target !== "spectator") return;

    console.log("Popup received message", msg);

    if (msg.type === "VVR_SPECTATOR_OFFER") {
        console.log("Popup received offer");
        await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));

        while (iceCandidateQueue.length > 0) {
            pc.addIceCandidate(new RTCIceCandidate(iceCandidateQueue.shift()!));
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        chrome.runtime.sendMessage({
            target: "cs",
            type: "VVR_SPECTATOR_ANSWER",
            answer
        });
    }

    if (msg.type === "VVR_SPECTATOR_CANDIDATE") {
        if (pc.remoteDescription && pc.remoteDescription.type) {
            pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
        } else {
            iceCandidateQueue.push(msg.candidate);
        }
    }
});


// we are ready
chrome.runtime.sendMessage({
    target: "cs",
    action: "VVR_START_SPECTATE"
});
