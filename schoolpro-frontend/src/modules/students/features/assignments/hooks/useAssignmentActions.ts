
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

  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [submittingAppeal, setSubmittingAppeal] = useState(false);

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

  const handleAppealScore = useCallback(
    async (reason: string) => {
      if (!assignment || submittingAppeal) return;

      try {
        setSubmittingAppeal(true);

        const updated = await assignmentsService.appealAssignment(
          assignment.id,
          reason,
        );

        setAssignment(updated);
        setAppealModalOpen(false);

        message.success(t("assignments.appealSuccess"));
      } catch {
        message.error(t("assignments.appealError"));
      } finally {
        setSubmittingAppeal(false);
      }
    },
    [assignment, setAssignment, submittingAppeal, t],
  );

  return {
    reopenModalOpen,
    setReopenModalOpen,
    requestingReopen,
    handleRequestReopen,

    appealModalOpen,
    setAppealModalOpen,
    submittingAppeal,
    handleAppealScore,
  };
};
