import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export interface TimetableActionGroupProps {
  hasActiveFilters?: boolean;
  isPrinting?: boolean;
  onResetFilters: () => void;
  onPrint?: () => void;
}

export const TimetableActionGroup: React.FC<TimetableActionGroupProps> = ({
  hasActiveFilters = false,
  isPrinting = false,
  onResetFilters,
  onPrint,
}) => {
  const { t } = useTranslation(["card", "button"]);

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Reset button when not on default/current week */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onResetFilters}
          title={t("card:timetable.backToCurrentWeek")}
          aria-label={t("card:timetable.backToCurrentWeek")}
        >
          <Icon name="refresh" size={13} />
          <span>{t("card:timetable.backToCurrentWeek")}</span>
        </Button>
      )}

      {/* Print action button */}
      {onPrint && (
        <Button
          variant="primary"
          onClick={onPrint}
          loading={isPrinting}
          disabled={isPrinting}
          title={t("button:printTimeTable")}
          aria-label={t("button:printTimeTable")}
        >
          <Icon name="print" size={13} />
          <span>{t("button:printTimeTable")}</span>
        </Button>
      )}
    </div>
  );
};
