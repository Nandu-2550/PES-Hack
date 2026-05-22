import localforage from 'localforage';

const store = localforage.createInstance({ name: 'agrishield-cache' });

export async function getCached(key) {
  return await store.getItem(key); // returns { data, syncedAt } or null
}

export async function setCached(key, data) {
  await store.setItem(key, {
    data,
    syncedAt: Date.now()
  });
}

export function formatSyncTime(ts) {
  if (!ts) return 'Never synced';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
