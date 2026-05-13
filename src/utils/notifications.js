import apiClient from '../api/client';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export async function subscribeToPush() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: await urlBase64ToUint8Array(vapidKey)
    });
  }

  const browser = navigator.userAgent;
  const visitorId = localStorage.getItem('visitor_id') || null;

  await apiClient.post('/push/subscribe', {
    visitor_id: visitorId,
    subscription: subscription.toJSON(),
    browser
  });

  return true;
}