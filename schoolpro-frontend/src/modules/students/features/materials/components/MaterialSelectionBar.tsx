import React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface MaterialSelectionBarProps {
  selectedCount: number;
  totalOnPage: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDownloadSelected: () => void;
  onDownloadAll?: () => void;
}

export const MaterialSelectionBar: React.FC<MaterialSelectionBarProps> = ({
  selectedCount,
  totalOnPage,
  isAllSelected,
  onSelectAll,
  onClearSelection,
  onDownloadSelected,
  onDownloadAll,
}) => {
  const { t } = useTranslation(["card", "button"]);
  if (totalOnPage === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xl shadow-2xs transition-all">
      {/* Left: Select all checkbox + count indicator */}
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isAllSelected}
          indeterminate={selectedCount > 0 && !isAllSelected}
          onChange={onSelectAll}
        >
          <span className="text-xs font-semibold text-slate-800">
            {t("card:materials.selection.selectAllOnPage", {
              count: totalOnPage,
            })}
          </span>
        </Checkbox>

        {selectedCount > 0 && (
          <>
            <span className="h-4 w-px bg-blue-200 hidden sm:inline-block" />
            <div className="text-xs font-bold text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200 shadow-2xs">
              {t("card:materials.selection.selectedCount", {
                count: selectedCount,
              })}
            </div>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 justify-end flex-wrap">
        {selectedCount > 0 ? (
          <>
            <Button
              variant="ghost"
              onClick={onClearSelection}
              className="text-xs text-slate-600 hover:text-slate-800"
            >
              <span>{t("card:materials.selection.clearSelection")}</span>
            </Button>

            <Button
              variant="primary"
              onClick={onDownloadSelected}
              className="text-xs px-3 py-1.5 font-semibold"
            >
              <Icon name="download" size={13} />
              <span>
                {t("card:materials.selection.downloadZipPackage", {
                  count: selectedCount,
                })}
              </span>
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            onClick={onDownloadAll || onSelectAll}
            className="text-xs px-3 py-1.5 font-semibold text-blue-700 border-blue-200 hover:bg-blue-100/60"
          >
            <Icon name="download" size={13} />
            <span>
              {t("card:materials.selection.downloadAll", {
                count: totalOnPage,
              })}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};
