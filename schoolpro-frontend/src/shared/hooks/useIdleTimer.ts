import { useEffect, useRef, useCallback } from "react";
import { message } from "@/components/ui/Message";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { clearAuthSessionAndRedirect } from "@/shared/api/httpClient";

const DEFAULT_TIMEOUT_MINUTES = 15;
const STORAGE_LAST_ACTIVE_KEY = "schoolpro_last_activity_time";
const CHECK_INTERVAL_MS = 10000; // Check idle status every 10 seconds
const THROTTLE_MS = 1000; // Update activity timestamp at most once every 1s

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
  "click",
] as const;

export interface UseIdleTimerOptions {
  timeoutMinutes?: number;
  enabled?: boolean;
}

/**
 * Enterprise Inactivity / Idle Timer Hook.
 * Listens for user interactions, synchronizes across browser tabs via localStorage,
 * and automatically logs out with a friendly alert when idle threshold is reached.
 */
export function useIdleTimer(options: UseIdleTimerOptions = {}) {
  const { isAuthenticated } = useAuthStore();
  const envTimeout = Number(import.meta.env.VITE_IDLE_TIMEOUT_MINUTES);
  const timeoutMinutes =
    options.timeoutMinutes ||
    (!isNaN(envTimeout) && envTimeout > 0 ? envTimeout : DEFAULT_TIMEOUT_MINUTES);

  const isEnabled = (options.enabled ?? true) && isAuthenticated;
  const lastThrottleRef = useRef<number>(0);
  const timeoutMs = timeoutMinutes * 60 * 1000;

  // Record user activity timestamp safely
  const recordActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastThrottleRef.current > THROTTLE_MS) {
      lastThrottleRef.current = now;
      try {
        localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, now.toString());
      } catch {
        // Fallback for restricted storage environments
      }
    }
  }, []);

  // Perform automatic logout when inactivity threshold exceeded
  const handleIdleLogout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_LAST_ACTIVE_KEY);
    } catch {
      // Ignore
    }

    message.warning({
      content: "Phiên làm việc đã kết thúc do không có thao tác trong thời gian dài. Vui lòng đăng nhập lại.",
      duration: 5,
    });

    clearAuthSessionAndRedirect("idle_timeout");
  }, []);

  // Check whether user has been idle for longer than allowed threshold
  const checkIdleStatus = useCallback(() => {
    if (!isEnabled) return;

    try {
      const rawLastActive = localStorage.getItem(STORAGE_LAST_ACTIVE_KEY);
      const lastActiveTime = rawLastActive ? parseInt(rawLastActive, 10) : Date.now();
      const idleTime = Date.now() - lastActiveTime;

      if (idleTime >= timeoutMs) {
        handleIdleLogout();
      }
    } catch {
      // Storage read fallback
    }
  }, [isEnabled, timeoutMs, handleIdleLogout]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    // Set initial activity mark
    recordActivity();

    // Event listener for user interactions
    const onUserInteraction = () => {
      recordActivity();
    };

    // Cross-tab synchronization via storage event
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_LAST_ACTIVE_KEY && e.newValue) {
        lastThrottleRef.current = parseInt(e.newValue, 10);
      }
    };

    // Immediate check when user wakes up device or switches back to tab
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkIdleStatus();
      }
    };

    // Attach interaction listeners
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, onUserInteraction, { passive: true });
    });

    window.addEventListener("storage", onStorageChange);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Periodic heartbeat timer
    const intervalId = window.setInterval(checkIdleStatus, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, onUserInteraction);
      });
      window.removeEventListener("storage", onStorageChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [isEnabled, recordActivity, checkIdleStatus]);
}
