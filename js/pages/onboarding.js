/**
 * ShowDeck — Onboarding Flow
 */

import { applyCustomTheme } from '../utils/dom.js';

let currentStep = 1;

export function render() {
  return `
    <div class="page-container animate-fade-in" style="max-width: 600px; margin: 0 auto; padding-top: var(--space-12);">
      <div class="card" style="padding: var(--space-8); text-align: center;">
        
        <!-- Step 1: Welcome -->
        <div id="onboarding-step-1" class="onboarding-step animate-fade-in" style="display: block;">
          <div style="font-size: 48px; margin-bottom: var(--space-4);">👋</div>
          <h1 style="font-size: var(--text-2xl); font-weight: var(--weight-bold); margin-bottom: var(--space-2);">Welcome to ShowDeck</h1>
          <p style="color: var(--text-secondary); margin-bottom: var(--space-6); line-height: 1.6;">
            ShowDeck is your private, local-first media tracker. None of your data ever leaves this device, and you have complete control over your library.
          </p>
          <div style="text-align: left; margin-bottom: var(--space-8);">
            <label style="display:block; margin-bottom: var(--space-2); font-weight: var(--weight-medium);">What should we call you?</label>
            <input type="text" id="onboarding-name" class="input" placeholder="Enter your name" style="width: 100%; font-size: var(--text-lg); padding: var(--space-3);" />
          </div>
          <button id="btn-next-1" class="btn btn-primary" style="width: 100%; font-size: var(--text-md); padding: var(--space-3);">Continue</button>
        </div>

        <!-- Step 2: Appearance -->
        <div id="onboarding-step-2" class="onboarding-step animate-fade-in" style="display: none;">
          <div style="font-size: 48px; margin-bottom: var(--space-4);">🎨</div>
          <h1 style="font-size: var(--text-2xl); font-weight: var(--weight-bold); margin-bottom: var(--space-2);">Make it yours</h1>
          <p style="color: var(--text-secondary); margin-bottom: var(--space-6);">Choose an accent color for your UI.</p>
          
          <div style="display: flex; gap: var(--space-4); justify-content: center; margin-bottom: var(--space-8); flex-wrap: wrap;">
            <button class="color-preset active" data-color="purple" style="width: 48px; height: 48px; border-radius: 50%; background: hsl(245, 58%, 51%); border: 3px solid transparent; cursor: pointer;"></button>
            <button class="color-preset" data-color="blue" style="width: 48px; height: 48px; border-radius: 50%; background: hsl(210, 100%, 50%); border: 3px solid transparent; cursor: pointer;"></button>
            <button class="color-preset" data-color="green" style="width: 48px; height: 48px; border-radius: 50%; background: hsl(152, 55%, 42%); border: 3px solid transparent; cursor: pointer;"></button>
            <button class="color-preset" data-color="red" style="width: 48px; height: 48px; border-radius: 50%; background: hsl(0, 72%, 51%); border: 3px solid transparent; cursor: pointer;"></button>
            <div style="position: relative; width: 48px; height: 48px;">
              <input type="color" id="onboarding-custom-color" value="#ffffff" style="opacity: 0; position: absolute; inset: 0; width: 100%; height: 100%; cursor: pointer; z-index: 2;" />
              <div class="color-preset" id="custom-color-preview" data-color="custom" style="width: 48px; height: 48px; border-radius: 50%; background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red); border: 3px solid transparent; pointer-events: none; position: absolute; inset: 0;"></div>
            </div>
          </div>
          <button id="btn-next-2" class="btn btn-primary" style="width: 100%; font-size: var(--text-md); padding: var(--space-3);">Continue</button>
        </div>

        <!-- Step 3: API Setup -->
        <div id="onboarding-step-3" class="onboarding-step animate-fade-in" style="display: none;">
          <div style="font-size: 48px; margin-bottom: var(--space-4);">🔌</div>
          <h1 style="font-size: var(--text-2xl); font-weight: var(--weight-bold); margin-bottom: var(--space-2);">Connect Data Sources</h1>
          <div style="text-align: left; margin-bottom: var(--space-8);">
            <label style="display:block; margin-bottom: var(--space-2); font-weight: var(--weight-medium);">TMDB API Key (Optional)</label>
            <input type="password" id="onboarding-tmdb-key" class="input" placeholder="Enter TMDB API Key" style="width: 100%;" />
          </div>
          
          <div style="display: flex; gap: var(--space-4);">
            <button id="btn-skip-3" class="btn btn-ghost" style="flex: 1;">Skip for now</button>
            <button id="btn-finish" class="btn btn-primary" style="flex: 1;">Finish Setup</button>
          </div>
        </div>

      </div>
    </div>
    <style>
      .color-preset.active {
        border-color: var(--text-primary) !important;
        transform: scale(1.1);
      }
      .color-preset {
        transition: transform 0.2s, border-color 0.2s;
      }
    </style>
  `;
}

export function init() {
  const container = document.getElementById('page-content');
  currentStep = 1;
  let selectedTheme = 'purple';
  let customHex = null;

  const steps = [
    container.querySelector('#onboarding-step-1'),
    container.querySelector('#onboarding-step-2'),
    container.querySelector('#onboarding-step-3'),
  ];

  function showStep(stepNumber) {
    steps.forEach((step, index) => {
      step.style.display = (index + 1 === stepNumber) ? 'block' : 'none';
    });
  }

  // Step 1
  const btnNext1 = container.querySelector('#btn-next-1');
  const nameInput = container.querySelector('#onboarding-name');
  btnNext1.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name) {
      localStorage.setItem('showdeck_user_name', name);
    }
    showStep(2);
  });

  // Step 2
  const presets = container.querySelectorAll('.color-preset');
  const customColorInput = container.querySelector('#onboarding-custom-color');
  const customColorPreview = container.querySelector('#custom-color-preview');
  
  presets.forEach(p => {
    p.addEventListener('click', (e) => {
      presets.forEach(preset => preset.classList.remove('active'));
      p.classList.add('active');
      selectedTheme = p.dataset.color;
      
      if (selectedTheme !== 'custom') {
        document.body.dataset.theme = selectedTheme;
        applyCustomTheme(null);
      }
    });
  });

  customColorInput.addEventListener('input', (e) => {
    presets.forEach(preset => preset.classList.remove('active'));
    customColorPreview.classList.add('active');
    selectedTheme = 'custom';
    customHex = e.target.value;
    customColorPreview.style.background = customHex;
    document.body.dataset.theme = 'custom';
    applyCustomTheme(customHex);
  });

  const btnNext2 = container.querySelector('#btn-next-2');
  btnNext2.addEventListener('click', () => {
    localStorage.setItem('showdeck_accent_theme', selectedTheme);
    if (selectedTheme === 'custom' && customHex) {
      localStorage.setItem('showdeck_custom_color', customHex);
    } else {
      localStorage.removeItem('showdeck_custom_color');
    }
    showStep(3);
  });

  // Step 3
  const tmdbInput = container.querySelector('#onboarding-tmdb-key');
  
  const finish = () => {
    const tmdb = tmdbInput.value.trim();
    if (tmdb) localStorage.setItem('showdeck_tmdb_key', tmdb);
    
    localStorage.setItem('showdeck_onboarded', 'true');
    window.location.hash = '#/home';
  };

  container.querySelector('#btn-finish').addEventListener('click', finish);
  container.querySelector('#btn-skip-3').addEventListener('click', finish);
}
