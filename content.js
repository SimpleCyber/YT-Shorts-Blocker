// Check if the current URL is a YouTube Shorts or Instagram Reels video
function isBlockedUrl() {
    const url = window.location.href;
    return url.includes('/shorts/') || url.includes('/reels/');
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
            content: 'Take a break from endless scrolling and do something meaningful!',
            author: 'Shorts & Reels Blocker'
        };
    }
}

// Create and display the quote overlay
async function showQuoteOverlay() {
    if (document.querySelector('.quote-container')) return; // Prevent multiple overlays

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

    // Style the container
    Object.assign(container.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        background: '#f5f5f5',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        textAlign: 'center',
        zIndex: '9999'
    });

    document.body.appendChild(container);
}

// Remove the quote overlay
function removeQuoteOverlay() {
    const container = document.querySelector('.quote-container');
    if (container) {
        container.remove();
    }
}

// Main execution
if (isBlockedUrl()) {
    showQuoteOverlay();
}

// Monitor URL changes for single-page apps (SPA)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        if (isBlockedUrl()) {
            showQuoteOverlay();
        } else {
            removeQuoteOverlay();
        }
    }
}).observe(document, { subtree: true, childList: true });
