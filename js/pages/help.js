/**
 * ShowDeck — Help & Guidance Page
 * Simple, user-friendly feature explanations.
 */

export function render() {
  return `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Help & Guidance</h1>
          <p class="page-subtitle">Learn how to get the most out of ShowDeck.</p>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--space-6);max-width:800px;">
        
        <!-- Finding & Adding Content -->
        <div class="card" style="padding:var(--space-6);">
          <h3 class="section-title" style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
            <span>🔍</span> Finding & Adding Content
          </h3>
          <p style="color:var(--text-secondary);line-height:1.6;margin-bottom:var(--space-4);">
            Use the <strong>Search</strong> page to look up your favorite TV shows and movies. When you find something you want to track, tap the <strong>Add</strong> button on its poster. You can immediately categorize it into lists like 'Plan to Watch' or 'Watching' from the popup menu.
          </p>
        </div>

        <!-- Managing Library -->
        <div class="card" style="padding:var(--space-6);">
          <h3 class="section-title" style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
            <span>📚</span> Managing Your Library
          </h3>
          <p style="color:var(--text-secondary);line-height:1.6;margin-bottom:var(--space-4);">
            Your <strong>Library</strong> holds everything you've tracked. You can toggle between different views (Grid, List, and Compact) to see more details. 
            <br><br>
            In the <strong>List view</strong>, click on any show to open its details. From there, you can easily mark individual episodes as watched, give the show a star rating, or write private, auto-saving notes.
          </p>
        </div>

        <!-- Getting Started -->
        <div class="card" style="padding:var(--space-6);">
          <h3 class="section-title" style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
            <span>🚀</span> Getting Started
          </h3>
          <p style="color:var(--text-secondary);line-height:1.6;margin-bottom:var(--space-4);">
            Welcome to ShowDeck! To begin:
            <br><br>
            1. <strong>Connect an API Key:</strong> Go to Settings and enter your TMDB API Key. This lets ShowDeck fetch show data directly from your device.
            <br>
            2. <strong>Search for Shows:</strong> Navigate to the Search tab, look up your favorite shows, and add them to your library.
            <br>
            3. <strong>Track Progress:</strong> Go to your Library to mark episodes as watched.
          </p>
        </div>

        <!-- How to get TMDB API Key -->
        <div class="card" style="padding:var(--space-6);">
          <h3 class="section-title" style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
            <span>🔑</span> How to get a TMDB API Key
          </h3>
          <p style="color:var(--text-secondary);line-height:1.6;margin-bottom:var(--space-4);">
            ShowDeck connects directly to TMDB. You need your own free key. Here is how to get one:
            <br><br>
            1. <strong>Sign Up:</strong> Go to <a href="https://www.themoviedb.org/signup" target="_blank" style="color:var(--color-primary);text-decoration:none;">themoviedb.org</a> and create a free account.
            <br>
            2. <strong>Request an API Key:</strong> Once logged in, go to your <strong>Account Settings</strong> &gt; <strong>API</strong>.
            <br>
            3. <strong>Register as Developer:</strong> Click "Create" or "Click here to apply for an API key" and select <strong>Developer</strong>.
            <br>
            4. <strong>Fill the Form:</strong> Accept the terms and fill out the basic application form (you can mention ShowDeck as the application).
            <br>
            5. <strong>Copy Key:</strong> Once approved, copy your <strong>API Key (v3 auth)</strong> and paste it into ShowDeck's Settings or Onboarding screen!
          </p>
        </div>

        <!-- Managing Your Data -->
        <div class="card" style="padding:var(--space-6);">
          <h3 class="section-title" style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
            <span>💾</span> Managing Your Data
          </h3>
          <p style="color:var(--text-secondary);line-height:1.6;margin-bottom:var(--space-4);">
            Because ShowDeck is local-first, you have full control over your data:
            <br><br>
            • <strong>JSON Export/Import:</strong> Backup your entire library to a JSON file in Settings. Keep this safe!<br>
            • <strong>TV Time Import:</strong> Moving from TV Time? You can import your GDPR zip export directly into ShowDeck.<br>
            • <strong>CSV Export:</strong> Need to analyze your watch habits in a spreadsheet? Export your library as a CSV.
          </p>
        </div>

        <!-- Keyboard Shortcuts -->
        <div class="card" style="padding:var(--space-6);">
          <h3 class="section-title" style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
            <span>⌨️</span> Desktop Keyboard Shortcuts
          </h3>
          <p style="color:var(--text-secondary);line-height:1.6;margin-bottom:var(--space-4);">
            Speed up your workflow on desktop with these handy shortcuts:
            <br><br>
            • <kbd>/</kbd> – Focus the search bar<br>
            • <kbd>Esc</kbd> – Close modals or clear search<br>
            • <kbd>1-5</kbd> – Quickly rate a show when viewing its details
          </p>
        </div>

        <!-- Statistics & Streaks -->
        <div class="card" style="padding:var(--space-6);">
          <h3 class="section-title" style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
            <span>📊</span> Statistics & Streaks
          </h3>
          <p style="color:var(--text-secondary);line-height:1.6;margin-bottom:var(--space-4);">
            The <strong>Stats</strong> page visualizes your watching habits. 
            <br><br>
            • <strong>Watch Streak:</strong> Logging at least one episode a day builds your watch streak on the Activity Heatmap!
            <br>
            • <strong>Ratings:</strong> Rate your watched shows (1 to 5 stars) to see your personal Rating Distribution chart.
            <br>
            • <strong>Genres:</strong> See what genres you tend to watch the most.
          </p>
        </div>

        <!-- Privacy & Offline -->
        <div class="card" style="padding:var(--space-6);">
          <h3 class="section-title" style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
            <span>🔒</span> Privacy & Offline Capabilities
          </h3>
          <p style="color:var(--text-secondary);line-height:1.6;margin-bottom:var(--space-4);">
            ShowDeck is built to respect your privacy. It is an <strong>offline-first</strong> application.
            <br><br>
            • Your entire library is stored purely locally on your device. We do not track your activity or sync it to any server.
            <br>
            • You can use ShowDeck even without an internet connection (it will sync missing posters/details when you reconnect).
            <br>
            • You can easily export your data anytime or completely wipe it using the Danger Zone in <strong>Settings</strong>.
          </p>
        </div>

        <!-- About & Contact -->
        <div class="card" style="padding:var(--space-6);border-color:var(--color-primary);text-align:center;">
          <h2 style="font-size:var(--text-xl);font-weight:var(--weight-bold);margin-bottom:var(--space-2);">ShowDeck</h2>
          <p style="color:var(--text-secondary);margin-bottom:var(--space-4);">Your personal entertainment tracker.</p>
          
          <div style="margin-bottom:var(--space-4);font-size:var(--text-sm);">
            Created with ❤️ by <span style="font-weight:var(--weight-bold);">Kartik Patkar</span>
          </div>

          <div style="display:flex;justify-content:center;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-6);">
            <a href="https://github.com/Kartikpatkar/ShowDeck" target="_blank" class="btn btn-secondary btn-sm" style="border-radius:20px;padding:var(--space-2) var(--space-4);">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/kartik-patkar" target="_blank" class="btn btn-secondary btn-sm" style="border-radius:20px;padding:var(--space-2) var(--space-4);">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              LinkedIn
            </a>
            <a href="https://www.salesforce.com/trailblazer/kpatkar1" target="_blank" class="btn btn-secondary btn-sm" style="border-radius:20px;padding:var(--space-2) var(--space-4);">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-4.71c.38-1.54 1.74-2.29 3.29-2.29 2.21 0 4 1.79 4 4s-1.79 4-4 4Z"/></svg>
              Trailhead
            </a>
            <a href="mailto:kartikkp.assets@gmail.com" class="btn btn-secondary btn-sm" style="border-radius:20px;padding:var(--space-2) var(--space-4);">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Email
            </a>
          </div>

          <div style="border-top:1px solid var(--border-color);padding-top:var(--space-4);font-size:var(--text-xs);color:var(--text-tertiary);">
            © ${new Date().getFullYear()} Kartik Patkar. ShowDeck is open source.
          </div>
        </div>

      </div>
    </div>
  `;
}

export function init() {
  // Static page, no init logic needed
}
