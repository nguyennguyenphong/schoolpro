import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LeaveRequestStatusBanner } from "@/modules/students/features/leave-requests/components/detail/LeaveRequestStatusBanner";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";

describe("LeaveRequestStatusBanner", () => {
  const baseMockItem: LeaveRequestItem = {
    id: "lr-001",
    code: "202610180001",
    requestCode: "202610180001",
    studentId: "stu-1",
    studentName: "Nguyễn Văn An",
    studentCode: "HS-1234",
    classId: "cls-1",
    className: "10A1",
    homeroomTeacherName: "Thầy Hoàng Văn Nam",
    homeroomTeacherEmail: "nam.hoang@schoolpro.edu.vn",
    leaveType: "sick",
    leaveTypeCode: "sick",
    startDate: "2026-10-20",
    endDate: "2026-10-20",
    totalDays: 1,
    sessionShift: "morning",
    reason: "Em bị sốt cao cần đi khám bệnh tại bệnh viện.",
    commitment: "Em hứa sẽ chép bài và làm bài tập đầy đủ.",
    status: "approved",
    statusCode: "approved",
    teacherNote: "Em nhớ giữ gìn sức khỏe và chép bài đầy đủ nhé.",
    reviewedAt: "2026-10-18T10:00:00Z",
    approvalDeadline: "2026-10-20T04:00:00Z",
    isAutoApproved: false,
    createdAt: "2026-10-18T08:00:00Z",
    updatedAt: "2026-10-18T10:00:00Z",
  };

  it("renders approved banner with teacher note", () => {
    render(<LeaveRequestStatusBanner item={baseMockItem} />);

    // Should display the teacher's note
    expect(screen.getByText(/Em nhớ giữ gìn sức khỏe/i)).toBeInTheDocument();
  });

  it("renders pending banner with teacher name and deadline", () => {
    const pendingItem: LeaveRequestItem = {
      ...baseMockItem,
      status: "pending",
      teacherNote: undefined,
    };

    render(<LeaveRequestStatusBanner item={pendingItem} />);

    // Should display the teacher name
    expect(screen.getAllByText(/Thầy Hoàng Văn Nam/i).length).toBeGreaterThan(0);
  });

  it("renders rejected banner with reason note", () => {
    const rejectedItem: LeaveRequestItem = {
      ...baseMockItem,
      status: "rejected",
      teacherNote: "Trùng lịch kiểm tra 1 tiết môn Toán, cần liên hệ trực tiếp.",
    };

    render(<LeaveRequestStatusBanner item={rejectedItem} />);

    expect(screen.getByText(/Trùng lịch kiểm tra 1 tiết môn Toán/i)).toBeInTheDocument();
  });
});
