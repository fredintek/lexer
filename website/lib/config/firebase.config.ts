import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDc1xcnsZtbsZ-Nu8QEIMTuB4F4xLb5MtY",
  authDomain: "lexer-trader.firebaseapp.com",
  projectId: "lexer-trader",
  storageBucket: "lexer-trader.firebasestorage.app",
  messagingSenderId: "410919521189",
  appId: "1:410919521189:web:9dfc75e2c4ef851c01f64c",
  measurementId: "G-BSDY2YDCMD",
};

const app = initializeApp(firebaseConfig);
export const messaging =
  typeof window !== "undefined" ? getMessaging(app) : null;

export const requestFcmToken = async () => {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const currentToken = await getToken(messaging, {
        vapidKey:
          "BO2gv2dV0mq4TnYJMPNUav-Mn3jXTDT3mf43DvmKEMSFOr87BAcXgWub-cQH23rcMMnIvENUNe8JjpROlFqqNQg",
      });
      return currentToken;
    }
  } catch (err) {
    console.log("An error occurred while retrieving token. ", err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
