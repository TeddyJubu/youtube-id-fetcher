// content.js
function getVideoId() {
    const url = window.location.href;
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v') || null;
}

function sendVideoIdToServer(videoId) {
    if (!videoId || typeof videoId !== 'string') {
        console.error('Invalid videoId:', videoId);
        return Promise.reject(new Error('Invalid video ID'));
    }

    const payload = { videoId: videoId };
    console.log('Sending payload:', payload);

    return fetch('http://127.0.0.1:3000/video-id', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(async response => {
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, Response: ${responseText}`);
        }
        
        return JSON.parse(responseText);
    })
    .then(data => {
        console.log('Server response data:', data);
        if (data.summary) {
            displaySummary(data.summary);
            return data;
        }
        throw new Error('No summary in response');
    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('Failed to get summary: ' + error.message);
        throw error;
    });
}

function displaySummary(summary) {
    console.log('Display summary called with:', summary);
    const videoInfo = document.querySelector('#above-the-fold');
    if (!videoInfo) {
        console.error('Could not find #above-the-fold to display summary');
        return;
    }

    if (document.getElementById('video-summary')) {
        console.log('Summary already displayed, skipping');
        return;
    }

    const summaryDiv = document.createElement('div');
    summaryDiv.id = 'video-summary';
    summaryDiv.style.marginTop = '10px';
    summaryDiv.style.padding = '10px';
    summaryDiv.style.backgroundColor = '#f9f9f9';
    summaryDiv.style.border = '1px solid #ddd';
    summaryDiv.style.borderRadius = '4px';
    summaryDiv.innerHTML = `<strong>Summary:</strong> ${summary}`;
    videoInfo.appendChild(summaryDiv);
    console.log('Summary displayed successfully');
}

function injectExtractButton(videoId) {
    // Wait for YouTube's content to load
    setTimeout(() => {
        // Try multiple selectors in order of preference
        const possibleContainers = [
            '#above-the-fold',
            '#top-row',
            '#primary-inner',
            '#primary',
            '#info-contents',
            '#meta',
            '#below'
        ];

        let container = null;
        for (const selector of possibleContainers) {
            container = document.querySelector(selector);
            if (container) {
                console.log('Found container:', selector);
                break;
            }
        }

        if (!container) {
            console.error('Could not find suitable container for extract button');
            // Retry after a longer delay
            setTimeout(() => injectExtractButton(videoId), 2000);
            return;
        }

        if (document.getElementById('extract-button-container')) {
            console.log('Extract button container already exists');
            return;
        }

        // Create a container for the button
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'extract-button-container';
        buttonContainer.style.padding = '12px';
        buttonContainer.style.marginTop = '10px';
        buttonContainer.style.marginBottom = '10px';
        buttonContainer.style.backgroundColor = '#f8f8f8';
        buttonContainer.style.borderRadius = '8px';
        buttonContainer.style.width = '100%';

        const extractButton = document.createElement('button');
        extractButton.id = 'extract-button';
        extractButton.textContent = 'Generate Summary';
        extractButton.style.backgroundColor = '#065fd4';
        extractButton.style.color = 'white';
        extractButton.style.border = 'none';
        extractButton.style.padding = '10px 20px';
        extractButton.style.borderRadius = '18px';
        extractButton.style.cursor = 'pointer';
        extractButton.style.fontFamily = 'Roboto, Arial, sans-serif';
        extractButton.style.fontSize = '14px';
        extractButton.style.fontWeight = '500';
        extractButton.style.width = '100%';
        extractButton.style.transition = 'background-color 0.2s';

        extractButton.onmouseover = () => extractButton.style.backgroundColor = '#0b5ed7';
        extractButton.onmouseout = () => extractButton.style.backgroundColor = '#065fd4';
        extractButton.onclick = () => {
            const currentVideoId = getVideoId(); // Get fresh video ID
            console.log('Current video ID:', currentVideoId);
            
            if (!currentVideoId) {
                console.error('No video ID found');
                alert('No video ID found');
                return;
            }
            
            extractButton.disabled = true;
            extractButton.textContent = 'Generating Summary...';
            extractButton.style.backgroundColor = '#cccccc';
            
            sendVideoIdToServer(currentVideoId)
                .finally(() => {
                    extractButton.disabled = false;
                    extractButton.textContent = 'Generate Summary';
                    extractButton.style.backgroundColor = '#065fd4';
                });
        };

        buttonContainer.appendChild(extractButton);
        
        // Try to insert at the beginning of the container
        if (container.firstChild) {
            container.insertBefore(buttonContainer, container.firstChild);
        } else {
            container.appendChild(buttonContainer);
        }
        
        console.log('Extract button injected successfully');
    }, 1000); // Initial delay to ensure YouTube's content is loaded
}

// Update the observer to be more specific
const observer = new MutationObserver((mutations) => {
    const newVideoId = getVideoId();
    if (newVideoId && !document.getElementById('extract-button-container')) {
        console.log('Page updated, attempting to inject button');
        injectExtractButton(newVideoId);
    }
});

// Start observing with a more specific target
function startObserving() {
    const target = document.querySelector('#primary') || document.body;
    observer.observe(target, { 
        childList: true, 
        subtree: true 
    });
}

// Listen for YouTube's navigation events
document.addEventListener('yt-navigate-finish', () => {
    const videoId = getVideoId();
    if (videoId) {
        console.log('Navigation detected, attempting to inject button');
        injectExtractButton(videoId);
    }
});

// Initial injection with multiple attempts
window.addEventListener('load', () => {
    const videoId = getVideoId();
    if (videoId) {
        console.log('Initial load, attempting to inject button');
        injectExtractButton(videoId);
        startObserving();
    }
});

// Additional injection attempt after a delay
setTimeout(() => {
    const videoId = getVideoId();
    if (videoId && !document.getElementById('extract-button-container')) {
        console.log('Delayed injection attempt');
        injectExtractButton(videoId);
    }
}, 3000);
