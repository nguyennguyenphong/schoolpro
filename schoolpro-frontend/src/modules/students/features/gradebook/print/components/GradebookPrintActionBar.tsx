import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface GradebookPrintActionBarProps {
  onPrint: () => void;
  onClose: () => void;
}

export const GradebookPrintActionBar: React.FC<GradebookPrintActionBarProps> = ({
  onPrint,
  onClose,
}) => {
  const { t } = useTranslation(["card"]);

  return (
    <div className="no-print sticky top-0 z-50 bg-white/95 backdrop-blur-xs border-b border-slate-200 shadow-xs px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="small"
          onClick={onClose}
          className="font-medium text-xs sm:text-sm text-slate-700"
        >
          <Icon name="arrow-left" size={14} />
          <span>{t("card:gradebook.print.back")}</span>
        </Button>
        <span className="text-xs text-slate-500 hidden sm:inline">
          {t("card:gradebook.print.pageTitle")}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          size="small"
          onClick={onClose}
          className="font-medium text-xs sm:text-sm text-slate-600 hidden sm:inline-flex"
        >
          <Icon name="close" size={14} />
          <span>{t("card:gradebook.print.close")}</span>
        </Button>
        <Button
          variant="primary"
          size="small"
          onClick={onPrint}
          className="font-semibold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Icon name="print" size={15} />
          <span>{t("card:gradebook.print.printNow")}</span>
        </Button>
      </div>
    </div>
  );
};
