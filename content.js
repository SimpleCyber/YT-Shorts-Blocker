// Function to create and inject the sandglass timer
function createSandglassTimer() {
  // Add Google Fonts
  if (!document.getElementById("outfit-font")) {
    const fontLink = document.createElement("link");
    fontLink.id = "outfit-font";
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700&display=swap";
    document.head.appendChild(fontLink);
  }

  // Create stylesheet for the enhanced UI
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    :root {
      --primary: #6366f1;
      --primary-glow: rgba(99, 102, 241, 0.5);
      --bg-overlay: rgba(15, 23, 42, 0.8);
      --card-bg: rgba(30, 41, 59, 0.7);
      --text-main: #f8fafc;
      --text-dim: #94a3b8;
      --accent: #f59e0b;
      --sand: #fbbf24;
    }

    .blocker-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      background: radial-gradient(circle at top right, #1e293b, #0f172a);
      color: var(--text-main);
      z-index: 2147483647;
      font-family: 'Outfit', sans-serif;
      overflow: hidden;
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .info-panel {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 10% 8%;
      backdrop-filter: blur(8px);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .timer-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.02);
      position: relative;
    }

    .app-title {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 4px;
      color: var(--primary);
      font-weight: 700;
      margin-bottom: 20px;
    }

    .quote-wrap {
      position: relative;
      margin-bottom: 40px;
    }

    .quote-text {
      font-size: clamp(28px, 4vw, 48px);
      line-height: 1.2;
      font-weight: 700;
      margin-bottom: 20px;
      background: linear-gradient(to bottom right, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .quote-author {
      font-size: 18px;
      color: var(--text-dim);
      font-weight: 300;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .quote-author::before {
      content: '';
      width: 30px;
      height: 1px;
      background: var(--primary);
    }

    .tips-container {
      margin-top: auto;
      padding: 20px;
      background: var(--card-bg);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .tip-heading {
      font-size: 14px;
      color: var(--accent);
      margin-bottom: 8px;
      font-weight: 700;
    }

    .tip-content {
      font-size: 15px;
      color: var(--text-dim);
      line-height: 1.5;
    }

    .hourglass-container {
      position: relative;
      width: 200px;
      height: 300px;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .countdown-wrap {
      text-align: center;
      position: relative;
    }

    .timer-value {
      font-size: 72px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      margin-bottom: 5px;
    }

    .timer-label {
      font-size: 14px;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .theme-toggle {
      position: absolute;
      top: 30px;
      right: 30px;
      background: var(--card-bg);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .theme-toggle:hover {
      background: var(--primary);
      transform: translateY(-2px);
    }

    @media (max-width: 900px) {
      .blocker-container {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr auto;
      }
      .info-panel {
        padding: 60px 40px 20px;
        border-right: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .timer-panel {
        padding: 40px;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // Load Font Awesome if not present
  if (!document.getElementById("fa-link")) {
    const fa = document.createElement("link");
    fa.id = "fa-link";
    fa.rel = "stylesheet";
    fa.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    document.head.appendChild(fa);
  }

  // Create HTML Structure
  const container = document.createElement("div");
  container.className = "blocker-container";

  container.innerHTML = `
    <div class="info-panel">
      <div class="app-title">Shorts Blocker</div>
      <div class="quote-wrap">
        <div class="quote-text" id="quote-text">"Distraction is the thief of time."</div>
        <div class="quote-author" id="quote-author">Marcus Aurelius</div>
      </div>
      <div class="tips-container">
        <div class="tip-heading">💡 FOCUS TIP</div>
        <div class="tip-content" id="focus-tip">Did you know? It takes average 23 minutes to regain full focus after a single distraction.</div>
      </div>
    </div>
    <div class="timer-panel">
      <button class="theme-toggle" id="theme-toggler">
        <i class="fas fa-moon"></i>
      </button>
      <div class="hourglass-container">
          <div class="outer-wrapper">
            <div class="wrapper">
              <div class="glass"></div>
              <div class="glass"></div>
              <div class="glass"></div>
              <div class="glass"></div>
              <svg width="100%" height="100%" fill="transparent"></svg>
            </div>
          </div>
      </div>
      <div class="countdown-wrap">
        <div class="timer-value" id="timer-val">60</div>
        <div class="timer-label">seconds left</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // Focus tips database
  const tips = [
    "It takes an average of 23 minutes to regain full focus after a distraction.",
    "Deep work sessions of 90 minutes are more effective than 8 hours of distracted work.",
    "The 5-second rule: If you have an impulse to act on a goal, you must physically move within 5 seconds.",
    "Multitasking is a myth; your brain is just switching between tasks rapidly, losing efficiency.",
    "A clean workspace leads to a clean mind and better focus.",
  ];

  const focusTipEl = container.querySelector("#focus-tip");
  focusTipEl.textContent = tips[Math.floor(Math.random() * tips.length)];

  // Timer Logic
  let timeLeft = 60;
  const timerVal = container.querySelector("#timer-val");
  
  // Start the particle hourglass animation
  const hgAnimation = window.startHourglass ? window.startHourglass(container) : null;

  const timerInterval = setInterval(() => {
    timeLeft--;
    timerVal.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (hgAnimation && hgAnimation.stop) hgAnimation.stop();
      timerVal.textContent = "0";

      setTimeout(() => {
        container.style.opacity = "0";
        container.style.transition = "opacity 0.8s ease";
        setTimeout(() => {
          container.remove();
          // Resume videos
          document.querySelectorAll("video").forEach((v) => {
            v.muted = false;
            v.play();
          });
        }, 800);
      }, 1000);
    }
  }, 1000);

  // Fetch Quote
  async function updateQuote() {
    try {
      const response = await fetch(
        "https://api.quotable.io/random?tags=wisdom|inspirational",
      );
      const data = await response.json();
      document.getElementById("quote-text").textContent = `"${data.content}"`;
      document.getElementById("quote-author").textContent = data.author;
    } catch (e) {
      console.log("Using fallback quote");
    }
  }
  updateQuote();

  // Return API
  return {
    removeTimer: () => {
      clearInterval(timerInterval);
      container.remove();
    },
  };
}

// Function to check if this is a blocked URL
function isBlockedUrl() {
  const url = window.location.href;
  return (
    url.includes("/shorts/") ||
    url.includes("/reels/") ||
    url.includes("youtube.com")
  );
}

// Main function to manage viewing and apply timer
async function manageViewing() {
  if (isBlockedUrl() && !document.querySelector(".blocker-container")) {
    const timer = createSandglassTimer();

    // Wait 60 seconds
    await new Promise((resolve) => setTimeout(resolve, 60000));

    // Remove timer overlay
    timer.removeTimer();

    // Set timer to appear again after 1 minute of watching
    setTimeout(() => {
      createSandglassTimer();
    }, 60000);
  }
}

// Monitor URL changes for SPAs
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    manageViewing();
  }
}).observe(document, { subtree: true, childList: true });

// Initial check
manageViewing();
