import React from "react";
import { useTranslation } from "react-i18next";
import { StudentPagination } from "@/modules/students/components";

export interface AssignmentsPaginationProps {
  current: number;
  pageSize: number;
  total: number;
  itemsCount: number;
  onChange: (page: number, pageSize: number) => void;
}

export const AssignmentsPagination: React.FC<AssignmentsPaginationProps> = ({
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
      unitLabel={t("card:assignmentUnit")}
      onChange={onChange}
    />
  );
};

