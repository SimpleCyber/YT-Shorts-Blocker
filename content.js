// Function to create and inject the sandglass timer
function createSandglassTimer() {
    // Create stylesheet for the timer
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      :root {
        --bg-color: #f5f5f5;
        --text-color: #333;
        --glass-color: rgba(255, 255, 255, 0.3);
        --sand-color: #e2c496;
        --glass-border: #a0a0a0;
        --glass-shadow: rgba(0, 0, 0, 0.2);
        --quote-bg: rgba(255, 255, 255, 0.9);
        --hourglass-outline: #888;
      }
  
      .dark-mode {
        --bg-color: #222;
        --text-color: #f5f5f5;
        --glass-color: rgba(30, 30, 30, 0.5);
        --sand-color: #d4a76a;
        --glass-border: #555;
        --glass-shadow: rgba(0, 0, 0, 0.5);
        --quote-bg: rgba(30, 30, 30, 0.9);
        --hourglass-outline: #aaa;
      }
  
      .quote-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-color);
        color: var(--text-color);
        z-index: 9999;
        font-family: Arial, sans-serif;
        transition: all 0.3s ease;
      }
  
      .content-wrapper {
        width: 80%;
        max-width: 600px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        background-color: var(--quote-bg);
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 4px 25px var(--glass-shadow);
      }
  
      .quote-text {
        font-size: 24px;
        font-weight: 500;
        margin-bottom: 15px;
        line-height: 1.4;
      }
  
      .quote-author {
        font-size: 20px;
        font-style: italic;
        margin-bottom: 30px;
      }
  
      .info-text {
        font-size: 20px;
        margin: 15px 0;
      }
  
      .timer-display {
        font-size: 28px;
        font-weight: bold;
        margin: 10px 0;
      }
  
      .sandglass-container {
        position: relative;
        width: 200px;
        height: 320px;
        margin: 20px 0;
        display: flex;
        justify-content: center;
        align-items: center;
      }
  
      .hourglass {
        position: relative;
        width: 140px;
        height: 220px;
      }
  
      /* Realistic hourglass shape with pseudo-elements */
      .hourglass-top {
        position: absolute;
        width: 100%;
        height: 100px;
        top: 0;
        border-radius: 50% 50% 0 0;
        border: 2px solid var(--hourglass-outline);
        border-bottom: none;
        background-color: var(--glass-color);
        overflow: hidden;
        box-shadow: inset 0 10px 15px rgba(255, 255, 255, 0.3);
      }
  
      .hourglass-middle {
        position: absolute;
        width: 30px;
        height: 20px;
        left: 55px;
        top: 100px;
        background-color: var(--hourglass-outline);
        z-index: 3;
      }
  
      .hourglass-bottom {
        position: absolute;
        width: 100%;
        height: 100px;
        bottom: 0;
        border-radius: 0 0 50% 50%;
        border: 2px solid var(--hourglass-outline);
        border-top: none;
        background-color: var(--glass-color);
        overflow: hidden;
        box-shadow: inset 0 -10px 15px rgba(255, 255, 255, 0.3);
      }
  
      .hourglass-neck {
        position: absolute;
        width: 30px;
        height: 20px;
        left: 55px;
        top: 100px;
        background-color: var(--glass-color);
        border-left: 2px solid var(--hourglass-outline);
        border-right: 2px solid var(--hourglass-outline);
        z-index: 2;
      }
  
      .top-sand, .bottom-sand {
        position: absolute;
        background-color: var(--sand-color);
        left: 50%;
        transform: translateX(-50%);
        border-radius: 50%;
        transition: height 0.5s linear;
      }
  
      .top-sand {
        width: 80%;
        height: 80px;
        top: 10px;
        clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%);
      }
  
      .bottom-sand {
        width: 80%;
        height: 0px;
        bottom: 10px;
        clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%);
      }
  
      .sand-stream {
        position: absolute;
        width: 4px;
        height: 20px;
        left: 68px;
        top: 100px;
        background-color: var(--sand-color);
        opacity: 0;
        z-index: 1;
      }
  
      .sand-particles {
        position: absolute;
        width: 50px;
        height: 50px;
        left: 45px;
        top: 115px;
        opacity: 0;
      }
  
      .particle {
        position: absolute;
        width: 3px;
        height: 3px;
        background-color: var(--sand-color);
        border-radius: 50%;
        opacity: 0;
      }
  
      .theme-toggle {
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        border: none;
        font-size: 24px;
        color: var(--text-color);
        cursor: pointer;
        z-index: 10000;
        padding: 10px;
        border-radius: 50%;
        background-color: var(--glass-color);
        box-shadow: 0 2px 10px var(--glass-shadow);
      }
  
      .theme-toggle:hover {
        transform: scale(1.1);
      }
  
      @media (max-width: 600px) {
        .content-wrapper {
          width: 90%;
          padding: 20px;
        }
        
        .quote-text {
          font-size: 20px;
        }
        
        .sandglass-container {
          transform: scale(0.9);
        }
      }
    `;
    document.head.appendChild(styleEl);
  
    // Load Font Awesome
    if (!document.getElementById('font-awesome-link')) {
      const fontAwesome = document.createElement('link');
      fontAwesome.id = 'font-awesome-link';
      fontAwesome.rel = 'stylesheet';
      fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(fontAwesome);
    }
  
    // Create container
    const container = document.createElement('div');
    container.className = 'quote-container';
    
    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-wrapper';
    
    // Create quote elements
    const quoteText = document.createElement('div');
    quoteText.className = 'quote-text';
    quoteText.textContent = 'Loading quote...';
    
    const quoteAuthor = document.createElement('div');
    quoteAuthor.className = 'quote-author';
    quoteAuthor.textContent = '- Loading author';
    
    const infoText = document.createElement('div');
    infoText.className = 'info-text';
    infoText.textContent = 'Please wait before watching.';
  
    // Create sandglass
    const sandglassContainer = document.createElement('div');
    sandglassContainer.className = 'sandglass-container';
    
    const hourglass = document.createElement('div');
    hourglass.className = 'hourglass';
    
    const hourglassTop = document.createElement('div');
    hourglassTop.className = 'hourglass-top';
    
    const hourglassMiddle = document.createElement('div');
    hourglassMiddle.className = 'hourglass-middle';
    
    const hourglassBottom = document.createElement('div');
    hourglassBottom.className = 'hourglass-bottom';
    
    const hourglassNeck = document.createElement('div');
    hourglassNeck.className = 'hourglass-neck';
    
    const topSand = document.createElement('div');
    topSand.className = 'top-sand';
    
    const bottomSand = document.createElement('div');
    bottomSand.className = 'bottom-sand';
    
    const sandStream = document.createElement('div');
    sandStream.className = 'sand-stream';
    
    const sandParticles = document.createElement('div');
    sandParticles.className = 'sand-particles';
    
    // Create 10 sand particles
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      sandParticles.appendChild(particle);
    }
    
    hourglassTop.appendChild(topSand);
    hourglassBottom.appendChild(bottomSand);
    hourglass.appendChild(hourglassTop);
    hourglass.appendChild(hourglassMiddle);
    hourglass.appendChild(hourglassBottom);
    hourglass.appendChild(hourglassNeck);
    hourglass.appendChild(sandStream);
    hourglass.appendChild(sandParticles);
    sandglassContainer.appendChild(hourglass);
    
    // Create timer display
    const timerDisplay = document.createElement('div');
    timerDisplay.className = 'timer-display';
    timerDisplay.textContent = '60';
    
    // Create theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    themeToggle.title = 'Toggle dark mode';
    
    // Assemble the UI
    contentWrapper.appendChild(quoteText);
    contentWrapper.appendChild(quoteAuthor);
    contentWrapper.appendChild(infoText);
    contentWrapper.appendChild(sandglassContainer);
    contentWrapper.appendChild(timerDisplay);
    
    container.appendChild(themeToggle);
    container.appendChild(contentWrapper);
    
    document.body.appendChild(container);
    
    // Animation functions
    function animateSandParticles() {
      const particles = document.querySelectorAll('.particle');
      particles.forEach((particle, index) => {
        // Random position within the sandParticles container
        const leftPos = Math.random() * 30;
        const delay = index * 200;
        
        // Reset and animate each particle
        setTimeout(() => {
          particle.style.left = `${leftPos}px`;
          particle.style.top = '0px';
          particle.style.opacity = '0.8';
          
          // Animation
          let pos = 0;
          const id = setInterval(() => {
            if (pos >= 30) {
              clearInterval(id);
              particle.style.opacity = '0';
            } else {
              pos++;
              particle.style.top = `${pos}px`;
              particle.style.opacity = 0.8 - (pos / 30);
            }
          }, 50);
        }, delay);
      });
    }
    
    // Create animation loop for sand falling
    function startSandAnimation() {
      sandStream.style.opacity = '1';
      sandParticles.style.opacity = '1';
      
      // Start sand particle animation
      setInterval(animateSandParticles, 2000);
    }
    
    // Fetch a random quote
    async function fetchQuote() {
      try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching quote:', error);
        return {
          content: 'Take a break from endless scrolling and do something meaningful!',
          author: 'Digital Wellbeing Timer'
        };
      }
    }
    
    // Update quote display
    async function updateQuote() {
      const quote = await fetchQuote();
      quoteText.textContent = `"${quote.content}"`;
      quoteAuthor.textContent = `- ${quote.author}`;
    }
    
    // Theme toggle functionality
    function toggleTheme() {
      document.body.classList.toggle('dark-mode');
      container.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
      localStorage.setItem('darkMode', isDark);
    }
    
    // Apply saved theme
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
      container.classList.add('dark-mode');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    themeToggle.addEventListener('click', toggleTheme);
    
    // Timer functionality
    let timerDuration = 60;
    let timeRemaining = timerDuration;
    let timerInterval;
    
    function updateTimerDisplay() {
      timerDisplay.textContent = timeRemaining;
      
      // Calculate sand levels
      const sandPercentage = timeRemaining / timerDuration;
      const topHeight = sandPercentage * 80;
      const bottomHeight = 80 - topHeight;
      
      topSand.style.height = `${topHeight}px`;
      bottomSand.style.height = `${bottomHeight}px`;
    }
    
    function startTimer() {
      startSandAnimation();
      
      timerInterval = setInterval(() => {
        if (timeRemaining <= 0) {
          clearInterval(timerInterval);
          timerComplete();
          return;
        }
        
        timeRemaining--;
        updateTimerDisplay();
      }, 1000);
    }
    
    function timerComplete() {
      infoText.textContent = "Time's up! You can continue watching.";
      sandStream.style.opacity = '0';
      sandParticles.style.opacity = '0';
      
      setTimeout(() => {
        container.style.display = 'none';
        // Unmute and play videos
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
          video.muted = false;
          video.play();
        });
      }, 2000);
    }
    
    // Mute and pause videos
    function muteAndPauseVideos() {
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        video.pause();
        video.muted = true;
      });
    }
    
    // Initialize
    updateQuote();
    updateTimerDisplay();
    muteAndPauseVideos();
    startTimer();
    
    return {
      removeTimer: () => {
        container.remove();
        clearInterval(timerInterval);
      }
    };
  }
  
  // Function to check if this is a blocked URL
  function isBlockedUrl() {
    const url = window.location.href;
    return url.includes('/shorts/') || url.includes('/reels/');
  }
  
  // Main function to manage viewing and apply timer
  async function manageViewing() {
    if (isBlockedUrl()) {
      const timer = createSandglassTimer();
      
      // Wait 60 seconds
      await new Promise(resolve => setTimeout(resolve, 60000));
      
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