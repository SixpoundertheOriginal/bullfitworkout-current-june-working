
import React from 'react';

export interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  needsUpdate: boolean;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private status: ServiceWorkerStatus = {
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isOnline: navigator.onLine,
    needsUpdate: false
  };

  async register(): Promise<boolean> {
    if (!this.status.isSupported) {
      console.log('ServiceWorker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      this.status.isRegistered = true;
      
      console.log('ServiceWorker registered successfully');
      
      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdate();
      });

      // Listen for messages from ServiceWorker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleMessage(event);
      });

      return true;
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
      return false;
    }
  }

  private handleUpdate() {
    if (!this.registration?.installing) return;

    const newWorker = this.registration.installing;
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        this.status.needsUpdate = true;
        this.notifyUpdate();
      }
    });
  }

  private notifyUpdate() {
    // Could dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  private handleMessage(event: MessageEvent) {
    // Handle messages from ServiceWorker
    console.log('Message from ServiceWorker:', event.data);
  }

  async activateUpdate(): Promise<void> {
    if (!this.registration?.waiting) return;

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }

  getStatus(): ServiceWorkerStatus {
    return { ...this.status };
  }

  // Cache management
  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  }

  // Background sync
  async requestBackgroundSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
      try {
        // Type assertion for sync support
        const registration = this.registration as any;
        await registration?.sync?.register(tag);
      } catch (error) {
        console.log('Background sync not available:', error);
      }
    }
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();

// Network status monitoring
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
