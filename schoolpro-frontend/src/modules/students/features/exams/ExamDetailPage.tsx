import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ExamItem } from "@/modules/students/features/exams/types";
import { examsService } from "@/modules/students/features/exams/services";
import {
  ExamDetailHeader,
  ExamDetailSkeleton,
  ExamSubmitConfirmModal,
} from "@/modules/students/features/exams/components/detail";
import {
  ExamHeaderCard,
  QuestionCard,
  ExamTimerSidebar,
} from "@/modules/students/features/exams/components/test-form";

export const ExamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | string | string[] | boolean>>({});
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // Load exam and previous submission / draft
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
          if (data.questions.length > 0) {
            setActiveQuestionId(data.questions[0].id);
          }

          // If completed, load past submission
          if (data.status === "completed") {
            const sub = await examsService.getSubmission(id);
            if (sub?.answers) {
              setAnswers(sub.answers);
            }
          } else {
            // Restore unsaved draft from localStorage if present
            try {
              const savedDraft = localStorage.getItem(`schoolpro_exam_draft_${id}`);
              if (savedDraft) {
                const parsed = JSON.parse(savedDraft);
                if (typeof parsed === "object" && parsed !== null) {
                  setAnswers(parsed);
                }
              }
            } catch {
              // Ignore draft parse failure
            }
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
  const isReadOnly = isCompleted || isExpired;

  // Track active question as student scrolls
  useEffect(() => {
    if (!exam || exam.questions.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const qId = entry.target.id.replace("question-", "");
            setActiveQuestionId(qId);
            break;
          }
        }
      },
      { threshold: 0.3, rootMargin: "-15% 0px -40% 0px" }
    );

    exam.questions.forEach((q) => {
      const el = document.getElementById(`question-${q.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [exam]);

  // Update answer for a specific question with auto-draft persistence
  const handleAnswerChange = (questionId: string, value: number | string | string[] | boolean) => {
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

      if (id) {
        try {
          localStorage.setItem(`schoolpro_exam_draft_${id}`, JSON.stringify(next));
        } catch {
          // Ignore quota errors
        }
      }
      return next;
    });
  };

  // Check if a question is answered
  const isQuestionAnswered = useCallback(
    (qId: string): boolean => {
      const val = answers[qId];
      if (val === undefined || val === null) return false;
      if (typeof val === "string") return val.trim().length > 0;
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === "number") return val > 0;
      if (typeof val === "boolean") return true;
      return false;
    },
    [answers]
  );

  const handleScrollToQuestion = (qId: string) => {
    setActiveQuestionId(qId);
    const elem = document.getElementById(`question-${qId}`);
    elem?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Validation before opening submit confirm modal
  const handlePreSubmit = () => {
    if (!exam) return;

    for (const q of exam.questions) {
      if (q.required && !isQuestionAnswered(q.id)) {
        message.warning(`Vui lòng trả lời câu hỏi bắt buộc: "${q.title}"`);
        handleScrollToQuestion(q.id);
        return;
      }
    }

    setConfirmModalOpen(true);
  };

  // Submit execution
  const handleExecuteSubmit = useCallback(async () => {
    if (!exam) return;
    try {
      setSubmitting(true);
      const res = await examsService.submitExam(exam.id, answers);
      setConfirmModalOpen(false);
      message.success(res.message);

      // Clean local draft
      try {
        localStorage.removeItem(`schoolpro_exam_draft_${exam.id}`);
      } catch {
        // Ignore
      }

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

  // Countdown Timer
  useEffect(() => {
    if (isReadOnly || !exam || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          message.warning("Hết thời gian làm bài! Hệ thống đang tự động nộp bài thi.");
          handleExecuteSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isReadOnly, exam, timeLeft, handleExecuteSubmit]);

  if (loading) {
    return <ExamDetailSkeleton />;
  }

  if (!exam) {
    return (
      <div className="p-10 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs my-6 max-w-xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Icon name="file-text" size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-0">Không tìm thấy bài thi</h3>
        <p className="text-xs text-slate-500 mb-3">
          Bài thi không tồn tại hoặc đã bị gỡ khỏi hệ thống.
        </p>
        <Button variant="primary" onClick={() => navigate("/student/exams")}>
          Quay lại danh sách bài thi
        </Button>
      </div>
    );
  }

  const answeredCount = exam.questions.filter((q) => isQuestionAnswered(q.id)).length;

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-16">
      {/* 1. Header Card matching LeaveRequestDetailHeader */}
      <ExamDetailHeader
        exam={exam}
        onBack={() => navigate("/student/exams")}
      />

      {/* 2. Top Info / Status Card */}
      <ExamHeaderCard exam={exam} />

      {/* 3. Main Workspace: Question Cards (Left - 8 parts) & Sticky Sidebar (Right - 4 parts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: 8 parts */}
        <div className="lg:col-span-8 space-y-4">
          {exam.questions.map((q, idx) => {
            const userAns = answers[q.id];
            return (
              <QuestionCard
                key={q.id}
                question={q}
                index={idx}
                value={userAns}
                isActive={activeQuestionId === q.id}
                onChange={(val) => handleAnswerChange(q.id, val)}
                readOnly={isReadOnly}
              />
            );
          })}
        </div>

        {/* Right Column: 4 parts - Sticky to viewport, does not scroll with page */}
        <div className="lg:col-span-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto pr-1">
          <ExamTimerSidebar
            timeLeft={timeLeft}
            questions={exam.questions}
            activeQuestionId={activeQuestionId ?? undefined}
            isQuestionAnswered={isQuestionAnswered}
            onScrollToQuestion={handleScrollToQuestion}
            onSubmit={handlePreSubmit}
            submitting={submitting}
            readOnly={isReadOnly}
            score={exam.score}
            maxScore={exam.maxScore}
          />
        </div>
      </div>

      {/* 4. Confirmation Submit Modal */}
      <ExamSubmitConfirmModal
        open={confirmModalOpen}
        examTitle={exam.title}
        totalQuestions={exam.questions.length}
        answeredCount={answeredCount}
        submitting={submitting}
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={handleExecuteSubmit}
      />
    </div>
  );
};
