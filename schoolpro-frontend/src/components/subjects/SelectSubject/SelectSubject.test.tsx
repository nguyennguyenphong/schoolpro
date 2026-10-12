import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SelectSubject } from "@/components/subjects/SelectSubject";
import { subjectApi } from "@/components/subjects/SelectSubject/services/subjectApi";
import type { SubjectItem } from "@/components/subjects/SelectSubject/types";

const TEST_SUBJECTS: SubjectItem[] = [
  {
    id: "1a4d7b21-8c92-4e11-9a10-2b3c4d5e6f01",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    department_id: "ecf6a9a8-cd10-4b32-9287-cd6f394c1571",
    code: "SUB_MATH101",
    name: "Toán",
    short_name: "Toán",
    evaluation_type: "SCORE",
    is_compulsory: true,
    is_active: true,
  },
  {
    id: "2b5e8c32-9d03-4f22-ab21-3c4d5e6f7a02",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    department_id: "e95ff85f-ecbe-4286-ab55-95ffeed75e07",
    code: "SUB_LIT102",
    name: "Ngữ văn",
    short_name: "Văn",
    evaluation_type: "SCORE",
    is_compulsory: true,
    is_active: true,
  },
  {
    id: "0d36041a-158b-47aa-c309-1e2f3a4b5c10",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    department_id: "fffc5c55-3003-4df0-b28b-fe746414fd31",
    code: "SUB_PHYS110",
    name: "Vật lí",
    short_name: "Lý",
    evaluation_type: "SCORE",
    is_compulsory: false,
    is_active: true,
  },
];

describe("SelectSubject Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders correctly with default placeholder", () => {
      render(<SelectSubject customSubjects={TEST_SUBJECTS} />);
      expect(screen.getByText("Chọn môn học")).toBeInTheDocument();
    });

    it("renders with custom placeholder", () => {
      render(
        <SelectSubject
          placeholder="Vui lòng chọn môn học"
          customSubjects={TEST_SUBJECTS}
        />,
      );
      expect(screen.getByText("Vui lòng chọn môn học")).toBeInTheDocument();
    });

    it("renders with disabled state", () => {
      const { container } = render(
        <SelectSubject disabled customSubjects={TEST_SUBJECTS} />,
      );
      const selectElement = container.querySelector(".ant-select-disabled");
      expect(selectElement).toBeInTheDocument();
    });

    it("renders with custom className", () => {
      const { container } = render(
        <SelectSubject
          className="custom-subject-class"
          customSubjects={TEST_SUBJECTS}
        />,
      );
      expect(
        container.querySelector(".custom-subject-class"),
      ).toBeInTheDocument();
    });

    it("renders options with code prefix when showCodePrefix is true", async () => {
      render(<SelectSubject showCodePrefix customSubjects={TEST_SUBJECTS} />);

      const combobox = screen.getByRole("combobox");
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(screen.getByTitle("Toán")).toBeInTheDocument();
      });
    });
  });

  describe("Value & Code Resolution", () => {
    it("resolves value given by UUID", () => {
      render(
        <SelectSubject
          value="1a4d7b21-8c92-4e11-9a10-2b3c4d5e6f01"
          customSubjects={TEST_SUBJECTS}
        />,
      );
      expect(screen.getByText("Toán")).toBeInTheDocument();
    });

    it("resolves value given by code (SUB_MATH101)", () => {
      render(
        <SelectSubject value="SUB_MATH101" customSubjects={TEST_SUBJECTS} />,
      );
      expect(screen.getByText("Toán")).toBeInTheDocument();
    });
  });

  describe("Selection & Change handling", () => {
    it("selects a subject and triggers onChange", async () => {
      const handleChange = vi.fn();

      render(
        <SelectSubject
          customSubjects={TEST_SUBJECTS}
          onChange={handleChange}
        />,
      );

      const combobox = screen.getByRole("combobox");
      expect(combobox).toBeInTheDocument();
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(screen.getByTitle("Ngữ văn")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle("Ngữ văn"));

      expect(handleChange).toHaveBeenCalledWith(
        "2b5e8c32-9d03-4f22-ab21-3c4d5e6f7a02",
        expect.anything(),
      );
    });

    it("renders 'Tất cả môn học' option when includeAllOption is true", () => {
      render(
        <SelectSubject
          customSubjects={TEST_SUBJECTS}
          includeAllOption
          value="all"
        />,
      );

      expect(screen.getByText("Tất cả môn học")).toBeInTheDocument();
    });
  });

  describe("API integration", () => {
    it("fetches subjects from subjectApi on mount when customSubjects is omitted", async () => {
      const spy = vi
        .spyOn(subjectApi, "fetchSubjects")
        .mockResolvedValueOnce(TEST_SUBJECTS);

      render(<SelectSubject />);

      await waitFor(() => {
        expect(spy).toHaveBeenCalled();
      });

      const combobox = screen.getByRole("combobox");
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(screen.getByTitle("Vật lí")).toBeInTheDocument();
      });

      spy.mockRestore();
    });
  });
});
