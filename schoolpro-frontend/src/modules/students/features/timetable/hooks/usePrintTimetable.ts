import { useState, useCallback } from "react";
import { printTimetable } from "@/modules/students/features/timetable/utils";

interface UseTimetablePrintProps {
  filter: {
    selectedDate: Date;
  };
  slots: Parameters<typeof printTimetable>[0]["slots"];
  currentWeekLabel: string;
  semesterLabel: string;
  user?: {
    full_name?: string;
    name?: string;
  } | null;
}

export const usePrintTimetable = ({
  filter,
  slots,
  currentWeekLabel,
  semesterLabel,
  user,
}: UseTimetablePrintProps) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useCallback(async () => {
    setIsPrinting(true);

    const homeroomSlot = slots?.find((s) => s.instructorName?.toLowerCase().includes("chủ nhiệm"));
    const homeroomTeacher = homeroomSlot
      ? homeroomSlot.instructorName.replace(/\s*\((?:Giáo viên\s*)?chủ nhiệm\)\s*/gi, "").trim()
      : "Trần Thị Văn";

    try {
      await printTimetable({
        selectedDate: filter.selectedDate.toISOString(),
        slots,
        className: slots?.[0]?.className,
        currentWeekLabel,
        semesterLabel,
        studentName: user?.full_name || user?.name || "SchoolPro Student",
        homeroomTeacher,
      });
    } finally {
      setIsPrinting(false);
    }
  }, [
    filter.selectedDate,
    slots,
    currentWeekLabel,
    semesterLabel,
    user,
  ]);

  return {
    isPrinting,
    handlePrint,
  };
};
