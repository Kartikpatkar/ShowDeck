/**
 * ShowDeck — Help Page
 */

export function render() {
  return `
    <div class="page-container animate-fade-in" style="max-width:800px;margin:0 auto;">
      <div class="page-header" style="margin-bottom:var(--space-8);">
        <div class="page-header-left">
          <h1 class="page-title">Help & Guides</h1>
          <p class="page-subtitle">Learn how to get the most out of ShowDeck.</p>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--space-6);">
        
        <!-- Getting Started -->
        <div class="card" style="padding:var(--space-6);">
          <h2 class="section-title">Getting Started</h2>
          <div style="margin-top:var(--space-4);color:var(--text-secondary);line-height:1.6;">
            <p style="margin-bottom:var(--space-2);"><strong>1. Add an API Key:</strong> To search for movies, you need a free TMDB API key. Go to <strong>Settings &rarr; API Providers</strong> and enter your key.</p>
            <p style="margin-bottom:var(--space-2);"><strong>2. Search for Media:</strong> Click <strong>Search</strong> in the sidebar. Type a show or movie name and click "Add to Library".</p>
            <p><strong>3. Track Progress:</strong> Go to your Library. Click a show, then click on a season, and mark episodes as "Watched" as you finish them.</p>
          </div>
        </div>

        <!-- Managing Data -->
        <div class="card" style="padding:var(--space-6);">
          <h2 class="section-title">Managing Your Data</h2>
          <div style="margin-top:var(--space-4);color:var(--text-secondary);line-height:1.6;">
            <p style="margin-bottom:var(--space-2);"><strong>Offline Mode:</strong> ShowDeck is a Progressive Web App (PWA). If you lose internet connection, you can still view your entire library and notes!</p>
            <p style="margin-bottom:var(--space-2);"><strong>Manual Sync:</strong> To fetch the latest episodes or updated posters, go to a show's page and click the <strong>Sync</strong> button in the top right.</p>
            <p><strong>Backups:</strong> Since your data lives locally on your device, it's highly recommended to go to <strong>Settings &rarr; Export Backup (JSON)</strong> occasionally. You can restore this file on a new phone or computer.</p>
          </div>
        </div>

        <!-- Hotkeys -->
        <div class="card" style="padding:var(--space-6);">
          <h2 class="section-title">Desktop Keyboard Shortcuts</h2>
          <div style="margin-top:var(--space-4);display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-color);padding-bottom:var(--space-2);">
              <span class="text-secondary">Go Back</span>
              <kbd style="background:var(--surface-3);padding:2px 8px;border-radius:4px;font-family:monospace;">Esc</kbd>
            </div>
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-color);padding-bottom:var(--space-2);">
              <span class="text-secondary">Sync Show/Movie</span>
              <kbd style="background:var(--surface-3);padding:2px 8px;border-radius:4px;font-family:monospace;">S</kbd>
            </div>
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-color);padding-bottom:var(--space-2);">
              <span class="text-secondary">Toggle Watched</span>
              <kbd style="background:var(--surface-3);padding:2px 8px;border-radius:4px;font-family:monospace;">W</kbd>
            </div>
          </div>
        </div>

        <!-- About & Contact -->
        <div class="card" style="padding:var(--space-6);border-color:var(--color-primary);">
          <h2 class="section-title">About the Author</h2>
          <div style="margin-top:var(--space-4);color:var(--text-secondary);line-height:1.6;">
            <p style="margin-bottom:var(--space-4);">ShowDeck is an open-source project created by <strong>Kartik Patkar</strong>. It was built to provide a fast, private alternative to corporate tracking apps.</p>
            
            <div style="display:flex;gap:var(--space-4);flex-wrap:wrap;">
              <a href="https://github.com/Kartikpatkar/ShowDeck" target="_blank" class="btn btn-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                View on GitHub
              </a>
              <a href="https://github.com/Kartikpatkar/ShowDeck/issues" target="_blank" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Report a Bug / Issue
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}
