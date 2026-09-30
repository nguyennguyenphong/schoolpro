import React, { useState } from "react";
import { Avatar, Input as AntInput } from "antd";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  ParentMessage,
  SendFeedbackPayload,
} from "@/modules/students/features/contact-book/types";

interface ParentExchangeViewProps {
  messages: ParentMessage[];
  onSendMessage: (payload: SendFeedbackPayload) => Promise<boolean>;
  onOpenFeedbackModal: () => void;
  submitting: boolean;
}

export const ParentExchangeView: React.FC<ParentExchangeViewProps> = ({
  messages,
  onSendMessage,
  onOpenFeedbackModal,
  submitting,
}) => {
  const [quickContent, setQuickContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendQuick = async () => {
    if (!quickContent.trim()) return;
    setIsSending(true);
    const success = await onSendMessage({
      content: quickContent.trim(),
      parentName: "Nguyễn Văn Bình",
      phone: "0987.654.321",
    });
    if (success) {
      setQuickContent("");
    }
    setIsSending(false);
  };

  return (
    <div className="space-y-4">
      {/* Intro info box */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <Icon name="mail" size={18} />
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-0.5">
              Kênh trao đổi 2 chiều giữa Phụ huynh & Giáo viên chủ nhiệm
            </h4>
            <p className="text-xs text-slate-500 mb-0">
              Nơi tiếp nhận ý kiến đóng góp, xin phép nghỉ học và trao đổi định kỳ về tình hình học tập của học sinh
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onOpenFeedbackModal}
          className="shrink-0 text-xs font-semibold"
        >
          <Icon name="edit" size={14} />
          <span>Gửi phản hồi chính thức</span>
        </Button>
      </div>

      {/* Messages Stream Card */}
      <Card className="rounded-xl border-slate-200 shadow-2xs overflow-hidden [&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-purple-600 rounded-full inline-block" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-0">
              Lịch sử trao đổi & Ý kiến phản hồi ({messages.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Tự động lưu trữ</span>
        </div>

        <div className="space-y-4 mb-6">
          {messages.map((msg) => {
            const isTeacher = msg.senderRole === "teacher";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-start ${isTeacher ? "flex-row" : "flex-row-reverse"}`}
              >
                {/* Avatar */}
                <Avatar
                  size={36}
                  src={
                    isTeacher
                      ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
                      : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
                  }
                  className={`border shrink-0 mt-0.5 ${
                    isTeacher ? "border-purple-200" : "border-blue-200"
                  }`}
                />

                {/* Bubble */}
                <div
                  className={`max-w-xl rounded-2xl p-4 shadow-2xs space-y-1.5 ${
                    isTeacher
                      ? "bg-purple-50/50 border border-purple-100 text-slate-800 rounded-tl-none"
                      : "bg-blue-600 text-white rounded-tr-none"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className={`font-bold ${isTeacher ? "text-purple-900" : "text-white"}`}>
                      {msg.senderName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {msg.weekNumber && (
                        <Tag
                          color={isTeacher ? "purple" : "blue"}
                          className="m-0 text-[10px] font-semibold"
                        >
                          Tuần {msg.weekNumber}
                        </Tag>
                      )}
                      <span className={`text-[11px] ${isTeacher ? "text-slate-400" : "text-blue-100"}`}>
                        {msg.createdAt}
                      </span>
                    </div>
                  </div>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed mb-0 ${
                      isTeacher ? "text-slate-700" : "text-white"
                    }`}
                  >
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Send Input Area */}
        <div className="pt-4 border-t border-slate-100 bg-slate-50/60 -mx-5 -mb-5 p-4 rounded-b-xl">
          <span className="text-xs font-bold text-slate-700 block mb-2">
            Gửi nhanh lời nhắn cho Giáo viên chủ nhiệm:
          </span>
          <div className="flex gap-2">
            <AntInput.TextArea
              rows={2}
              value={quickContent}
              onChange={(e) => setQuickContent(e.target.value)}
              placeholder="Nhập nội dung trao đổi, thắc mắc hoặc lời cảm ơn tới GVCN..."
              className="rounded-lg text-xs"
              disabled={isSending || submitting}
            />
            <Button
              variant="primary"
              onClick={handleSendQuick}
              disabled={!quickContent.trim() || isSending || submitting}
              className="shrink-0 self-end text-xs font-semibold px-4 h-10"
            >
              <Icon name="send" size={14} />
              <span>Gửi tin</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
