/**
 * ShowDeck — Tags Database Operations
 */

import { db } from './db.js';

export async function addTag(name, color = null) {
  const existing = await db.tags.where('name').equals(name).first();
  if (existing) return existing.id;
  return db.tags.add({ name, color: color || '#6b7280' });
}

export async function getAllTags() {
  return db.tags.orderBy('name').toArray();
}

export async function deleteTag(id) {
  // Remove tag from all shows and movies
  const tag = await db.tags.get(id);
  if (!tag) return;

  await db.shows.where('tags').equals(tag.name).modify(show => {
    show.tags = show.tags.filter(t => t !== tag.name);
  });
  await db.movies.where('tags').equals(tag.name).modify(movie => {
    movie.tags = movie.tags.filter(t => t !== tag.name);
  });

  return db.tags.delete(id);
}

export async function renameTag(id, newName) {
  const tag = await db.tags.get(id);
  if (!tag) return;
  const oldName = tag.name;

  await db.tags.update(id, { name: newName });

  // Update in shows/movies
  await db.shows.where('tags').equals(oldName).modify(show => {
    show.tags = show.tags.map(t => t === oldName ? newName : t);
  });
  await db.movies.where('tags').equals(oldName).modify(movie => {
    movie.tags = movie.tags.map(t => t === oldName ? newName : t);
  });
}
