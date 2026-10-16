export type MaterialCategory =
  | "lecture"
  | "outline"
  | "textbook"
  | "exam_prep"
  | "reference";

export type MaterialFormat =
  | "pdf"
  | "word"
  | "excel"
  | "powerpoint"
  | "video"
  | "audio"
  | "archive";

export type MaterialViewMode = "grid" | "list";

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  teacher: string;
  teacherTitle: string;
  semester: string;
  academicYear: string;
  colorScheme: "blue" | "purple" | "emerald" | "amber" | "rose" | "indigo" | "cyan" | "teal" | "orange";
  description: string;
  totalMaterials: number;
  lecturesCount: number;
  outlinesCount: number;
  examsCount: number;
  totalDownloads: number;
}

export interface MaterialItem {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  category: MaterialCategory;
  format: MaterialFormat;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  previewUrl?: string;
  author: string;
  uploadDate: string; // YYYY-MM-DD
  downloadsCount: number;
  viewsCount: number;
  semester: string; // "HK1" | "HK2" | "all"
  academicYear: string;
  description: string;
  tableOfContents?: string[];
  isBookmarked?: boolean;
  isFeatured?: boolean;
}

export interface MaterialSummary {
  total: number;
  lecturesCount: number;
  outlinesCount: number;
  textbooksCount: number;
  examPrepsCount: number;
  totalDownloads: number;
}

export interface MaterialFilter {
  searchQuery: string;
  academicYear: string;
  subject: string;
  category: string;
  semester: string;
  sortBy: "newest" | "most_downloaded" | "title_asc" | "size_asc";
  viewMode: MaterialViewMode;
  page: number;
  pageSize: number;
}

export interface SubjectFilter {
  searchQuery: string;
  semester: string;
  sortBy: "name_asc" | "most_materials" | "most_downloads";
  viewMode?: MaterialViewMode;
  page: number;
  pageSize: number;
}
