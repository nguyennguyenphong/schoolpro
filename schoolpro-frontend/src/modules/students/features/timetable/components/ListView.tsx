import React from "react";
import dayjs from "dayjs";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { TimetableSlot } from "@/modules/students/features/timetable/types";

interface ListViewProps {
  slots: TimetableSlot[];
  onSlotClick?: (slot: TimetableSlot) => void;
}

export const ListView: React.FC<ListViewProps> = ({ slots }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ongoing":
        return <Tag color="processing">Đang học</Tag>;
      case "completed":
        return <Tag color="default">Đã xong</Tag>;
      case "cancelled":
        return <Tag color="error">Tạm nghỉ</Tag>;
      case "upcoming":
      default:
        return <Tag color="blue">Sắp tới</Tag>;
    }
  };

  if (slots.length === 0) {
    return (
      <div className="p-12 text-center bg-white border border-[#f0f0f0] rounded-xl shadow-2xs">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Icon name="search" size={20} />
        </div>
        <h4 className="text-sm font-bold text-slate-800 mb-1">
          Không tìm thấy buổi học nào
        </h4>
        <p className="text-xs text-slate-500 mb-0">
          Hãy điều chỉnh lại bộ lọc ngày, tháng, năm hoặc học phần để xem thêm.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#f0f0f0] rounded-xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs whitespace-nowrap min-w-[1600px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-[#f0f0f0] text-slate-500 font-semibold uppercase text-[11px] tracking-wider whitespace-nowrap">
              <th className="py-3 px-4">Ngày học</th>
              <th className="py-3 px-4">Giờ học & Tiết</th>
              <th className="py-3 px-4">Mã môn</th>
              <th className="py-3 px-4">Tên môn học</th>
              <th className="py-3 px-4 text-center">Hình thức học</th>
              <th className="py-3 px-4 text-center">Hình thức dạy</th>
              <th className="py-3 px-4">Phòng học</th>
              <th className="py-3 px-4">Giáo viên</th>
              <th className="py-3 px-4">Ghi chú</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-center">Liên kết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slots.map((slot) => {
              const slotDate = dayjs(slot.date);
              const formattedDate = slotDate.format("DD/MM/YYYY");
              const dayName = `Thứ ${slot.dayOfWeek === 8 ? "CN" : slot.dayOfWeek}`;
              const isPractice = slot.classType === "practice";
              const isOnline = Boolean(slot.onlineUrl);

              return (
                <tr
                  key={slot.id}
                  className="hover:bg-slate-50/70 transition-colors whitespace-nowrap"
                >
                  {/* 1. Date Column: single line */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800">
                      {formattedDate}
                    </span>
                    <span className="text-slate-400 font-medium ml-1.5">
                      ({dayName})
                    </span>
                  </td>

                  {/* 2. Time & Periods: single line */}
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    <span>{slot.startTime} - {slot.endTime}</span>
                    <span className="text-blue-600 font-sans font-medium ml-1.5">
                      ({slot.periods})
                    </span>
                  </td>

                  {/* 3. Course Code */}
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">
                    {slot.courseCode}
                  </td>

                  {/* 4. Course Name: single line */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900">
                      {slot.courseName}
                    </span>
                    <span className="text-slate-400 text-[11px] ml-1.5">
                      (Lớp {slot.classCode} • {slot.credits} tiết/tuần)
                    </span>
                  </td>

                  {/* 5. Hình thức học */}
                  <td className="py-3 px-4 text-center">
                    <Tag
                      color={isPractice ? "green" : "blue"}
                      className="text-[10px] px-2 py-0.5 m-0 font-semibold inline-block"
                    >
                      {isPractice ? "Thực hành" : "Lý thuyết"}
                    </Tag>
                  </td>

                  {/* 6. Hình thức dạy */}
                  <td className="py-3 px-4 text-center">
                    <Tag
                      color={isOnline ? "purple" : "cyan"}
                      className="text-[10px] px-2 py-0.5 m-0 font-semibold inline-block"
                    >
                      {isOnline ? "Trực tuyến" : "Trực tiếp"}
                    </Tag>
                  </td>

                  {/* 7. Room & Building: single line */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">
                      {slot.room}
                    </span>
                    <span className="text-slate-500">
                      {" "}• {slot.building}
                    </span>
                  </td>

                  {/* 8. Teacher */}
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {slot.instructorName}
                  </td>

                  {/* 9. Note: single line */}
                  <td className="py-3 px-4 text-slate-600 italic text-[11px]">
                    {slot.notes || slot.lessonTopic || "—"}
                  </td>

                  {/* 10. Status */}
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(slot.status)}
                  </td>

                  {/* 11. Online Link */}
                  <td className="py-3 px-4 text-center">
                    {slot.onlineUrl ? (
                      <a
                        href={slot.onlineUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:underline text-xs"
                      >
                        <Icon name="external-link" size={13} className="shrink-0" />
                        <span>Vào lớp</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
