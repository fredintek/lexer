// 1. Import the scripts directly from Google's CDN
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

// 2. Initialize with your config (Hardcoded here because it's a public static file)
firebase.initializeApp({
  apiKey: "AIzaSyDc1xcnsZtbsZ-Nu8QEIMTuB4F4xLb5MtY",
  authDomain: "lexer-trader.firebaseapp.com",
  projectId: "lexer-trader",
  storageBucket: "lexer-trader.firebasestorage.app",
  messagingSenderId: "410919521189",
  appId: "1:410919521189:web:9dfc75e2c4ef851c01f64c",
  measurementId: "G-BSDY2YDCMD",
});

const messaging = firebase.messaging();

// 3. Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[sw.js] Background message received ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
