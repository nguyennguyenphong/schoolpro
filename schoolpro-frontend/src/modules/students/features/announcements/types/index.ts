export interface AnnouncementItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  publishDate: string;
  department: string;
  isImportant: boolean;
  category: "registration" | "exam" | "scholarship" | "finance" | "activity" | "general";
  attachments?: Array<{ name: string; url: string; size?: string }>;
}
