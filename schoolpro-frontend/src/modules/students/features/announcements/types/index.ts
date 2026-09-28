export type AnnouncementCategory =
  | "all"
  | "general"
  | "academic"
  | "exam"
  | "tuition"
  | "activity"
  | "homeroom";

export type AnnouncementPriority = "urgent" | "high" | "normal";

export type AnnouncementSortOption = "newest" | "oldest" | "views" | "priority";

export interface AnnouncementAttachment {
  id: string;
  name: string;
  url: string;
  size: string;
  fileType: "pdf" | "doc" | "docx" | "xlsx" | "image";
}

export interface AnnouncementItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishDate: string;
  author: string;
  department: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  isPinned: boolean;
  isRead: boolean;
  viewsCount: number;
  targetAudience?: string;
  attachments?: AnnouncementAttachment[];
}

export interface AnnouncementFilter {
  searchQuery: string;
  category: AnnouncementCategory;
  department: string;
  readStatus: "all" | "unread" | "read";
  priority: "all" | "urgent" | "high" | "normal";
  sortBy: AnnouncementSortOption;
  viewMode: "grid" | "list";
  page: number;
  pageSize: number;
}

export interface AnnouncementListResult {
  items: AnnouncementItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AnnouncementSummary {
  total: number;
  unreadCount: number;
  urgentCount: number;
  academicCount: number;
  examCount: number;
  activityCount: number;
}
