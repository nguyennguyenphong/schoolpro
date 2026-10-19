import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProfileBasicInfoTab } from "@/modules/students/features/profile/components/ProfileBasicInfoTab";
import { MOCK_STUDENT_PROFILE } from "@/modules/students/features/profile/services/mockProfileData";

describe("ProfileBasicInfoTab Guided Wizard", () => {
  const personalInfo = MOCK_STUDENT_PROFILE.personalInfo;

  it("renders steps, progress indicator, and active step fields", () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(
      <ProfileBasicInfoTab
        personalInfo={personalInfo}
        onSave={onSave}
        disabled={false}
      />
    );

    // Identity fields in step 0
    expect(screen.getByDisplayValue("105494395865")).toBeInTheDocument();
    expect(screen.getByDisplayValue("hocsinh_01")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Đỗ Minh Quân")).toBeInTheDocument();

    // Next step button and Save button
    expect(screen.getByRole("button", { name: /tiếp theo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /lưu thay đổi/i })).toBeInTheDocument();
  });

  it("advances step when clicking Next Step button and allows going back", () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(
      <ProfileBasicInfoTab
        personalInfo={personalInfo}
        onSave={onSave}
        disabled={false}
      />
    );

    const nextBtn = screen.getByRole("button", { name: /tiếp theo/i });
    fireEvent.click(nextBtn);

    // Step 1: Contact section is now visible and Previous button appears
    const backBtn = screen.getByRole("button", { name: /quay lại/i });
    expect(backBtn).toBeInTheDocument();

    // Clicking Previous returns to step 0
    fireEvent.click(backBtn);
    expect(screen.queryByRole("button", { name: /quay lại/i })).not.toBeInTheDocument();
  });

  it("submits unified payload on save button click", async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(
      <ProfileBasicInfoTab
        personalInfo={personalInfo}
        onSave={onSave}
        disabled={false}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /lưu thay đổi/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
      const callArg = onSave.mock.calls[0][0];
      expect(callArg.username).toBe("hocsinh_01");
      expect(callArg.fullName).toBe("Đỗ Minh Quân");
      expect(callArg.phone).toBe("0912 345 810");
      expect(callArg.insuranceCardNumber).toBe("GD4790234567891");
    });
  });

  it("resets form values when clicking the reset button", () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(
      <ProfileBasicInfoTab
        personalInfo={personalInfo}
        onSave={onSave}
        disabled={false}
      />
    );

    const preferredNameInput = screen.getByDisplayValue("Minh Quân");
    fireEvent.change(preferredNameInput, { target: { value: "Quân Đỗ New" } });
    expect(screen.getByDisplayValue("Quân Đỗ New")).toBeInTheDocument();

    const resetBtn = screen.getByRole("button", { name: /đặt lại/i });
    fireEvent.click(resetBtn);

    expect(screen.getByDisplayValue("Minh Quân")).toBeInTheDocument();
  });
});
