import React from "react";
import { Avatar } from "antd";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  ContactBookSummary,
  ContactBookTab,
} from "@/modules/students/features/contact-book/types";

interface OverviewTabViewProps {
  summary: ContactBookSummary;
  onSelectTab: (tab: ContactBookTab) => void;
  onOpenFeedbackModal: () => void;
}

export const OverviewTabView: React.FC<OverviewTabViewProps> = ({
  summary,
  onSelectTab,
  onOpenFeedbackModal,
}) => {
  return (
    <div className="flex flex-col gap-5 sm:gap-6 w-full">
      {/* 1. Student Academic Info & Family Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Student & Family Information (Trang Bìa & Lý Lịch Sổ Liên Lạc) */}
        <Card className="rounded-xl border-slate-200 shadow-2xs lg:col-span-2 [&>.ant-card-body]:p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-0">
                Lý lịch học sinh & Thông tin gia đình
              </h3>
            </div>
            <Tag color="blue" className="m-0 font-semibold text-xs">
              Sổ chính khóa 2025 - 2026
            </Tag>
          </div>

          {/* Thông tin học sinh */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-100 mb-4 bg-slate-50/60 rounded-xl px-4 text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Họ và tên</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">{summary.studentName}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Mã số học sinh</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-blue-600">{summary.studentCode}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Ngày sinh / Giới tính</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {summary.dateOfBirth || "15/10/2009"} ({summary.gender || "Nam"})
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Lớp niên khóa</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {summary.className} • {summary.semester}
              </span>
            </div>
          </div>

          {/* Thông tin cha mẹ / người giám hộ */}
          {summary.parentInfo && (
            <div className="mb-4 p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-2.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Icon name="userCheck" size={14} className="text-purple-600" />
                Thông tin Cha Mẹ / Người giám hộ học sinh
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 text-[11px] block">Họ tên Bố & Nghề nghiệp:</span>
                  <span className="font-bold text-slate-800 block">
                    {summary.parentInfo.fatherName} — {summary.parentInfo.fatherJob}
                  </span>
                  <span className="text-slate-600 flex items-center gap-1">
                    <Icon name="phone" size={12} className="text-slate-400" />
                    {summary.parentInfo.fatherPhone}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 text-[11px] block">Họ tên Mẹ & Nghề nghiệp:</span>
                  <span className="font-bold text-slate-800 block">
                    {summary.parentInfo.motherName} — {summary.parentInfo.motherJob}
                  </span>
                  <span className="text-slate-600 flex items-center gap-1">
                    <Icon name="phone" size={12} className="text-slate-400" />
                    {summary.parentInfo.motherPhone}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1 flex items-start gap-1.5">
                <Icon name="home" size={13} className="text-slate-400 shrink-0 mt-0.5" />
                <span>Hộ khẩu thường trú: <strong>{summary.parentInfo.address}</strong></span>
              </div>
            </div>
          )}

          {/* Đánh giá toàn diện */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Icon name="sparkles" size={16} />
              </span>
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-900 block">
                  Đánh giá kết quả học tập & rèn luyện từ Giáo viên Chủ nhiệm
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-0">
                  {summary.latestTeacherComment}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white">
                <Icon name="checkCircle" size={16} className="text-emerald-500 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Hạnh kiểm</span>
                  <span className="font-bold text-slate-800">{summary.conduct} ({summary.disciplineScore}/100 đ)</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white">
                <Icon name="chart" size={16} className="text-blue-500 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Học lực</span>
                  <span className="font-bold text-slate-800">Giỏi (GPA {summary.currentGpa.toFixed(1)})</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white">
                <Icon name="clock" size={16} className="text-amber-500 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Chuyên cần</span>
                  <span className="font-bold text-slate-800">{summary.attendanceRate}% có mặt</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Homeroom Teacher Contact Card */}
        <Card className="rounded-xl border-slate-200 shadow-2xs [&>.ant-card-body]:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-4 bg-purple-600 rounded-full inline-block" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-0">
                Giáo viên chủ nhiệm
              </h3>
            </div>

            <div className="flex items-center gap-3.5 mb-4">
              <Avatar
                size={52}
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
                className="border-2 border-purple-200 shadow-2xs shrink-0"
              />
              <div className="overflow-hidden">
                <span className="text-sm sm:text-base font-bold text-slate-900 block truncate">
                  {summary.homeroomTeacher.name}
                </span>
                <span className="text-xs text-purple-600 font-medium block truncate">
                  {summary.homeroomTeacher.subject}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Chủ nhiệm Lớp {summary.className}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 py-3 border-y border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Icon name="phone" size={13} className="text-slate-400" />
                  Số điện thoại:
                </span>
                <a
                  href={`tel:${summary.homeroomTeacher.phone}`}
                  className="font-bold text-blue-600 hover:underline"
                >
                  {summary.homeroomTeacher.phone}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Icon name="mail" size={13} className="text-slate-400" />
                  Email liên hệ:
                </span>
                <span className="font-medium text-slate-700 truncate max-w-44">
                  {summary.homeroomTeacher.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Icon name="clock" size={13} className="text-slate-400" />
                  Tiếp nhận liên lạc:
                </span>
                <span className="font-medium text-slate-700">17:00 - 19:30 các ngày</span>
              </div>
            </div>

            {/* Quy định sử dụng sổ */}
            <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Quy định Sổ liên lạc:</span>
              <p className="mb-0 leading-relaxed text-slate-500">
                Sổ liên lạc là phương tiện phối hợp chính thức giữa gia đình và nhà trường. Phụ huynh định kỳ theo dõi nhận xét từng tuần và ký xác nhận vào sổ.
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <Button
              variant="outline"
              onClick={() => onSelectTab("feedback")}
              className="w-full justify-center text-xs font-semibold"
            >
              <Icon name="fileText" size={14} />
              <span>Xem sổ ý kiến phụ huynh</span>
            </Button>
            <Button
              variant="primary"
              onClick={onOpenFeedbackModal}
              className="w-full justify-center text-xs font-semibold"
            >
              <Icon name="edit" size={14} />
              <span>Ghi ý kiến vào sổ liên lạc</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* 2. Attendance & Signature Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attendance Breakdown */}
        <Card className="rounded-xl border-slate-200 shadow-2xs [&>.ant-card-body]:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-0">
                Theo dõi chuyên cần học kỳ
              </h3>
            </div>
            <Tag color="warning" className="m-0 font-semibold text-xs">
              Tỷ lệ {summary.attendanceRate}%
            </Tag>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-lg sm:text-xl font-bold text-slate-800 block">
                {Math.round((summary.attendanceRate / 100) * 48)}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Buổi có mặt</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
              <span className="text-lg sm:text-xl font-bold text-blue-600 block">
                {summary.excusedAbsence}
              </span>
              <span className="text-[11px] text-blue-600 font-medium">Nghỉ có phép</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-center">
              <span className="text-lg sm:text-xl font-bold text-rose-600 block">
                {summary.unexcusedAbsence}
              </span>
              <span className="text-[11px] text-rose-600 font-medium">Không phép</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
              <span className="text-lg sm:text-xl font-bold text-amber-600 block">
                {summary.lateCount}
              </span>
              <span className="text-[11px] text-amber-600 font-medium">Đi muộn</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Tuân thủ quy định chuyên cần:</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <Icon name="checkCircle" size={14} />
              Đạt tiêu chuẩn xếp loại
            </span>
          </div>
        </Card>

        {/* Electronic Signature & Confirmation Status */}
        <Card className="rounded-xl border-slate-200 shadow-2xs [&>.ant-card-body]:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-600 rounded-full inline-block" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-0">
                  Xác nhận & Chữ ký số Sổ liên lạc
                </h3>
              </div>
              <Tag color="success" className="m-0 font-semibold text-xs">
                Kỳ hiện hành
              </Tag>
            </div>

            <div className="space-y-3 pt-1">
              {/* Teacher Signature status */}
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Icon name="check" size={16} />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Giáo viên chủ nhiệm đã duyệt sổ
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Người ký: {summary.homeroomTeacher.name} • 27/09/2026
                    </span>
                  </div>
                </div>
                <Tag color="success" className="m-0 font-semibold text-[10px]">
                  Hợp lệ
                </Tag>
              </div>

              {/* Parent Confirmation status */}
              <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Icon name="userCheck" size={16} />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Cha Mẹ học sinh đã ký xác nhận
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Người ký: {summary.parentInfo?.fatherName || "Nguyễn Văn Bình"} (Bố) • 28/09/2026
                    </span>
                  </div>
                </div>
                <Tag color="processing" className="m-0 font-semibold text-[10px]">
                  Đã ký nhận
                </Tag>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 mt-3">
            <span>Tổng số lần Cha Mẹ ghi ý kiến vào sổ:</span>
            <span className="font-bold text-blue-600">{summary.parentFeedbackCount} phiếu ghi</span>
          </div>
        </Card>
      </div>

      {/* 3. Quick Links Section */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Icon name="fileText" size={20} />
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-0.5">
              Theo dõi chi tiết nhận xét từng tuần và bảng điểm các môn
            </h4>
            <p className="text-xs text-slate-500 mb-0">
              Tra cứu đầy đủ phiếu liên lạc từng tuần của GVCN và bảng điểm nhận xét của từng thầy cô bộ môn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => onSelectTab("weekly")}
            className="flex-1 sm:flex-none text-xs font-semibold bg-white"
          >
            <span>Nhận xét từng tuần</span>
            <Icon name="arrow-right" size={13} />
          </Button>
          <Button
            variant="primary"
            onClick={() => onSelectTab("subjects")}
            className="flex-1 sm:flex-none text-xs font-semibold"
          >
            <span>Xem điểm bộ môn</span>
            <Icon name="arrow-right" size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
};
