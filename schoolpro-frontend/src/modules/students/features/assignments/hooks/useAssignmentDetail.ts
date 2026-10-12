
import { useEffect, useState } from "react";
import type {
  AssignmentItem,
  AssignmentSummary,
} from "@/modules/students/features/assignments/types";
import { assignmentsService } from "@/modules/students/features/assignments/services";

interface UseAssignmentDetailReturn {
  assignment: AssignmentItem | null;
  summary: AssignmentSummary | null;
  loading: boolean;
  setAssignment: React.Dispatch<
    React.SetStateAction<AssignmentItem | null>
  >;
}

export const useAssignmentDetail = (
  id: string | undefined,
): UseAssignmentDetailReturn => {
  const [assignment, setAssignment] =
    useState<AssignmentItem | null>(null);

  const [summary, setSummary] =
    useState<AssignmentSummary | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      if (!id) {
        setAssignment(null);
        setSummary(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [item, sum] = await Promise.all([
          assignmentsService.getAssignmentById(id),
          assignmentsService.getSummary(),
        ]);

        if (ignore) return;

        setAssignment(item);
        setSummary(sum);
      } catch {
        if (ignore) return;

        setAssignment(null);
        setSummary(null);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      ignore = true;
    };
  }, [id]);

  return {
    assignment,
    summary,
    loading,
    setAssignment,
  };
};
