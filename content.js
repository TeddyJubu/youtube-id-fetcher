// content.js
function getVideoId() {
    const url = window.location.href;
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v') || null;
}

function createPopup(videoId) {
    // Create popup div
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'white';
    popup.style.padding = '20px';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    popup.style.zIndex = '10000';

    // Add content
    popup.innerHTML = `
        <h3>YouTube Video ID</h3>
        <p>${videoId || 'No video ID found'}</p>
        <button onclick="this.parentElement.remove()" style="background-color: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px;">Close</button>
    `;
    document.body.appendChild(popup);
}

function injectExtractButton(videoId) {
    const subscribeContainer = document.querySelector('ytd-subscribe-button-renderer');
    if (!subscribeContainer) return;
    if (document.getElementById('extract-button')) return;

    const extractButton = document.createElement('button');
    extractButton.id = 'extract-button';
    extractButton.textContent = 'Extract';
    extractButton.style.backgroundColor = '#007bff';
    extractButton.style.color = 'white';
    extractButton.style.border = 'none';
    extractButton.style.padding = '8px 16px';
    extractButton.style.borderRadius = '4px';
    extractButton.style.cursor = 'pointer';
    extractButton.style.marginLeft = '10px';
    extractButton.style.fontFamily = 'Roboto, Arial, sans-serif';

    extractButton.onmouseover = () => extractButton.style.backgroundColor = '#0056b3';
    extractButton.onmouseout = () => extractButton.style.backgroundColor = '#007bff';

    extractButton.onclick = () => createPopup(videoId);

    subscribeContainer.parentNode.insertBefore(extractButton, subscribeContainer.nextSibling);
}

const videoId = getVideoId();
if (videoId) {
    injectExtractButton(videoId);
}

const observer = new MutationObserver(() => {
    const newVideoId = getVideoId();
    if (newVideoId && !document.getElementById('extract-button')) {
        injectExtractButton(newVideoId);
    }
});
observer.observe(document.body, { childList: true, subtree: true });