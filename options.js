const DEFAULTS = {
    blockedSites: ["youtube.com/shorts", "instagram.com/reels"],
    duration: 60,
    lockUntil: 0
};

async function getSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get(DEFAULTS, (result) => {
            resolve(result);
        });
    });
}

// UI Elements
const sitesListEl = document.getElementById('sites-list');
const siteInput = document.getElementById('site-input');
const addBtn = document.getElementById('add-btn');
const siteError = document.getElementById('site-error');
const timerOptions = document.getElementById('timer-options');
const lockOptions = document.getElementById('lock-options');
const lockBtn = document.getElementById('lock-btn');
const lockTimer = document.getElementById('lock-timer');
const lockTimeLeft = document.getElementById('lock-time-left');
const modal = document.getElementById('modal');
const modalMsg = document.getElementById('modal-msg');
const modalConfirm = document.getElementById('modal-confirm');
const modalCancel = document.getElementById('modal-cancel');

let selectedLockDays = 0;

async function render() {
    const settings = await getSettings();
    const isLocked = Date.now() < settings.lockUntil;

    // Render sites
    sitesListEl.innerHTML = settings.blockedSites.map(site => `
        <div class="block-item">
            <span>${site}</span>
            ${!isLocked ? `<i class="fas fa-trash remove-site" data-site="${site}"></i>` : ''}
        </div>
    `).join('');

    if (!isLocked) {
        sitesListEl.querySelectorAll('.remove-site').forEach(btn => {
            btn.onclick = async () => {
                const siteToRemove = btn.dataset.site;
                const current = await getSettings();
                const updated = current.blockedSites.filter(s => s !== siteToRemove);
                chrome.storage.local.set({ blockedSites: updated }, render);
            };
        });
    }

    // Render timer options
    timerOptions.innerHTML = [60, 300, 600, 1800, 3600, 7200].map(val => {
        const labels = {60: '1 Min', 300: '5 Min', 600: '10 Min', 1800: '30 Min', 3600: '1 Hour', 7200: '2 Hours'};
        return `<div class="duration-option ${settings.duration === val ? 'active' : ''} ${isLocked ? 'disabled' : ''}" data-value="${val}">${labels[val]}</div>`;
    }).join('');

    if (!isLocked) {
        timerOptions.querySelectorAll('.duration-option').forEach(opt => {
            opt.onclick = () => {
                chrome.storage.local.set({ duration: parseInt(opt.dataset.value) }, render);
            };
        });
    }

    // Render lock UI
    if (isLocked) {
        lockBtn.style.display = 'none';
        lockTimer.style.display = 'flex';
        lockOptions.parentElement.style.opacity = '0.5';
        lockOptions.parentElement.style.pointerEvents = 'none';
        addBtn.disabled = true;
        siteInput.disabled = true;
        
        const updateCountdown = () => {
            const now = Date.now();
            const left = settings.lockUntil - now;
            if (left <= 0) {
                render();
                return;
            }
            const days = Math.floor(left / (1000 * 60 * 60 * 24));
            const hours = Math.floor((left % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((left % (1000 * 60 * 60)) / (1000 * 60));
            lockTimeLeft.textContent = `LOCKED: ${days}d ${hours}h ${mins}m left`;
        };
        updateCountdown();
    } else {
        lockBtn.style.display = 'block';
        lockTimer.style.display = 'none';
        lockOptions.parentElement.style.opacity = '1';
        lockOptions.parentElement.style.pointerEvents = 'auto';
        addBtn.disabled = false;
        siteInput.disabled = false;
    }

    // Lock selection
    lockOptions.querySelectorAll('.lock-opt').forEach(opt => {
        opt.classList.toggle('active', parseInt(opt.dataset.days) === selectedLockDays);
        opt.onclick = () => {
            selectedLockDays = parseInt(opt.dataset.days);
            render();
        };
    });
}

addBtn.onclick = async () => {
    let newSite = siteInput.value.trim().toLowerCase();
    newSite = newSite.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/+$/, '');
    
    if (newSite) {
        const current = await getSettings();
        if (!current.blockedSites.includes(newSite)) {
            const updated = [...current.blockedSites, newSite];
            chrome.storage.local.set({ blockedSites: updated }, () => {
                siteInput.value = "";
                siteError.style.display = "none";
                render();
            });
        } else {
            siteError.style.display = "block";
        }
    }
};

lockBtn.onclick = () => {
    if (selectedLockDays === 0) {
        alert("Please select a lock duration first.");
        return;
    }
    modalMsg.textContent = `You are about to lock your settings for ${selectedLockDays} days. You will NOT be able to change blocked sites or timer settings until the time expires. This cannot be undone.`;
    modal.style.display = 'flex';
};

modalCancel.onclick = () => modal.style.display = 'none';

modalConfirm.onclick = async () => {
    const lockUntil = Date.now() + (selectedLockDays * 24 * 60 * 60 * 1000);
    await chrome.storage.local.set({ lockUntil });
    modal.style.display = 'none';
    render();
};

render();
