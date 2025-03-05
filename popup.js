// popup.js
document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({ type: "GET_VIDEO_ID" }, (response) => {
        document.getElementById("videoId").textContent = response.videoId || "No video ID found";
    });
});