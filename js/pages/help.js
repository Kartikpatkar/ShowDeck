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
          <div style="margin-top:var(--space-4);display:flex;flex-direction:column;gap:var(--space-4);">
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

        <!-- About & Contact (Inspired by sf-vault footer) -->
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
