import React from "react";
import { Empty } from "antd";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  ParentNoteItem,
  SendFeedbackPayload,
} from "@/modules/students/features/contact-book/types";

interface ParentExchangeViewProps {
  messages?: ParentNoteItem[];
  parentNotes?: ParentNoteItem[];
  onSendMessage?: (payload: SendFeedbackPayload) => Promise<boolean>;
  onAddParentNote?: (payload: SendFeedbackPayload) => Promise<boolean>;
  onOpenFeedbackModal: () => void;
  submitting?: boolean;
}

export const ParentExchangeView: React.FC<ParentExchangeViewProps> = ({
  messages,
  parentNotes,
  onOpenFeedbackModal,
}) => {
  const notesList = parentNotes || messages || [];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Intro info box - Đúng tính chất trang sổ liên lạc của Cha Mẹ học sinh */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#f0f0f0] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3.5">
          <span className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Icon name="fileText" size={20} />
          </span>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-0.5">
              Mục ghi ý kiến và Ký xác nhận của Cha Mẹ học sinh
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 mb-0">
              Phần dành cho phụ huynh ghi nhận xét về việc học ở nhà, sinh hoạt của con em và đề xuất ý kiến với nhà trường theo từng tuần
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={onOpenFeedbackModal}
          className="shrink-0 text-xs font-semibold px-4 h-9"
        >
          <Icon name="edit" size={14} />
          <span>Ghi ý kiến vào sổ liên lạc</span>
        </Button>
      </div>

      {/* Danh sách các phiếu ghi ý kiến định kỳ trong sổ */}
      {notesList.length === 0 ? (
        <div className="p-10 sm:p-14 text-center bg-white rounded-2xl border border-[#f0f0f0] shadow-2xs">
          <Empty
            description={
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-bold text-slate-700 mb-0">
                  Chưa có phiếu ghi ý kiến nào của Cha Mẹ học sinh
                </p>
                <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
                  Quý phụ huynh vui lòng bấm nút "Ghi ý kiến vào sổ liên lạc" để đóng góp ý kiến và ký xác nhận định kỳ.
                </p>
              </div>
            }
          >
            <Button variant="primary" onClick={onOpenFeedbackModal} className="mt-3">
              <Icon name="edit" size={14} />
              <span>Ghi ý kiến ngay</span>
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="flex flex-col gap-6 sm:gap-5 w-full">
          {notesList.map((note) => (
            <div key={note.id} className="w-full">
              <Card
                className="w-full rounded-2xl border border-[#f0f0f0]/90 shadow-xs"
              >
                {/* Header của phiếu ghi ý kiến */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-sm flex items-center justify-center border border-blue-200 shrink-0 shadow-2xs">
                      T{note.weekNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
                          Ý kiến của Cha Mẹ học sinh — Tuần {note.weekNumber}
                        </h4>
                        {note.isConfirmed && (
                          <Tag color="success" className="m-0 font-semibold text-[10px]">
                            Đã ký sổ
                          </Tag>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Người ký: <strong>{note.parentName}</strong> ({note.parentRole || "Phụ huynh"}) • SĐT: {note.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 self-start sm:self-auto px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <Icon name="clock" size={13} className="text-slate-400" />
                    <span>Ký ngày: <strong className="text-slate-700">{note.signedAt}</strong></span>
                  </div>
                </div>

                {/* Thân phiếu: Gồm 2 mục chuẩn như sổ giấy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 my-5">
                  {/* 1. Nhận xét tình hình học ở nhà */}
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-[#f0f0f0]/90 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                      <Icon name="home" size={14} className="text-blue-600" />
                      <span>Tình hình tự học & sinh hoạt tại nhà</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-0">
                      {note.homeStudyComment || "Gia đình đã kiểm tra và theo dõi sát sao việc học tại nhà của cháu."}
                    </p>
                  </div>

                  {/* 2. Ý kiến, đề xuất với nhà trường */}
                  <div className="p-4 sm:p-5 rounded-xl bg-blue-50/50 border border-blue-200/90 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wide">
                      <Icon name="edit" size={14} className="text-blue-600" />
                      <span>Ý kiến đóng góp & đề xuất của gia đình</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mb-0">
                      "{note.generalOpinion || "Gia đình hoàn toàn nhất trí với nhận xét và kết quả của giáo viên."}"
                    </p>
                  </div>
                </div>

                {/* Phần tiếp nhận & phản hồi chính thức từ Giáo viên chủ nhiệm */}
                {note.teacherResponse ? (
                  <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                          <Icon name="checkCircle" size={14} className="text-purple-600" />
                          Ý kiến tiếp thu từ Giáo viên chủ nhiệm:
                        </span>
                        <span className="text-[11px] text-purple-700 font-semibold">
                          {note.teacherResponse.teacherName}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 mb-0 leading-relaxed">
                        {note.teacherResponse.content}
                      </p>
                    </div>
                    <span className="text-[11px] text-purple-600 shrink-0 font-medium px-2.5 py-1 bg-white/70 rounded-md border border-purple-200">
                      Ghi nhận: {note.teacherResponse.respondedAt}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Icon name="check" size={13} className="text-emerald-500" />
                      Ý kiến đã được lưu trữ chính thức vào hồ sơ Sổ liên lạc của học sinh
                    </span>
                    <span className="text-blue-600 font-medium">Học kỳ 1 • 2025-2026</span>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
