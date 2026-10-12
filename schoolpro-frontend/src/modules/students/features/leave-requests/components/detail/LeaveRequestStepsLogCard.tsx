import type React from "react";
import { LeaveRequestActivityLogCard } from "@/modules/students/features/leave-requests/components/detail/LeaveRequestActivityLogCard";
import { LeaveRequestContentCard } from "@/modules/students/features/leave-requests/components/detail/LeaveRequestContentCard";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";

interface LeaveRequestStepsLogCardProps {
  item: LeaveRequestItem;
}

export const LeaveRequestStepsLogCard: React.FC<LeaveRequestStepsLogCardProps> = ({ item }) => {
  return (
    <div className="space-y-4 sm:space-y-5">
      <LeaveRequestContentCard item={item} />
      <LeaveRequestActivityLogCard item={item} />
    </div>
  );
};
