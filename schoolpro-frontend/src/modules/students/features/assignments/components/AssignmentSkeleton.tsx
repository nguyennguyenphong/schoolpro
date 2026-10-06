import React from "react";
import { AssignmentCard } from "@/modules/students/features/assignments/components/AssignmentCard";

/**
 * Standard Ant Design Skeleton loader for Assignments grid.
 * Perfectly matches AssignmentCard dimensions (h-60) and 3-column grid layout to prevent layout shift.
 */
export const AssignmentSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((j) => (
        <AssignmentCard key={j} loading={true} />
      ))}
    </div>
  );
};
