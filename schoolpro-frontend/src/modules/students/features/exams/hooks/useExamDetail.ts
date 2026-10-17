import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { message } from "@/components/ui/Message";
import { i18n } from "@/i18n";
import type { ExamItem } from "@/modules/students/features/exams/types";
import { examsService } from "@/modules/students/features/exams/services";
import { isAnswerFilled } from "@/modules/students/features/exams/utils";

interface StoredTiming {
  startTime: number;
  durationMinutes: number;
  endTime: number;
}

export const useExamDetail = (id?: string) => {
  const [exam, setExam] = useState<ExamItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | string | string[] | boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const examRef = useRef<ExamItem | null>(null);
  useEffect(() => {
    examRef.current = exam;
  }, [exam]);

  const idRef = useRef<string | undefined>(id);
  useEffect(() => {
    idRef.current = id;
  }, [id]);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const submittingRef = useRef(false);
  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  const isCompleted = exam?.status === "completed";
  const isExpired = exam?.status === "expired";
  const isReadOnly = Boolean(isCompleted || isExpired);

  const isReadOnlyRef = useRef(isReadOnly);
  useEffect(() => {
    isReadOnlyRef.current = isReadOnly;
  }, [isReadOnly]);

  const hasAutoSubmittedRef = useRef(false);

  // Execute submission with optional allowIncomplete bypass
  // Stable function reference with empty dependency array using refs to prevent render-loop triggers
  const executeSubmit = useCallback(
    async (options?: { allowIncomplete?: boolean }): Promise<boolean> => {
      const currentExam = examRef.current;
      if (!currentExam || submittingRef.current || isReadOnlyRef.current) return false;
      try {
        setSubmitting(true);
        const allowIncomplete = options?.allowIncomplete ?? false;
        const res = await examsService.submitExam(
          currentExam.id,
          answersRef.current,
          allowIncomplete
        );
        message.success(res.message);

        // Clear local storage timing and drafts upon successful submission
        try {
          localStorage.removeItem(`schoolpro_exam_timing_${currentExam.id}`);
          localStorage.removeItem(`schoolpro_exam_draft_${currentExam.id}`);
        } catch {
          // ignore
        }

        // Reload fresh exam state
        const updated = await examsService.getExamById(currentExam.id);
        if (updated) {
          setExam(updated);
        }
        return true;
      } catch {
        message.error(i18n.t("card:exams.messages.submitError"));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  // Load exam, handle persistent wall-clock timer and drafts
  useEffect(() => {
    let ignore = false;

    async function loadExam() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await examsService.getExamById(id);
        if (ignore || !data) return;

        setExam(data);

        if (data.status === "completed") {
          // Clear active timers
          try {
            localStorage.removeItem(`schoolpro_exam_timing_${id}`);
            localStorage.removeItem(`schoolpro_exam_draft_${id}`);
          } catch {
            // ignore
          }
          const sub = await examsService.getSubmission(id);
          if (sub?.answers) {
            setAnswers(sub.answers);
          }
          setTimeLeft(0);
        } else if (data.status === "expired") {
          try {
            localStorage.removeItem(`schoolpro_exam_timing_${id}`);
            localStorage.removeItem(`schoolpro_exam_draft_${id}`);
          } catch {
            // ignore
          }
          setTimeLeft(0);
        } else {
          // Pending exam: setup persistent wall-clock timer
          const timingKey = `schoolpro_exam_timing_${id}`;
          const draftKey = `schoolpro_exam_draft_${id}`;

          let targetEndTime = 0;
          try {
            const storedTiming = localStorage.getItem(timingKey);
            if (storedTiming) {
              const parsed: StoredTiming = JSON.parse(storedTiming);
              targetEndTime = parsed.endTime;
            } else {
              const now = Date.now();
              const dur = data.durationMinutes || 45;
              targetEndTime = now + dur * 60 * 1000;
              const timingObj: StoredTiming = {
                startTime: now,
                durationMinutes: dur,
                endTime: targetEndTime,
              };
              localStorage.setItem(timingKey, JSON.stringify(timingObj));
            }
          } catch {
            targetEndTime = Date.now() + (data.durationMinutes || 45) * 60 * 1000;
          }

          const remainingSeconds = Math.max(0, Math.floor((targetEndTime - Date.now()) / 1000));
          setTimeLeft(remainingSeconds);

          // Restore draft answers if available
          try {
            const storedDraft = localStorage.getItem(draftKey);
            if (storedDraft) {
              const parsedDraft = JSON.parse(storedDraft);
              setAnswers(parsedDraft);
            } else {
              setAnswers({});
            }
          } catch {
            setAnswers({});
          }

          // If time already expired while student was away, auto-submit once
          if (remainingSeconds <= 0 && !hasAutoSubmittedRef.current) {
            hasAutoSubmittedRef.current = true;
            message.warning(i18n.t("card:exams.messages.timeExpired"));
            void executeSubmit({ allowIncomplete: true });
          }
        }
      } catch {
        message.error(i18n.t("card:exams.messages.loadError"));
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadExam();
    return () => {
      ignore = true;
    };
  }, [id, executeSubmit]);

  // Update answer for a specific question & persist draft to localStorage
  const handleAnswerChange = useCallback(
    (questionId: string, value: number | string | string[] | boolean) => {
      if (isReadOnly || !id) return;
      setAnswers((prev) => {
        const next = { ...prev };
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          delete next[questionId];
        } else {
          next[questionId] = value;
        }

        // Persist draft immediately
        try {
          localStorage.setItem(`schoolpro_exam_draft_${id}`, JSON.stringify(next));
        } catch {
          // ignore
        }

        return next;
      });
    },
    [id, isReadOnly]
  );

  const isQuestionAnswered = useCallback(
    (questionId: string): boolean => {
      return isAnswerFilled(answers[questionId]);
    },
    [answers]
  );

  // List of incomplete/unanswered questions
  const unansweredQuestions = useMemo(() => {
    if (!exam) return [];
    return exam.questions
      .map((q, idx) => ({ ...q, questionNumber: idx + 1 }))
      .filter((q) => !isQuestionAnswered(q.id));
  }, [exam, isQuestionAnswered]);

  const answeredCount = useMemo(() => {
    if (!exam) return 0;
    return exam.questions.length - unansweredQuestions.length;
  }, [exam, unansweredQuestions]);

  const hasExam = Boolean(exam);

  // Wall-clock Countdown Timer: checks wall-clock time against stored endTime
  useEffect(() => {
    if (isReadOnly || !hasExam || !id) return;

    const timer = setInterval(() => {
      const timingKey = `schoolpro_exam_timing_${id}`;
      let targetEndTime = 0;
      try {
        const storedTiming = localStorage.getItem(timingKey);
        if (storedTiming) {
          const parsed: StoredTiming = JSON.parse(storedTiming);
          targetEndTime = parsed.endTime;
        }
      } catch {
        // ignore
      }

      if (targetEndTime > 0) {
        const remaining = Math.max(0, Math.floor((targetEndTime - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0 && !hasAutoSubmittedRef.current) {
          hasAutoSubmittedRef.current = true;
          clearInterval(timer);
          message.warning(i18n.t("card:exams.messages.timeExpired"));
          void executeSubmit({ allowIncomplete: true });
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [id, isReadOnly, hasExam, executeSubmit]);

  return {
    exam,
    loading,
    submitting,
    answers,
    timeLeft,
    isReadOnly,
    isCompleted,
    isExpired,
    answeredCount,
    unansweredQuestions,
    handleAnswerChange,
    isQuestionAnswered,
    executeSubmit,
  };
};
