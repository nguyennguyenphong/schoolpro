import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { WelcomeBanner } from "@/modules/students/features/home/components/WelcomeBanner";
import type { StudentProfile } from "@/modules/students/features/home/types";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("WelcomeBanner", () => {
  const mockProfile: StudentProfile = {
    id: "stu-1",
    code: "HS2026001",
    fullName: "Nguyễn Văn An",
    email: "an.nguyen@schoolpro.edu.vn",
    major: "Lớp 10A1",
    faculty: "Trường Trung học phổ thông SchoolPro",
    cohort: "Niên khóa 2026 - 2027",
    academicYear: "2026 - 2027",
    currentSemester: "Học kỳ 1",
    currentWeek: 4,
    avatarUrl: "https://example.com/avatar.jpg",
    className: "10A1",
    homeroomTeacher: "Trần Thị Văn",
  };

  it("renders student name, academic badges, and homeroom teacher", () => {
    render(
      <MemoryRouter>
        <WelcomeBanner profile={mockProfile} />
      </MemoryRouter>
    );

    // Checks student welcome greeting
    expect(screen.getByText(/Nguyễn Văn An/)).toBeInTheDocument();

    // Checks homeroom teacher display and label
    expect(screen.getByText("Giáo viên chủ nhiệm")).toBeInTheDocument();
    expect(screen.getByText("Trần Thị Văn")).toBeInTheDocument();

    // Checks academic badges
    expect(screen.getByText(/Học kỳ 1/)).toBeInTheDocument();
    expect(screen.getByText(/2026 - 2027/)).toBeInTheDocument();
    expect(screen.getByText("Lớp 10A1")).toBeInTheDocument();
  });

  it("renders fallback homeroom teacher when not specified in profile", () => {
    const minimalProfile: StudentProfile = {
      ...mockProfile,
      homeroomTeacher: undefined,
      homeroomTeacherName: undefined,
    };

    render(
      <MemoryRouter>
        <WelcomeBanner profile={minimalProfile} />
      </MemoryRouter>
    );

    expect(screen.getByText("Chưa phân công")).toBeInTheDocument();
  });
});
