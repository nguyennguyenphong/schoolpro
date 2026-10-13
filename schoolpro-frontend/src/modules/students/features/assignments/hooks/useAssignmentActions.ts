
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { message } from "@/components/ui/Message";

import type { AssignmentItem } from "@/modules/students/features/assignments/types";
import { assignmentsService } from "@/modules/students/features/assignments/services";

interface UseAssignmentActionsParams {
  assignment: AssignmentItem | null;
  setAssignment: React.Dispatch<
    React.SetStateAction<AssignmentItem | null>
  >;
}

export const useAssignmentActions = ({
  assignment,
  setAssignment,
}: UseAssignmentActionsParams) => {
  const { t } = useTranslation("message");

  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [requestingReopen, setRequestingReopen] = useState(false);

  const handleRequestReopen = useCallback(
    async (reason: string) => {
      if (!assignment || requestingReopen) return;

      try {
        setRequestingReopen(true);

        const updated =
          await assignmentsService.requestReopenAssignment(
            assignment.id,
            reason,
          );

        setAssignment(updated);
        setReopenModalOpen(false);

        message.success(
          t("assignments.reopenSuccess", {
            teacher: assignment.teacherName,
            email:
              updated.reopenRequest?.teacherEmail ||
              assignment.teacherEmail ||
              "",
          }),
        );
      } catch {
        message.error(t("assignments.reopenError"));
      } finally {
        setRequestingReopen(false);
      }
    },
    [assignment, requestingReopen, setAssignment, t],
  );

  return {
    reopenModalOpen,
    setReopenModalOpen,
    requestingReopen,
    handleRequestReopen,
  };
};

