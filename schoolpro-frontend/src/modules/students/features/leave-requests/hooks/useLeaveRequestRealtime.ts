import { message } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LEAVE_REQUEST_BROADCAST_CHANNEL,
  leaveRequestsService,
} from "@/modules/students/features/leave-requests/services";
import type {
  LeaveRequestRealtimePayload,
  LeaveRequestRealtimeSyncSnapshot,
} from "@/modules/students/features/leave-requests/types";
import { useNotificationStore } from "@/shared/store/useNotificationStore";

export interface UseLeaveRequestRealtimeOptions {
  leaveRequestId?: string;
  classId?: string;
  enabled?: boolean;
  pollIntervalMs?: number;
  showToastOnExternalUpdate?: boolean;
  onEvent?: (payload: LeaveRequestRealtimePayload) => void;
  onSyncChange?: (snapshot: LeaveRequestRealtimeSyncSnapshot) => void;
}

export interface UseLeaveRequestRealtimeResult {
  isConnected: boolean;
  lastSyncedAt: string | null;
  triggerSyncCheck: () => Promise<void>;
}

/**
 * Enterprise real-time synchronization hook for Student Leave Requests.
 * Combines:
 * 1. Django Channels WebSocket push (/ws/academic/leave-requests/) with exponential backoff & heartbeat
 * 2. Cross-tab BroadcastChannel synchronization
 * 3. Lightweight delta-sync polling & visibility/focus revalidation (also triggers 3h pre-lesson auto-approval)
 */
export function useLeaveRequestRealtime(
  options: UseLeaveRequestRealtimeOptions = {},
): UseLeaveRequestRealtimeResult {
  const {
    leaveRequestId,
    classId,
    enabled = true,
    pollIntervalMs = 10000,
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
    (payload: LeaveRequestRealtimePayload, isFromSocket: boolean) => {
      if (!payload || !payload.eventType) return;

      if (
        leaveRequestId &&
        payload.leaveRequestId &&
        payload.leaveRequestId !== leaveRequestId
      ) {
        return;
      }

      const dedupeKey = `${payload.eventType}:${payload.leaveRequestId}:${payload.timestamp}:${payload.eventLog?.id || ""}`;
      if (processedEventsRef.current.has(dedupeKey)) {
        return;
      }
      processedEventsRef.current.add(dedupeKey);
      if (processedEventsRef.current.size > 150) {
        const firstKey = processedEventsRef.current.values().next().value;
        if (firstKey) {
          processedEventsRef.current.delete(firstKey);
        }
      }

      setLastSyncedAt(new Date().toISOString());

      if (isFromSocket && showToastOnExternalUpdate) {
        const translate = tRef.current;
        if (payload.eventType === "LEAVE_REQUEST_AUTO_APPROVED") {
          useNotificationStore.getState().incrementUnreadCount(1);
          message.success(
            payload.message ||
              translate("message:leaveRequestRealtime.autoApproved", {
                defaultValue:
                  "Đơn xin nghỉ phép đã được hệ thống tự động phê duyệt (trước giờ học 03 giờ).",
              }),
          );
        } else if (payload.eventType === "LEAVE_REQUEST_REVIEWED") {
          useNotificationStore.getState().incrementUnreadCount(1);
          const isApproved =
            String(payload.status || "").toLowerCase() === "approved";
          if (isApproved) {
            message.success(
              payload.message ||
                translate("message:leaveRequestRealtime.approved", {
                  defaultValue:
                    "Đơn xin nghỉ phép đã được Giáo viên chủ nhiệm phê duyệt.",
                }),
            );
          } else {
            message.warning(
              payload.message ||
                translate("message:leaveRequestRealtime.rejected", {
                  defaultValue:
                    "Đơn xin nghỉ phép đã bị Giáo viên chủ nhiệm từ chối.",
                }),
            );
          }
        }
      }

      onEventRef.current?.(payload);
    },
    [leaveRequestId, showToastOnExternalUpdate],
  );

  const triggerSyncCheck = useCallback(async () => {
    if (!enabled) return;

    const snapshot = await leaveRequestsService.getRealtimeSyncSnapshot({
      leaveRequestId,
      classId,
    });

    if (!snapshot) return;

    setLastSyncedAt(snapshot.serverTime || new Date().toISOString());

    const prevVersion = lastSyncVersionRef.current;
    lastSyncVersionRef.current = snapshot.syncVersion;

    if (snapshot.autoApprovedNowCount > 0 && showToastOnExternalUpdate) {
      useNotificationStore
        .getState()
        .incrementUnreadCount(snapshot.autoApprovedNowCount);
      message.success(
        tRef.current("message:leaveRequestRealtime.autoApproved", {
          defaultValue:
            "Đơn xin nghỉ phép đã được hệ thống tự động phê duyệt (trước giờ học 03 giờ).",
        }),
      );
    }

    if (prevVersion !== null && prevVersion !== snapshot.syncVersion) {
      onSyncChangeRef.current?.(snapshot);
    }
  }, [classId, enabled, leaveRequestId, showToastOnExternalUpdate]);

  // 1. WebSocket connection with automatic reconnect and heartbeat
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("WebSocket" in window)) {
      return;
    }

    let isUnmounted = false;
    let ws: WebSocket | null = null;
    let initialConnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let retryCount = 0;

    const clearTimers = () => {
      if (initialConnectTimer) {
        clearTimeout(initialConnectTimer);
        initialConnectTimer = null;
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
    };

    const closeSocketSafely = (socket: WebSocket | null) => {
      if (!socket) return;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      if (socket.readyState === WebSocket.CONNECTING) {
        // Avoid "WebSocket is closed before the connection is established" console error
        socket.onopen = () => {
          try {
            socket.close(1000);
          } catch {
            // Ignore close error
          }
        };
        return;
      }

      socket.onopen = null;
      if (socket.readyState === WebSocket.OPEN) {
        try {
          socket.close(1000);
        } catch {
          // Ignore close error on teardown
        }
      }
    };

    const connectWebSocket = () => {
      if (isUnmounted) return;

      try {
        const wsUrl = leaveRequestsService.buildRealtimeWebSocketUrl({
          leaveRequestId,
          classId,
        });
        const socket = new WebSocket(wsUrl);
        ws = socket;

        socket.onopen = () => {
          if (isUnmounted) {
            try {
              socket.close(1000);
            } catch {
              // Ignore
            }
            return;
          }
          retryCount = 0;
          setIsConnected(true);

          if (leaveRequestId && socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                action: "subscribe_detail",
                leaveRequestId,
              }),
            );
          }

          heartbeatTimer = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ action: "ping" }));
            }
          }, 25000);
        };

        socket.onmessage = (event: MessageEvent) => {
          if (isUnmounted) return;
          try {
            const parsed = JSON.parse(String(event.data)) as {
              type?: string;
              data?: LeaveRequestRealtimePayload;
            };
            if (parsed.type === "leave_request_event" && parsed.data) {
              handleIncomingEvent(parsed.data, true);
            }
          } catch {
            // Ignore malformed socket frames
          }
        };

        socket.onerror = () => {
          // Handled in onclose with backoff retry
        };

        socket.onclose = () => {
          if (isUnmounted) return;
          setIsConnected(false);
          clearTimers();

          if (retryCount < 8) {
            const delay = Math.min(1500 * Math.pow(1.8, retryCount), 30000);
            retryCount += 1;
            reconnectTimer = setTimeout(connectWebSocket, delay);
          }
        };
      } catch {
        setIsConnected(false);
      }
    };

    // Short delay avoids StrictMode mount->unmount->remount opening a throwaway socket
    initialConnectTimer = setTimeout(connectWebSocket, 50);

    return () => {
      isUnmounted = true;
      clearTimers();
      closeSocketSafely(ws);
      ws = null;
    };
  }, [classId, enabled, handleIncomingEvent, leaveRequestId]);

  // 2. Cross-tab BroadcastChannel & CustomEvent listener
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleCustomEvent = (event: Event) => {
      const customEv = event as CustomEvent<LeaveRequestRealtimePayload>;
      if (customEv.detail) {
        handleIncomingEvent(customEv.detail, false);
      }
    };

    window.addEventListener(LEAVE_REQUEST_BROADCAST_CHANNEL, handleCustomEvent);

    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(LEAVE_REQUEST_BROADCAST_CHANNEL);
        channel.onmessage = (event: MessageEvent<LeaveRequestRealtimePayload>) => {
          if (event.data) {
            handleIncomingEvent(event.data, false);
          }
        };
      }
    } catch {
      // BroadcastChannel not available
    }

    return () => {
      window.removeEventListener(
        LEAVE_REQUEST_BROADCAST_CHANNEL,
        handleCustomEvent,
      );
      if (channel) {
        try {
          channel.close();
        } catch {
          // Ignore close error
        }
      }
    };
  }, [enabled, handleIncomingEvent]);

  // 3. Delta-sync polling & visibility/focus revalidation
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const initialTimer = setTimeout(() => {
      void triggerSyncCheck();
    }, 0);

    const intervalId =
      pollIntervalMs > 0
        ? setInterval(() => {
            if (
              typeof document === "undefined" ||
              document.visibilityState === "visible"
            ) {
              void triggerSyncCheck();
            }
          }, pollIntervalMs)
        : null;

    const handleVisibilityOrFocus = () => {
      if (
        typeof document === "undefined" ||
        document.visibilityState === "visible"
      ) {
        void triggerSyncCheck();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      clearTimeout(initialTimer);
      if (intervalId) {
        clearInterval(intervalId);
      }
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
