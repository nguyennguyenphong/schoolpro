import type {
  MaterialItem,
  MaterialSummary,
  MaterialFilter,
  SubjectItem,
  SubjectFilter,
} from "@/modules/students/features/materials/types";
import {
  mockMaterialsData,
  mockSubjectsData,
} from "@/modules/students/features/materials/services/mock/mockMaterialsData";

class MaterialsService {
  private materials: MaterialItem[] = [...mockMaterialsData];
  private subjects: SubjectItem[] = [...mockSubjectsData];
  private latency = 200;

  /**
   * Lấy danh sách các môn học
   */
  async getSubjects(
    filter?: Partial<SubjectFilter>,
  ): Promise<{ items: SubjectItem[]; total: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...this.subjects];

        // 1. Search Query (Tên môn, mã môn, giáo viên)
        if (filter?.searchQuery && filter.searchQuery.trim()) {
          const q = filter.searchQuery.toLowerCase().trim();
          result = result.filter(
            (item) =>
              item.name.toLowerCase().includes(q) ||
              item.code.toLowerCase().includes(q) ||
              item.teacher.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q),
          );
        }

        // 2. Semester filter
        if (filter?.semester && filter.semester !== "all") {
          result = result.filter((item) => item.semester.includes(filter.semester!));
        }

        // 3. Sort
        if (filter?.sortBy) {
          switch (filter.sortBy) {
            case "most_materials":
              result.sort((a, b) => b.totalMaterials - a.totalMaterials);
              break;
            case "most_downloads":
              result.sort((a, b) => b.totalDownloads - a.totalDownloads);
              break;
            case "name_asc":
            default:
              result.sort((a, b) => a.name.localeCompare(b.name));
              break;
          }
        }

        const total = result.length;

        // 4. Pagination
        if (filter?.page && filter?.pageSize) {
          const start = (filter.page - 1) * filter.pageSize;
          result = result.slice(start, start + filter.pageSize);
        }

        resolve({ items: result, total });
      }, this.latency);
    });
  }

  /**
   * Lấy thông tin 1 môn học theo mã môn (MATH11, PHYS11...)
   */
  async getSubjectByCode(code: string): Promise<SubjectItem | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = this.subjects.find(
          (s) => s.code.toLowerCase() === code.toLowerCase(),
        );
        resolve(found || null);
      }, this.latency);
    });
  }

  /**
   * Lấy danh sách tài liệu học tập (hỗ trợ lọc theo môn, danh mục, học kỳ - BỎ ĐỊNH DẠNG)
   */
  async getMaterials(
    filter?: Partial<MaterialFilter>,
  ): Promise<{ items: MaterialItem[]; total: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...this.materials];

        // 1. Search Query
        if (filter?.searchQuery && filter.searchQuery.trim()) {
          const q = filter.searchQuery.toLowerCase().trim();
          result = result.filter(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              item.subjectName.toLowerCase().includes(q) ||
              item.author.toLowerCase().includes(q) ||
              item.fileName.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q),
          );
        }

        // 2. Subject filter
        if (filter?.subject && filter.subject !== "all") {
          result = result.filter(
            (item) =>
              item.subjectCode.toLowerCase() === filter.subject!.toLowerCase(),
          );
        }

        // 3. Category filter
        if (filter?.category && filter.category !== "all") {
          result = result.filter((item) => item.category === filter.category);
        }

        // 4. Semester filter
        if (filter?.semester && filter.semester !== "all") {
          result = result.filter((item) => item.semester === filter.semester);
        }

        // 5. Sort
        if (filter?.sortBy) {
          switch (filter.sortBy) {
            case "most_downloaded":
              result.sort((a, b) => b.downloadsCount - a.downloadsCount);
              break;
            case "title_asc":
              result.sort((a, b) => a.title.localeCompare(b.title));
              break;
            case "size_asc":
              result.sort((a, b) => parseFloat(a.fileSize) - parseFloat(b.fileSize));
              break;
            case "newest":
            default:
              result.sort(
                (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
              );
              break;
          }
        }

        const total = result.length;

        // 6. Pagination
        if (filter?.page && filter?.pageSize) {
          const start = (filter.page - 1) * filter.pageSize;
          result = result.slice(start, start + filter.pageSize);
        }

        resolve({ items: result, total });
      }, this.latency);
    });
  }

  /**
   * Lấy tài liệu của 1 môn học cụ thể
   */
  async getMaterialsBySubject(
    subjectCode: string,
    filter?: Partial<MaterialFilter>,
  ): Promise<{ items: MaterialItem[]; total: number }> {
    return this.getMaterials({ ...filter, subject: subjectCode });
  }

  calculateSummary(items: MaterialItem[]): MaterialSummary {
    const total = items.length;
    const lecturesCount = items.filter((m) => m.category === "lecture").length;
    const outlinesCount = items.filter((m) => m.category === "outline").length;
    const textbooksCount = items.filter((m) => m.category === "textbook").length;
    const examPrepsCount = items.filter((m) => m.category === "exam_prep").length;
    const totalDownloads = items.reduce((acc, cur) => acc + cur.downloadsCount, 0);

    return {
      total,
      lecturesCount,
      outlinesCount,
      textbooksCount,
      examPrepsCount,
      totalDownloads,
    };
  }

  getSubjectsList(): { code: string; name: string }[] {
    return this.subjects.map((s) => ({ code: s.code, name: s.name }));
  }

  toggleBookmark(id: string): boolean {
    const item = this.materials.find((m) => m.id === id);
    if (item) {
      item.isBookmarked = !item.isBookmarked;
      return item.isBookmarked;
    }
    return false;
  }

  incrementDownload(id: string): void {
    const item = this.materials.find((m) => m.id === id);
    if (item) {
      item.downloadsCount += 1;
    }
  }
}

export const materialsService = new MaterialsService();
