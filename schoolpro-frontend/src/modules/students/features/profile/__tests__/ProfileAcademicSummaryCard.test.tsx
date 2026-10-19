import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProfileAcademicSummaryCard } from "@/modules/students/features/profile/components/ProfileAcademicSummaryCard";

describe("ProfileAcademicSummaryCard Component", () => {
  it("renders student code, school name, academic year, and semester correctly", () => {
    render(
      <ProfileAcademicSummaryCard
        studentCode="105494395865"
        schoolName="Trường Trung học phổ thông SchoolPro"
        academicYear="2026 - 2027"
        semester="Học kỳ 1"
      />
    );

    expect(screen.getByText("105494395865")).toBeInTheDocument();
    expect(screen.getByText("Trường Trung học phổ thông SchoolPro")).toBeInTheDocument();
    expect(screen.getByText("2026 - 2027")).toBeInTheDocument();
    expect(screen.getByText("Học kỳ 1")).toBeInTheDocument();
  });

  it("falls back to default semester if semester is not provided", () => {
    render(
      <ProfileAcademicSummaryCard
        studentCode="105494395865"
        schoolName="Trường Trung học phổ thông SchoolPro"
        academicYear="2026 - 2027"
      />
    );

    expect(screen.getByText("105494395865")).toBeInTheDocument();
    expect(screen.getByText("Học kỳ 1")).toBeInTheDocument();
  });
});
