import { useState, useEffect } from 'react';
import { getCached, setCached } from '../db/cache';
import api from '../api/client';

export function useCachedFetch(cacheKey, endpoint) {
  const [data, setData] = useState(null);
  const [syncedAt, setSyncedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Step 1: serve from cache immediately
      const cached = await getCached(cacheKey);
      if (cached && !cancelled) {
        setData(cached.data);
        setSyncedAt(cached.syncedAt);
        setLoading(false);
        setIsStale(true);
      }

      // Step 2: fetch fresh data in background
      try {
        const res = await api.get(endpoint);
        if (!cancelled) {
          setData(res.data);
          setSyncedAt(Date.now());
          setIsStale(false);
          await setCached(cacheKey, res.data);
        }
      } catch {
        // Network failed — cached data already shown, nothing to do
        if (!cancelled && !cached) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [cacheKey, endpoint]);

  return { data, setData, syncedAt, loading, isStale };
}
