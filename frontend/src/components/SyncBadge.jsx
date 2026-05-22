import React from 'react';
import { formatSyncTime } from '../db/cache';

export default function SyncBadge({ syncedAt, isStale }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 11, color: isStale ? '#f4a261' : '#52b788',
      padding: '4px 10px', borderRadius: 20,
      background: isStale ? 'rgba(244,162,97,0.1)' : 'rgba(82,183,136,0.1)',
      width: 'fit-content',
      marginBottom: '16px'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%',
        background: isStale ? '#f4a261' : '#52b788',
        display: 'inline-block' }} />
      {isStale ? '⚠ Offline — ' : '✓ Live — '}
      Last synced: {formatSyncTime(syncedAt)}
    </div>
  );
}
