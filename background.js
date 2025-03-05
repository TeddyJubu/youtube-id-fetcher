// background.js
let currentVideoId = null;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "VIDEO_ID") {
        currentVideoId = message.videoId;
        console.log("Video ID stored:", currentVideoId);
    } else if (message.type === "OPEN_POPUP") {
        // Chrome doesn't allow programmatic popup opening directly
        // The popup will fetch the ID when opened
        console.log("Popup requested, ID ready:", currentVideoId);
    } else if (message.type === "GET_VIDEO_ID") {
        sendResponse({ videoId: currentVideoId });
    }
    return true; // Keeps the message channel open for async response
});

// Log when extension is clicked (optional)
chrome.action.onClicked.addListener((tab) => {
    console.log("Extension clicked, current video ID:", currentVideoId);
});

// background.js
console.log("Background script running");