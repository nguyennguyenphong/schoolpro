import React from "react";
import dayjs from "dayjs";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { TimetableSlot } from "@/modules/students/features/timetable/types";

interface ListViewProps {
  slots: TimetableSlot[];
  onSlotClick: (slot: TimetableSlot) => void;
}

export const ListView: React.FC<ListViewProps> = ({ slots, onSlotClick }) => {
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
      <div className="p-12 text-center bg-white border border-slate-200 rounded-xl shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
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
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-3.5">Ngày học</th>
              <th className="py-3 px-3.5">Giờ học & Tiết</th>
              <th className="py-3 px-3.5">Mã HP</th>
              <th className="py-3 px-3.5">Tên học phần</th>
              <th className="py-3 px-3.5 text-center">Hình thức</th>
              <th className="py-3 px-3.5">Phòng học</th>
              <th className="py-3 px-3.5">Giảng viên</th>
              <th className="py-3 px-3.5 text-center">Trạng thái</th>
              <th className="py-3 px-3.5 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slots.map((slot) => {
              const slotDate = dayjs(slot.date);
              const formattedDate = slotDate.format("DD/MM/YYYY");
              const dayName = `Thứ ${slot.dayOfWeek === 8 ? "CN" : slot.dayOfWeek}`;

              return (
                <tr
                  key={slot.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Date Column */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="font-bold text-slate-800 block">
                      {formattedDate}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {dayName}
                    </span>
                  </td>

                  {/* Time & Periods */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="font-mono font-semibold text-slate-700 block">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <span className="text-[11px] text-blue-600 block">
                      {slot.periods}
                    </span>
                  </td>

                  {/* Course Code */}
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-700">
                    {slot.courseCode}
                  </td>

                  {/* Course Name */}
                  <td className="py-3 px-3.5 max-w-xs">
                    <span className="font-bold text-slate-900 block truncate">
                      {slot.courseName}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      Lớp: {slot.classCode} • {slot.credits} TC
                    </span>
                  </td>

                  {/* Class Type */}
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <Tag
                      color={slot.classType === "practice" ? "green" : "blue"}
                      className="text-[10px] px-1.5 py-0 m-0"
                    >
                      {slot.classType === "practice" ? "Thực hành" : "Lý thuyết"}
                    </Tag>
                  </td>

                  {/* Room & Building */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="font-semibold text-slate-800 block">
                      {slot.room}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {slot.building}
                    </span>
                  </td>

                  {/* Instructor */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                    {slot.instructorName}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    {getStatusBadge(slot.status)}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => onSlotClick(slot)}
                      className="rounded-lg text-xs"
                    >
                      Xem
                    </Button>
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
