import { describe, it, expect } from "vitest";
import { gradebookService } from "@/modules/students/features/gradebook/services/gradebookService";

describe("gradebookService", () => {
  it("getGradeSummary returns valid summary data", async () => {
    const summary = await gradebookService.getGradeSummary();
    expect(summary).toBeDefined();
    expect(summary.gpa).toBeGreaterThanOrEqual(0);
    expect(summary.academicRank).toBeDefined();
    expect(summary.totalClassStudents).toBeGreaterThan(0);
  });

  it("getSubjectGrades returns list of subject grades", async () => {
    const res = await gradebookService.getSubjectGrades({
      searchQuery: "",
      academicYear: "2025-2026",
      semester: "HK1",
      classification: "all",
      sortBy: "gpa_desc",
      viewMode: "table",
    });
    expect(res).toBeDefined();
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.total).toBeGreaterThanOrEqual(res.items.length);
  });

  it("getSubjectGrades returns empty items when filtering with semester having no scores (HK2)", async () => {
    const res = await gradebookService.getSubjectGrades({
      searchQuery: "",
      academicYear: "2025-2026",
      semester: "HK2",
      classification: "all",
      sortBy: "gpa_desc",
      viewMode: "table",
    });
    expect(res).toBeDefined();
    expect(res.items).toEqual([]);
    expect(res.total).toBe(0);
  });

  it("getSubjectGrades returns empty items when filtering with unknown academic year", async () => {
    const res = await gradebookService.getSubjectGrades({
      searchQuery: "",
      academicYear: "2010-2011",
      semester: "HK1",
      classification: "all",
      sortBy: "gpa_desc",
      viewMode: "table",
    });
    expect(res).toBeDefined();
    expect(res.items).toEqual([]);
    expect(res.total).toBe(0);
  });

  it("getTranscript returns student transcript and certification", async () => {
    const transcript = await gradebookService.getTranscript();
    expect(transcript).toBeDefined();
    expect(transcript?.studentName).toBeDefined();
    expect(transcript?.subjects.length).toBeGreaterThan(0);
    expect(transcript?.digitalSignature).toBeDefined();
  });

  it("exportTranscriptPdf returns export metadata", async () => {
    const pdfRes = await gradebookService.exportTranscriptPdf();
    expect(pdfRes).toBeDefined();
    expect(pdfRes.downloadUrl).toBeDefined();
    expect(pdfRes.fileName).toContain(".pdf");
    expect(pdfRes.digitalSignature).toBeDefined();
  });
});
