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
    summaryDiv.style.marginTop = '20px';
    summaryDiv.style.padding = '20px';
    summaryDiv.style.backgroundColor = '#f9f9f9';
    summaryDiv.style.border = '1px solid #ddd';
    summaryDiv.style.borderRadius = '8px';
    summaryDiv.style.fontSize = '16px';
    summaryDiv.style.lineHeight = '1.6';

    // Create header with copy button
    const headerDiv = document.createElement('div');
    headerDiv.style.display = 'flex';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.marginBottom = '15px';

    const titleSpan = document.createElement('span');
    titleSpan.innerHTML = '<strong style="font-size: 18px;">Summary</strong>';

    const copyButton = document.createElement('button');
    copyButton.innerHTML = '📋';
    copyButton.style.border = 'none';
    copyButton.style.background = 'transparent';
    copyButton.style.fontSize = '18px';
    copyButton.style.cursor = 'pointer';
    copyButton.style.padding = '5px';
    copyButton.title = 'Copy summary';
    copyButton.onclick = () => {
        navigator.clipboard.writeText(summary);
        copyButton.innerHTML = '✓';
        setTimeout(() => copyButton.innerHTML = '📋', 2000);
    };

    headerDiv.appendChild(titleSpan);
    headerDiv.appendChild(copyButton);

    const contentDiv = document.createElement('div');
    contentDiv.textContent = summary;
    contentDiv.style.marginTop = '10px';

    summaryDiv.appendChild(headerDiv);
    summaryDiv.appendChild(contentDiv);
    videoInfo.appendChild(summaryDiv);
    console.log('Summary displayed successfully');
}

function injectExtractButton(videoId) {
    setTimeout(() => {
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
        buttonContainer.style.padding = '10px';
        buttonContainer.style.marginTop = '10px';
        buttonContainer.style.marginBottom = '10px';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-start';

        const extractButton = document.createElement('button');
        extractButton.id = 'extract-button';
        extractButton.style.backgroundColor = '#065fd4';
        extractButton.style.color = 'white';
        extractButton.style.border = 'none';
        extractButton.style.padding = '8px 16px';
        extractButton.style.borderRadius = '18px';
        extractButton.style.cursor = 'pointer';
        extractButton.style.fontFamily = 'Roboto, Arial, sans-serif';
        extractButton.style.fontSize = '14px';
        extractButton.style.fontWeight = '500';
        extractButton.style.display = 'flex';
        extractButton.style.alignItems = 'center';
        extractButton.style.gap = '8px';
        extractButton.style.transition = 'background-color 0.2s';

        // Add loading spinner (hidden by default)
        const spinner = document.createElement('div');
        spinner.style.width = '14px';
        spinner.style.height = '14px';
        spinner.style.border = '2px solid #ffffff';
        spinner.style.borderTop = '2px solid transparent';
        spinner.style.borderRadius = '50%';
        spinner.style.display = 'none';
        spinner.style.animation = 'spin 1s linear infinite';

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        const buttonText = document.createElement('span');
        buttonText.textContent = 'Generate Summary';

        extractButton.appendChild(spinner);
        extractButton.appendChild(buttonText);

        extractButton.onmouseover = () => extractButton.style.backgroundColor = '#0b5ed7';
        extractButton.onmouseout = () => extractButton.style.backgroundColor = '#065fd4';
        extractButton.onclick = () => {
            const currentVideoId = getVideoId();
            console.log('Current video ID:', currentVideoId);
            
            if (!currentVideoId) {
                console.error('No video ID found');
                alert('No video ID found');
                return;
            }
            
            extractButton.disabled = true;
            buttonText.textContent = 'Generating...';
            spinner.style.display = 'block';
            extractButton.style.backgroundColor = '#cccccc';
            
            sendVideoIdToServer(currentVideoId)
                .finally(() => {
                    extractButton.disabled = false;
                    buttonText.textContent = 'Generate Summary';
                    spinner.style.display = 'none';
                    extractButton.style.backgroundColor = '#065fd4';
                });
        };

        buttonContainer.appendChild(extractButton);
        
        if (container.firstChild) {
            container.insertBefore(buttonContainer, container.firstChild);
        } else {
            container.appendChild(buttonContainer);
        }
        
        console.log('Extract button injected successfully');
    }, 1000);
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
