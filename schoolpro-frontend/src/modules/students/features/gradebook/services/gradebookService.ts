import type {
  SubjectGradeItem,
  GradeSummary,
  GradeFilter,
} from "@/modules/students/features/gradebook/types";
import {
  mockGradeSummary,
  mockSubjectGrades,
} from "@/modules/students/features/gradebook/services/mock/mockGradebookData";

class GradebookService {
  private summary: GradeSummary = { ...mockGradeSummary };
  private grades: SubjectGradeItem[] = [...mockSubjectGrades];
  private latency = 200;

  /**
   * Lấy tổng quan học lực và học bạ
   */
  async getGradeSummary(): Promise<GradeSummary> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.summary);
      }, this.latency);
    });
  }

  /**
   * Lấy danh sách bảng điểm chi tiết các môn học (hỗ trợ tìm kiếm, lọc xếp loại, sắp xếp)
   */
  async getSubjectGrades(
    filter?: Partial<GradeFilter>,
  ): Promise<{ items: SubjectGradeItem[]; total: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...this.grades];

        // 1. Search Query (Tên môn, mã môn, giáo viên, nhận xét)
        if (filter?.searchQuery && filter.searchQuery.trim()) {
          const q = filter.searchQuery.toLowerCase().trim();
          result = result.filter(
            (item) =>
              item.name.toLowerCase().includes(q) ||
              item.code.toLowerCase().includes(q) ||
              item.teacher.toLowerCase().includes(q) ||
              item.teacherComment.toLowerCase().includes(q),
          );
        }

        // 2. Classification filter
        if (filter?.classification && filter.classification !== "all") {
          if (filter.classification === "feedback_only") {
            result = result.filter((item) => item.evaluationType === "feedback");
          } else if (filter.classification === "excellent") {
            result = result.filter(
              (item) => item.evaluationType === "score" && (item.averageScore || 0) >= 8.0,
            );
          } else if (filter.classification === "good") {
            result = result.filter(
              (item) =>
                item.evaluationType === "score" &&
                (item.averageScore || 0) >= 6.5 &&
                (item.averageScore || 0) < 8.0,
            );
          } else if (filter.classification === "average") {
            result = result.filter(
              (item) => item.evaluationType === "score" && (item.averageScore || 0) < 6.5,
            );
          }
        }

        // 3. Sort
        if (filter?.sortBy) {
          switch (filter.sortBy) {
            case "gpa_desc":
              result.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
              break;
            case "gpa_asc":
              result.sort((a, b) => (a.averageScore || 0) - (b.averageScore || 0));
              break;
            case "name_asc":
            default:
              result.sort((a, b) => a.name.localeCompare(b.name, "vi"));
              break;
          }
        }

        resolve({ items: result, total: result.length });
      }, this.latency);
    });
  }

  /**
   * Lấy chi tiết điểm của một môn học
   */
  async getSubjectGradeById(id: string): Promise<SubjectGradeItem | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = this.grades.find((g) => g.id === id || g.code === id);
        resolve(found || null);
      }, this.latency);
    });
  }
}

export const gradebookService = new GradebookService();
