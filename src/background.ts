import OFFSCREEN_URL from "url:~/src/offscreen.html";





chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "launch-viewportvr",
        title: "Launch ViewportVR",
        contexts: ["all"],
        documentUrlPatterns: ["<all_urls>"]
    });
});
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "launch-viewportvr") {
        chrome.tabs.sendMessage(tab.id, { action: "VVR_ACTIVATE" });
    }
});

// relay messages between offscreen and content script
chrome.runtime.onMessage.addListener(async (msg, sender) => {
    console.log(msg.target, sender.url);

    if (msg.action === "VVR_START_STREAM") {
        if (!(await chrome.offscreen.hasDocument())) {
            await chrome.offscreen.createDocument({
                url: OFFSCREEN_URL,
                reasons: [chrome.offscreen.Reason.USER_MEDIA],
                justification: "Capturing tab for VR streaming"
            });
        }

        // get privileged stream id
        chrome.tabCapture.getMediaStreamId(
            { targetTabId: sender.tab.id },
            (streamId) => {
                chrome.runtime.sendMessage({
                    target: "offscreen",
                    type: "START_STREAM",
                    streamId
                });
            }
        );
    }

    if (msg.target === "cs" && sender.url?.includes("offscreen")) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, msg);
            }
        });
    }

    if (msg.target === "offscreen" && !sender.url?.includes("offscreen")) {
        chrome.runtime.sendMessage(msg);
    }
});
