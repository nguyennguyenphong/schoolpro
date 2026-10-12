import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Progress, Rate, Modal, message } from "antd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import type { SurveyItem, QuestionItem } from "@/modules/students/features/evaluation/types";
import { evaluationService } from "@/modules/students/features/evaluation/services";

export const SurveyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<SurveyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | string | string[]>>({});
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadSurvey() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await evaluationService.getSurveyById(id);
        if (!ignore && data) {
          setSurvey(data);
          // Load submission if exists
          if (data.status === "completed") {
            const sub = await evaluationService.getSubmission(id);
            if (sub && sub.answers) {
              setAnswers(sub.answers);
            }
          }
        }
      } catch {
        message.error("Không thể tải thông tin phiếu khảo sát.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadSurvey();

    return () => {
      ignore = true;
    };
  }, [id]);

  // Handle rating change (clicking selected rating again clears it)
  const handleRatingChange = (questionId: string, value: number) => {
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

  // Handle radio change (clicking selected option again deselects it)
  const handleRadioChange = (questionId: string, value: string) => {
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

  // Handle checkbox toggle (add/remove from array; if empty, removes key)
  const handleCheckboxToggle = (questionId: string, optionValue: string) => {
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

  // Handle text change (if empty trimmed string, removes key)
  const handleTextChange = (questionId: string, text: string) => {
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

  const isCompleted = survey?.status === "completed";
  const isExpired = survey?.status === "expired";
  const isReadOnly = isCompleted || isExpired;

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

  // Realtime calculation of answered questions
  const totalQuestions = survey?.questions.length || 0;
  const answeredCount = useMemo(() => {
    if (!survey) return 0;
    return survey.questions.filter((q) => isQuestionAnswered(q.id)).length;
  }, [survey, isQuestionAnswered]);

  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const scrollToQuestion = (qId: string) => {
    const elem = document.getElementById(`question-${qId}`);
    elem?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Submit button clicked
  const handlePreSubmit = () => {
    if (!survey) return;
    setAttemptedSubmit(true);

    // Validate required questions
    for (const q of survey.questions) {
      if (q.required && !isQuestionAnswered(q.id)) {
        message.warning(`Vui lòng hoàn thành câu hỏi bắt buộc: "${q.title}"`);
        scrollToQuestion(q.id);
        return;
      }
    }

    setConfirmModalOpen(true);
  };

  // Confirm submit
  const handleExecuteSubmit = async () => {
    if (!survey) return;
    try {
      setSubmitting(true);
      await evaluationService.submitSurvey(survey.id, answers);
      setConfirmModalOpen(false);
      message.success("Gửi phiếu đánh giá & khảo sát thành công! Cảm ơn ý kiến quý báu của em.");
      setSubmitting(false);
      navigate("/student/evaluations");
    } catch {
      message.error("Đã xảy ra lỗi khi gửi phiếu khảo sát. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  const likertLabels: Array<{ score: number; label: string; sub: string }> = [
    { score: 1, label: "Rất kém", sub: "Hoàn toàn không hài lòng" },
    { score: 2, label: "Chưa tốt", sub: "Chưa đạt yêu cầu" },
    { score: 3, label: "Bình thường", sub: "Tạm chấp nhận được" },
    { score: 4, label: "Tốt", sub: "Hài lòng và đáp ứng tốt" },
    { score: 5, label: "Rất tốt", sub: "Hoàn toàn hài lòng" },
  ];

  const optionLetters = ["A", "B", "C", "D", "E", "F"];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-5 animate-pulse pb-16">
        <div className="bg-white p-6 rounded-xl border border-[#f0f0f0] space-y-4">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          <div className="h-8 w-3/4 bg-slate-200 rounded" />
          <div className="h-4 w-full bg-slate-100 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-[#f0f0f0] p-6 space-y-3">
                <div className="h-5 w-1/2 bg-slate-200 rounded" />
                <div className="h-10 w-full bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-[#f0f0f0] p-6 h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-xl border border-[#f0f0f0] p-10 text-center shadow-2xs space-y-4 my-10">
        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Icon name="info" size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy phiếu khảo sát</h2>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Phiếu khảo sát bạn yêu cầu không tồn tại hoặc đã được gỡ khỏi hệ thống.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate("/student/evaluations")}
          className="font-semibold flex items-center gap-1.5 mx-auto"
        >
          <Icon name="arrow-left" size={14} />
          <span>Về danh sách khảo sát</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-20">
      {/* 1. Page Header with integrated Breadcrumb & Overview */}
      <div className="bg-white rounded-xl border border-[#f0f0f0] p-5 sm:p-6 shadow-2xs space-y-3">
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
                href: "/student/evaluations",
                title: (
                  <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                    <Icon name="checkCircle" size={13} className="text-slate-400 shrink-0" />
                    <span>Đánh giá & Khảo sát</span>
                  </span>
                ),
              },
              {
                title: (
                  <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                    <span>{survey.code}</span>
                  </span>
                ),
              },
            ]}
          />

          <Button
            variant="outline"
            onClick={() => navigate("/student/evaluations")}
            className="flex items-center gap-1.5 font-medium self-start sm:self-center"
          >
            <Icon name="arrow-left" size={14} />
            <span>Quay lại danh sách</span>
          </Button>
        </div>

        <div className="pt-1 space-y-2 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              {survey.title}
            </h1>
            <Tag color="blue" className="font-bold m-0 text-xs">
              {survey.code}
            </Tag>
            {survey.isAnonymous ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Icon name="lock" size={12} />
                <span>Ẩn danh 100%</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Icon name="user" size={12} />
                <span>Định danh cá nhân</span>
              </span>
            )}
            {isCompleted && (
              <Tag color="success" className="font-semibold m-0 text-xs">
                Đã hoàn thành
              </Tag>
            )}
            {isExpired && (
              <Tag color="default" className="font-semibold m-0 text-xs">
                Đã kết thúc
              </Tag>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-0">
            {survey.description}
          </p>
        </div>

        {/* Survey Target Info Banner */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-[#f0f0f0]">
          <div>
            <span className="text-slate-400">Đối tượng: </span>
            <strong className="text-slate-800">{survey.targetSubject || "Toàn trường"}</strong>
          </div>
          {survey.targetTeacher && (
            <div>
              <span className="text-slate-400">• Giáo viên: </span>
              <strong className="text-slate-800">{survey.targetTeacher}</strong>
            </div>
          )}
          <div>
            <span className="text-slate-400">• Hạn chót: </span>
            <strong className="text-rose-600">{survey.endDate}</strong>
          </div>
          <div>
            <span className="text-slate-400">• Thời lượng: </span>
            <strong className="text-slate-800">~{survey.estimatedMinutes} phút</strong>
          </div>
          <div>
            <span className="text-slate-400">• Quy mô: </span>
            <strong className="text-slate-800">{totalQuestions} câu hỏi</strong>
          </div>
        </div>

        {isCompleted && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Icon name="checkCircle" size={17} className="text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold">
                Phiếu khảo sát đã được gửi lúc <strong>{survey.completedAt || "Học kỳ 1"}</strong>. Em đang xem lại các câu trả lời đã gửi.
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/student/evaluations")}
              className="font-medium"
            >
              Về danh sách
            </Button>
          </div>
        )}
      </div>

      {/* 2. Main Layout: Questions List (Left) and Sticky Progress Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Natural page scroll through evaluation questions */}
        <div className="lg:col-span-8 space-y-4">
          {survey.questions.map((q: QuestionItem, idx: number) => {
            const currentVal = answers[q.id];
            const answered = isQuestionAnswered(q.id);
            const hasError = attemptedSubmit && q.required && !answered;

            // Supported input types: "rating" | "radio" | "checkbox" | "input" (plus backwards compatible aliases)
            const isRating = q.type === "rating";
            const isRadio = q.type === "radio" || q.type === "single_choice";
            const isCheckbox = q.type === "checkbox" || q.type === "multiple_choice";
            const isInput = q.type === "input" || q.type === "text";

            return (
              <div
                key={q.id}
                id={`question-${q.id}`}
                className={`bg-white rounded-xl border transition-all p-5 sm:p-6 space-y-4 shadow-2xs ${
                  hasError
                    ? "border-rose-400"
                    : "border-[#f0f0f0]"
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

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-0">
                        {q.title}
                        {q.required && <span className="text-rose-500 ml-1 font-bold">*</span>}
                      </h3>
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

                {/* Question Input Controls: rating, radio, checkbox, input */}
                <div className="pt-1 pl-0 sm:pl-9.5 space-y-3">
                  {/* 1. Rating Type (Thang điểm 1 - 5 sao / Likert) */}
                  {isRating && (
                    <div className="space-y-3">
                      {/* Visual 5-step buttons: click to set, click again to unselect */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {likertLabels.map((item) => {
                          const isSelected = currentVal === item.score;
                          return (
                            <button
                              key={item.score}
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => handleRatingChange(q.id, item.score)}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-200"
                                  : "bg-white text-slate-700 border-[#f0f0f0] hover:border-blue-300 hover:bg-blue-50/40"
                              } ${isReadOnly ? "cursor-not-allowed opacity-90" : ""}`}
                            >
                              <span className="text-base font-extrabold">{item.score} ★</span>
                              <span
                                className={`text-xs font-bold ${
                                  isSelected ? "text-white" : "text-slate-800"
                                }`}
                              >
                                {item.label}
                              </span>
                              <span
                                className={`text-[10px] hidden sm:block leading-tight ${
                                  isSelected ? "text-blue-100" : "text-slate-400"
                                }`}
                              >
                                {item.sub}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Ant Design Rate Component */}
                      <div className="flex items-center gap-3 pt-1">
                        <Rate
                          value={typeof currentVal === "number" ? currentVal : 0}
                          onChange={(val) => handleRatingChange(q.id, val)}
                          disabled={isReadOnly}
                        />
                        {typeof currentVal === "number" && currentVal > 0 ? (
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                            {likertLabels[currentVal - 1]?.label} ({currentVal}/5 sao)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Bấm vào số sao hoặc ô điểm để chọn (bấm lại để bỏ chọn)
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. Radio Type (Single choice: click to select, click again to unselect) */}
                  {isRadio && q.options && (
                    <div className="space-y-2">
                      {q.options.map((opt, i) => {
                        const isSelected = currentVal === opt;
                        return (
                          <div
                            key={i}
                            onClick={() => {
                              if (!isReadOnly) handleRadioChange(q.id, opt);
                            }}
                            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              isReadOnly ? "cursor-default" : "cursor-pointer"
                            } ${
                              isSelected
                                ? "bg-blue-50/70 border-blue-500 shadow-2xs"
                                : "bg-white border-[#f0f0f0] hover:border-slate-300 hover:bg-slate-50/60"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-slate-100 text-slate-600 border-slate-300"
                                }`}
                              >
                                {optionLetters[i] || i + 1}
                              </span>
                              <span
                                className={`text-xs sm:text-sm font-medium ${
                                  isSelected ? "text-blue-900 font-bold" : "text-slate-700"
                                }`}
                              >
                                {opt}
                              </span>
                            </div>

                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 3. Checkbox Type (Multiple choice: toggle into/out of array) */}
                  {isCheckbox && q.options && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-400 mb-1.5 font-medium italic">
                        * Em có thể chọn một hoặc nhiều phương án phù hợp
                      </p>
                      {q.options.map((opt, i) => {
                        const selectedList = Array.isArray(currentVal)
                          ? (currentVal as string[])
                          : [];
                        const isSelected = selectedList.includes(opt);
                        return (
                          <div
                            key={i}
                            onClick={() => {
                              if (!isReadOnly) handleCheckboxToggle(q.id, opt);
                            }}
                            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              isReadOnly ? "cursor-default" : "cursor-pointer"
                            } ${
                              isSelected
                                ? "bg-blue-50/70 border-blue-500 shadow-2xs"
                                : "bg-white border-[#f0f0f0] hover:border-slate-300 hover:bg-slate-50/60"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-slate-100 text-slate-600 border-slate-300"
                                }`}
                              >
                                {optionLetters[i] || i + 1}
                              </span>
                              <span
                                className={`text-xs sm:text-sm font-medium ${
                                  isSelected ? "text-blue-900 font-bold" : "text-slate-700"
                                }`}
                              >
                                {opt}
                              </span>
                            </div>

                            <div
                              className={`w-5 h-5 rounded-xl border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && <Icon name="check" size={13} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 4. Input Type (Textarea / Text comments) */}
                  {isInput && (
                    <div className="space-y-1.5">
                      <TextArea
                        rows={4}
                        allowClear
                        placeholder={
                          isReadOnly
                            ? "Không có ý kiến đóng góp"
                            : "Nhập suy nghĩ, đề xuất hoặc phản hồi của em tại đây..."
                        }
                        value={typeof currentVal === "string" ? currentVal : ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          handleTextChange(q.id, e.target.value)
                        }
                        disabled={isReadOnly}
                        className="w-full text-xs sm:text-sm p-3.5 rounded-xl border-[#f0f0f0] focus:border-blue-500"
                      />
                      {!isReadOnly && (
                        <div className="flex justify-between items-center text-[11px] text-slate-400 px-1 mt-1">
                          <span>Ý kiến của em sẽ được ghi nhận và xem xét kỹ lưỡng</span>
                          <span>{typeof currentVal === "string" ? currentVal.length : 0} ký tự</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error hint */}
                  {hasError && (
                    <p className="text-xs text-rose-500 font-semibold mb-0 flex items-center gap-1 pt-1">
                      <Icon name="warning" size={13} />
                      <span>Câu hỏi bắt buộc, vui lòng chọn hoặc nhập câu trả lời.</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Bottom Left Form Actions */}
          <div className="bg-white rounded-xl border border-[#f0f0f0] p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/student/evaluations")}
              disabled={submitting}
              className="font-medium"
            >
              <Icon name="arrow-left" size={14} />
              <span>Quay lại danh sách</span>
            </Button>

            {!isReadOnly && (
              <Button
                variant="primary"
                onClick={handlePreSubmit}
                loading={submitting}
                className="font-bold flex items-center gap-1.5"
              >
                <Icon name="check" size={15} />
                <span>Nộp phiếu khảo sát</span>
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Progress Panel & Question Markers Grid (Sticky on scroll) */}
        <div className="lg:col-span-4 flex flex-col gap-4.5 lg:sticky lg:top-20 self-start">
          {/* Progress & Questions Grid Card */}
          <Card className="rounded-xl border-[#f0f0f0] shadow-2xs [&>.ant-card-body]:p-5 space-y-4">
            <div className="pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Tiến độ thực hiện
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900">
                  {answeredCount} <span className="text-sm font-semibold text-slate-400">/ {totalQuestions} câu</span>
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {progressPercent}%
                </span>
              </div>
              <div className="pt-2">
                <Progress
                  percent={progressPercent}
                  strokeColor="#2563eb"
                  showInfo={false}
                />
              </div>
            </div>

            {/* Question numbered markers (Tô ô xanh lá khi đã làm xong) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 mt-3">Mục lục câu hỏi:</span>
                <span className="text-slate-400 text-[11px]">Bấm số để nhảy tới câu</span>
              </div>

              {/* Grid of number boxes */}
              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
                {survey.questions.map((q: QuestionItem, i: number) => {
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

              {/* Legend: Colors meaning */}
              <div className="pt-3 flex items-center gap-4 text-[11px] text-slate-500 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block" />
                  <span>Đã làm xong</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300 inline-block" />
                  <span>Chưa làm</span>
                </div>
              </div>
            </div>

            {/* Quick Action Button in Sidebar */}
            {!isReadOnly && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handlePreSubmit}
                  loading={submitting}
                  className="w-full font-bold flex items-center justify-center gap-1.5"
                >
                  <Icon name="check" size={15} />
                  <span>Gửi phiếu đánh giá</span>
                </Button>
              </div>
            )}
          </Card>

          {/* Survey Summary Details Card */}
          <Card className="rounded-xl border-[#f0f0f0] shadow-2xs space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Thông tin đợt khảo sát
            </span>

            <div className="space-y-2 text-xs mt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Hình thức:</span>
                <span className="font-semibold text-slate-700">
                  {survey.isAnonymous ? "Ẩn danh 100%" : "Định danh cá nhân"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Thời gian ước tính:</span>
                <span className="font-semibold text-slate-700">~{survey.estimatedMinutes} phút</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Hạn chót gửi:</span>
                <strong className="text-rose-600">{survey.endDate}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Lớp học:</span>
                <span className="font-semibold text-slate-700">Lớp 11A1</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Niên khóa:</span>
                <span className="font-semibold text-slate-700">{survey.academicYear}</span>
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
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Icon name="checkCircle" size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-0.5">
                Xác nhận nộp phiếu khảo sát?
              </h3>
              <p className="text-xs text-slate-500 mb-0">
                Mã phiếu: <strong className="text-slate-700">{survey.code}</strong>
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
              <span>Bảo mật dữ liệu:</span>
              <strong className="text-slate-800">
                {survey.isAnonymous ? "Bảo mật ẩn danh 100%" : "Định danh cá nhân"}
              </strong>
            </div>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-[#f0f0f0] mb-0 leading-relaxed">
              Sau khi xác nhận nộp, ý kiến của em sẽ được ghi nhận chính thức vào hệ thống.
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
              <span>Xác nhận gửi phiếu</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
