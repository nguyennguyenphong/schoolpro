import React from "react";
import { useTranslation } from "react-i18next";
import { Empty } from "@/components/ui/Empty";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface LeaveRequestsEmptyStateProps {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onCreateClick: () => void;
}

export const LeaveRequestsEmptyState: React.FC<LeaveRequestsEmptyStateProps> = ({
  hasActiveFilters,
  onResetFilters,
  onCreateClick,
}) => {
  const { t } = useTranslation(["message", "button"]);

  return (
    <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs">
      <Empty
        description={
          <div className="space-y-1.5">
            <p className="text-sm font-bold text-slate-700 mb-0">
              {hasActiveFilters
                ? t("message:empty.noFilteredLeaveRequests")
                : t("message:empty.noLeaveRequests")}
            </p>
            <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
              {hasActiveFilters
                ? t("message:empty.noFilteredLeaveRequestsDesc")
                : t("message:empty.noLeaveRequestsDesc")}
            </p>
          </div>
        }
      >
        <div className="flex items-center justify-center gap-2 mt-3">
          {hasActiveFilters ? (
            <Button variant="outline" onClick={onResetFilters}>
              <Icon name="refresh" size={13} />
              <span>{t("button:resetFilters")}</span>
            </Button>
          ) : (
            <Button variant="primary" onClick={onCreateClick}>
              <Icon name="plus" size={14} />
              <span>{t("button:createLeaveRequest")}</span>
            </Button>
          )}
        </div>
      </Empty>
    </div>
  );
};
