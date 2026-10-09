import React from "react";
import { useTranslation } from "react-i18next";
import { Empty } from "@/components/ui/Empty";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface AssignmentsEmptyStateProps {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const AssignmentsEmptyState: React.FC<AssignmentsEmptyStateProps> = ({
  hasActiveFilters,
  onResetFilters,
}) => {
  const { t } = useTranslation(["message", "button"]);

  return (
    <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs">
      <Empty
        description={
          <div className="space-y-1.5">
            <p className="text-sm font-bold text-slate-700 mb-0">
              {hasActiveFilters
                ? t("message:empty.noFilteredAssignments")
                : t("message:empty.noAssignments")}
            </p>
            <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
              {hasActiveFilters
                ? t("message:empty.noFilteredAssignmentsDesc")
                : t("message:empty.noAssignments")}
            </p>
          </div>
        }
      >
        {hasActiveFilters && (
          <Button variant="outline" onClick={onResetFilters} className="mt-3">
            <Icon name="refresh" size={13} className="mr-1" />
            {t("button:resetFilters")}
          </Button>
        )}
      </Empty>
    </div>
  );
};
