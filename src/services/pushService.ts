import { supabase } from '@/integrations/supabase/client';

export const pushService = {
  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  // Subscribe to push notifications
  async subscribe(userId: string) {
    try {
      const permission = await this.requestPermission();
      if (!permission) {
        return { data: null, error: new Error('Permission denied') };
      }

      // Register service worker
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // This is a placeholder VAPID public key - replace with real key
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib37gp65t2ivxIkv69yViEuiBI'
        )
      });

      const { endpoint, keys } = subscription.toJSON();

      const { data, error } = await supabase.functions.invoke('push-notifications', {
        body: {
          action: 'subscribe',
          userId,
          endpoint,
          p256dh: keys?.p256dh,
          auth: keys?.auth
        }
      });

      return { data: data?.data, error };
    } catch (error) {
      console.error('Push subscription error:', error);
      return { data: null, error };
    }
  },

  // Unsubscribe from push notifications
  async unsubscribe(userId: string) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        const { data, error } = await supabase.functions.invoke('push-notifications', {
          body: {
            action: 'unsubscribe',
            userId,
            endpoint: subscription.endpoint
          }
        });

        return { data: data?.data, error };
      }

      return { data: null, error: new Error('No subscription found') };
    } catch (error) {
      console.error('Push unsubscribe error:', error);
      return { data: null, error };
    }
  },

  // Send notification to user
  async sendNotification(
    userId: string,
    title: string,
    body: string,
    icon?: string,
    notificationData?: any
  ) {
    const { data, error } = await supabase.functions.invoke('push-notifications', {
      body: {
        action: 'send_notification',
        userId,
        title,
        body,
        icon,
        data: notificationData
      }
    });

    return { data: data?.data, error };
  },

  // Send bulk notifications
  async sendBulkNotifications(
    userIds: string[],
    title: string,
    body: string,
    icon?: string,
    notificationData?: any
  ) {
    const { data, error } = await supabase.functions.invoke('push-notifications', {
      body: {
        action: 'send_bulk_notifications',
        userIds,
        title,
        body,
        icon,
        data: notificationData
      }
    });

    return { data: data?.data, error };
  },

  // Helper to convert base64 to Uint8Array
  urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
};

export default pushService;
