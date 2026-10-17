import { httpClient } from "@/shared/api/httpClient";
import type { ApiResponse } from "@/shared/types/auth";
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

interface RawBackendMaterial {
  id: string;
  title: string;
  subject_code?: string;
  subjectCode?: string;
  subject_name?: string;
  subjectName?: string;
  category: MaterialItem["category"];
  format: MaterialItem["format"];
  file_name?: string;
  fileName?: string;
  file_size?: string;
  fileSize?: string;
  file_url?: string;
  fileUrl?: string;
  preview_url?: string;
  previewUrl?: string;
  author: string;
  upload_date?: string;
  uploadDate?: string;
  downloads_count?: number;
  downloadsCount?: number;
  views_count?: number;
  viewsCount?: number;
  semester: string;
  academic_year?: string;
  academicYear?: string;
  description: string;
  table_of_contents?: string[];
  tableOfContents?: string[];
  is_bookmarked?: boolean;
  isBookmarked?: boolean;
  is_featured?: boolean;
  isFeatured?: boolean;
}

interface RawBackendSubject {
  id: string;
  code: string;
  name: string;
  teacher: string;
  teacher_title?: string;
  teacherTitle?: string;
  semester?: string;
  academic_year?: string;
  academicYear?: string;
  color_scheme?: SubjectItem["colorScheme"];
  colorScheme?: SubjectItem["colorScheme"];
  description?: string;
  total_materials?: number;
  totalMaterials?: number;
  lectures_count?: number;
  lecturesCount?: number;
  outlines_count?: number;
  outlinesCount?: number;
  exams_count?: number;
  examsCount?: number;
  total_downloads?: number;
  totalDownloads?: number;
}

function mapBackendMaterial(raw: RawBackendMaterial): MaterialItem {
  return {
    id: raw.id,
    title: raw.title,
    subjectCode: raw.subject_code || raw.subjectCode || "",
    subjectName: raw.subject_name || raw.subjectName || "",
    category: raw.category,
    format: raw.format,
    fileName: raw.file_name || raw.fileName || "",
    fileSize: raw.file_size || raw.fileSize || "1.0 MB",
    fileUrl: raw.file_url || raw.fileUrl || "#",
    previewUrl: raw.preview_url || raw.previewUrl,
    author: raw.author,
    uploadDate: raw.upload_date || raw.uploadDate || new Date().toISOString().split("T")[0],
    downloadsCount: raw.downloads_count ?? raw.downloadsCount ?? 0,
    viewsCount: raw.views_count ?? raw.viewsCount ?? 0,
    semester: raw.semester,
    academicYear: raw.academic_year || raw.academicYear || "2026-2027",
    description: raw.description || "",
    tableOfContents: raw.table_of_contents || raw.tableOfContents || [],
    isBookmarked: Boolean(raw.is_bookmarked ?? raw.isBookmarked),
    isFeatured: Boolean(raw.is_featured ?? raw.isFeatured),
  };
}

function mapBackendSubject(raw: RawBackendSubject): SubjectItem {
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    teacher: raw.teacher,
    teacherTitle: raw.teacher_title || raw.teacherTitle || "ThS.",
    semester: raw.semester || "HK1, HK2",
    academicYear: raw.academic_year || raw.academicYear || "2026-2027",
    colorScheme: raw.color_scheme || raw.colorScheme || "blue",
    description: raw.description || "",
    totalMaterials: raw.total_materials ?? raw.totalMaterials ?? 0,
    lecturesCount: raw.lectures_count ?? raw.lecturesCount ?? 0,
    outlinesCount: raw.outlines_count ?? raw.outlinesCount ?? 0,
    examsCount: raw.exams_count ?? raw.examsCount ?? 0,
    totalDownloads: raw.total_downloads ?? raw.totalDownloads ?? 0,
  };
}

class MaterialsService {
  private materials: MaterialItem[] = [...mockMaterialsData];
  private subjects: SubjectItem[] = [...mockSubjectsData];

  /**
   * Lấy danh sách các môn học
   */
  async getSubjects(
    filter?: Partial<SubjectFilter>,
  ): Promise<{ items: SubjectItem[]; total: number }> {
    try {
      const params: Record<string, string | number | undefined> = {};
      if (filter?.searchQuery) params.search = filter.searchQuery;
      if (filter?.semester && filter.semester !== "all") params.semester = filter.semester;
      if (filter?.sortBy) params.ordering = filter.sortBy;
      if (filter?.page) params.page = filter.page;
      if (filter?.pageSize) params.page_size = filter.pageSize;

      const res = await httpClient.get<ApiResponse<{ items: RawBackendSubject[]; total: number }>>(
        "/academic/materials/subjects/",
        { params },
      );
      if (res.data?.data?.items) {
        return {
          items: res.data.data.items.map(mapBackendSubject),
          total: res.data.data.total,
        };
      }
    } catch {
      // Graceful fallback to mock data
    }

    let result = [...this.subjects];

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

    if (filter?.semester && filter.semester !== "all") {
      result = result.filter((item) => item.semester.includes(filter.semester!));
    }

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

    if (filter?.page && filter?.pageSize) {
      const start = (filter.page - 1) * filter.pageSize;
      result = result.slice(start, start + filter.pageSize);
    }

    return { items: result, total };
  }

  /**
   * Lấy thông tin 1 môn học theo mã môn (MATH11, PHYS11...)
   */
  async getSubjectByCode(code: string): Promise<SubjectItem | null> {
    try {
      const res = await httpClient.get<ApiResponse<RawBackendSubject>>(
        "/academic/materials/subject_detail/",
        { params: { code } },
      );
      if (res.data?.data) {
        return mapBackendSubject(res.data.data);
      }
    } catch {
      // Graceful fallback
    }

    const found = this.subjects.find(
      (s) => s.code.toLowerCase() === code.toLowerCase(),
    );
    return found || null;
  }

  /**
   * Lấy danh sách tài liệu học tập
   */
  async getMaterials(
    filter?: Partial<MaterialFilter>,
  ): Promise<{ items: MaterialItem[]; total: number }> {
    try {
      const params: Record<string, string | number | undefined> = {};
      if (filter?.searchQuery) params.search = filter.searchQuery;
      if (filter?.academicYear && filter.academicYear !== "all") params.academic_year = filter.academicYear;
      if (filter?.subject && filter.subject !== "all") params.subject = filter.subject;
      if (filter?.category && filter.category !== "all") params.category = filter.category;
      if (filter?.semester && filter.semester !== "all") params.semester = filter.semester;
      if (filter?.sortBy) params.ordering = filter.sortBy;
      if (filter?.page) params.page = filter.page;
      if (filter?.pageSize) params.page_size = filter.pageSize;

      const res = await httpClient.get<ApiResponse<{ items: RawBackendMaterial[]; total: number }>>(
        "/academic/materials/",
        { params },
      );
      if (res.data?.data?.items) {
        return {
          items: res.data.data.items.map(mapBackendMaterial),
          total: res.data.data.total,
        };
      }
    } catch {
      // Graceful fallback to mock data
    }

    let result = [...this.materials];

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

    if (filter?.academicYear && filter.academicYear !== "all") {
      const yearClean = filter.academicYear.replace(/[^0-9]/g, "");
      result = result.filter(
        (item) =>
          item.academicYear.includes(filter.academicYear!) ||
          (yearClean && item.academicYear.replace(/[^0-9]/g, "").includes(yearClean)),
      );
    }

    if (filter?.subject && filter.subject !== "all") {
      result = result.filter(
        (item) => item.subjectCode.toLowerCase() === filter.subject!.toLowerCase(),
      );
    }

    if (filter?.category && filter.category !== "all") {
      result = result.filter((item) => item.category === filter.category);
    }

    if (filter?.semester && filter.semester !== "all") {
      const sem = filter.semester.toLowerCase();
      result = result.filter((item) => {
        const itemSem = item.semester.toLowerCase();
        if (sem.includes("1") || sem.includes("hk1")) return itemSem.includes("hk1") || itemSem.includes("1");
        if (sem.includes("2") || sem.includes("hk2")) return itemSem.includes("hk2") || itemSem.includes("2");
        return itemSem.includes(sem);
      });
    }

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

    if (filter?.page && filter?.pageSize) {
      const start = (filter.page - 1) * filter.pageSize;
      result = result.slice(start, start + filter.pageSize);
    }

    return { items: result, total };
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

  async getSummary(): Promise<MaterialSummary> {
    try {
      const res = await httpClient.get<ApiResponse<MaterialSummary>>("/academic/materials/summary/");
      if (res.data?.data) {
        return res.data.data;
      }
    } catch {
      // Graceful fallback
    }
    return this.calculateSummary(this.materials);
  }

  getSubjectsList(): { code: string; name: string }[] {
    return this.subjects.map((s) => ({ code: s.code, name: s.name }));
  }

  toggleBookmark(id: string): boolean {
    const item = this.materials.find((m) => m.id === id);
    let newState = false;
    if (item) {
      item.isBookmarked = !item.isBookmarked;
      newState = item.isBookmarked;
    }
    httpClient.post(`/academic/materials/${id}/bookmark/`).catch(() => {
      // Silent catch
    });
    return newState;
  }

  async getMaterialById(id: string): Promise<MaterialItem | null> {
    try {
      const res = await httpClient.get<ApiResponse<RawBackendMaterial>>(`/academic/materials/${id}/`);
      if (res.data?.data) {
        return mapBackendMaterial(res.data.data);
      }
    } catch {
      // Fallback to local memory mock data
    }
    const found = this.materials.find((m) => m.id === id);
    return found ? { ...found } : null;
  }

  incrementDownload(id: string): void {
    const item = this.materials.find((m) => m.id === id);
    if (item) {
      item.downloadsCount += 1;
    }
    httpClient.post(`/academic/materials/${id}/download/`).catch(() => {
      // Silent catch
    });
  }
}

export const materialsService = new MaterialsService();
