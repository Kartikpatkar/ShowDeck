/**
 * ShowDeck — Home Page
 * Dashboard with welcome message, quick stats placeholders,
 * continue watching, and recently added sections.
 */

export function render() {
  return `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Welcome back 👋</h1>
          <p class="page-subtitle">Here's what's happening with your entertainment.</p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="section">
        <div class="grid-stats stagger-children">
          <div class="stat-card">
            <span class="stat-card-label">Shows</span>
            <span class="stat-card-value">0</span>
          </div>
          <div class="stat-card">
            <span class="stat-card-label">Movies</span>
            <span class="stat-card-value">0</span>
          </div>
          <div class="stat-card">
            <span class="stat-card-label">Episodes</span>
            <span class="stat-card-value">0</span>
          </div>
          <div class="stat-card">
            <span class="stat-card-label">Hours Watched</span>
            <span class="stat-card-value">0</span>
          </div>
        </div>
      </div>

      <!-- Continue Watching -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Continue Watching</h2>
          <a href="#/library" class="section-action">View All</a>
        </div>
        <div class="empty-state" style="padding: var(--space-8) var(--space-4);">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
          </div>
          <h3 class="empty-state-title">Nothing playing</h3>
          <p class="empty-state-text">Start tracking a show to see it here.</p>
          <a href="#/search" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Search Shows
          </a>
        </div>
      </div>

      <!-- Recently Added -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Recently Added</h2>
          <a href="#/library" class="section-action">View All</a>
        </div>
        <div class="empty-state" style="padding: var(--space-8) var(--space-4);">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>
          </div>
          <h3 class="empty-state-title">Library is empty</h3>
          <p class="empty-state-text">Add shows and movies to start building your collection.</p>
          <a href="#/search" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add Content
          </a>
        </div>
      </div>
    </div>
  `;
}
