import React from "react";
import dayjs from "dayjs";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { TimetableSlot } from "@/modules/students/features/timetable/types";

interface DailyAgendaViewProps {
  selectedDate: string;
  slots: TimetableSlot[];
  onSlotClick: (slot: TimetableSlot) => void;
  onGoToToday: () => void;
}

export const DailyAgendaView: React.FC<DailyAgendaViewProps> = ({
  selectedDate,
  slots,
  onSlotClick,
  onGoToToday,
}) => {
  const currentDayjs = dayjs(selectedDate);
  const fullDateStr = currentDayjs.format("DD/MM/YYYY");

  const getAttendanceBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Tag color="success">✓ Đã điểm danh</Tag>;
      case "absent":
        return <Tag color="error">✕ Vắng mặt</Tag>;
      case "late":
        return <Tag color="warning">Đi muộn</Tag>;
      default:
        return <Tag color="default">Chưa điểm danh</Tag>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Date Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-white border border-[#f0f0f0] rounded-xl shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold shadow-xs">
            <span className="text-[11px] uppercase tracking-wider leading-none">
              T{currentDayjs.day() === 0 ? "CN" : currentDayjs.day() + 1}
            </span>
            <span className="text-lg leading-tight mt-0.5">{currentDayjs.date()}</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-0">
              Lịch học chi tiết trong ngày ({fullDateStr})
            </h3>
            <p className="text-xs text-slate-500 mb-0">
              Bạn có <strong>{slots.length}</strong> buổi học được xếp lịch trong ngày này
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onGoToToday}
          >
            Quay lại hôm nay
          </Button>
        </div>
      </div>

      {/* Sessions Timeline List */}
      {slots.length === 0 ? (
        <Card className="rounded-xl shadow-2xs text-center [&>.ant-card-body]:p-12">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Icon name="calendar" size={28} />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1">
            Không có lịch học trong ngày {fullDateStr}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Bạn có thể chuyển sang chế độ xem Lưới tuần để theo dõi tổng thể lịch học của cả tuần.
          </p>
          <Button variant="primary" onClick={onGoToToday}>
            Xem lịch học tuần này
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {slots.map((slot) => {
            const isOngoing = slot.status === "ongoing";
            return (
              <Card
                key={slot.id}
                className={`rounded-xl shadow-2xs transition-all hover:border-blue-300 [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5 relative ${
                  isOngoing ? "border-blue-400 ring-2 ring-blue-500/20" : ""
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Time and Course Info */}
                  <div className="flex items-start gap-4">
                    {/* Time Pillar */}
                    <div className="w-28 shrink-0 text-center p-2.5 bg-slate-50 border border-[#f0f0f0] rounded-xl">
                      <span className="text-xs font-mono font-bold text-slate-800 block">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">
                        {slot.periods}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 uppercase tracking-wider">
                        {slot.shift === "morning"
                          ? "Ca Sáng"
                          : slot.shift === "afternoon"
                          ? "Ca Chiều"
                          : "Ca Tối"}
                      </span>
                    </div>

                    {/* Main Course Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-[#f0f0f0]">
                          {slot.courseCode}
                        </span>
                        <Tag color={slot.classType === "practice" ? "green" : "blue"}>
                          {slot.classType === "practice" ? "Thực hành" : "Lý thuyết"}
                        </Tag>
                        {getAttendanceBadge(slot.attendanceStatus)}
                        {slot.onlineUrl && (
                          <Tag color="cyan">Online Meeting</Tag>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-900 mb-0">
                        {slot.courseName}
                      </h4>

                      {slot.lessonTopic && (
                        <p className="text-xs text-slate-600 mb-0 flex items-start gap-1">
                          <span className="font-semibold text-slate-700 shrink-0">Nội dung:</span>
                          <span>{slot.lessonTopic}</span>
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                        <div className="flex items-center gap-1">
                          <Icon name="map-pin" size={13} className="text-slate-400" />
                          <span className="font-medium text-slate-700">
                            Phòng {slot.room} • {slot.building}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="user" size={13} className="text-slate-400" />
                          <span>{slot.instructorName}</span>
                        </div>
                        <div>
                          <span>Lớp: <strong>{slot.classCode}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {slot.onlineUrl && (
                      <a
                        href={slot.onlineUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="no-underline"
                      >
                        <Button variant="outline" className="rounded-lg text-xs">
                          Vào lớp trực tuyến
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="primary"
                      onClick={() => onSlotClick(slot)}
                      className="rounded-lg text-xs"
                    >
                      Chi tiết buổi học
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
