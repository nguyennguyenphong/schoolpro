export const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

/**
 * Checks if a question has been answered by the student.
 */
export const isAnswerFilled = (
  value: unknown,
): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return value > 0;
  if (typeof value === "boolean") return true;
  return false;
};

/**
 * Format seconds into mm:ss display string.
 */
export const formatExamTime = (totalSeconds: number): string => {
  const mins = Math.max(0, Math.floor(totalSeconds / 60));
  const secs = Math.max(0, totalSeconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Checks if exam score is released according to teacher's release mode setting:
 * - immediate: released immediately upon completion
 * - hidden: completely hidden from student
 * - scheduled: released on or after scoreReleaseDate
 */
export const isScoreReleased = (exam: {
  scoreReleaseMode?: "immediate" | "hidden" | "scheduled";
  scoreReleaseDate?: string;
  settings?: {
    scoreReleaseMode?: "immediate" | "hidden" | "scheduled";
    scoreReleaseDate?: string;
  };
}): boolean => {
  const mode = exam.scoreReleaseMode || exam.settings?.scoreReleaseMode || "immediate";
  if (mode === "immediate") return true;
  if (mode === "hidden") return false;
  if (mode === "scheduled") {
    const releaseDate = exam.scoreReleaseDate || exam.settings?.scoreReleaseDate;
    if (!releaseDate) return false;
    return new Date(releaseDate).getTime() <= Date.now();
  }
  return true;
};
