import type { FileCategory } from "@/modules/students/features/assignments/types";
import type { IconName } from "@/components/ui/Icon/types";

export interface FileCategoryMeta {
  category: FileCategory;
  title: string;
  badge: string;
  extensions: string[];
  acceptAttr: string;
  iconName: IconName;
  theme: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    iconBg: string;
  };
  sampleTip: string;
}

export const FILE_CATEGORIES_META: Record<FileCategory, FileCategoryMeta> = {
  word: {
    category: "word",
    title: "Văn bản Word",
    badge: "DOC / DOCX",
    extensions: [".doc", ".docx", ".rtf", ".odt"],
    acceptAttr: ".doc,.docx,.rtf,.odt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    iconName: "file-text",
    theme: {
      bg: "bg-blue-50/70",
      text: "text-blue-700",
      border: "border-blue-200",
      badgeBg: "bg-blue-100 text-blue-800",
      iconBg: "bg-blue-600 text-white",
    },
    sampleTip: "Bài luận văn, đề cương, báo cáo thu hoạch...",
  },
  excel: {
    category: "excel",
    title: "Bảng tính Excel",
    badge: "XLS / XLSX / CSV",
    extensions: [".xls", ".xlsx", ".csv"],
    acceptAttr: ".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv",
    iconName: "file-spreadsheet",
    theme: {
      bg: "bg-emerald-50/70",
      text: "text-emerald-700",
      border: "border-emerald-200",
      badgeBg: "bg-emerald-100 text-emerald-800",
      iconBg: "bg-emerald-600 text-white",
    },
    sampleTip: "Số liệu thí nghiệm Lý/Hóa, bảng khảo sát...",
  },
  pdf: {
    category: "pdf",
    title: "Tài liệu PDF",
    badge: "PDF",
    extensions: [".pdf"],
    acceptAttr: ".pdf,application/pdf",
    iconName: "file",
    theme: {
      bg: "bg-rose-50/70",
      text: "text-rose-700",
      border: "border-rose-200",
      badgeBg: "bg-rose-100 text-rose-800",
      iconBg: "bg-rose-600 text-white",
    },
    sampleTip: "File scan bài giải viết tay, bài tập xuất PDF...",
  },
  image: {
    category: "image",
    title: "Hình ảnh",
    badge: "JPG / PNG / WEBP",
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic"],
    acceptAttr: "image/jpeg,image/png,image/webp,image/gif,image/heic,.jpg,.jpeg,.png,.webp,.heic",
    iconName: "image",
    theme: {
      bg: "bg-indigo-50/70",
      text: "text-indigo-700",
      border: "border-indigo-200",
      badgeBg: "bg-indigo-100 text-indigo-800",
      iconBg: "bg-indigo-600 text-white",
    },
    sampleTip: "Ảnh chụp tập vở, bài giải Toán/Lý, sơ đồ tư duy...",
  },
  video: {
    category: "video",
    title: "Video Clip",
    badge: "MP4 / MOV / WEBM",
    extensions: [".mp4", ".mov", ".avi", ".mkv", ".webm"],
    acceptAttr: "video/mp4,video/quicktime,video/webm,video/x-msvideo,.mp4,.mov,.avi,.webm",
    iconName: "video",
    theme: {
      bg: "bg-purple-50/70",
      text: "text-purple-700",
      border: "border-purple-200",
      badgeBg: "bg-purple-100 text-purple-800",
      iconBg: "bg-purple-600 text-white",
    },
    sampleTip: "Video thuyết trình nhóm, bài thể dục, kịch tiếng Anh...",
  },
  audio: {
    category: "audio",
    title: "Âm thanh / Ghi âm",
    badge: "MP3 / WAV / M4A",
    extensions: [".mp3", ".wav", ".m4a", ".aac", ".ogg"],
    acceptAttr: "audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/aac,audio/ogg,.mp3,.wav,.m4a,.aac,.ogg",
    iconName: "music",
    theme: {
      bg: "bg-amber-50/70",
      text: "text-amber-700",
      border: "border-amber-200",
      badgeBg: "bg-amber-100 text-amber-800",
      iconBg: "bg-amber-600 text-white",
    },
    sampleTip: "Ghi âm phát âm tiếng Anh, phần đọc thơ, thuyết minh...",
  },
  archive: {
    category: "archive",
    title: "Tệp nén ZIP / RAR",
    badge: "ZIP / RAR",
    extensions: [".zip", ".rar", ".7z", ".tar"],
    acceptAttr: ".zip,.rar,.7z,.tar,application/zip,application/x-rar-compressed",
    iconName: "file-archive",
    theme: {
      bg: "bg-slate-100/80",
      text: "text-slate-700",
      border: "border-slate-300",
      badgeBg: "bg-slate-200 text-slate-800",
      iconBg: "bg-slate-600 text-white",
    },
    sampleTip: "Gói nhiều file bài làm kèm tài liệu tham khảo...",
  },
  other: {
    category: "other",
    title: "Tệp tin khác",
    badge: "FILE",
    extensions: [],
    acceptAttr: "*/*",
    iconName: "file",
    theme: {
      bg: "bg-slate-50",
      text: "text-slate-600",
      border: "border-[#f0f0f0]",
      badgeBg: "bg-slate-100 text-slate-700",
      iconBg: "bg-slate-500 text-white",
    },
    sampleTip: "Tệp đính kèm học tập khác...",
  },
};

export function detectFileType(fileName: string): FileCategory {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["doc", "docx", "rtf", "odt"].includes(ext)) return "word";
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "webp", "gif", "svg", "heic"].includes(ext)) return "image";
  if (["mp4", "mov", "avi", "mkv", "webm", "3gp"].includes(ext)) return "video";
  if (["mp3", "wav", "m4a", "aac", "ogg", "flac"].includes(ext)) return "audio";
  if (["zip", "rar", "7z", "tar"].includes(ext)) return "archive";
  return "other";
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const ALL_ACCEPTED_ATTR = [
  ...FILE_CATEGORIES_META.word.extensions,
  ...FILE_CATEGORIES_META.excel.extensions,
  ...FILE_CATEGORIES_META.pdf.extensions,
  ...FILE_CATEGORIES_META.image.extensions,
  ...FILE_CATEGORIES_META.video.extensions,
  ...FILE_CATEGORIES_META.audio.extensions,
  ...FILE_CATEGORIES_META.archive.extensions,
].join(",");

export function isDueDatePassed(dueDateStr: string): boolean {
  if (!dueDateStr) return false;
  try {
    const formatted = dueDateStr.includes("T") ? dueDateStr : dueDateStr.replace(" ", "T");
    const dueTime = new Date(formatted).getTime();
    if (isNaN(dueTime)) return false;
    return dueTime < Date.now();
  } catch {
    return false;
  }
}

