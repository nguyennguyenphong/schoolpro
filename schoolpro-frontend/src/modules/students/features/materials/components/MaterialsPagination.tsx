import React from "react";
import { useTranslation } from "react-i18next";
import { StudentPagination } from "@/modules/students/components";

export interface MaterialsPaginationProps {
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

  return (
    <StudentPagination
      current={current}
      pageSize={pageSize}
      total={total}
      itemsCount={itemsCount}
      unitLabel={t("card:materialUnit")}
      onChange={onChange}
    />
  );
};

