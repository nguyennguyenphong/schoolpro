import { message } from "antd";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import {
  LeaveRequestDetailHeader,
  LeaveRequestDetailSidebar,
  LeaveRequestStepsLogCard,
} from "@/modules/students/features/leave-requests/components/detail";
import { useLeaveRequestRealtime } from "@/modules/students/features/leave-requests/hooks";
import { leaveRequestsService } from "@/modules/students/features/leave-requests/services";
import type {
  LeaveRequestItem,
  LeaveRequestRealtimePayload,
} from "@/modules/students/features/leave-requests/types";

const LeaveRequestDetailPage: React.FC = () => {
  const { t } = useTranslation(["message", "button"]);
  const { id } = useParams<{ id: string }>();
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

      silentRefreshDetail();
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
        silentRefreshDetail();
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

    loadDetail();

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

  if (loading) {
    return (
      <div className="space-y-4 pb-8">
        <Card
          loading={true}
          className="rounded-xl shadow-2xs border-[#f0f0f0] h-28"
          skeletonProps={{ paragraph: { rows: 2 } }}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card
              loading={true}
              className="rounded-xl shadow-2xs border-[#f0f0f0] h-96"
              skeletonProps={{ paragraph: { rows: 8 } }}
            />
          </div>
          <div>
            <Card
              loading={true}
              className="rounded-xl shadow-2xs border-[#f0f0f0] h-80"
              skeletonProps={{ paragraph: { rows: 6 } }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-10 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs my-6">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Icon name="file-text" size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          {t("message:empty.leaveRequestNotFoundTitle")}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {t("message:empty.leaveRequestNotFoundDesc")}
        </p>
        <Button variant="primary" onClick={() => navigate("/student/leave-requests")}>
          {t("button:backToLeaveRequests")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      <LeaveRequestDetailHeader
        item={item}
        downloading={downloading}
        deleting={deleting}
        onBack={() => navigate("/student/leave-requests")}
        onEdit={() => navigate(`/student/leave-requests/${item.id}/edit`)}
        onDownloadPdf={handleDownloadPdf}
        onDelete={handleDelete}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2">
          <LeaveRequestStepsLogCard item={item} />
        </div>

        <div>
          <LeaveRequestDetailSidebar item={item} />
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestDetailPage;
