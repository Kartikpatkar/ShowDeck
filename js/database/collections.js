/**
 * ShowDeck — Collections Database Operations
 */

import { db } from './db.js';

export async function addCollection(data) {
  const now = new Date();
  return db.collections.add({
    name: data.name,
    description: data.description || '',
    icon: data.icon || '📁',
    color: data.color || '#5b4dc7',
    itemIds: data.itemIds || [],
    createdAt: now,
    updatedAt: now,
  });
}

export async function getCollection(id) {
  return db.collections.get(id);
}

export async function getAllCollections() {
  return db.collections.orderBy('createdAt').reverse().toArray();
}

export async function updateCollection(id, changes) {
  changes.updatedAt = new Date();
  return db.collections.update(id, changes);
}

export async function deleteCollection(id) {
  return db.collections.delete(id);
}

export async function addToCollection(collectionId, itemId, itemType) {
  const collection = await db.collections.get(collectionId);
  if (!collection) return;
  const key = `${itemType}:${itemId}`;
  if (!collection.itemIds.includes(key)) {
    collection.itemIds.push(key);
    await db.collections.update(collectionId, {
      itemIds: collection.itemIds,
      updatedAt: new Date(),
    });
  }
}

export async function removeFromCollection(collectionId, itemId, itemType) {
  const collection = await db.collections.get(collectionId);
  if (!collection) return;
  const key = `${itemType}:${itemId}`;
  collection.itemIds = collection.itemIds.filter(i => i !== key);
  await db.collections.update(collectionId, {
    itemIds: collection.itemIds,
    updatedAt: new Date(),
  });
}
