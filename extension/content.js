const DEFAULTS = {
  blockedSites: ["youtube.com/shorts", "instagram.com/reels"],
  blockedCategories: [],
  blockedKeywords: [],
  duration: 60, // seconds
  lockUntil: 0, // timestamp
  isBlockingEnabled: true,
  isWhitelistMode: false,
  usageLimits: []
};

const CATEGORY_LISTS = {
  social: ['facebook.com', 'instagram.com', 'x.com', 'twitter.com', 'tiktok.com', 'snapchat.com', 'reddit.com', 'pinterest.com', 'linkedin.com'],
  news: ['cnn.com', 'foxnews.com', 'nytimes.com', 'bbc.com', 'buzzfeed.com', 'dailymail.co.uk', 'reuters.com'],
  sports: ['espn.com', 'nba.com', 'nfl.com', 'skysports.com', 'bleacherreport.com', 'cbssports.com'],
  shopping: ['amazon.com', 'ebay.com', 'walmart.com', 'target.com', 'aliexpress.com', 'bestbuy.com', 'etsy.com'],
  adult: [
    'pornhub.com', 'pornhub.org', 'xvideos.com', 'xnxx.com', 'redtube.com', 
    'youporn.com', 'tube8.com', 'spankbang.com', 'xhamster.com', 'xhamster2.com', 
    'brazzers.com', 'naughtyamerica.com', 'chaturbate.com', 'onlyfans.com',
    'hentaihaven.org', 'rule34.xxx', 'sex.com', 'xxxvideo.com', 'hqporner.com'
  ]
};

const ADULT_KEYWORDS = [
  'porn', 'pron', 'sexvideo', 'sexvideos', 'xxx', 'adult', 'sex', 
  'pornhub', 'xvideos', 'xnxx', 'redtube', 'youporn', 'tube8', 
  'spankbang', 'xhamster', 'brazzers', 'naughtyamerica',
  'p0rn', 'pr0n', 'xxxvideo', 'sex-video', 'sex-videos',
  'free-sex-videos', 'bestpornsite', 'nsfw', 'onlyfans'
];

async function getSettings() {
  return new Promise((resolve) => {
    try {
      if (!chrome.runtime || !chrome.runtime.id) {
        console.warn("FocusShield: Extension context invalidated.");
        resolve(DEFAULTS);
        return;
      }
      chrome.storage.local.get(DEFAULTS, (result) => {
        if (chrome.runtime.lastError) {
          console.warn("FocusShield: Storage error", chrome.runtime.lastError.message);
          resolve(DEFAULTS);
        } else {
          resolve(result);
        }
      });
    } catch (e) {
      console.warn("FocusShield: Context error", e);
      resolve(DEFAULTS);
    }
  });
}

// Function to show custom confirm/alert
function showCustomModal({ title, message, confirmText = "Confirm", cancelText = "Cancel", type = "confirm" }) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "custom-modal-overlay";
    
    overlay.innerHTML = `
      <div class="custom-modal">
        <div class="modal-title">${title}</div>
        <div class="modal-message">${message}</div>
        <div class="modal-buttons">
          ${type === "confirm" ? `<button class="modal-btn btn-cancel" id="modal-cancel">${cancelText}</button>` : ""}
          <button class="modal-btn ${type === "confirm" ? "btn-confirm" : "btn-primary"}" id="modal-confirm">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const confirmBtn = overlay.querySelector("#modal-confirm");
    const cancelBtn = overlay.querySelector("#modal-cancel");

    confirmBtn.onclick = () => {
      overlay.remove();
      resolve(true);
    };

    if (cancelBtn) {
      cancelBtn.onclick = () => {
        overlay.remove();
        resolve(false);
      };
    }

    overlay.onclick = (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve(false);
      }
    };
  });
}

// Function to create and inject the sandglass timer
function createSandglassTimer(blockData = {}) {
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
    .blocker-container {
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

    .privacy-link-wrap {
      margin-top: 20px;
      text-align: center;
    }

    .privacy-link {
      color: var(--text-dim);
      text-decoration: none;
      font-size: 12px;
      opacity: 0.5;
      transition: all 0.2s;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .privacy-link:hover {
      opacity: 1;
      color: var(--primary);
    }

    .hourglass-container {
      position: relative;
      width: 320px;
      height: 450px;
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

    /* Settings Panel Styles */
    .settings-panel {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      z-index: 100;
      padding: 40px;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
    }

    .settings-panel.open {
      transform: translateX(0);
    }

    .settings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .settings-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--primary);
    }

    .close-settings {
      background: transparent;
      border: none;
      color: var(--text-dim);
      font-size: 20px;
      cursor: pointer;
      transition: color 0.2s;
    }

    .close-settings:hover {
      color: #fff;
    }

    .settings-section {
      margin-bottom: 30px;
    }

    .section-label {
      font-size: 14px;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 15px;
      display: block;
    }

    .block-list {
      max-height: 200px;
      overflow-y: auto;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 10px;
      margin-bottom: 15px;
    }

    .block-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .block-item:last-child {
      border-bottom: none;
    }

    .remove-site {
      color: #ef4444;
      cursor: pointer;
      font-size: 14px;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .remove-site:hover {
      opacity: 1;
    }

    .add-site-wrap {
      display: flex;
      gap: 10px;
    }

    .settings-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 10px 15px;
      color: #fff;
      font-family: inherit;
    }

    .settings-btn {
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0 15px;
      cursor: pointer;
      font-weight: 500;
    }

    .settings-error {
      color: #ef4444;
      font-size: 11px;
      margin-top: 5px;
      margin-left: 2px;
      display: none;
      animation: fadeIn 0.2s ease;
    }

    .duration-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .duration-option {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 10px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
    }

    .duration-option.active {
      background: var(--primary);
      border-color: var(--primary);
      box-shadow: 0 0 15px var(--primary-glow);
    }

    .lock-btn {
      width: 100%;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
      padding: 12px;
      border-radius: 12px;
      margin-top: 15px;
      cursor: pointer;
      font-weight: 700;
      transition: all 0.2s;
    }

    .lock-btn:hover {
      background: #ef4444;
      color: #fff;
    }

    .locked-trigger {
      cursor: default; /* Keep default cursor since it's not clickable */
    }

    .locked-trigger .tooltip {
      position: absolute;
      bottom: -40px;
      right: 0;
      background: #1e293b;
      padding: 8px 12px;
      border-radius: 8px;
      white-space: nowrap;
      font-size: 11px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      border: 1px solid rgba(255,255,255,0.1);
      z-index: 1000;
    }

    .locked-trigger:hover .tooltip {
      opacity: 1;
    }

    /* Custom Alert/Confirm Styles */
    .custom-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
      animation: modalFadeIn 0.2s ease-out;
    }

    .custom-modal {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 30px;
      width: 400px;
      max-width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes modalSlideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #fff;
    }

    .modal-message {
      font-size: 15px;
      color: var(--text-dim);
      line-height: 1.5;
      margin-bottom: 25px;
    }

    .modal-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .modal-btn {
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      font-family: inherit;
    }

    .btn-cancel {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-dim);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-cancel:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .btn-confirm {
      background: #ef4444;
      color: #fff;
    }

    .btn-confirm:hover {
      background: #dc2626;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .btn-primary {
      background: var(--primary);
      color: #fff;
    }

    .btn-primary:hover {
      background: #4f46e5;
    }
    .go-back-btn {
      margin-top: 30px;
      background: var(--card-bg);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-main);
      padding: 12px 30px;
      border-radius: 30px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .go-back-btn:hover {
      background: var(--primary);
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
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
      <div class="app-title">FocusShield</div>
      <div class="quote-wrap">
        <div class="quote-text" id="quote-text">${blockData.reason === 'focus_mode' ? '"Focus is the key to all success."' : '"Distraction is the thief of time."'}</div>
        <div class="quote-author" id="quote-author">${blockData.reason === 'focus_mode' ? 'Anonymous' : 'Marcus Aurelius'}</div>
      </div>
      <div class="tips-container">
        <div class="tip-heading">${blockData.reason === 'focus_mode' ? '🎯 FOCUS MODE ACTIVE' : blockData.reason === 'focus_only_site' ? '🚫 FOCUS ONLY SITE' : '💡 FOCUS TIP'}</div>
        <div class="tip-content" id="focus-tip">${blockData.reason === 'focus_mode' ? 'This site is not in your Focus Whitelist. Stay focused on your goals!' : blockData.reason === 'focus_only_site' ? 'This site is only accessible during Focus Mode. Start a focus session to access it.' : 'Did you know? It takes average 23 minutes to regain full focus after a single distraction.'}</div>
      </div>
      <div class="privacy-link-wrap">
        <a href="${chrome.runtime.getURL('privacy.html')}" target="_blank" class="privacy-link">Privacy Policy</a>
      </div>
    </div>
    <div class="timer-panel">
     <!-- <button class="theme-toggle" id="settings-trigger">
        <i class="fas fa-cog"></i>
      </button> -->

      <div class="settings-panel" id="settings-panel">
        <div class="settings-header">
          <div class="settings-title">Settings</div>
          <button class="close-settings" id="settings-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="settings-section">
          <label class="section-label">Website Block List</label>
          <div class="block-list" id="blocked-sites-list">
            <!-- Sites will be injected here -->
          </div>
          <div class="add-site-wrap">
            <input type="text" class="settings-input" id="new-site-input" placeholder="e.g. facebook.com">
            <button class="settings-btn" id="add-site-btn">Add</button>
          </div>
          <div class="settings-error" id="site-error">This site is already in your block list</div>
        </div>

        <div class="settings-section">
          <label class="section-label">Block Duration</label>
          <div class="duration-grid">
            <div class="duration-option" data-value="60">1 Min</div>
            <div class="duration-option" data-value="120">2 Min</div>
            <div class="duration-option" data-value="300">5 Min</div>
            <div class="duration-option" data-value="3600">1 Hour</div>
            <div class="duration-option" data-value="7200">2 Hours</div>
            <div class="duration-option" data-value="14400">4 Hours</div>
          </div>
        </div>

        <div class="settings-section">
          <label class="section-label">Secure Lock</label>
          <div class="duration-grid">
            <div class="duration-option lock-opt" data-days="1">1 Day</div>
            <div class="duration-option lock-opt" data-days="2">2 Days</div>
            <div class="duration-option lock-opt" data-days="5">5 Days</div>
            <div class="duration-option lock-opt" data-days="7">1 Week</div>
            <div class="duration-option lock-opt" data-days="21">21 Days</div>
            <div class="duration-option lock-opt" data-days="30">1 Month</div>
          </div>
          <button class="lock-btn" id="activate-lock-btn">LOCK SETTINGS</button>
        </div>
      </div>

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
        <div class="timer-label" id="timer-label">seconds left</div>
      </div>
      <button class="go-back-btn" id="go-back-btn" style="display: none;">
        <i class="fas fa-arrow-left"></i> Go Back
      </button>
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

  // Settings UI Logic
  const settingsPanel = container.querySelector("#settings-panel");
  const settingsTrigger = container.querySelector("#settings-trigger");
  const settingsClose = container.querySelector("#settings-close");
  const sitesListEl = container.querySelector("#blocked-sites-list");
  const addSiteBtn = container.querySelector("#add-site-btn");
  const newSiteInput = container.querySelector("#new-site-input");
  const siteError = container.querySelector("#site-error");
  const durationOptions = container.querySelectorAll(".duration-option:not(.lock-opt)");
  const lockOptions = container.querySelectorAll(".lock-opt");
  const activateLockBtn = container.querySelector("#activate-lock-btn");

  let selectedLockDays = 0;

  async function updateLockUI() {
    const settings = await getSettings();
    const isLocked = Date.now() < settings.lockUntil;

    if (isLocked) {
      const timeLeft = settings.lockUntil - Date.now();
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      let timeStr = days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
      
      settingsTrigger.classList.add("locked-trigger");
      settingsTrigger.innerHTML = `<i class="fas fa-lock"></i> <div class="tooltip">${timeStr}</div>`;
      settingsTrigger.onclick = null;
      settingsPanel.classList.remove("open");
    } else {
      settingsTrigger.classList.remove("locked-trigger");
      settingsTrigger.innerHTML = `<i class="fas fa-cog"></i>`;
      settingsTrigger.onclick = () => {
        renderSettings();
        settingsPanel.classList.add("open");
      };
    }
  }

  settingsClose.onclick = () => settingsPanel.classList.remove("open");

  async function renderSettings() {
    const settings = await getSettings();
    
    // Render sites
    sitesListEl.innerHTML = settings.blockedSites.map(site => `
      <div class="block-item">
        <span>${site}</span>
      </div>
    `).join('');



    // Render active duration
    durationOptions.forEach(opt => {
      opt.classList.toggle("active", parseInt(opt.dataset.value) === settings.duration);
      opt.onclick = () => {
        chrome.storage.local.set({ duration: parseInt(opt.dataset.value) }, renderSettings);
      };
    });

    // Render lock selection
    lockOptions.forEach(opt => {
      opt.classList.toggle("active", parseInt(opt.dataset.days) === selectedLockDays);
      opt.onclick = () => {
        selectedLockDays = parseInt(opt.dataset.days);
        renderSettings();
      };
    });
  }

  activateLockBtn.onclick = async () => {
    if (selectedLockDays > 0) {
      const confirmed = await showCustomModal({
        title: "Are you sure?",
        message: `You are about to lock your settings for ${selectedLockDays} days. This action cannot be undone and you won't be able to change any settings until the time is up.`,
        confirmText: "Lock Now",
        cancelText: "Go Back"
      });

      if (confirmed) {
        const lockUntil = Date.now() + (selectedLockDays * 24 * 60 * 60 * 1000);
        chrome.storage.local.set({ lockUntil }, () => {
          updateLockUI();
        });
      }
    } else {
      showCustomModal({
        title: "Selection Required",
        message: "Please select a lock duration before clicking the lock button.",
        confirmText: "Got it",
        type: "alert"
      });
    }
  };

  addSiteBtn.onclick = async () => {
    let newSite = newSiteInput.value.trim().toLowerCase();
    // Remove protocol (http/https), www prefix, and trailing slashes
    newSite = newSite.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/+$/, '');
    
    if (newSite) {
      const current = await getSettings();
      if (!current.blockedSites.includes(newSite)) {
        const updated = [...current.blockedSites, newSite];
        chrome.storage.local.set({ blockedSites: updated }, () => {
          newSiteInput.value = "";
          siteError.style.display = "none";
          renderSettings();
        });
      } else {
        siteError.style.display = "block";
      }
    }
  };

  renderSettings();
  updateLockUI();

  // Timer Logic
  const timerVal = container.querySelector("#timer-val");
  const timerLabel = container.querySelector("#timer-label");
  const goBackBtn = container.querySelector("#go-back-btn");
  
  let timeLeft = 60;
  let timerInterval;

  const isHardBlock = ['site', 'usage_limit', 'keyword', 'whitelist', 'focus_only_site', 'focus_mode'].includes(blockData.reason);

  // Start the particle hourglass animation for ALL blocks (visual only)
  const hgAnimation = window.startHourglass ? window.startHourglass(container) : null;

  if (isHardBlock) {
    // Hide timer for hard blocks
    timerVal.style.display = 'none';
    timerLabel.textContent = blockData.reason === 'usage_limit' ? 'Daily Limit Reached' : 'Access Restricted';
    timerLabel.style.fontSize = '18px';
    timerLabel.style.fontWeight = '700';
    timerLabel.style.color = '#fff';
    
    // Show Go Back button
    goBackBtn.style.display = 'flex';
    goBackBtn.onclick = () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.close();
      }
    };
  } else {
    getSettings().then(s => {
      timeLeft = s.duration;
      timerVal.textContent = timeLeft;

      timerInterval = setInterval(() => {
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
    });
  }

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
async function isBlockedUrl() {
  const url = window.location.href.toLowerCase();
  const settings = await getSettings();
  
  // 1. Focus Mode Logic
  const focusSession = settings.focusSession || {};
  if (focusSession.active && !focusSession.paused) {
    // During Focus Mode: Only allow Whitelisted sites
    const whitelist = settings.focusWhitelist || [];
    const isWhitelisted = whitelist.some(site => url.includes(site.toLowerCase()));
    
    // Always allow the dashboard and essential domains
    const isEssential = url.includes('localhost') || 
                        url.includes('127.0.0.1') || 
                        url.includes('focus-shield.vercel.app') ||
                        url.startsWith('chrome://') ||
                        url.startsWith('about:');

    if (!isWhitelisted && !isEssential) {
      return { blocked: true, reason: 'focus_mode' };
    }
    return { blocked: false };
  }

  // 2. Disabled outside Focus Mode logic (for focusWhitelist items)
  const focusWhitelist = settings.focusWhitelist || [];
  if (focusWhitelist.some(site => url.includes(site.toLowerCase()))) {
    // If it's a focus-only site and we are NOT focusing, block it.
    return { blocked: true, reason: 'focus_only_site' };
  }

  if (settings.isBlockingEnabled === false) return false;
  
  let allBlockedSites = [...(settings.blockedSites || [])];
  const activeCats = settings.blockedCategories || [];
  activeCats.forEach(catId => {
    if (CATEGORY_LISTS[catId]) {
      allBlockedSites.push(...CATEGORY_LISTS[catId]);
    }
  });

  const siteList = allBlockedSites.filter(site => site.trim().length > 0);
  let isBlocked = false;
  let blockReason = '';
  let blockCategory = '';

  for (const site of siteList) {
    if (url.includes(site)) {
      isBlocked = true;
      blockReason = 'site';
      // Try to find if it belongs to a category
      for (const [cat, list] of Object.entries(CATEGORY_LISTS)) {
        if (list.includes(site)) {
          blockCategory = cat;
          break;
        }
      }
      break;
    }
  }

  // Check Usage Limits
  if (!isBlocked && settings.usageLimits && settings.usageLimits.length > 0) {
    const todayKey = `insights_${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    const usageData = await new Promise(r => chrome.storage.local.get([todayKey], data => r(data[todayKey] || {})));
    
    const limitObj = settings.usageLimits.find(u => url.includes(u.domain));
    if (limitObj && limitObj.limitMinutes > 0) {
      const minsUsed = Math.floor((usageData[limitObj.domain] || 0) / 60);
      if (minsUsed >= limitObj.limitMinutes) {
        isBlocked = true;
        blockReason = 'usage_limit';
      }
    }
  }
  
  const keywords = [...(settings.blockedKeywords || [])];
  
  // If 'adult' category is active, add the hardcoded adult keywords as well
  if (activeCats.includes('adult')) {
    keywords.push(...ADULT_KEYWORDS);
  }

  const validKeywords = keywords.filter(kw => kw.trim().length > 0);
  if (validKeywords.length > 0) {
    const normalizedUrl = url.toLowerCase();
    // Check keywords in URL
    isBlocked = validKeywords.some(kw => {
      if (normalizedUrl.includes(kw.toLowerCase())) {
        blockReason = 'keyword';
        return true;
      }
      return false;
    });
    
    if (!isBlocked) {
      // Check keywords in Metadata
      const pageText = [
        document.title,
        document.querySelector('meta[name="description"]')?.content || '',
        document.querySelector('meta[name="keywords"]')?.content || '',
        document.querySelector('meta[property="og:title"]')?.content || '',
        document.querySelector('meta[property="og:description"]')?.content || ''
      ].join(' ').toLowerCase();
      
      isBlocked = validKeywords.some(kw => {
        if (pageText.includes(kw.toLowerCase())) {
          blockReason = 'keyword';
          return true;
        }
        return false;
      });
    }
  }
  
  if (settings.isWhitelistMode) {
    // Whitelist mode: block if NOT in list
    // Allow blank/new tabs and the Dashboard itself
    if (
      url.startsWith('chrome://') || 
      url.startsWith('about:') || 
      url.startsWith('chrome-extension://') ||
      url.includes('localhost') ||
      url.includes('127.0.0.1') ||
      url.includes('focus-shield.vercel.app')
    ) return { blocked: false };
    
    if (!isBlocked) {
      return { blocked: true, reason: 'whitelist' };
    }
    return { blocked: false };
  } else {
    // Normal blocklist mode
    if (isBlocked) {
      return { blocked: true, reason: blockReason, category: blockCategory };
    }
    return { blocked: false };
  }
}


// Helper to record blocked attempts
async function recordBlockedAttempt(reason, category) {
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const statsKey = `stats_${dateStr}`;
  
  const data = await new Promise(r => chrome.storage.local.get([statsKey], r));
  const stats = data[statsKey] || { blockedAttempts: 0, blockedCategories: {} };
  
  stats.blockedAttempts = (stats.blockedAttempts || 0) + 1;
  if (category) {
    stats.blockedCategories[category] = (stats.blockedCategories[category] || 0) + 1;
  }
  
  await chrome.storage.local.set({ [statsKey]: stats });
}

// Main function to manage viewing and apply timer
async function manageViewing() {
  const result = await isBlockedUrl();
  const existingBlocker = document.querySelector(".blocker-container");

  if (result.blocked) {
    if (!existingBlocker) {
      // Pause all videos immediately
      document.querySelectorAll("video").forEach(v => v.pause());
      createSandglassTimer(result);
      recordBlockedAttempt(result.reason, result.category);
    }
  } else if (existingBlocker) {
    existingBlocker.remove();
  }
}

// Initial check
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', manageViewing);
} else {
  manageViewing();
}

// Observe URL changes (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    manageViewing();
  }
}).observe(document, { subtree: true, childList: true });

// Periodic check every 30 seconds (to catch usage limit expiry mid-session)
setInterval(manageViewing, 30000);

// Initial check
manageViewing();

// Add communication bridge for Next.js Website Dashboard
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data && event.data.type === "FOCUS_SHIELD_SYNC") {
    // Forward the message to the background script
    try {
      chrome.runtime.sendMessage(event.data.payload, (response) => {
        // Check for runtime errors (like extension context invalidated)
        if (chrome.runtime.lastError) {
          console.error("FocusShield: Bridge Error", chrome.runtime.lastError.message);
          window.postMessage({ 
            type: "FOCUS_SHIELD_SYNC_RESPONSE", 
            actionType: event.data.actionType,
            error: chrome.runtime.lastError.message 
          }, "*");
          return;
        }

        // Send response back to the Next.js app
        window.postMessage({ 
          type: "FOCUS_SHIELD_SYNC_RESPONSE", 
          actionType: event.data.actionType,
          response 
        }, "*");
      });
    } catch (e) {
      console.error("FocusShield: Error sending message to background", e);
      // Propagate error back to website so it doesn't just time out
      window.postMessage({ 
        type: "FOCUS_SHIELD_SYNC_RESPONSE", 
        actionType: event.data.actionType,
        error: e.message || "Failed to communicate with extension"
      }, "*");
    }
  }
});
