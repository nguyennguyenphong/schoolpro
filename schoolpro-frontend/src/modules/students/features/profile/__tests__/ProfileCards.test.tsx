import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProfileIdentityCard } from "@/modules/students/features/profile/components/sections/ProfileIdentityCard";
import { ProfileContactCard } from "@/modules/students/features/profile/components/sections/ProfileContactCard";
import { ProfileResidenceCard } from "@/modules/students/features/profile/components/sections/ProfileResidenceCard";
import { ProfileOrganizationCard } from "@/modules/students/features/profile/components/sections/ProfileOrganizationCard";
import { MOCK_STUDENT_PROFILE } from "@/modules/students/features/profile/services/mockProfileData";

describe("Profile Independent Cards", () => {
  const personalInfo = MOCK_STUDENT_PROFILE.personalInfo;

  it("renders ProfileIdentityCard with fields and save button", () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(
      <ProfileIdentityCard
        personalInfo={personalInfo}
        onSave={onSave}
        disabled={false}
      />
    );

    expect(screen.getByDisplayValue("105494395865")).toBeInTheDocument();
    expect(screen.getByDisplayValue("hocsinh_01")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Đỗ Minh Quân")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /lưu thay đổi/i })).toBeInTheDocument();
  });

  it("renders ProfileContactCard with phone, email, and bio", () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(
      <ProfileContactCard
        personalInfo={personalInfo}
        onSave={onSave}
        disabled={false}
      />
    );

    expect(screen.getByDisplayValue("0912 345 810")).toBeInTheDocument();
    expect(screen.getByDisplayValue("hocsinh_01@schoolpro.edu.vn")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Học sinh lớp 10A1 chuyên Khoa học Tự nhiên")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /lưu thay đổi/i })).toBeInTheDocument();
  });

  it("renders ProfileResidenceCard with birthplace and addresses", () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(
      <ProfileResidenceCard
        personalInfo={personalInfo}
        onSave={onSave}
        disabled={false}
      />
    );

    expect(screen.getByDisplayValue("TP. Hồ Chí Minh")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Kinh")).toBeInTheDocument();
    expect(screen.getByDisplayValue("HK-750102")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /lưu thay đổi/i })).toBeInTheDocument();
  });

  it("renders ProfileOrganizationCard with insurance card and notes", () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(
      <ProfileOrganizationCard
        personalInfo={personalInfo}
        onSave={onSave}
        disabled={false}
      />
    );

    expect(screen.getByDisplayValue("GD4790234567891")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Thành viên Đội tuyển Olympic Tin học trẻ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /lưu thay đổi/i })).toBeInTheDocument();
  });
});
