import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import type { ActiveSession } from "@/modules/students/features/settings/types";

interface ActiveSessionsSectionProps {
  sessions: ActiveSession[];
  onRevokeSession: (sessionId: string) => Promise<void>;
  onRevokeAllOtherSessions: () => Promise<void>;
  loading?: boolean;
}

export const ActiveSessionsSection: React.FC<ActiveSessionsSectionProps> = ({
  sessions,
  onRevokeSession,
  onRevokeAllOtherSessions,
  loading = false,
}) => {
  const { t } = useTranslation(["card", "button", "modal", "common"]);
  const [sessionToRevoke, setSessionToRevoke] = useState<ActiveSession | null>(null);
  const [isRevokeAllOpen, setIsRevokeAllOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const getDeviceIcon = (deviceType: ActiveSession["deviceType"]): "device" | "phone" => {
    switch (deviceType) {
      case "mobile":
        return "phone";
      default:
        return "device";
    }
  };

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

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <Card className="rounded-2xl border border-slate-200 shadow-2xs bg-white p-5 sm:p-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
            <Icon name="device" size={20} />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">
              {t("card:settings.sections.sessions")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-0">
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

      <div className="space-y-3">
        {sessions.map((session) => {
          const icon = getDeviceIcon(session.deviceType);
          return (
            <div
              key={session.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                session.isCurrent
                  ? "bg-blue-50/20 border-blue-200 ring-1 ring-blue-100"
                  : "bg-slate-50/60 border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    session.isCurrent
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  <Icon name={icon} size={20} />
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-slate-900 text-sm">
                      {session.deviceName}
                    </span>
                    {session.isCurrent ? (
                      <Tag color="green" className="font-semibold text-xs px-2 py-0.5 m-0">
                        {t("card:settings.sessions.currentDevice")}
                      </Tag>
                    ) : (
                      <Tag className="text-xs px-2 py-0.5 m-0 bg-slate-100 text-slate-600 border-slate-200">
                        {session.os}
                      </Tag>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-0">
                    {session.browser} • {session.ipAddress} ({session.location})
                  </p>
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
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mt-3 text-xs space-y-1">
            <span className="font-bold text-slate-800 block">
              {sessionToRevoke.deviceName}
            </span>
            <span className="text-slate-500 block">
              {sessionToRevoke.browser} • {sessionToRevoke.ipAddress}
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
    </Card>
  );
};
