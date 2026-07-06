/**
 * ShowDeck — Personal Goals
 * Define and track watching goals.
 */

import { db } from '../database/db.js';
import { toast } from '../components/toast.js';
import { escapeHtml } from '../utils/dom.js';

let goalsData = [];

export function render() {
  return `
    <div class="page-container animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Personal Goals</h1>
          <p class="page-subtitle">Set targets and track your watch habits over time.</p>
        </div>
        <button class="btn btn-primary" id="new-goal-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Goal
        </button>
      </div>

      <!-- New Goal Form -->
      <div id="new-goal-form" class="card hidden" style="margin-bottom:var(--space-6); padding:var(--space-6); background:var(--surface-2); border-color:var(--color-primary);">
        <h3 style="margin-top:0; margin-bottom:var(--space-4);">New Goal</h3>
        <div style="display:flex; flex-direction:column; gap:var(--space-4);">
          <div>
            <label style="font-weight:var(--weight-medium); display:block; margin-bottom:var(--space-1);">Goal Name</label>
            <input type="text" id="goal-name" class="input" placeholder="e.g. 2026 Movie Challenge" style="width:100%;">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-4);">
            <div>
              <label style="font-weight:var(--weight-medium); display:block; margin-bottom:var(--space-1);">I want to watch...</label>
              <select id="goal-type" class="input" style="width:100%;">
                <option value="movie">Movies</option>
                <option value="show">TV Episodes</option>
              </select>
            </div>
            <div>
              <label style="font-weight:var(--weight-medium); display:block; margin-bottom:var(--space-1);">Target Amount</label>
              <input type="number" id="goal-target" class="input" placeholder="e.g. 50" min="1" style="width:100%;">
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:var(--space-3); margin-top:var(--space-2);">
            <button class="btn btn-ghost" id="cancel-goal-btn">Cancel</button>
            <button class="btn btn-primary" id="save-goal-btn">Save Goal</button>
          </div>
        </div>
      </div>

      <!-- Goals Grid -->
      <div id="goals-grid" class="grid-posters" style="grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:var(--space-6);">
        <div class="spinner"></div>
      </div>
    </div>
  `;
}

export async function init() {
  await loadGoals();
  bindEvents();
}

async function loadGoals() {
  const container = document.getElementById('goals-grid');
  if (!container) return;

  try {
    goalsData = await db.goals.reverse().sortBy('createdAt');
    
    // Calculate progress for each goal dynamically
    for (const goal of goalsData) {
      // Find activity of this type since the goal was created
      const count = await db.activity
        .where('date')
        .aboveOrEqual(goal.createdAt)
        .filter(act => act.type === 'watch' && act.itemType === goal.type)
        .count();
      
      goal.progress = count;
    }

    if (goalsData.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3 class="empty-state-title">No goals set</h3>
          <p class="empty-state-text">Challenge yourself by setting a watch goal.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = goalsData.map(g => {
      const percentage = Math.min(100, Math.round((g.progress / g.target) * 100));
      const isComplete = g.progress >= g.target;
      const progressColor = isComplete ? 'var(--color-success)' : 'var(--color-primary)';
      
      return `
        <div class="card" style="display:flex; flex-direction:column; padding:var(--space-5); position:relative; overflow:hidden;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-4);">
            <div>
              <h3 style="margin:0; font-size:var(--text-lg);">${escapeHtml(g.name)}</h3>
              <div style="font-size:var(--text-xs); color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.05em; margin-top:2px;">
                Started ${new Date(g.createdAt).toLocaleDateString()}
              </div>
            </div>
            <button class="btn btn-icon btn-ghost delete-goal-btn" data-id="${g.id}" style="color:var(--text-tertiary); padding:4px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
          
          <div style="display:flex; justify-content:space-between; margin-bottom:var(--space-2); font-size:var(--text-sm); font-weight:var(--weight-medium);">
            <span>${g.progress} / ${g.target} ${g.type === 'show' ? 'Episodes' : 'Movies'}</span>
            <span style="color:${progressColor};">${percentage}%</span>
          </div>
          
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width:${percentage}%; background:${progressColor};"></div>
          </div>
          
          ${isComplete ? `
            <div style="position:absolute; top:-20px; right:-20px; width:80px; height:80px; background:var(--color-success); opacity:0.1; border-radius:50%;"></div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Bind delete
    container.querySelectorAll('.delete-goal-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        if (confirm('Delete this goal?')) {
          await db.goals.delete(id);
          toast('Goal deleted');
          loadGoals();
        }
      });
    });

  } catch (e) {
    console.error('Failed to load goals:', e);
    container.innerHTML = '<div class="text-error">Failed to load goals.</div>';
  }
}

function bindEvents() {
  const form = document.getElementById('new-goal-form');
  const addBtn = document.getElementById('new-goal-btn');
  const cancelBtn = document.getElementById('cancel-goal-btn');
  const saveBtn = document.getElementById('save-goal-btn');

  addBtn?.addEventListener('click', () => {
    form.classList.remove('hidden');
    document.getElementById('goal-name').focus();
  });

  cancelBtn?.addEventListener('click', () => {
    form.classList.add('hidden');
  });

  saveBtn?.addEventListener('click', async () => {
    const name = document.getElementById('goal-name').value.trim();
    const type = document.getElementById('goal-type').value;
    const target = parseInt(document.getElementById('goal-target').value);

    if (!name || isNaN(target) || target <= 0) {
      toast('Please enter a valid name and target', 'warning');
      return;
    }

    try {
      await db.goals.add({
        name,
        type,
        target,
        progress: 0,
        createdAt: new Date().toISOString()
      });
      
      form.classList.add('hidden');
      document.getElementById('goal-name').value = '';
      document.getElementById('goal-target').value = '';
      toast('Goal created!', 'success');
      
      loadGoals();
    } catch (e) {
      console.error(e);
      toast('Failed to create goal', 'error');
    }
  });
}
