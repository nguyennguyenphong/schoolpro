import React from "react";
import { Modal } from "antd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { SubjectGradeItem, GradeSummary } from "@/modules/students/features/gradebook/types";

interface GradeTranscriptModalProps {
  isOpen: boolean;
  grades: SubjectGradeItem[];
  summary: GradeSummary | null;
  onClose: () => void;
  onExportPdf: () => void;
}

export const GradeTranscriptModal: React.FC<GradeTranscriptModalProps> = ({
  isOpen,
  grades,
  summary,
  onClose,
  onExportPdf,
}) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#f0f0f0]">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Icon name="checkCircle" size={14} />
            <span>Xác thực bởi Cổng Học bạ Điện tử Quốc gia (Bộ GD&ĐT)</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.print();
              }}
              className="text-slate-700 font-semibold"
            >
              <Icon name="fileText" size={14} />
              <span>In Bảng điểm</span>
            </Button>
            <Button variant="primary" onClick={onExportPdf} className="font-semibold">
              <Icon name="download" size={14} />
              <span>Tải PDF Ký số</span>
            </Button>
          </div>
        </div>
      }
      width={840}
      title={null}
      destroyOnHidden
      centered
    >
      <div className="space-y-4 pt-1 text-slate-800">
        {/* National Header */}
        <div className="text-center space-y-1 pb-3 border-b-2 border-[#f0f0f0]">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            SỞ GIÁO DỤC VÀ ĐÀO TẠO • TRƯỜNG TRUNG HỌC PHỔ THÔNG CHUYÊN
          </div>
          <h2 className="text-lg sm:text-xl font-black text-blue-900 tracking-tight mb-0 uppercase">
            BẢNG ĐIỂM HỌC TẬP VÀ HỌC BẠ ĐIỆN TỬ
          </h2>
          <div className="text-xs font-medium text-slate-500">
            Áp dụng theo Thông tư số 22/2021/TT-BGDĐT của Bộ Giáo dục và Đào tạo
          </div>
        </div>

        {/* Student Profile Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-300 text-xs">
          <div>
            <span className="text-slate-500 block">Họ và tên:</span>
            <strong className="text-sm text-slate-900">Nguyễn Văn An</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Lớp / Khối:</span>
            <strong className="text-sm text-slate-900">Lớp 11A1 (Khối 11)</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Mã học sinh:</span>
            <strong className="text-sm text-slate-900">SV202688</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Năm học / Học kỳ:</span>
            <strong className="text-sm text-slate-900">2025-2026 • HK1</strong>
          </div>
        </div>

        {/* Grades Table with borders */}
        <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center border border-slate-300">STT</th>
                <th className="py-2.5 px-3 border border-slate-300">Môn học</th>
                <th className="py-2.5 px-3 text-center border border-slate-300">TX (x1)</th>
                <th className="py-2.5 px-3 text-center border border-slate-300">GK (x2)</th>
                <th className="py-2.5 px-3 text-center border border-slate-300">CK (x3)</th>
                <th className="py-2.5 px-3 text-center border border-slate-300">ĐTBm</th>
                <th className="py-2.5 px-3 text-center border border-slate-300">Xếp loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {grades.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 text-center text-slate-500 font-semibold border border-[#f0f0f0]">{idx + 1}</td>
                  <td className="py-2 px-3 font-bold text-slate-800 border border-[#f0f0f0]">{item.name}</td>
                  <td className="py-2 px-3 text-center text-slate-600 border border-[#f0f0f0]">
                    {item.regularScores.map((s) => s.score.toFixed(1)).join("  ")}
                  </td>
                  <td className="py-2 px-3 text-center font-semibold text-slate-700 border border-[#f0f0f0]">
                    {item.midtermScore ? item.midtermScore.score.toFixed(1) : "--"}
                  </td>
                  <td className="py-2 px-3 text-center font-semibold text-slate-700 border border-[#f0f0f0]">
                    {item.finalScore ? item.finalScore.score.toFixed(1) : "--"}
                  </td>
                  <td className="py-2 px-3 text-center border border-[#f0f0f0]">
                    {item.evaluationType === "feedback" ? (
                      <span className="font-bold text-emerald-700">ĐẠT</span>
                    ) : (
                      <strong className="font-black text-blue-700 text-sm">
                        {item.averageScore?.toFixed(1)}
                      </strong>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center font-semibold text-slate-700 border border-[#f0f0f0]">
                    {item.evaluationType === "feedback"
                      ? "Hoàn thành tốt"
                      : (item.averageScore || 0) >= 8.0
                      ? "Giỏi"
                      : "Khá"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Overall Evaluation */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1.5">
              <div className="font-bold text-blue-900 text-sm">KẾT QUẢ ĐÁNH GIÁ CHUNG:</div>
              <div className="flex justify-between">
                <span>Điểm trung bình học kỳ (ĐTB):</span>
                <strong className="text-blue-900 text-sm">{summary.gpa.toFixed(2)}/10</strong>
              </div>
              <div className="flex justify-between">
                <span>Kết quả Học lực:</span>
                <strong className="text-blue-900">{summary.academicRank}</strong>
              </div>
              <div className="flex justify-between">
                <span>Kết quả Rèn luyện:</span>
                <strong className="text-emerald-800">{summary.conductRank}</strong>
              </div>
              <div className="flex justify-between">
                <span>Thứ hạng trong lớp:</span>
                <strong className="text-amber-800">
                  Hạng {summary.classPosition}/{summary.totalClassStudents}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Danh hiệu khen thưởng:</span>
                <strong className="text-purple-800">{summary.titleAwarded}</strong>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-300 space-y-1.5 flex flex-col justify-between">
              <div>
                <div className="font-bold text-slate-800">Nhận xét của Giáo viên Chủ nhiệm:</div>
                <p className="text-slate-600 italic leading-relaxed mt-1 mb-0">
                  "{summary.homeroomComment}"
                </p>
              </div>
              <div className="text-[11px] text-slate-400 text-right pt-2 border-t border-[#f0f0f0]">
                Giáo viên chủ nhiệm: <strong>{summary.homeroomTeacher}</strong> (Đã ký số xác thực)
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
