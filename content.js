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
    // Convert common markdown syntax to HTML
    const htmlContent = convertMarkdownToHTML(summary);
    renderSummaryWithStyles(htmlContent, summary); // Pass the original summary text
}

function convertMarkdownToHTML(markdown) {
    // Simple markdown to HTML converter
    return markdown
        // Convert headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // Convert bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Convert italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Convert lists
        .replace(/^\- (.*$)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        // Convert code blocks
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Convert blockquotes
        .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
        // Convert paragraphs
        .replace(/\n\n(.*)/g, '<p>$1</p>')
        // Convert line breaks
        .replace(/\n/g, '<br>');
}

function renderSummaryWithStyles(htmlContent, originalText) { // Add originalText parameter
    // Add required styles if not already present
    if (!document.getElementById('summary-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'summary-styles';
        styleSheet.textContent = `
            .summary-content {
                font-family: Arial, sans-serif;
                line-height: 1.8;
                color: #4A4A4A;
            }
            
            .summary-content h1, 
            .summary-content h2, 
            .summary-content h3 {
                margin-top: 24px;
                margin-bottom: 16px;
                font-weight: 600;
                line-height: 1.25;
            }
            
            .summary-content h1 {
                font-size: 24px;
                border-bottom: 2px solid #D9A05B;
                padding-bottom: 8px;
            }
            
            .summary-content h2 {
                font-size: 20px;
            }
            
            .summary-content h3 {
                font-size: 18px;
            }
            
            .summary-content p {
                margin-bottom: 16px;
            }
            
            .summary-content ul {
                margin-bottom: 16px;
                padding-left: 24px;
            }
            
            .summary-content li {
                margin: 8px 0;
            }
            
            .summary-content code {
                background-color: rgba(217, 160, 91, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 14px;
            }
            
            .summary-content blockquote {
                border-left: 4px solid #D9A05B;
                margin: 16px 0;
                padding: 8px 16px;
                background-color: rgba(217, 160, 91, 0.05);
            }
            
            .summary-content strong {
                font-weight: 600;
            }
            
            .summary-content em {
                font-style: italic;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // Find container and render summary
    const videoInfo = document.querySelector('#above-the-fold');
    if (!videoInfo) {
        console.error('Could not find #above-the-fold to display summary');
        return;
    }

    if (document.getElementById('video-summary')) {
        console.log('Summary already displayed, updating content');
        const contentDiv = document.querySelector('#video-summary .summary-content');
        if (contentDiv) {
            contentDiv.innerHTML = htmlContent;
            return;
        }
    }

    // Create summary container
    const summaryDiv = document.createElement('div');
    summaryDiv.id = 'video-summary';
    Object.assign(summaryDiv.style, {
        marginTop: '20px',
        padding: '25px',
        backgroundColor: '#FAF3E0',
        border: '1px solid #D9A05B',
        borderRadius: '12px',
        fontSize: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    });

    // Create header with copy button - pass the original text
    const headerDiv = document.createElement('div');
    Object.assign(headerDiv.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #D9A05B',
        paddingBottom: '10px'
    });

    const titleSpan = document.createElement('span');
    titleSpan.innerHTML = '<strong style="font-size: 20px; color: #4A4A4A;">Video Summary</strong>';

    const copyButton = createCopyButton(originalText); // Pass the original text for copying
    headerDiv.appendChild(titleSpan);
    headerDiv.appendChild(copyButton);

    // Content div with HTML content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'summary-content';
    contentDiv.innerHTML = htmlContent;

    summaryDiv.appendChild(headerDiv);
    summaryDiv.appendChild(contentDiv);
    videoInfo.appendChild(summaryDiv);
    console.log('Summary displayed successfully');
}

function createCopyButton(textToCopy) {
    const copyButton = document.createElement('button');
    Object.assign(copyButton.style, {
        backgroundColor: '#D9A05B',
        color: '#FAF3E0',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease'
    });

    copyButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
        <span>Copy</span>`;

    copyButton.onmouseover = () => {
        copyButton.style.backgroundColor = '#C08A4A';
    };
    copyButton.onmouseout = () => {
        copyButton.style.backgroundColor = '#D9A05B';
    };

    copyButton.onclick = () => {
        navigator.clipboard.writeText(textToCopy);
        copyButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span>Copied!</span>`;
        copyButton.style.backgroundColor = '#68A357';
        setTimeout(() => {
            copyButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                <span>Copy</span>`;
            copyButton.style.backgroundColor = '#D9A05B';
        }, 2000);
    };

    return copyButton;
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
        Object.assign(buttonContainer.style, {
            padding: '10px',
            marginTop: '10px',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'flex-start'
        });

        const extractButton = document.createElement('button');
        extractButton.id = 'extract-button';
        Object.assign(extractButton.style, {
            backgroundColor: '#FAF3E0',
            color: '#4A4A4A',
            border: '2px solid #D9A05B',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: '"Libre Baskerville", serif',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        });

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes slideIn {
                0% { transform: translateY(-100%); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes checkmark {
                0% { transform: scale(0); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            
            .completion-animation {
                animation: checkmark 0.5s ease-in-out forwards;
            }
        `;
        document.head.appendChild(style);

        // Add loading spinner (hidden by default)
        const spinner = document.createElement('div');
        Object.assign(spinner.style, {
            width: '16px',
            height: '16px',
            border: '2px solid #D9A05B',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            display: 'none',
            animation: 'spin 1s linear infinite'
        });

        const buttonText = document.createElement('span');
        buttonText.textContent = 'Generate Summary';

        extractButton.appendChild(spinner);
        extractButton.appendChild(buttonText);

        // Hover effects
        extractButton.onmouseover = () => {
            extractButton.style.backgroundColor = '#D9A05B';
            extractButton.style.color = '#FAF3E0';
            extractButton.style.transform = 'translateY(-1px)';
            extractButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        };
        
        extractButton.onmouseout = () => {
            extractButton.style.backgroundColor = '#FAF3E0';
            extractButton.style.color = '#4A4A4A';
            extractButton.style.transform = 'translateY(0)';
            extractButton.style.boxShadow = 'none';
        };

        extractButton.onclick = () => {
            const currentVideoId = getVideoId();
            if (!currentVideoId) {
                console.error('No video ID found');
                alert('No video ID found');
                return;
            }
            
            // Button loading state
            extractButton.disabled = true;
            buttonText.textContent = 'Generating...';
            spinner.style.display = 'inline-block';
            extractButton.style.backgroundColor = '#FAF3E0';
            extractButton.style.opacity = '0.7';
            
            sendVideoIdToServer(currentVideoId)
                .then(() => {
                    // Success animation
                    spinner.style.display = 'none';
                    buttonText.textContent = 'Summary Generated!';
                    
                    // Create checkmark icon
                    const checkmark = document.createElement('div');
                    checkmark.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D9A05B" stroke-width="3">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>`;
                    checkmark.style.display = 'inline-flex';
                    checkmark.classList.add('completion-animation');
                    
                    extractButton.insertBefore(checkmark, buttonText);
                    
                    // Reset button after delay
                    setTimeout(() => {
                        extractButton.disabled = false;
                        buttonText.textContent = 'Generate Summary';
                        checkmark.remove();
                        extractButton.style.opacity = '1';
                    }, 2000);
                })
                .catch(() => {
                    // Error state
                    extractButton.disabled = false;
                    buttonText.textContent = 'Generate Summary';
                    spinner.style.display = 'none';
                    extractButton.style.opacity = '1';
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
