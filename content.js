// Check if the current URL is a YouTube Shorts video
function isShortsUrl() {
    return window.location.href.includes('/shorts/');
}

// Fetch a random quote from the Quotable API
async function fetchQuote() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching quote:', error);
        return {
            content: 'Take a break from shorts and do something meaningful.',
            author: 'YouTube Shorts Blocker'
        };
    }
}

// Create and display the quote container
async function showQuoteOverlay() {
    const quote = await fetchQuote();
    
    const container = document.createElement('div');
    container.className = 'quote-container';
    
    const quoteText = document.createElement('div');
    quoteText.className = 'quote-text';
    quoteText.textContent = `"${quote.content}"`;
    
    const quoteAuthor = document.createElement('div');
    quoteAuthor.className = 'quote-author';
    quoteAuthor.textContent = `- ${quote.author}`;
    
    container.appendChild(quoteText);
    container.appendChild(quoteAuthor);
    document.body.appendChild(container);
}

// Main execution
if (isShortsUrl()) {
    showQuoteOverlay();
}

// Handle URL changes (for single-page navigation)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        if (isShortsUrl()) {
            showQuoteOverlay();
        } else {
            const container = document.querySelector('.quote-container');
            if (container) {
                container.remove();
            }
        }
    }
}).observe(document, { subtree: true, childList: true });