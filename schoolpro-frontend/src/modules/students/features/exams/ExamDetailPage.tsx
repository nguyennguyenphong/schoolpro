import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
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
import { useExamDetail } from "@/modules/students/features/exams/hooks";

export const ExamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    exam,
    loading,
    submitting,
    answers,
    timeLeft,
    isReadOnly,
    answeredCount,
    handleAnswerChange,
    isQuestionAnswered,
    validateRequired,
    executeSubmit,
  } = useExamDetail(id);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // Scroll smoothly to selected question
  const handleScrollToQuestion = (qId: string) => {
    setActiveQuestionId(qId);
    const elem = document.getElementById(`question-${qId}`);
    elem?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Validation before opening submit confirm modal
  const handlePreSubmit = () => {
    const { valid, unansweredQuestion } = validateRequired();
    if (!valid && unansweredQuestion) {
      message.warning(`Vui lòng trả lời câu hỏi bắt buộc: "${unansweredQuestion.title}"`);
      handleScrollToQuestion(unansweredQuestion.id);
      return;
    }
    setConfirmModalOpen(true);
  };

  // Execute submission
  const handleConfirmSubmit = async () => {
    await executeSubmit();
    setConfirmModalOpen(false);
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

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-16">
      {/* 1. Header Card matching LeaveRequestDetailHeader */}
      <ExamDetailHeader
        exam={exam}
        onBack={() => navigate("/student/exams")}
      />

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

        {/* Right Column: 3 parts - Sticky to viewport, does not scroll with page */}
        <div className="lg:col-span-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto pr-1">
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
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
};
