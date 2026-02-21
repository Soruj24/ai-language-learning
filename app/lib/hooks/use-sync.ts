import { useState, useEffect } from 'react';
import { useOffline } from './use-offline';

export interface ProgressData {
  lessonId: string;
  score: number;
  completedAt: string;
  userId?: string;
}

export function useSync() {
  const isOffline = useOffline();
  const [pendingSync, setPendingSync] = useState<ProgressData[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pendingProgress');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse pending progress', e);
        }
      }
    }
    return [];
  });

  // Sync when coming back online
  useEffect(() => {
    const syncData = async () => {
      const remaining: ProgressData[] = [];
      for (const item of pendingSync) {
        const success = await sendProgressToServer(item);
        if (!success) {
          remaining.push(item);
        }
      }
      
      if (remaining.length !== pendingSync.length) {
        setPendingSync(remaining);
        if (remaining.length > 0) {
          localStorage.setItem('pendingProgress', JSON.stringify(remaining));
        } else {
          localStorage.removeItem('pendingProgress');
        }
      }
    };

    if (!isOffline && pendingSync.length > 0) {
      syncData();
    }
  }, [isOffline, pendingSync]);

  const saveProgress = async (data: ProgressData) => {
    if (isOffline) {
      const newPending = [...pendingSync, data];
      setPendingSync(newPending);
      localStorage.setItem('pendingProgress', JSON.stringify(newPending));
      return true; // Saved locally
    } else {
      const success = await sendProgressToServer(data);
      if (!success) {
        const newPending = [...pendingSync, data];
        setPendingSync(newPending);
        localStorage.setItem('pendingProgress', JSON.stringify(newPending));
        return true; // Saved locally as fallback
      }
      return true; // Saved to server
    }
  };

  return { saveProgress, pendingCount: pendingSync.length };
}

async function sendProgressToServer(data: ProgressData) {
  try {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (e) {
    console.error('Error sending progress to server:', e);
    return false;
  }
}
