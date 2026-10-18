import type React from "react";
import { LeaveRequestStatusBanner } from "@/modules/students/features/leave-requests/components/detail/LeaveRequestStatusBanner";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";

interface LeaveRequestWorkflowCardProps {
  item: LeaveRequestItem;
}

/**
 * Re-exports the student-friendly Status Banner under LeaveRequestWorkflowCard
 * to ensure complete backwards compatibility with existing consumers.
 */
export const LeaveRequestWorkflowCard: React.FC<LeaveRequestWorkflowCardProps> = ({ item }) => {
  return <LeaveRequestStatusBanner item={item} />;
};
