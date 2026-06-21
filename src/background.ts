import OFFSCREEN_URL from "url:~/src/offscreen.html";
import SPECTATOR_URL from "url:~/src/spectator.html";


// Replace your onInstalled listener with this development-friendly version:
chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create(
        {
            id: "launch-viewportvr",
            title: "Launch ViewportVR",
            contexts: ["all"],
            documentUrlPatterns: ["<all_urls>"]
        },
        () => {
            // Catch any errors silently if Chrome complains about duplicates
            if (chrome.runtime.lastError) {
            }
        }
    );
});

let activeStreamTabId: number | null = null;
let creatingOffscreen: Promise<void> | null = null;

// THE FIX: Store a Promise instead of a raw string
let streamIdPromise: Promise<string> | null = null;

async function ensureOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    if (creatingOffscreen) {
        await creatingOffscreen;
        return;
    }
    creatingOffscreen = chrome.offscreen.createDocument({
        url: OFFSCREEN_URL,
        reasons: [chrome.offscreen.Reason.USER_MEDIA],
        justification: "Capturing tab for VR streaming"
    });
    await creatingOffscreen;
    creatingOffscreen = null;
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "launch-viewportvr" && tab?.id) {
        activeStreamTabId = tab.id;

        // 1. Create a Promise that resolves when tabCapture is done
        streamIdPromise = new Promise((resolve, reject) => {
            chrome.tabCapture.getMediaStreamId(
                { targetTabId: tab.id },
                (streamId) => {
                    if (chrome.runtime.lastError || !streamId) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(streamId);
                    }
                }
            );
        });

        chrome.windows.create({
            url: SPECTATOR_URL,
            type: "popup",
            width: 800,
            height: 600
        });

        // Tell the content script to mount React
        chrome.tabs.sendMessage(tab.id, { action: "VVR_ACTIVATE" });
    }
});

// resolve offscreen and background urls to safe ones (converting ../ to actual back steps) for comparison
const REAL_OFFSCREEN_URL = new URL(OFFSCREEN_URL, location.href).href;
const REAL_SPECTATOR_URL = new URL(SPECTATOR_URL, location.href).href;

chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.action === "VVR_START_STREAM") {
        if (!streamIdPromise) {
            console.error(
                "No stream ID Promise exists! Launch via Context Menu."
            );
            return;
        }

        // 2. Capture the Promise locally and clear the global one
        const currentPromise = streamIdPromise;
        streamIdPromise = null;

        // 3. Wait for BOTH the stream token and the offscreen document
        Promise.all([currentPromise, ensureOffscreen()])
            .then(([streamId]) => {
                chrome.runtime.sendMessage({
                    target: "offscreen",
                    type: "START_STREAM",
                    streamId: streamId
                });
            })
            .catch((error) => {
                console.error("Stream initialization failed:", error);
            });

        return true;
    }

    console.table([msg, sender.url])

    let dropped = true;

    // Explicitly route to the requesting tab
    if (msg.target === "cs" && (sender.url === REAL_OFFSCREEN_URL || sender.url === REAL_SPECTATOR_URL)) {
        if (activeStreamTabId) {
            chrome.tabs.sendMessage(activeStreamTabId, msg);
            dropped = false;
        }
    }

    if ((msg.target === "offscreen" && sender.url !== REAL_OFFSCREEN_URL) || (msg.target === "spectator" && sender.url !== REAL_SPECTATOR_URL)) {
        chrome.runtime.sendMessage(msg);
        dropped = false;
    }

    if (dropped) {
        console.warn("Dropped message:", msg, "from sender:", sender.url);
    }
});
