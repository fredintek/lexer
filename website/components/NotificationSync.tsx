"use client";
import { messaging, requestFcmToken } from "@/lib/config/firebase.config";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";
import { useUpdateFcmTokenMutation } from "@/lib/redux/services/notification.api";
import { useAppSelector } from "@/lib/redux/store";
import { onMessage } from "firebase/messaging";
import { useEffect } from "react";
import toast from "react-hot-toast";

const NotificationSync = () => {
  const { user, isAuthenticated } = useAppSelector(selectCurrentUser);
  const [updateToken] = useUpdateFcmTokenMutation();

  useEffect(() => {
    // 1. Only run if authenticated
    if (!user || !isAuthenticated) return;

    // 2. Token Sync Logic
    const sync = async () => {
      try {
        const token = await requestFcmToken();
        if (token) {
          await updateToken({ token }).unwrap();
          //   console.log("FCM Token Synced ✅");
        }
      } catch (err) {
        console.error("FCM Sync Failed ❌", err);
      }
    };
    sync();

    // 3. Continuous Foreground Listener
    // check if messaging exists
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        // console.log("Foreground Message Received:", payload);
        toast.success(
          <div className="flex flex-col gap-1">
            <p className="font-black text-[10px] uppercase tracking-widest leading-none">
              {payload.notification?.title}
            </p>
            <p className="text-xs opacity-80 font-medium">
              {payload.notification?.body}
            </p>
          </div>,
          {
            duration: 6000,
            position: "top-right",
            // Add custom styling to match your dashboard
            style: {
              background: "#0f172a",
              color: "#fff",
              borderRadius: "1rem",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          },
        );
      });

      // Cleanup listener when component unmounts or user logs out
      return () => unsubscribe();
    }
  }, [user?.id, isAuthenticated, updateToken]);

  return null;
};

export default NotificationSync;
