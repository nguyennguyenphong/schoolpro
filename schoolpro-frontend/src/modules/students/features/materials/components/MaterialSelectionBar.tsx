import React from "react";
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
}

export const MaterialSelectionBar: React.FC<MaterialSelectionBarProps> = ({
  selectedCount,
  totalOnPage,
  isAllSelected,
  onSelectAll,
  onClearSelection,
  onDownloadSelected,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl shadow-2xs transition-all animate-fadeIn">
      {/* Left: Select all checkbox + count */}
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isAllSelected}
          indeterminate={selectedCount > 0 && selectedCount < totalOnPage}
          onChange={onSelectAll}
        >
          <span className="text-xs font-semibold text-slate-800">
            Chọn tất cả ({totalOnPage} tài liệu trên trang)
          </span>
        </Checkbox>

        <span className="h-4 w-px bg-blue-200 hidden sm:inline-block" />

        <div className="text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-xl border border-blue-200">
          Đã chọn: {selectedCount} tài liệu
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="primary"
          onClick={onDownloadSelected}
        >
          <Icon name="download" size={13} />
          <span>Tải xuống gói ZIP ({selectedCount})</span>
        </Button>

        <Button
          variant="ghost"
          onClick={onClearSelection}
        >
          <span>Bỏ chọn</span>
        </Button>
      </div>
    </div>
  );
};
