import React from "react";
import { Checkbox } from "antd";
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
    <div className="bg-blue-50 border border-blue-200 p-3 sm:p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isAllSelected}
          indeterminate={selectedCount > 0 && selectedCount < totalOnPage}
          onChange={onSelectAll}
        >
          <span className="text-xs font-semibold text-blue-900">
            Chọn tất cả ({totalOnPage} tài liệu trên trang)
          </span>
        </Checkbox>
        <div className="hidden sm:block h-4 w-px bg-blue-200" />
        <span className="text-xs font-bold text-blue-800 bg-white px-2.5 py-0.5 rounded-md border border-blue-200">
          Đã chọn: {selectedCount} tài liệu
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          onClick={onDownloadSelected}
        >
          <Icon name="download" size={13} className="mr-1.5" />
          <span>Tải xuống gói ZIP ({selectedCount})</span>
        </Button>

        <Button
          variant="outline"
          onClick={onClearSelection}
          className="bg-white text-slate-700"
        >
          <Icon name="close" size={13} className="mr-1.5" />
          <span>Bỏ chọn</span>
        </Button>
      </div>
    </div>
  );
};
