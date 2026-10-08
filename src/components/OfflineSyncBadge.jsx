import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getOfflineQueue, saveOfflineQueue } from '../data/mockStore';
import { logAudit } from '../utils/audit';

export default function OfflineSyncBadge({ isOffline, onToggleOffline, onSyncComplete, role = 'Officer' }) {
  const queue = getOfflineQueue();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(null);

  const handleSyncNow = () => {
    if (queue.length === 0) {
      setSyncToast('All local items already synchronized.');
      setTimeout(() => setSyncToast(null), 3000);
      return;
    }

    setIsSyncing(true);
    setTimeout(() => {
      // Simulate successful network synchronization
      const count = queue.length;
      saveOfflineQueue([]);
      setIsSyncing(false);
      logAudit({
        action: 'OFFLINE_QUEUE_SYNCED',
        userRole: role,
        entityId: `SYNC-${count}-ITEMS`,
        entityType: 'Offline Sync Batch',
        previousStatus: 'Pending Sync',
        newStatus: 'Synced to Branch Core',
        notes: `Successfully synchronized ${count} offline records to core database.`
      });

      setSyncToast(`Successfully synchronized ${count} offline item(s) to branch core.`);
      setTimeout(() => setSyncToast(null), 4000);
      if (onSyncComplete) onSyncComplete();
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.75rem' }}>
      {/* Network toggle button */}
      <button
        onClick={onToggleOffline}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.25rem 0.55rem',
          borderRadius: '9999px',
          border: '1px solid',
          borderColor: isOffline ? '#fca5a5' : '#86efac',
          backgroundColor: isOffline ? '#fef2f2' : '#f0fdf4',
          color: isOffline ? '#b91c1c' : '#15803d',
          fontWeight: 600,
          cursor: 'pointer'
        }}
        title="Toggle between Online and Simulated Offline Field Mode"
      >
        {isOffline ? <WifiOff size={13} /> : <Wifi size={13} />}
        {isOffline ? 'Offline Mode (Demo)' : 'Online Core'}
      </button>

      {/* Sync Counter & Action */}
      {queue.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              fontWeight: 600,
              border: '1px solid #fde68a'
            }}
          >
            {queue.length} Pending Sync
          </span>

          {!isOffline && (
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>
      )}

      {syncToast && (
        <span style={{ color: '#15803d', fontWeight: 600 }}>
          {syncToast}
        </span>
      )}
    </div>
  );
}
