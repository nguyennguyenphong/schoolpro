import { useState, useEffect, useCallback, useMemo } from "react";
import { message } from "antd";
import type { ExamItem } from "@/modules/students/features/exams/types";
import { examsService } from "@/modules/students/features/exams/services";
import { isAnswerFilled } from "@/modules/students/features/exams/utils";

export const useExamDetail = (id?: string) => {
  const [exam, setExam] = useState<ExamItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | string | string[] | boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Load exam and saved draft / past submission
  useEffect(() => {
    let ignore = false;

    async function loadExam() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await examsService.getExamById(id);
        if (!ignore && data) {
          setExam(data);
          setTimeLeft(data.durationMinutes * 60);

          // If completed, load past submission answers
          if (data.status === "completed") {
            const sub = await examsService.getSubmission(id);
            if (sub?.answers) {
              setAnswers(sub.answers);
            }
          } else {
            // Ensure answers start completely clear/empty
            try {
              localStorage.removeItem(`schoolpro_exam_draft_${id}`);
            } catch {
              // Ignore
            }
            setAnswers({});
          }
        }
      } catch {
        message.error("Không thể tải thông tin đề thi.");
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
  }, [id]);

  const isCompleted = exam?.status === "completed";
  const isExpired = exam?.status === "expired";
  const isReadOnly = Boolean(isCompleted || isExpired);

  // Update answer for a specific question
  const handleAnswerChange = useCallback(
    (questionId: string, value: number | string | string[] | boolean) => {
      if (isReadOnly) return;
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
        return next;
      });
    },
    [isReadOnly]
  );

  const isQuestionAnswered = useCallback(
    (questionId: string): boolean => {
      return isAnswerFilled(answers[questionId]);
    },
    [answers]
  );

  const answeredCount = useMemo(() => {
    if (!exam) return 0;
    return exam.questions.filter((q) => isQuestionAnswered(q.id)).length;
  }, [exam, isQuestionAnswered]);

  // Submit exam to backend
  const executeSubmit = useCallback(async () => {
    if (!exam) return;
    try {
      setSubmitting(true);
      const res = await examsService.submitExam(exam.id, answers);
      message.success(res.message);

      // Reload exam state
      const updated = await examsService.getExamById(exam.id);
      if (updated) {
        setExam(updated);
      }
    } catch {
      message.error("Đã xảy ra lỗi khi nộp bài thi. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }, [exam, answers]);

  // Validate required questions before submit
  const validateRequired = useCallback((): {
    valid: boolean;
    unansweredQuestion?: { id: string; title: string };
  } => {
    if (!exam) return { valid: false };

    for (const q of exam.questions) {
      if (q.required && !isQuestionAnswered(q.id)) {
        return {
          valid: false,
          unansweredQuestion: { id: q.id, title: q.title },
        };
      }
    }

    return { valid: true };
  }, [exam, isQuestionAnswered]);

  // Countdown Timer
  useEffect(() => {
    if (isReadOnly || !exam || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          message.warning("Hết thời gian làm bài! Hệ thống đang tự động nộp bài thi.");
          executeSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isReadOnly, exam, timeLeft, executeSubmit]);

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
    handleAnswerChange,
    isQuestionAnswered,
    validateRequired,
    executeSubmit,
  };
};
