import React from "react";
import { useTranslation } from "react-i18next";
import { Pagination } from "@/components/ui/Pagination";

interface MaterialsPaginationProps {
  current: number;
  pageSize: number;
  total: number;
  itemsCount: number;
  onChange: (page: number, pageSize: number) => void;
}

export const MaterialsPagination: React.FC<MaterialsPaginationProps> = ({
  current,
  pageSize,
  total,
  itemsCount,
  onChange,
}) => {
  const { t } = useTranslation(["card"]);

  if (total <= 0) return null;

  return (
    <div className="p-4 bg-white rounded-xl border border-[#f0f0f0] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
      <div className="text-xs text-slate-500">
        {t("card:materials.filter.paginationShowing", {
          count: itemsCount,
          total,
        })}
      </div>

      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        showSizeChanger
        pageSizeOptions={["9", "18", "36", "72"]}
      />
    </div>
  );
};
