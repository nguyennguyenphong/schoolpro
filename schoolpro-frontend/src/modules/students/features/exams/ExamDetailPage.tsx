import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Progress, Rate, Modal, message } from "antd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import type { ExamItem, ExamQuestion } from "@/modules/students/features/exams/types";
import { examsService } from "@/modules/students/features/exams/services";

export const ExamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | string | string[]>>({});
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

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

          // If completed, load past submission
          if (data.status === "completed") {
            const sub = await examsService.getSubmission(id);
            if (sub?.answers) {
              setAnswers(sub.answers);
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

  // Handle radio option change (clicking selected option deselects it)
  const handleRadioChange = (questionId: string, value: string) => {
    if (isReadOnly) return;
    setAnswers((prev) => {
      const next = { ...prev };
      if (!value || prev[questionId] === value) {
        delete next[questionId];
      } else {
        next[questionId] = value;
      }
      return next;
    });
  };

  // Handle checkbox toggle (add/remove from array; if empty, deletes key)
  const handleCheckboxToggle = (questionId: string, optionValue: string) => {
    if (isReadOnly) return;
    setAnswers((prev) => {
      const next = { ...prev };
      const prevVal = prev[questionId];
      const currentList: string[] = Array.isArray(prevVal)
        ? [...prevVal]
        : typeof prevVal === "string" && prevVal.trim()
        ? [prevVal]
        : [];

      const index = currentList.indexOf(optionValue);
      if (index > -1) {
        currentList.splice(index, 1);
      } else {
        currentList.push(optionValue);
      }

      const cleanedList = currentList.filter(
        (item) => typeof item === "string" && item.trim().length > 0
      );

      if (cleanedList.length === 0) {
        delete next[questionId];
      } else {
        next[questionId] = cleanedList;
      }
      return next;
    });
  };

  // Handle text input change (if empty trimmed string, deletes key)
  const handleInputChange = (questionId: string, text: string) => {
    if (isReadOnly) return;
    setAnswers((prev) => {
      const next = { ...prev };
      if (!text || !text.trim()) {
        delete next[questionId];
      } else {
        next[questionId] = text;
      }
      return next;
    });
  };

  // Handle rating change (clicking selected rating clears it)
  const handleRatingChange = (questionId: string, value: number) => {
    if (isReadOnly) return;
    setAnswers((prev) => {
      const next = { ...prev };
      if (!value || value <= 0 || prev[questionId] === value) {
        delete next[questionId];
      } else {
        next[questionId] = value;
      }
      return next;
    });
  };

  // Check if a specific question is answered
  const isQuestionAnswered = useCallback(
    (qId: string): boolean => {
      const val = answers[qId];
      if (val === undefined || val === null) return false;
      if (typeof val === "string") return val.trim().length > 0;
      if (Array.isArray(val)) {
        return val.some((item) => typeof item === "string" && item.trim().length > 0);
      }
      if (typeof val === "number") return val > 0;
      return false;
    },
    [answers]
  );

  // Real-time calculation of answered questions
  const totalQuestions = exam?.questions.length || 0;
  const answeredCount = useMemo(() => {
    if (!exam) return 0;
    return exam.questions.filter((q) => isQuestionAnswered(q.id)).length;
  }, [exam, isQuestionAnswered]);

  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const scrollToQuestion = (qId: string) => {
    const elem = document.getElementById(`question-${qId}`);
    elem?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Pre-submit validation
  const handlePreSubmit = () => {
    if (!exam) return;
    setAttemptedSubmit(true);

    // Validate required questions
    for (const q of exam.questions) {
      if (q.required && !isQuestionAnswered(q.id)) {
        message.warning(`Vui lòng hoàn thành câu hỏi bắt buộc: "${q.title}"`);
        scrollToQuestion(q.id);
        return;
      }
    }

    setConfirmModalOpen(true);
  };

  // Execute submit
  const handleExecuteSubmit = useCallback(async () => {
    if (!exam) return;
    try {
      setSubmitting(true);
      const res = await examsService.submitExam(exam.id, answers);
      setConfirmModalOpen(false);
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

  const optionLetters = ["A", "B", "C", "D", "E", "F"];

  // Format timer
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-5 animate-pulse pb-16">
        <div className="bg-white p-6 rounded-2xl border border-[#f0f0f0] space-y-4">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          <div className="h-8 w-3/4 bg-slate-200 rounded" />
          <div className="h-4 w-full bg-slate-100 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#f0f0f0] p-6 space-y-3">
                <div className="h-5 w-1/2 bg-slate-200 rounded" />
                <div className="h-10 w-full bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-[#f0f0f0] p-10 text-center shadow-2xs space-y-4 my-10">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Icon name="info" size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy bài thi</h2>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Đề thi trắc nghiệm bạn yêu cầu không tồn tại hoặc đã đóng cổng truy cập.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate("/student/exams")}
          className="font-semibold flex items-center gap-1.5 mx-auto"
        >
          <Icon name="arrow-left" size={14} />
          <span>Về danh sách đề thi</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-20">
      {/* 1. Page Header with integrated Breadcrumb & Overview */}
      <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Breadcrumb
            items={[
              {
                href: "/student/home",
                title: (
                  <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                    <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                    <span>Trang chủ</span>
                  </span>
                ),
              },
              {
                href: "/student/exams",
                title: (
                  <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                    <Icon name="fileText" size={13} className="text-blue-600 shrink-0" />
                    <span>Khảo thí & Đề thi</span>
                  </span>
                ),
              },
              {
                title: (
                  <span className="text-slate-800 font-semibold truncate max-w-xs inline-block">
                    {exam.title}
                  </span>
                ),
              },
            ]}
          />

          <Button
            variant="outline"
            onClick={() => navigate("/student/exams")}
            className="self-start sm:self-auto text-xs font-semibold flex items-center gap-1.5"
          >
            <Icon name="arrow-left" size={13} />
            <span>Quay lại danh sách</span>
          </Button>
        </div>

        {/* Exam Title & Badges */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-6 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              {exam.title}
            </h1>
            <Tag color="blue" className="font-mono font-bold m-0 text-xs">
              {exam.code}
            </Tag>

            {isCompleted ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Icon name="checkCircle" size={12} />
                <span>Đã nộp bài • Điểm số: {exam.score} / {exam.maxScore}</span>
              </span>
            ) : isExpired ? (
              <Tag color="default" className="font-semibold m-0 text-xs">
                Đã kết thúc
              </Tag>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <Icon name="clock" size={12} />
                <span>Đang diễn ra thi</span>
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-0">
            Học phần: <strong>{exam.courseName}</strong> ({exam.courseCode}) • Giảng viên:{" "}
            <strong>{exam.teacherName || "Bộ môn Khảo thí"}</strong>
          </p>
        </div>

        {/* Info Banner */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-[#f0f0f0]">
          <div>
            <span className="text-slate-400">Hình thức: </span>
            <strong className="text-slate-800">Trắc nghiệm trực tuyến</strong>
          </div>
          <div>
            <span className="text-slate-400">• Thời gian làm bài: </span>
            <strong className="text-slate-800">{exam.durationMinutes} phút</strong>
          </div>
          <div>
            <span className="text-slate-400">• Quy mô: </span>
            <strong className="text-slate-800">{totalQuestions} câu hỏi</strong>
          </div>
          <div>
            <span className="text-slate-400">• Thang điểm: </span>
            <strong className="text-slate-800">{exam.maxScore} điểm</strong>
          </div>
          <div>
            <span className="text-slate-400">• Hạn chót: </span>
            <strong className="text-rose-600">{exam.endDate}</strong>
          </div>
        </div>

        {isCompleted && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Icon name="checkCircle" size={17} className="text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold">
                Bài thi đã nộp lúc <strong>{exam.completedAt}</strong>. Điểm chính thức:{" "}
                <strong className="text-emerald-700 text-sm">{exam.score} / {exam.maxScore} điểm</strong>. Em đang xem lại chi tiết bài làm và đáp án.
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/student/exams")}
              className="text-xs font-medium"
            >
              Về danh sách đề thi
            </Button>
          </div>
        )}
      </div>

      {/* 2. Main Layout: Questions List (Left) and Sticky Progress Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Natural page scroll through questions */}
        <div className="lg:col-span-8 space-y-4">
          {exam.questions.map((q: ExamQuestion, idx: number) => {
            const currentVal = answers[q.id];
            const answered = isQuestionAnswered(q.id);
            const hasError = attemptedSubmit && q.required && !answered;

            const isRadio = q.type === "radio" || q.type === "single_choice";
            const isCheckbox = q.type === "checkbox" || q.type === "multiple_choice";
            const isInput = q.type === "input" || q.type === "text";
            const isRating = q.type === "rating";

            return (
              <div
                key={q.id}
                id={`question-${q.id}`}
                className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 space-y-4 shadow-2xs ${
                  hasError ? "border-rose-400" : "border-[#f0f0f0]"
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          answered
                            ? "bg-emerald-600 text-white"
                            : hasError
                            ? "bg-rose-500 text-white"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {idx + 1}
                      </span>

                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-0.5">
                          {q.title}
                          {q.required && <span className="text-rose-500 ml-1 font-bold">*</span>}
                        </h3>
                        {q.points !== undefined && (
                          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                            {q.points} điểm
                          </span>
                        )}
                      </div>
                    </div>

                    {q.description && (
                      <p className="text-xs text-slate-500 pl-9.5 mb-0 leading-relaxed">
                        {q.description}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    {answered ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <Icon name="check" size={11} />
                        <span>Đã làm</span>
                      </span>
                    ) : q.required ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Bắt buộc
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        Tùy chọn
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Inputs by Type */}
                <div className="pl-0 sm:pl-9.5 pt-1">
                  {/* 1. RADIO / SINGLE CHOICE */}
                  {isRadio && q.options && (
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = currentVal === opt;
                        const isCorrectAnswer =
                          isCompleted && q.correctAnswer && String(q.correctAnswer) === opt;
                        const isWrongChoice =
                          isCompleted && isSelected && String(q.correctAnswer) !== opt;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleRadioChange(q.id, opt)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                              isReadOnly ? "cursor-default" : "cursor-pointer"
                            } ${
                              isCorrectAnswer
                                ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs"
                                : isWrongChoice
                                ? "bg-rose-50 border-rose-400 text-rose-900 shadow-2xs"
                                : isSelected
                                ? "bg-blue-50 border-blue-500 text-blue-900 shadow-2xs"
                                : "bg-white border-[#f0f0f0] text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isCorrectAnswer
                                    ? "bg-emerald-600 text-white"
                                    : isWrongChoice
                                    ? "bg-rose-500 text-white"
                                    : isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {optionLetters[optIdx] || optIdx + 1}
                              </span>
                              <span>{opt}</span>
                            </div>

                            {isSelected && !isCompleted && (
                              <Icon name="check" size={16} className="text-blue-600 shrink-0" />
                            )}
                            {isCorrectAnswer && (
                              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                <Icon name="checkCircle" size={14} />
                                <span>Đáp án đúng</span>
                              </span>
                            )}
                            {isWrongChoice && (
                              <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                                <Icon name="error" size={14} />
                                <span>Đã chọn (Sai)</span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. CHECKBOX / MULTIPLE CHOICE */}
                  {isCheckbox && q.options && (
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const selectedList: string[] = Array.isArray(currentVal)
                          ? (currentVal as string[])
                          : [];
                        const isChecked = selectedList.includes(opt);
                        const isCorrectInList =
                          isCompleted &&
                          Array.isArray(q.correctAnswer) &&
                          q.correctAnswer.includes(opt);

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleCheckboxToggle(q.id, opt)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                              isReadOnly ? "cursor-default" : "cursor-pointer"
                            } ${
                              isChecked
                                ? "bg-blue-50 border-blue-500 text-blue-900 shadow-2xs"
                                : "bg-white border-[#f0f0f0] text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isChecked
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {optionLetters[optIdx] || optIdx + 1}
                              </span>
                              <span>{opt}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {isCorrectInList && (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  Đáp án đúng
                                </span>
                              )}
                              <div
                                className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                                  isChecked
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {isChecked && <Icon name="check" size={13} />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 3. INPUT / TEXT */}
                  {isInput && (
                    <div className="space-y-2">
                      <Input
                        value={typeof currentVal === "string" ? currentVal : ""}
                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                        disabled={isReadOnly}
                        placeholder={q.placeholder || "Nhập câu trả lời của em tại đây..."}
                        className="rounded-xl border-[#f0f0f0] text-xs sm:text-sm p-3"
                      />
                      {isCompleted && q.correctAnswer && (
                        <div className="text-xs bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-emerald-800">
                          <strong>Đáp án đúng:</strong> {String(q.correctAnswer)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. RATING */}
                  {isRating && (
                    <div className="bg-slate-50 border border-[#f0f0f0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Rate
                          value={typeof currentVal === "number" ? currentVal : 0}
                          onChange={(val) => handleRatingChange(q.id, val)}
                          disabled={isReadOnly}
                          count={q.ratingMax || 5}
                        />
                        <span className="text-xs font-bold text-amber-600">
                          {typeof currentVal === "number" && currentVal > 0
                            ? `${currentVal} / ${q.ratingMax || 5} sao`
                            : "Chưa đánh giá"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Bấm lại vào số sao đã chọn để hủy đánh giá
                      </span>
                    </div>
                  )}

                  {/* Explanation for completed exam */}
                  {isCompleted && q.explanation && (
                    <div className="mt-3 p-3 bg-slate-50 border border-[#f0f0f0] rounded-xl text-xs text-slate-700 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Icon name="info" size={13} className="text-blue-600" />
                        <span>Giải thích chi tiết:</span>
                      </div>
                      <p className="mb-0 text-slate-600 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Sticky Progress Sidebar & Question Palette */}
        <div className="lg:col-span-4 flex flex-col gap-4.5 lg:sticky lg:top-20 self-start">
          <Card className="rounded-2xl border-[#f0f0f0] shadow-2xs [&>.ant-card-body]:p-5 space-y-4">
            {/* Header: Progress & Timer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tiến độ làm bài
                </span>

                {!isReadOnly ? (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono font-bold text-xs border ${
                      timeLeft < 300
                        ? "bg-rose-50 border-rose-200 text-rose-700 animate-pulse"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}
                  >
                    <Icon name="clock" size={13} className={timeLeft < 300 ? "text-rose-600" : "text-amber-600"} />
                    <span>{formattedTime}</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Đã nộp bài
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Số câu đã làm:</span>
                  <span className="font-bold text-slate-800">
                    {answeredCount} / {totalQuestions} câu ({progressPercent}%)
                  </span>
                </div>
                <Progress
                  percent={progressPercent}
                  showInfo={false}
                  strokeColor={{ "0%": "#2563eb", "100%": "#10b981" }}
                  className="m-0"
                />
              </div>

              {/* Grid of question number boxes */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-600 block mb-2">
                  Bảng câu hỏi ({totalQuestions} câu):
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {exam.questions.map((q: ExamQuestion, i: number) => {
                    const done = isQuestionAnswered(q.id);
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => scrollToQuestion(q.id)}
                        className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer border ${
                          done
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs hover:bg-emerald-700"
                            : "bg-slate-100 text-slate-700 border-[#f0f0f0] hover:bg-slate-200"
                        }`}
                        title={`Câu ${i + 1}: ${done ? "Đã làm" : "Chưa làm"}`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend: Color meanings */}
              <div className="pt-3 flex items-center gap-4 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
                  <span>Đã làm xong</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 inline-block" />
                  <span>Chưa làm</span>
                </div>
              </div>
            </div>

            {/* Submit Action Button */}
            {!isReadOnly && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handlePreSubmit}
                  loading={submitting}
                  className="w-full font-bold flex items-center justify-center gap-1.5"
                >
                  <Icon name="check" size={15} />
                  <span>Nộp bài thi</span>
                </Button>
              </div>
            )}
          </Card>

          {/* Exam Summary Details Card */}
          <Card className="rounded-2xl border-[#f0f0f0] shadow-2xs space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Thông tin đề thi
            </span>

            <div className="space-y-2 text-xs mt-3">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Mã đề thi:</span>
                <span className="font-mono font-bold text-slate-800">{exam.code}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Thời gian làm bài:</span>
                <span className="font-semibold text-slate-800">{exam.durationMinutes} phút</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Tổng điểm bài thi:</span>
                <span className="font-bold text-slate-800">{exam.maxScore} điểm</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Hạn nộp:</span>
                <strong className="text-rose-600">{exam.endDate}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Niên khóa:</span>
                <span className="font-semibold text-slate-700">{exam.academicYear}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. Confirmation Modal */}
      <Modal
        open={confirmModalOpen}
        onCancel={() => setConfirmModalOpen(false)}
        footer={null}
        width={480}
        centered
        destroyOnHidden
      >
        <div className="p-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Icon name="checkCircle" size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-0.5">
                Xác nhận nộp bài thi?
              </h3>
              <p className="text-xs text-slate-500 mb-0">
                Mã đề: <strong className="text-slate-700">{exam.code}</strong>
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-[#f0f0f0] text-xs text-slate-600 space-y-2">
            <div className="flex justify-between">
              <span>Số câu đã hoàn thành:</span>
              <strong className="text-emerald-700">
                {answeredCount}/{totalQuestions} câu ({progressPercent}%)
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Thời gian còn lại:</span>
              <strong className="text-slate-800 font-mono">{formattedTime}</strong>
            </div>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-[#f0f0f0] mb-0 leading-relaxed">
              Sau khi nộp, hệ thống sẽ tính điểm tự động và em không thể thay đổi đáp án đã gửi.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
              disabled={submitting}
            >
              Kiểm tra lại
            </Button>
            <Button
              variant="primary"
              onClick={handleExecuteSubmit}
              loading={submitting}
              className="font-bold flex items-center gap-1.5"
            >
              <Icon name="check" size={14} />
              <span>Xác nhận nộp bài thi</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
