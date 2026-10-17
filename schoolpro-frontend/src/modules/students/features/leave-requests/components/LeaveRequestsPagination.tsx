import React from "react";
import { useTranslation } from "react-i18next";
import { StudentPagination } from "@/modules/students/components";

export interface LeaveRequestsPaginationProps {
  current: number;
  pageSize: number;
  total: number;
  itemsCount: number;
  onChange: (page: number, pageSize: number) => void;
}

export const LeaveRequestsPagination: React.FC<LeaveRequestsPaginationProps> = ({
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
      prefixText={t("card:leaveRequests.item.paginationShowingPrefix")}
      middleText={t("card:leaveRequests.item.paginationShowingMiddle")}
      suffixText={t("card:leaveRequests.item.paginationShowingSuffix")}
      onChange={onChange}
    />
  );
};

