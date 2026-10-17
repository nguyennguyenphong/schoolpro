import React from "react";
import { useTranslation } from "react-i18next";
import { Pagination } from "@/components/ui/Pagination";

export interface StudentPaginationProps {
  current: number;
  pageSize: number;
  total: number;
  itemsCount: number;
  unitLabel?: string;
  prefixText?: string;
  middleText?: string;
  suffixText?: string;
  onChange: (page: number, pageSize: number) => void;
  pageSizeOptions?: string[];
  className?: string;
}

/**
 * Standardized Pagination component across all Student Portal features
 * Unified with consistent pageSizeOptions: ["10", "20", "50", "100"] and responsive framing.
 */
export const StudentPagination: React.FC<StudentPaginationProps> = ({
  current,
  pageSize,
  total,
  itemsCount,
  unitLabel,
  prefixText,
  middleText,
  suffixText,
  onChange,
  pageSizeOptions = ["10", "20", "50", "100"],
  className,
}) => {
  const { t } = useTranslation(["common", "card"]);

  if (total <= 0) return null;

  const showingPrefix = prefixText || t("common:pagination.showing");
  const showingMiddle = middleText || t("common:pagination.of");
  const unit = unitLabel !== undefined ? unitLabel : (suffixText || "");

  return (
    <div
      className={`p-4 bg-white rounded-xl border border-[#f0f0f0] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs ${
        className || ""
      }`}
    >
      <div className="text-xs text-slate-500">
        {showingPrefix}{" "}
        <strong className="text-slate-800">{itemsCount}</strong>{" "}
        {showingMiddle}{" "}
        <strong className="text-slate-800">{total}</strong>{" "}
        {unit}
      </div>

      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        showSizeChanger
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
};
