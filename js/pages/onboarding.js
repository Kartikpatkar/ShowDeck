/**
 * ShowDeck — Onboarding Flow
 */

import { applyCustomTheme } from '../utils/dom.js';

let currentStep = '1';

export function render() {
  return `
    <div id="onboarding-container" class="page-container animate-fade-in" style="max-width: 600px; margin: 0 auto; padding-top: var(--space-8);">
      <div class="progress-wrap" id="progressWrap">
        <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
        <div class="progress-label" id="progressLabel">Step 1 of 4</div>
      </div>

      <div class="card" style="padding: var(--space-8); text-align: center;">
        
        <!-- Step 1: Welcome & Sync -->
        <div class="step active" id="onboarding-step-1">
          <div class="emoji">👋</div>
          <h1>Welcome to ShowDeck</h1>
          <p class="sub">ShowDeck is your private, local-first media tracker. Setup takes under a minute.</p>
          
          <div class="stack">
            <button id="btn-sync-drive" class="btn btn-primary btn-full" style="background: #4285F4; border: none; padding: 12px; font-size: var(--text-md);">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" style="margin-right:8px;"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign In & Restore Backup
            </button>
            <button id="btn-manual-setup" class="btn btn-secondary btn-full" style="padding: 12px; font-size: var(--text-md);">
              Set up manually (Skip)
            </button>
          </div>
        </div>

        <!-- Step 1b: Name (Manual Setup) -->
        <div class="step" id="onboarding-step-1b">
          <div class="emoji">👤</div>
          <h1>What should we call you?</h1>
          <p class="sub">We'll use this to personalize your experience.</p>
          <div class="field">
            <input type="text" id="onboarding-name" class="input" placeholder="Enter your name" style="width: 100%; font-size: var(--text-lg); padding: var(--space-3);" />
          </div>
          <div class="btn-row">
            <button class="btn btn-ghost" data-back="1">Back</button>
            <button id="btn-next-1" class="btn btn-primary" style="flex:1; font-size: var(--text-md); padding: var(--space-3);">Continue</button>
          </div>
        </div>

        <!-- Step 2: Appearance -->
        <div class="step" id="onboarding-step-2">
          <div class="emoji">🎨</div>
          <h1>Make it yours</h1>
          <p class="sub">Choose your theme and accent color. Preview updates live.</p>
          
          <div class="preview-card">
            <div class="preview-top">
              <div class="preview-swatch" id="previewSwatch"></div>
              <div>
                <div class="preview-title">Inception</div>
                <div class="preview-meta">Watching · S1E4</div>
              </div>
            </div>
            <div class="preview-track"><div class="preview-bar" id="previewBar"></div></div>
          </div>

          <div class="field">
            <label style="display:block; margin-bottom: var(--space-2); font-weight: var(--weight-medium);">Base Theme</label>
            <select id="onboarding-theme-select" class="input" style="width: 100%;">
              <option value="system">System Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="oled">OLED Black</option>
              <option value="dracula">Dracula</option>
              <option value="nord">Nord</option>
              <option value="catppuccin">Catppuccin</option>
              <option value="tokyo">Tokyo Night</option>
            </select>
          </div>
          
          <div style="text-align: left; margin-bottom: var(--space-2);">
            <label style="display:block; font-weight: var(--weight-medium);">Accent Color</label>
          </div>
          
          <div class="swatches" id="swatches">
            <button class="swatch color-preset active" data-color="purple" style="background: hsl(245, 58%, 51%);"></button>
            <button class="swatch color-preset" data-color="blue" style="background: hsl(210, 100%, 50%);"></button>
            <button class="swatch color-preset" data-color="green" style="background: hsl(152, 55%, 42%);"></button>
            <button class="swatch color-preset" data-color="red" style="background: hsl(0, 72%, 51%);"></button>
            <div style="position: relative; width: 48px; height: 48px;">
              <input type="color" id="onboarding-custom-color" value="#ffffff" style="opacity: 0; position: absolute; inset: 0; width: 100%; height: 100%; cursor: pointer; z-index: 2;" />
              <div class="swatch color-preset" id="custom-color-preview" data-color="custom" style="background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red); pointer-events: none; position: absolute; inset: 0;"></div>
            </div>
          </div>
          <div class="btn-row">
            <button class="btn btn-ghost" data-back="1b">Back</button>
            <button id="btn-next-2" class="btn btn-primary" style="flex:1; font-size: var(--text-md); padding: var(--space-3);">Continue</button>
          </div>
        </div>

        <!-- Step 3: API Setup -->
        <div class="step" id="onboarding-step-3">
          <div class="emoji">🔌</div>
          <h1>Connect Data Sources</h1>
          <div class="field">
            <label style="display:block; margin-bottom: var(--space-2); font-weight: var(--weight-medium);">TMDB API Key (Optional)</label>
            <input type="text" autocomplete="off" spellcheck="false" id="onboarding-tmdb-key" class="input" placeholder="Enter TMDB API Key" style="width: 100%;" />
          </div>
          
          <div class="toggle-row">
            <div>
              <div class="toggle-label-main">Include Adult Content</div>
              <div class="toggle-label-sub">Allow 18+ content in search results</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="onboarding-adult-toggle">
              <span class="slider"></span>
            </label>
          </div>
          
          <div class="btn-row">
            <button class="btn btn-ghost" data-back="2">Back</button>
            <button id="btn-skip-3" class="btn btn-secondary" style="flex: 1;">Skip</button>
            <button id="btn-finish" class="btn btn-primary" style="flex: 1;">Finish Setup</button>
          </div>
        </div>

        <!-- Step 4: Success -->
        <div class="step" id="onboarding-step-4">
          <div class="check-wrap">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle id="circleAnim" cx="36" cy="36" r="34" fill="none" stroke="var(--color-primary)" stroke-width="3" stroke-dasharray="214" stroke-dashoffset="214"/>
              <path id="checkAnim" d="M20 37 L31 48 L52 25" fill="none" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="50" stroke-dashoffset="50"/>
            </svg>
          </div>
          <h1>You're all set</h1>
          <p class="sub">ShowDeck is ready to go. Taking you to your library...</p>
        </div>

      </div>
    </div>
  `;
}

export function init() {
  const container = document.getElementById('page-content');
  let selectedTheme = 'purple';
  let customHex = null;
  
  const SLOT = { '1': 1, '1b': 2, '2': 3, '3': 4, '4': null };
  const TOTAL = 4;

  function showStep(id) {
    container.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    container.querySelector('#onboarding-step-' + id)?.classList.add('active');

    const slot = SLOT[id];
    const wrap = container.querySelector('#progressWrap');
    if (slot == null) {
      wrap.style.display = 'none';
    } else {
      wrap.style.display = 'block';
      container.querySelector('#progressFill').style.width = (slot / TOTAL * 100) + '%';
      container.querySelector('#progressLabel').textContent = 'Step ' + slot + ' of ' + TOTAL;
    }

    if (id === '4') {
      const circle = container.querySelector('#circleAnim');
      const check = container.querySelector('#checkAnim');
      circle.style.animation = 'none'; check.style.animation = 'none';
      void circle.offsetWidth;
      circle.style.animation = 'circleDraw .5s ease forwards';
      check.style.animation = 'checkDraw .35s ease .45s forwards';
    }
  }
  
  // Set initial state
  showStep('1');

  // Back Buttons
  container.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      showStep(e.target.dataset.back);
    });
  });

  // Step 1: Sync or Manual
  const btnSyncDrive = container.querySelector('#btn-sync-drive');
  const btnManualSetup = container.querySelector('#btn-manual-setup');
  
  btnManualSetup?.addEventListener('click', () => {
    showStep('1b');
  });
  
  btnSyncDrive?.addEventListener('click', async () => {
    try {
      btnSyncDrive.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;border-top-color:white;margin-right:4px;"></div> Syncing...';
      const { initDrive, restoreFromDrive } = await import('../api/drive.js');
      await initDrive();
      const backup = await restoreFromDrive();
      
      if (!backup) {
        // No backup found, just proceed to manual setup but they are now signed in
        const { toast } = await import('../components/toast.js');
        toast('Signed in! No previous backup found.', 'success');
        showStep('1b');
        return;
      }
      
      // Restore everything
      const { db, clearAllData } = await import('../database/db.js');
      await clearAllData();
      
      if (backup.settings) {
        if (backup.settings.tmdbKey) localStorage.setItem('showdeck_tmdb_key', backup.settings.tmdbKey);
        if (backup.settings.name) localStorage.setItem('showdeck_user_name', backup.settings.name);
        if (backup.settings.theme) localStorage.setItem('showdeck_theme', backup.settings.theme);
        if (backup.settings.accentTheme) localStorage.setItem('showdeck_accent_theme', backup.settings.accentTheme);
        if (backup.settings.customColor) localStorage.setItem('showdeck_custom_color', backup.settings.customColor);
        if (backup.settings.includeAdult) localStorage.setItem('showdeck_include_adult', backup.settings.includeAdult);
        if (backup.settings.view) localStorage.setItem('showdeck_view_preference', backup.settings.view);
      }
      
      await db.transaction('rw', db.shows, db.movies, db.episodes, db.collections, db.tags, db.activity, async () => {
        if (backup.data.shows) await db.shows.bulkAdd(backup.data.shows);
        if (backup.data.movies) await db.movies.bulkAdd(backup.data.movies);
        if (backup.data.episodes) await db.episodes.bulkAdd(backup.data.episodes);
        if (backup.data.collections) await db.collections.bulkAdd(backup.data.collections);
        if (backup.data.tags) await db.tags.bulkAdd(backup.data.tags);
        if (backup.data.activity) await db.activity.bulkAdd(backup.data.activity);
      });
      
      showStep('4');
      setTimeout(() => {
        localStorage.setItem('showdeck_onboarded', 'true');
        window.location.hash = '#/';
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error(err);
      const { toast } = await import('../components/toast.js');
      toast('Sync failed or cancelled', 'error');
      btnSyncDrive.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" style="margin-right:8px;"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Sign In & Restore Backup';
    }
  });

  // Step 1b: Name
  const btnNext1 = container.querySelector('#btn-next-1');
  const nameInput = container.querySelector('#onboarding-name');
  nameInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnNext1.click();
  });
  btnNext1.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    if (name) {
      localStorage.setItem('showdeck_user_name', name);
      showStep('2');
    } else {
      const { toast } = await import('../components/toast.js');
      toast('Please enter your name to continue.', 'error');
      nameInput.focus();
    }
  });

  // Step 2
  const presets = container.querySelectorAll('.color-preset');
  const customColorInput = container.querySelector('#onboarding-custom-color');
  const customColorPreview = container.querySelector('#custom-color-preview');
  const previewSwatch = container.querySelector('#previewSwatch');
  const previewBar = container.querySelector('#previewBar');
  
  presets.forEach(p => {
    p.addEventListener('click', (e) => {
      presets.forEach(preset => preset.classList.remove('active'));
      p.classList.add('active');
      selectedTheme = p.dataset.color;
      
      if (selectedTheme !== 'custom') {
        const computedBg = getComputedStyle(p).backgroundColor;
        previewSwatch.style.background = computedBg;
        previewBar.style.background = computedBg;
        
        localStorage.setItem('showdeck_accent_theme', selectedTheme);
        localStorage.removeItem('showdeck_custom_color');
        import('../app.js').then(({ initTheme }) => initTheme());
      }
    });
  });

  customColorInput.addEventListener('input', (e) => {
    presets.forEach(preset => preset.classList.remove('active'));
    customColorPreview.classList.add('active');
    selectedTheme = 'custom';
    customHex = e.target.value;
    
    customColorPreview.style.background = customHex;
    previewSwatch.style.background = customHex;
    previewBar.style.background = customHex;
    
    localStorage.setItem('showdeck_accent_theme', 'custom');
    localStorage.setItem('showdeck_custom_color', customHex);
    import('../app.js').then(({ initTheme }) => initTheme());
  });

  const themeSelect = container.querySelector('#onboarding-theme-select');
  themeSelect.addEventListener('change', (e) => {
    const mode = e.target.value;
    localStorage.setItem('showdeck_theme', mode);
    import('../app.js').then(({ initTheme }) => initTheme());
  });

  const btnNext2 = container.querySelector('#btn-next-2');
  btnNext2.addEventListener('click', () => {
    localStorage.setItem('showdeck_accent_theme', selectedTheme);
    if (selectedTheme === 'custom' && customHex) {
      localStorage.setItem('showdeck_custom_color', customHex);
    } else {
      localStorage.removeItem('showdeck_custom_color');
    }
    showStep('3');
  });

  // Step 3
  const tmdbInput = container.querySelector('#onboarding-tmdb-key');
  const adultToggle = container.querySelector('#onboarding-adult-toggle');
  
  tmdbInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish();
  });
  
  adultToggle?.addEventListener('change', async (e) => {
    if (e.target.checked) {
      const { confirmModal } = await import('../components/modal.js');
      const approved = await confirmModal(
        'Adult Content Warning',
        'Only select this if you are of legal age in your region. Are you sure you want to enable adult content?',
        'Enable',
        true
      );
      if (!approved) {
        e.target.checked = false;
        return;
      }
    }
  });
  
  const finish = () => {
    const tmdb = tmdbInput.value.trim();
    if (tmdb) localStorage.setItem('showdeck_tmdb_key', tmdb);
    
    if (adultToggle?.checked) {
      localStorage.setItem('showdeck_include_adult', 'true');
    } else {
      localStorage.setItem('showdeck_include_adult', 'false');
    }
    
    showStep('4');
    setTimeout(() => {
      localStorage.setItem('showdeck_onboarded', 'true');
      window.location.hash = '#/';
      window.location.reload();
    }, 1500);
  };

  container.querySelector('#btn-skip-3')?.addEventListener('click', finish);
  container.querySelector('#btn-finish')?.addEventListener('click', finish);
}
