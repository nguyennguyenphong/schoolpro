import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  ExamDetailHeader,
  ExamDetailSkeleton,
  ExamSubmitConfirmModal,
  ExamExitConfirmModal,
} from "@/modules/students/features/exams/components/detail";
import {
  ExamHeaderCard,
  QuestionCard,
  ExamTimerSidebar,
} from "@/modules/students/features/exams/components/test-form";
import { useExamDetail } from "@/modules/students/features/exams/hooks";
import { isScoreReleased } from "@/modules/students/features/exams/utils";

export const ExamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(["card", "button"]);

  const {
    exam,
    loading,
    submitting,
    answers,
    timeLeft,
    isReadOnly,
    isCompleted,
    answeredCount,
    unansweredQuestions,
    handleAnswerChange,
    isQuestionAnswered,
    executeSubmit,
  } = useExamDetail(id);

  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [_activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const canNavigateAway = isReadOnly || isCompleted;

  // 1. Browser tab / window close guard (beforeunload)
  useEffect(() => {
    if (canNavigateAway || !exam) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [canNavigateAway, exam]);

  // 2. Browser back button trap (popstate)
  useEffect(() => {
    if (canNavigateAway || !exam) return;

    window.history.pushState(null, "", window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
      setExitModalOpen(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [canNavigateAway, exam]);

  // Handle header back action
  const handleBackRequest = () => {
    if (!canNavigateAway) {
      setExitModalOpen(true);
    } else {
      navigate("/student/exams");
    }
  };

  // Exit and auto-submit current progress
  const handleConfirmExit = async () => {
    await executeSubmit({ allowIncomplete: true });
    setExitModalOpen(false);
    navigate("/student/exams");
  };

  // Scroll smoothly to selected question
  const handleScrollToQuestion = (qId: string) => {
    setActiveQuestionId(qId);
    const elem = document.getElementById(`question-${qId}`);
    elem?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Open submit confirmation dialog
  const handlePreSubmit = () => {
    setSubmitModalOpen(true);
  };

  // Execute submission
  const handleConfirmSubmit = async () => {
    const success = await executeSubmit({ allowIncomplete: true });
    if (success) {
      setSubmitModalOpen(false);
    }
  };

  if (loading) {
    return <ExamDetailSkeleton />;
  }

  if (!exam) {
    return (
      <div className="p-10 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs my-6 max-w-xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Icon name="file-text" size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-0">
          {t("card:exams.detail.notFoundTitle")}
        </h3>
        <p className="text-xs text-slate-500 mb-3">{t("card:exams.detail.notFoundDesc")}</p>
        <Button variant="primary" onClick={() => navigate("/student/exams")}>
          {t("card:exams.detail.backToList")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-16">
      {/* 1. Header Card matching LeaveRequestDetailHeader */}
      <ExamDetailHeader exam={exam} onBack={handleBackRequest} />

      {/* 2. Top Info / Status Card */}
      <ExamHeaderCard exam={exam} />

      {/* 3. Main Workspace: Question Cards (Left - 9 parts) & Sticky Sidebar (Right - 3 parts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: 9 parts */}
        <div className="lg:col-span-9 space-y-4">
          {exam.questions.map((q, idx) => {
            const userAns = answers[q.id];
            return (
              <QuestionCard
                key={q.id}
                question={q}
                index={idx}
                value={userAns}
                onChange={(val) => handleAnswerChange(q.id, val)}
                readOnly={isReadOnly}
              />
            );
          })}
        </div>

        {/* Right Column: 3 parts - Sticky to viewport */}
        <div className="lg:col-span-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto pr-1">
          <ExamTimerSidebar
            timeLeft={timeLeft}
            questions={exam.questions}
            isQuestionAnswered={isQuestionAnswered}
            onScrollToQuestion={handleScrollToQuestion}
            onSubmit={handlePreSubmit}
            submitting={submitting}
            readOnly={isReadOnly}
            score={exam.score}
            maxScore={exam.maxScore}
            scoreReleased={isScoreReleased(exam)}
            scoreReleaseMode={
              exam.scoreReleaseMode || exam.settings?.scoreReleaseMode || "immediate"
            }
          />
        </div>
      </div>

      {/* 4. Confirmation Submit Modal */}
      <ExamSubmitConfirmModal
        open={submitModalOpen}
        examTitle={exam.title}
        totalQuestions={exam.questions.length}
        answeredCount={answeredCount}
        unansweredQuestions={unansweredQuestions}
        onJumpToQuestion={handleScrollToQuestion}
        submitting={submitting}
        onCancel={() => setSubmitModalOpen(false)}
        onConfirm={handleConfirmSubmit}
      />

      {/* 5. Exit Confirmation Modal */}
      <ExamExitConfirmModal
        open={exitModalOpen}
        totalQuestions={exam.questions.length}
        unansweredCount={unansweredQuestions.length}
        submitting={submitting}
        onCancel={() => setExitModalOpen(false)}
        onConfirm={handleConfirmExit}
      />
    </div>
  );
};
