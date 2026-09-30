import React from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface AnnouncementSelectionBarProps {
  selectedCount: number;
  totalOnPage: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onMarkAsRead: () => void;
  onMarkAsUnread: () => void;
}

export const AnnouncementSelectionBar: React.FC<AnnouncementSelectionBarProps> = ({
  selectedCount,
  totalOnPage,
  isAllSelected,
  onSelectAll,
  onClearSelection,
  onMarkAsRead,
  onMarkAsUnread,
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
            Chọn tất cả ({totalOnPage} tin trên trang)
          </span>
        </Checkbox>

        <span className="h-4 w-px bg-blue-200 hidden sm:inline-block" />

        <div className="text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-md border border-blue-200">
          Đã chọn: {selectedCount} thông báo
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="primary"
          onClick={onMarkAsRead}
        >
          <Icon name="check" size={13} />
          Đánh dấu đã đọc
        </Button>

        <Button
          variant="outline"
          onClick={onMarkAsUnread}
        >
          <Icon name="clock" size={13} />
          Đánh dấu chưa đọc
        </Button>

        <Button
          variant="ghost"
          onClick={onClearSelection}
        >
          Bỏ chọn
        </Button>
      </div>
    </div>
  );
};
