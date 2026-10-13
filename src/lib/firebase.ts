import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
    databaseURL: process.env.NEXT_PUBLIC_DATABASE_USER,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const realtimeDb = getDatabase(firebaseApp);

export const getFcmToken = async (): Promise<string | null> => {
    if (typeof window === "undefined") return null;

    const supported = await isSupported().catch(() => false);
    if (!supported) return null;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
        console.warn("NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set — skipping FCM token fetch");
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return null;

        const [{ getMessaging, getToken }, registration] = await Promise.all([
            import("firebase/messaging"),
            navigator.serviceWorker.register("/firebase-messaging-sw.js"),
        ]);

        const messaging = getMessaging(firebaseApp);
        const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
        return token || null;
    } catch (error) {
        console.error("Error fetching FCM token:", error);
        return null;
    }
};

export const initForegroundFcm = async (onReceived?: () => void): Promise<void> => {
    if (typeof window === "undefined") return;

    const supported = await isSupported().catch(() => false);
    if (!supported) return;

    const registration = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js")
        ?? await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const { getMessaging, onMessage } = await import("firebase/messaging");
    const messaging = getMessaging(firebaseApp);

    onMessage(messaging, (payload) => {
        const notification = payload.notification || {};
        const data = payload.data || {};
        const title = notification.title || "Elite Quiz";

        registration.showNotification(title, {
            body: notification.body || "",
            icon: notification.icon || data.image || "/favicon.ico",
            data: { url: data.url || data.click_action || "/" },
        });

        onReceived?.();
    });
};
