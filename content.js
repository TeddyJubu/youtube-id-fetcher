// content.js
function getVideoId() {
    const url = window.location.href;
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v') || null;
}

// Function to create and inject the button
function injectExtractButton(videoId) {
    // Find the Subscribe button container
    const subscribeContainer = document.querySelector('ytd-subscribe-button-renderer');
    if (!subscribeContainer) return;

    // Check if button already exists to avoid duplicates
    if (document.getElementById('extract-button')) return;

    // Create the Extract button
    const extractButton = document.createElement('button');
    extractButton.id = 'extract-button';
    extractButton.textContent = 'Extract';
    extractButton.style.backgroundColor = '#007bff'; // Blue color
    extractButton.style.color = 'white';
    extractButton.style.border = 'none';
    extractButton.style.padding = '8px 16px';
    extractButton.style.borderRadius = '4px';
    extractButton.style.cursor = 'pointer';
    extractButton.style.marginLeft = '10px';
    extractButton.style.fontFamily = 'Roboto, Arial, sans-serif'; // Match YouTube's font

    // Add hover effect
    extractButton.onmouseover = () => extractButton.style.backgroundColor = '#0056b3';
    extractButton.onmouseout = () => extractButton.style.backgroundColor = '#007bff';

    // Add click event to send message and open popup
    extractButton.onclick = () => {
        chrome.runtime.sendMessage({
            type: "VIDEO_ID",
            videoId: videoId
        });
        // Trigger popup (we'll use the extension's popup)
        chrome.runtime.sendMessage({
            type: "OPEN_POPUP"
        });
    };

    // Insert the button after the Subscribe button
    subscribeContainer.parentNode.insertBefore(extractButton, subscribeContainer.nextSibling);
}

// Run when page loads
const videoId = getVideoId();
if (videoId) {
    injectExtractButton(videoId);
}

// Observe for dynamic page changes (YouTube is a single-page app)
const observer = new MutationObserver(() => {
    const newVideoId = getVideoId();
    if (newVideoId && !document.getElementById('extract-button')) {
        injectExtractButton(newVideoId);
    }
});
observer.observe(document.body, { childList: true, subtree: true });