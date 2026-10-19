import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { Empty } from "@/components/ui/Empty";
import { Pagination } from "@/components/ui/Pagination";
import type { ActiveSession } from "@/modules/students/features/settings/types";

export interface LoginHistorySectionProps {
  sessions: ActiveSession[];
  onRevokeSession: (sessionId: string) => Promise<void>;
  onRevokeAllOtherSessions: () => Promise<void>;
  loading?: boolean;
}

type DeviceFilterType = "all" | "desktop" | "mobile" | "tablet";

export const LoginHistorySection: React.FC<LoginHistorySectionProps> = ({
  sessions,
  onRevokeSession,
  onRevokeAllOtherSessions,
  loading = false,
}) => {
  const { t } = useTranslation(["card", "button", "modal", "common"]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filter and pagination states from URL search params
  const rawDevice = searchParams.get("device") as DeviceFilterType | null;
  const deviceFilter: DeviceFilterType =
    rawDevice === "desktop" || rawDevice === "mobile" || rawDevice === "tablet"
      ? rawDevice
      : "all";

  const searchQuery = searchParams.get("q") || searchParams.get("search") || "";

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const pageSize = 4;

  const [sessionToRevoke, setSessionToRevoke] = useState<ActiveSession | null>(null);
  const [isRevokeAllOpen, setIsRevokeAllOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Sync device filter changes to URL
  const handleDeviceFilterChange = (newDevice: DeviceFilterType) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newDevice === "all") {
        next.delete("device");
      } else {
        next.set("device", newDevice);
      }
      next.delete("page");
      return next;
    });
  };

  // Sync search query changes to URL
  const handleSearchChange = (query: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (query.trim()) {
        next.set("q", query.trim());
      } else {
        next.delete("q");
        next.delete("search");
      }
      next.delete("page");
      return next;
    });
  };

  // Sync pagination changes to URL
  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (page > 1) {
        next.set("page", String(page));
      } else {
        next.delete("page");
      }
      return next;
    });
  };

  // Clear all filters from URL
  const resetFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("device");
      next.delete("q");
      next.delete("search");
      next.delete("page");
      return next;
    });
  };

  const getDeviceIcon = (deviceType: ActiveSession["deviceType"]): "device" | "phone" => {
    switch (deviceType) {
      case "mobile":
        return "phone";
      default:
        return "device";
    }
  };

  // Filtered sessions based on search query and device type filter
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchDevice = deviceFilter === "all" || session.deviceType === deviceFilter;
      if (!matchDevice) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        session.deviceName.toLowerCase().includes(q) ||
        session.browser.toLowerCase().includes(q) ||
        session.os.toLowerCase().includes(q) ||
        session.ipAddress.toLowerCase().includes(q) ||
        session.location.toLowerCase().includes(q)
      );
    });
  }, [sessions, searchQuery, deviceFilter]);

  // Paginated sessions for the active page
  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSessions.slice(startIndex, startIndex + pageSize);
  }, [filteredSessions, currentPage, pageSize]);

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  const handleConfirmRevoke = async () => {
    if (!sessionToRevoke) return;
    try {
      setSubmitting(true);
      await onRevokeSession(sessionToRevoke.id);
      setSessionToRevoke(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmRevokeAll = async () => {
    try {
      setSubmitting(true);
      await onRevokeAllOtherSessions();
      setIsRevokeAllOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Title and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0f0f0] pb-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="device" size={20} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-0">
                {t("card:settings.tabs.loginHistory")}
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-[#f0f0f0]">
                {filteredSessions.length}/{sessions.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-0 mt-0.5">
              {t("card:settings.sections.sessionsDesc")}
            </p>
          </div>
        </div>

        {otherSessionsCount > 0 && (
          <Button
            variant="danger"
            disabled={loading}
            onClick={() => setIsRevokeAllOpen(true)}
            className="rounded-lg h-9 px-3.5 text-xs font-semibold self-start sm:self-auto shrink-0"
          >
            <Icon name="close" size={13} className="mr-1.5" />
            {t("button:logoutAllDevices")}
          </Button>
        )}
      </div>

      {/* 2. Search Box and Device Category Filters (Synced with URL) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Tìm theo thiết bị, trình duyệt, IP hoặc vị trí..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            allowClear
            autoFocus
            prefix={<Icon name="search" size={15} className="text-slate-400 mr-1.5" />}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(
            [
              { key: "all", label: "Tất cả", icon: "device" as const },
              { key: "desktop", label: "Máy tính", icon: "device" as const },
              { key: "mobile", label: "Điện thoại", icon: "phone" as const },
              { key: "tablet", label: "Máy tính bảng", icon: "device" as const },
            ] as const
          ).map((item) => {
            const isSelected = deviceFilter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleDeviceFilterChange(item.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon
                  name={item.icon}
                  size={13}
                  className={isSelected ? "text-white" : "text-slate-400"}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Session List Area */}
      {filteredSessions.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-slate-50/50 rounded-xl border border-[#f0f0f0]">
          <Empty
            description={
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-700 mb-0">
                  Không tìm thấy phiên đăng nhập nào
                </p>
                <p className="text-xs text-slate-500 mb-0">
                  Vui lòng thử từ khóa tìm kiếm khác hoặc xóa bộ lọc
                </p>
                <Button
                  size="small"
                  variant="outline"
                  onClick={resetFilters}
                  className="rounded-lg text-xs mt-2"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedSessions.map((session) => {
            const icon = getDeviceIcon(session.deviceType);
            return (
              <div
                key={session.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                  session.isCurrent
                    ? "bg-blue-50/20 border-blue-200 ring-1 ring-blue-100"
                    : "bg-slate-50/60 border-[#f0f0f0] hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      session.isCurrent
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-600 border-[#f0f0f0]"
                    }`}
                  >
                    <Icon name={icon} size={20} />
                  </span>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {session.deviceName}
                      </span>
                      {session.isCurrent ? (
                        <Tag color="green" className="font-semibold text-xs px-2 py-0.5 m-0">
                          {t("card:settings.sessions.currentDevice")}
                        </Tag>
                      ) : (
                        <Tag className="text-xs px-2 py-0.5 m-0 bg-slate-100 text-slate-600 border-[#f0f0f0]">
                          {session.os}
                        </Tag>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span>{session.browser}</span>
                      <span>|</span>
                      <span className="text-slate-600">{session.ipAddress}</span>
                      <span>|</span>
                      <span>{session.location}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Hoạt động: {session.lastActiveAt}
                    </div>
                  </div>
                </div>

                {!session.isCurrent && (
                  <div className="self-end sm:self-center shrink-0">
                    <Button
                      size="small"
                      variant="danger"
                      disabled={loading}
                      onClick={() => setSessionToRevoke(session)}
                      className="rounded-lg text-xs px-3 h-8"
                    >
                      {t("button:revokeSession")}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Pagination (Synced with URL) */}
      {filteredSessions.length > pageSize && (
        <div className="flex items-center justify-between border-t border-[#f0f0f0] pt-4">
          <span className="text-xs text-slate-500">
            Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
            {Math.min(currentPage * pageSize, filteredSessions.length)} trên tổng{" "}
            {filteredSessions.length} phiên
          </span>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredSessions.length}
            onChange={handlePageChange}
            showSizeChanger={false}
            size="small"
          />
        </div>
      )}

      {/* Confirm Single Revoke Modal */}
      <Modal
        open={Boolean(sessionToRevoke)}
        title={t("modal:revokeSessionConfirmTitle")}
        onOk={handleConfirmRevoke}
        onCancel={() => setSessionToRevoke(null)}
        confirmLoading={submitting}
        okText={t("button:revokeSession")}
        cancelText={t("button:cancel")}
      >
        <p className="text-sm text-slate-600 my-2">
          {t("modal:revokeSessionConfirmContent")}
        </p>
        {sessionToRevoke && (
          <div className="p-3 bg-slate-50 rounded-xl border border-[#f0f0f0] mt-3 text-xs space-y-1">
            <span className="font-bold text-slate-800 block">
              {sessionToRevoke.deviceName}
            </span>
            <span className="text-slate-500 block">
              {sessionToRevoke.browser} | {sessionToRevoke.ipAddress} ({sessionToRevoke.location})
            </span>
          </div>
        )}
      </Modal>

      {/* Confirm Revoke All Modal */}
      <Modal
        open={isRevokeAllOpen}
        title={t("button:logoutAllDevices")}
        onOk={handleConfirmRevokeAll}
        onCancel={() => setIsRevokeAllOpen(false)}
        confirmLoading={submitting}
        okText={t("button:logoutAllDevices")}
        cancelText={t("button:cancel")}
      >
        <p className="text-sm text-slate-600 my-2">
          {t("modal:revokeSessionConfirmContent")}
        </p>
      </Modal>
    </div>
  );
};
