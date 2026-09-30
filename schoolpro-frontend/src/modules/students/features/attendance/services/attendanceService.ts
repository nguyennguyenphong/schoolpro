import type {
  AttendanceRecord,
  AttendanceSummary,
  CheckInPayload,
  CheckInResult,
} from "@/modules/students/features/attendance/types";
import {
  mockAttendanceRecords,
  mockAttendanceSummary,
} from "@/modules/students/features/attendance/services/mock/mockAttendanceData";

class AttendanceService {
  private records: AttendanceRecord[] = [...mockAttendanceRecords];
  private latency = 250;

  /**
   * Lấy danh sách điểm danh theo ngày được chọn (YYYY-MM-DD)
   */
  async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = this.records.filter((r) => r.date === date);
        resolve(list);
      }, this.latency);
    });
  }

  /**
   * Lấy tóm tắt chuyên cần tổng thể
   */
  async getSummary(): Promise<AttendanceSummary> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Calculate based on today's items
        const todayItems = this.records.filter((r) => r.date === "2026-09-29");
        const attendedToday = todayItems.filter((r) => r.status === "present").length;
        const pendingToday = todayItems.filter((r) => r.status === "open" || r.status === "upcoming").length;
        const absentToday = todayItems.filter((r) => r.status === "absent").length;

        resolve({
          ...mockAttendanceSummary,
          totalToday: todayItems.length,
          attendedToday,
          pendingToday,
          absentToday,
        });
      }, this.latency);
    });
  }

  /**
   * Thực hiện điểm danh môn học (hỗ trợ mã Code, Quét QR hoặc Upload ảnh QR)
   */
  async submitCheckIn(payload: CheckInPayload): Promise<CheckInResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recordIndex = this.records.findIndex((r) => r.id === payload.recordId);
        if (recordIndex === -1) {
          resolve({
            success: false,
            message: "Không tìm thấy phiên điểm danh môn học này.",
          });
          return;
        }

        const target = this.records[recordIndex];

        if (target.status === "present") {
          resolve({
            success: true,
            message: "Em đã hoàn thành điểm danh môn học này trước đó rồi.",
            record: target,
          });
          return;
        }

        if (target.status === "absent") {
          resolve({
            success: false,
            message: "Cổng điểm danh đã đóng. Vui lòng liên hệ trực tiếp giáo viên bộ môn nếu có lý do chính đáng.",
          });
          return;
        }

        // Validate code nếu dùng mã code giáo viên
        if (payload.method === "code") {
          if (!payload.code) {
            resolve({
              success: false,
              message: "Vui lòng nhập mã code do giáo viên cung cấp.",
            });
            return;
          }

          const normalizedEntered = payload.code.trim().toUpperCase();
          const normalizedTarget = target.attendanceCode.trim().toUpperCase();

          if (normalizedEntered !== normalizedTarget) {
            resolve({
              success: false,
              message: `Mã code không chính xác! Vui lòng kiểm tra lại mã trên bảng hoặc hỏi giáo viên. (Mã mẫu demo: ${target.attendanceCode})`,
            });
            return;
          }
        }

        // Validate QR Token nếu có
        if (payload.method === "qr_scan" || payload.method === "qr_upload") {
          // If qrData provided and doesn't match target token
          if (payload.qrData && payload.qrData.trim() !== target.qrToken.trim()) {
            resolve({
              success: false,
              message: "Mã QR không khớp với môn học này. Vui lòng quét đúng mã QR của tiết học.",
            });
            return;
          }
        }

        // Cập nhật bản ghi thành Đã điểm danh (present)
        const now = new Date();
        const checkInTime = `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}`;

        const updatedRecord: AttendanceRecord = {
          ...target,
          status: "present",
          checkInTime,
          checkInMethod: payload.method,
          note: `Đã điểm danh thành công lúc ${checkInTime} qua ${
            payload.method === "qr_scan"
              ? "Quét QR Camera"
              : payload.method === "qr_upload"
              ? "Tải ảnh mã QR"
              : "Mã Code giáo viên"
          }.`,
        };

        this.records[recordIndex] = updatedRecord;

        resolve({
          success: true,
          message: `Điểm danh thành công môn ${target.subjectName}!`,
          record: updatedRecord,
        });
      }, this.latency);
    });
  }
}

export const attendanceService = new AttendanceService();
