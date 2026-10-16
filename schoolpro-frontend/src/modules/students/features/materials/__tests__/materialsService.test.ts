import { describe, it, expect } from "vitest";
import { materialsService } from "@/modules/students/features/materials/services/materialsService";

describe("materialsService", () => {
  it("should calculate summary metrics correctly", () => {
    const mockItems = [
      {
        id: "1",
        title: "Bài giảng 1",
        subjectCode: "MATH11",
        subjectName: "Toán học",
        category: "lecture" as const,
        format: "pdf" as const,
        fileName: "lecture1.pdf",
        fileSize: "2.5 MB",
        fileUrl: "#",
        author: "Thầy Hùng",
        uploadDate: "2026-10-01",
        downloadsCount: 15,
        viewsCount: 30,
        semester: "HK1",
        academicYear: "2026-2027",
        description: "Mô tả bài giảng",
      },
      {
        id: "2",
        title: "Đề cương 1",
        subjectCode: "MATH11",
        subjectName: "Toán học",
        category: "outline" as const,
        format: "word" as const,
        fileName: "outline1.docx",
        fileSize: "1.2 MB",
        fileUrl: "#",
        author: "Cô Mai",
        uploadDate: "2026-10-02",
        downloadsCount: 25,
        viewsCount: 50,
        semester: "HK1",
        academicYear: "2026-2027",
        description: "Mô tả đề cương",
      },
      {
        id: "3",
        title: "Sách giáo khoa Toán 11",
        subjectCode: "MATH11",
        subjectName: "Toán học",
        category: "textbook" as const,
        format: "pdf" as const,
        fileName: "sgk_toan.pdf",
        fileSize: "15 MB",
        fileUrl: "#",
        author: "Bộ GD&ĐT",
        uploadDate: "2026-09-01",
        downloadsCount: 100,
        viewsCount: 300,
        semester: "HK1",
        academicYear: "2026-2027",
        description: "Sách giáo khoa chính thức",
      },
    ];

    const summary = materialsService.calculateSummary(mockItems);
    expect(summary.total).toBe(3);
    expect(summary.lecturesCount).toBe(1);
    expect(summary.outlinesCount).toBe(1);
    expect(summary.textbooksCount).toBe(1);
    expect(summary.examPrepsCount).toBe(0);
    expect(summary.totalDownloads).toBe(140);
  });

  it("should get subjects list with code and name", () => {
    const list = materialsService.getSubjectsList();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty("code");
    expect(list[0]).toHaveProperty("name");
  });

  it("should get subjects with filtering", async () => {
    const res = await materialsService.getSubjects({ searchQuery: "Toán" });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.some((s) => s.name.includes("Toán"))).toBe(true);
  });

  it("should get subject by code", async () => {
    const subject = await materialsService.getSubjectByCode("MATH11");
    expect(subject).not.toBeNull();
    expect(subject?.code).toBe("MATH11");
  });

  it("should toggle bookmark on item", () => {
    const items = materialsService.getSubjectsList();
    expect(items.length).toBeGreaterThan(0);
    const result = materialsService.toggleBookmark("mat-01");
    expect(typeof result).toBe("boolean");
  });
});
