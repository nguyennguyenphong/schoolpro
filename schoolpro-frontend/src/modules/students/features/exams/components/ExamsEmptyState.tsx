import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

interface ExamsEmptyStateProps {
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
}

export const ExamsEmptyState: React.FC<ExamsEmptyStateProps> = ({
  hasActiveFilters = false,
  onResetFilters,
}) => {
  const { t } = useTranslation(["card", "button"]);

  return (
    <div className="bg-white rounded-xl border border-[#f0f0f0] p-8 sm:p-12 text-center shadow-2xs space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
        <Icon name="file-text" size={26} />
      </div>

      <div className="space-y-1 max-w-md mx-auto">
        <h3 className="text-base font-bold text-slate-800 mb-0">
          {hasActiveFilters
            ? t("card:exams.empty.noMatchingTitle")
            : t("card:exams.empty.noPendingTitle")}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-0">
          {hasActiveFilters
            ? t("card:exams.empty.noMatchingDesc")
            : t("card:exams.empty.noPendingDesc")}
        </p>
      </div>

      {hasActiveFilters && onResetFilters && (
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Icon name="refresh" size={13} />
            <span>{t("button:resetFilters")}</span>
          </Button>
        </div>
      )}
    </div>
  );
};
