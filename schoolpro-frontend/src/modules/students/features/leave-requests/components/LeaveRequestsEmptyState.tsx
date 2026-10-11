import React from "react";
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
  return (
    <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs">
      <Empty
        description={
          <div className="space-y-1.5">
            <p className="text-sm font-bold text-slate-700 mb-0">
              {hasActiveFilters
                ? "Không tìm thấy đơn xin nghỉ phép phù hợp"
                : "Chưa có đơn xin nghỉ phép nào"}
            </p>
            <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
              {hasActiveFilters
                ? "Không có đơn xin nghỉ nào khớp với bộ lọc hoặc từ khóa tìm kiếm hiện tại."
                : "Bạn chưa gửi đơn xin nghỉ phép nào trong học kỳ này. Nhấn nút bên dưới để tạo đơn xin nghỉ trực tuyến gửi Giáo viên chủ nhiệm."}
            </p>
          </div>
        }
      >
        <div className="flex items-center justify-center gap-2 mt-3">
          {hasActiveFilters ? (
            <Button variant="outline" onClick={onResetFilters}>
              <Icon name="refresh" size={13} className="mr-1" />
              <span>Đặt lại bộ lọc</span>
            </Button>
          ) : (
            <Button variant="primary" onClick={onCreateClick}>
              <Icon name="plus" size={14} />
              <span>Tạo đơn xin nghỉ phép</span>
            </Button>
          )}
        </div>
      </Empty>
    </div>
  );
};
