import { message } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ATTENDANCE_BROADCAST_CHANNEL,
  attendanceService,
} from "@/modules/students/features/attendance/services";
import type {
  AttendanceRealtimePayload,
  AttendanceRealtimeSyncSnapshot,
} from "@/modules/students/features/attendance/types";
import { useNotificationStore } from "@/shared/store/useNotificationStore";

export interface UseAttendanceRealtimeOptions {
  sessionId?: string;
  classId?: string;
  date?: string;
  enabled?: boolean;
  pollIntervalMs?: number;
  showToastOnExternalUpdate?: boolean;
  onEvent?: (payload: AttendanceRealtimePayload) => void;
  onSyncChange?: (snapshot: AttendanceRealtimeSyncSnapshot) => void;
}

export interface UseAttendanceRealtimeResult {
  isConnected: boolean;
  lastSyncedAt: string | null;
  triggerSyncCheck: () => Promise<void>;
}

/**
 * Enterprise real-time synchronization hook for Student & Teacher Attendance Sessions.
 * Combines:
 * 1. Django Channels WebSocket push (/ws/academic/attendance/) with StrictMode-safe 80ms delayed connect
 * 2. Cross-tab BroadcastChannel synchronization
 * 3. Lightweight delta-sync polling & automatic session expiration detection
 */
export function useAttendanceRealtime(
  options: UseAttendanceRealtimeOptions = {},
): UseAttendanceRealtimeResult {
  const {
    sessionId,
    classId,
    date,
    enabled = true,
    pollIntervalMs = 8000,
    showToastOnExternalUpdate = true,
    onEvent,
    onSyncChange,
  } = options;

  const { t } = useTranslation(["message"]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const tRef = useRef(t);
  const onEventRef = useRef(onEvent);
  const onSyncChangeRef = useRef(onSyncChange);
  const lastSyncVersionRef = useRef<string | null>(null);
  const processedEventsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    onSyncChangeRef.current = onSyncChange;
  }, [onSyncChange]);

  const handleIncomingEvent = useCallback(
    (payload: AttendanceRealtimePayload, isFromSocket: boolean) => {
      if (!payload || !payload.eventType) return;

      const dedupeKey = `${payload.eventType}:${payload.sessionId || payload.timetableId || ""}:${payload.timestamp}`;
      if (processedEventsRef.current.has(dedupeKey)) {
        return;
      }
      processedEventsRef.current.add(dedupeKey);
      if (processedEventsRef.current.size > 120) {
        const firstKey = processedEventsRef.current.values().next().value;
        if (firstKey) {
          processedEventsRef.current.delete(firstKey);
        }
      }

      setLastSyncedAt(new Date().toISOString());

      if (isFromSocket && showToastOnExternalUpdate) {
        const translate = tRef.current;
        if (
          payload.eventType === "ATTENDANCE_SESSION_OPENED" ||
          payload.eventType === "ATTENDANCE_CODE_REGENERATED"
        ) {
          useNotificationStore.getState().incrementUnreadCount(1);
          message.info(
            payload.message ||
              translate("message:attendance.teacherOpenedSessionToast", {
                subject: payload.record?.subjectName || "",
                radius: payload.allowedRadiusMeters || 50,
                defaultValue:
                  "Giáo viên vừa mở mã điểm danh 6 chữ số & mã QR mới cho tiết học!",
              }),
          );
        } else if (payload.eventType === "ATTENDANCE_SESSION_EXPIRED") {
          message.warning(
            payload.message ||
              translate("message:attendance.sessionExpiredToast", {
                subject: payload.record?.subjectName || "",
                defaultValue: "Mã điểm danh đã hết thời gian hiệu lực.",
              }),
          );
        }
      }

      onEventRef.current?.(payload);
    },
    [showToastOnExternalUpdate],
  );

  const triggerSyncCheck = useCallback(async () => {
    if (!enabled) return;
    const snapshot = await attendanceService.getRealtimeSyncSnapshot({
      classId,
      date,
    });
    if (!snapshot) return;

    setLastSyncedAt(snapshot.serverTime || new Date().toISOString());

    const prevVersion = lastSyncVersionRef.current;
    if (prevVersion === null) {
      lastSyncVersionRef.current = snapshot.syncVersion;
      if (snapshot.expiredNowCount > 0) {
        onSyncChangeRef.current?.(snapshot);
      }
      return;
    }

    if (
      prevVersion !== snapshot.syncVersion ||
      snapshot.expiredNowCount > 0
    ) {
      lastSyncVersionRef.current = snapshot.syncVersion;
      onSyncChangeRef.current?.(snapshot);
    }
  }, [classId, date, enabled]);

  // 1. WebSocket connection with StrictMode-safe 80ms delayed start
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("WebSocket" in window)) {
      return;
    }

    let ws: WebSocket | null = null;
    let initialConnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let pingTimer: ReturnType<typeof setInterval> | null = null;
    let unmounted = false;
    let retryCount = 0;

    const connect = () => {
      if (unmounted) return;
      try {
        const wsUrl = attendanceService.buildRealtimeWebSocketUrl({
          sessionId,
          classId,
          date,
        });
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (unmounted) {
            ws?.close(1000, "Component unmounted");
            return;
          }
          retryCount = 0;
          setIsConnected(true);
          setLastSyncedAt(new Date().toISOString());

          if (pingTimer) clearInterval(pingTimer);
          pingTimer = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ action: "ping" }));
            }
          }, 25000);
        };

        ws.onmessage = (event) => {
          if (unmounted) return;
          try {
            const data = JSON.parse(event.data) as AttendanceRealtimePayload;
            if (data.type === "connection_established" || data.type === "pong") {
              setIsConnected(true);
              return;
            }
            if (data.eventType) {
              handleIncomingEvent(data, true);
            }
          } catch {
            // Ignore malformed socket frames
          }
        };

        ws.onerror = () => {
          if (!unmounted) {
            setIsConnected(false);
          }
        };

        ws.onclose = () => {
          if (pingTimer) {
            clearInterval(pingTimer);
            pingTimer = null;
          }
          if (unmounted) return;
          setIsConnected(false);
          const backoffMs = Math.min(30000, 2000 * 2 ** Math.min(retryCount, 4));
          retryCount += 1;
          reconnectTimer = setTimeout(connect, backoffMs);
        };
      } catch {
        if (!unmounted) {
          setIsConnected(false);
        }
      }
    };

    // Delay initial socket creation by 80ms so React 19 StrictMode immediate unmount
    // cancels the timer cleanly before creating a socket in CONNECTING state.
    initialConnectTimer = setTimeout(connect, 80);

    return () => {
      unmounted = true;
      if (initialConnectTimer) clearTimeout(initialConnectTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pingTimer) clearInterval(pingTimer);
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1000, "Cleanup");
        }
        ws = null;
      }
    };
  }, [classId, date, enabled, handleIncomingEvent, sessionId]);

  // 2. Cross-tab BroadcastChannel & CustomEvent listener
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(ATTENDANCE_BROADCAST_CHANNEL);
        channel.onmessage = (event: MessageEvent<AttendanceRealtimePayload>) => {
          if (event.data) {
            handleIncomingEvent(event.data, false);
          }
        };
      }
    } catch {
      // Ignore BroadcastChannel errors
    }

    const handleCustomEvent = (event: Event) => {
      const custom = event as CustomEvent<AttendanceRealtimePayload>;
      if (custom.detail) {
        handleIncomingEvent(custom.detail, false);
      }
    };

    window.addEventListener(ATTENDANCE_BROADCAST_CHANNEL, handleCustomEvent);

    return () => {
      if (channel) {
        channel.close();
      }
      window.removeEventListener(
        ATTENDANCE_BROADCAST_CHANNEL,
        handleCustomEvent,
      );
    };
  }, [enabled, handleIncomingEvent]);

  // 3. Delta-sync polling & visibility/focus revalidation
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const initialSyncTimer = setTimeout(() => {
      void triggerSyncCheck();
    }, 0);

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        void triggerSyncCheck();
      }
    }, pollIntervalMs);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        void triggerSyncCheck();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      clearTimeout(initialSyncTimer);
      clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [enabled, pollIntervalMs, triggerSyncCheck]);

  return {
    isConnected,
    lastSyncedAt,
    triggerSyncCheck,
  };
}
