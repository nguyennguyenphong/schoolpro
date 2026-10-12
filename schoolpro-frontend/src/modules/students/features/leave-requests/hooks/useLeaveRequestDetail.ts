import { message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useLeaveRequestRealtime } from "@/modules/students/features/leave-requests/hooks/useLeaveRequestRealtime";
import { leaveRequestsService } from "@/modules/students/features/leave-requests/services";
import type {
  LeaveRequestItem,
  LeaveRequestRealtimePayload,
} from "@/modules/students/features/leave-requests/types";

export function useLeaveRequestDetail(id?: string) {
  const { t } = useTranslation(["message"]);
  const navigate = useNavigate();

  const [item, setItem] = useState<LeaveRequestItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const silentRefreshDetail = useCallback(async () => {
    if (!id) return;
    const latest = await leaveRequestsService.getLeaveRequestById(id);
    if (latest) {
      setItem(latest);
    }
  }, [id]);

  const handleRealtimeEvent = useCallback(
    (payload: LeaveRequestRealtimePayload) => {
      if (payload.eventType === "LEAVE_REQUEST_DELETED" && payload.leaveRequestId === id) {
        navigate("/student/leave-requests", { replace: true });
        return;
      }

      if (payload.item && payload.item.id === id) {
        setItem(payload.item);
        return;
      }

      if (payload.eventType === "LEAVE_REQUEST_LOG_CREATED" && payload.eventLog) {
        const newLog = payload.eventLog;
        setItem((prev) => {
          if (!prev) return prev;
          const existingLogs = prev.eventLogs || [];
          if (existingLogs.some((lg) => lg.id === newLog.id)) {
            return prev;
          }
          return {
            ...prev,
            eventLogs: [...existingLogs, newLog],
          };
        });
      }

      void silentRefreshDetail();
    },
    [id, navigate, silentRefreshDetail],
  );

  useLeaveRequestRealtime({
    leaveRequestId: id,
    enabled: Boolean(id),
    onEvent: handleRealtimeEvent,
    onSyncChange: (snapshot) => {
      if (snapshot.detailItem) {
        setItem(snapshot.detailItem);
      } else {
        void silentRefreshDetail();
      }
    },
  });

  useEffect(() => {
    let ignore = false;

    async function loadDetail() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await leaveRequestsService.getLeaveRequestById(id);
        if (!ignore) {
          setItem(res);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadDetail();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!item) return;
    try {
      setDownloading(true);
      await leaveRequestsService.downloadLeaveRequestPdf(item.id, item.code || item.requestCode);
      const latestItem = await leaveRequestsService.getLeaveRequestById(item.id);
      if (latestItem) {
        setItem(latestItem);
      }
      message.success(t("message:leaveRequestPdfDownloadSuccess"));
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : t("message:leaveRequestPdfDownloadError"),
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    try {
      setDeleting(true);
      await leaveRequestsService.deleteLeaveRequest(item.id);
      message.success(t("message:leaveRequestDeleteSuccess"));
      navigate("/student/leave-requests", { replace: true });
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : t("message:leaveRequestDeleteError"),
      );
    } finally {
      setDeleting(false);
    }
  };

  return {
    item,
    loading,
    downloading,
    deleting,
    handleDownloadPdf,
    handleDelete,
  };
}
