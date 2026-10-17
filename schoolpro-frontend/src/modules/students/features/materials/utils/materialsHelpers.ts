import type { TFunction } from "i18next";
import { message } from "@/components/ui/Message";
import type {
  MaterialCategory,
  MaterialFileItem,
  MaterialFormat,
  MaterialItem,
  SubjectItem,
} from "@/modules/students/features/materials/types";
import { materialsService } from "@/modules/students/features/materials/services";

/**
 * Tag color mapping for each material category
 */
export const MATERIAL_CATEGORY_COLORS: Record<MaterialCategory, string> = {
  lecture: "blue",
  outline: "orange",
  textbook: "purple",
  exam_prep: "green",
  reference: "default",
};

/**
 * Returns translated label and tag color for a given MaterialCategory
 */
export const getCategoryConfig = (
  cat: MaterialCategory,
  t: TFunction<any, any>,
): { label: string; color: string } => {
  switch (cat) {
    case "lecture":
      return {
        label: t("card:materials.categories.lecture"),
        color: MATERIAL_CATEGORY_COLORS.lecture,
      };
    case "outline":
      return {
        label: t("card:materials.categories.outline"),
        color: MATERIAL_CATEGORY_COLORS.outline,
      };
    case "textbook":
      return {
        label: t("card:materials.categories.textbook"),
        color: MATERIAL_CATEGORY_COLORS.textbook,
      };
    case "exam_prep":
      return {
        label: t("card:materials.categories.exam_prep"),
        color: MATERIAL_CATEGORY_COLORS.exam_prep,
      };
    case "reference":
    default:
      return {
        label: t("card:materials.categories.reference"),
        color: MATERIAL_CATEGORY_COLORS.reference,
      };
  }
};

/**
 * Visual styling and metadata for each material format
 */
export interface MaterialFormatMeta {
  label: string;
  icon:
    | "file"
    | "fileText"
    | "presentation"
    | "fileSpreadsheet"
    | "video"
    | "music"
    | "archive";
  badgeClass: string;
}

export const MATERIAL_FORMAT_META: Record<MaterialFormat, MaterialFormatMeta> = {
  pdf: {
    label: "PDF",
    icon: "file",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  word: {
    label: "DOCX",
    icon: "fileText",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  powerpoint: {
    label: "PPTX",
    icon: "presentation",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
  },
  excel: {
    label: "XLSX",
    icon: "fileSpreadsheet",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  video: {
    label: "MP4",
    icon: "video",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  audio: {
    label: "MP3",
    icon: "music",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  archive: {
    label: "ZIP",
    icon: "archive",
    badgeClass: "bg-slate-100 text-slate-700 border-[#f0f0f0]",
  },
};

/**
 * Theme and styling configuration for subject color schemes
 */
export interface SubjectColorSchemeStyle {
  iconBg: string;
  tagColor: string;
  accentHover: string;
}

export const SUBJECT_COLOR_SCHEMES: Record<
  NonNullable<SubjectItem["colorScheme"]>,
  SubjectColorSchemeStyle
> = {
  blue: {
    iconBg: "bg-blue-50 text-blue-600 border-blue-200",
    tagColor: "blue",
    accentHover: "hover:border-blue-400",
  },
  purple: {
    iconBg: "bg-purple-50 text-purple-600 border-purple-200",
    tagColor: "purple",
    accentHover: "hover:border-purple-400",
  },
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
    tagColor: "green",
    accentHover: "hover:border-emerald-400",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-600 border-amber-200",
    tagColor: "gold",
    accentHover: "hover:border-amber-400",
  },
  rose: {
    iconBg: "bg-rose-50 text-rose-600 border-rose-200",
    tagColor: "volcano",
    accentHover: "hover:border-rose-400",
  },
  cyan: {
    iconBg: "bg-cyan-50 text-cyan-600 border-cyan-200",
    tagColor: "cyan",
    accentHover: "hover:border-cyan-400",
  },
  indigo: {
    iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
    tagColor: "geekblue",
    accentHover: "hover:border-indigo-400",
  },
  orange: {
    iconBg: "bg-orange-50 text-orange-600 border-orange-200",
    tagColor: "orange",
    accentHover: "hover:border-orange-400",
  },
  teal: {
    iconBg: "bg-teal-50 text-teal-600 border-teal-200",
    tagColor: "teal",
    accentHover: "hover:border-teal-400",
  },
};

export const getSubjectColorStyle = (
  scheme?: SubjectItem["colorScheme"],
): SubjectColorSchemeStyle => {
  if (scheme && SUBJECT_COLOR_SCHEMES[scheme]) {
    return SUBJECT_COLOR_SCHEMES[scheme];
  }
  return SUBJECT_COLOR_SCHEMES.blue;
};

/**
 * Shared download feedback action
 */
export const downloadMaterialWithFeedback = async (
  item: MaterialItem,
  t: TFunction<any, any>,
): Promise<void> => {
  try {
    await materialsService.incrementDownload(item.id);
    message.success(
      t("card:materials.modal.downloadStarted", { fileName: item.fileName }),
    );
  } catch {
    message.error(t("message:downloadError"));
  }
};

/**
 * Shared bookmark toggle feedback action
 */
export const toggleBookmarkWithFeedback = (
  id: string,
  t: TFunction<any, any>,
): boolean => {
  try {
    const isBookmarked = materialsService.toggleBookmark(id);
    message.success(
      isBookmarked
        ? t("card:materials.modal.bookmarkSuccess")
        : t("card:materials.modal.unbookmarkSuccess"),
    );
    return isBookmarked;
  } catch {
    message.error(t("message:error"));
    return false;
  }
};

/**
 * Shared batch download feedback action
 */
export const downloadBatchWithFeedback = (
  count: number,
  t: TFunction<any, any>,
): void => {
  if (count <= 0) return;
  message.success(
    t("card:materials.modal.downloadBatchStarted", {
      count,
    }),
  );
};

/**
 * Resolves the list of downloadable files for a material item.
 * If item.attachments is provided, uses it. Otherwise generates a list containing
 * the main material file along with complementary files.
 */
export const getMaterialFileList = (item: MaterialItem): MaterialFileItem[] => {
  if (item.attachments && item.attachments.length > 0) {
    return item.attachments;
  }

  const mainFile: MaterialFileItem = {
    id: `${item.id}-main`,
    name: item.fileName,
    size: item.fileSize,
    format: item.format,
    url: item.fileUrl,
    previewUrl: item.previewUrl,
    description: "Tài liệu học tập chính thức",
  };

  const supplementaryFiles: MaterialFileItem[] = [];

  if (item.format === "pdf") {
    supplementaryFiles.push({
      id: `${item.id}-doc`,
      name: item.fileName.replace(/\.pdf$/i, "_Phieu_Bai_Tap.docx"),
      size: "1.2 MB",
      format: "word",
      url: "#download-doc",
      description: "Phiếu bài tập tự luyện và củng cố kiến thức",
    });
    supplementaryFiles.push({
      id: `${item.id}-sheet`,
      name: item.fileName.replace(/\.pdf$/i, "_Bang_Tra_Cuu.xlsx"),
      size: "450 KB",
      format: "excel",
      url: "#download-sheet",
      description: "Bảng tra cứu công thức và barem điểm",
    });
    supplementaryFiles.push({
      id: `${item.id}-slide`,
      name: item.fileName.replace(/\.pdf$/i, "_Slide_Bai_Giang.pptx"),
      size: "5.8 MB",
      format: "powerpoint",
      url: "#download-slide",
      description: "Slide bài giảng tóm tắt minh họa",
    });
  } else if (item.format === "powerpoint") {
    supplementaryFiles.push({
      id: `${item.id}-pdf`,
      name: item.fileName.replace(/\.pptx?$/i, "_Ban_In_Handout.pdf"),
      size: "2.8 MB",
      format: "pdf",
      url: "#download-handout",
      previewUrl: "/sample-notice.pdf",
      description: "Bản in Handout ghi chép dành cho học sinh",
    });
    supplementaryFiles.push({
      id: `${item.id}-doc`,
      name: item.fileName.replace(/\.pptx?$/i, "_Cau_Hoi_Thao_Luan.docx"),
      size: "980 KB",
      format: "word",
      url: "#download-questions",
      description: "Hệ thống câu hỏi thảo luận nhóm",
    });
  } else if (item.format === "audio") {
    supplementaryFiles.push({
      id: `${item.id}-pdf`,
      name: item.fileName.replace(/\.mp3$/i, "_Audio_Transcript.pdf"),
      size: "1.6 MB",
      format: "pdf",
      url: "#download-transcript",
      previewUrl: "/sample-notice.pdf",
      description: "Văn bản lời thoại (Transcript) bài nghe",
    });
    supplementaryFiles.push({
      id: `${item.id}-doc`,
      name: item.fileName.replace(/\.mp3$/i, "_Listening_Worksheet.docx"),
      size: "820 KB",
      format: "word",
      url: "#download-worksheet",
      description: "Phiếu bài tập nghe hiểu",
    });
  } else if (item.format === "word") {
    supplementaryFiles.push({
      id: `${item.id}-pdf`,
      name: item.fileName.replace(/\.docx?$/i, "_Ban_Xuat_Chuan.pdf"),
      size: "2.1 MB",
      format: "pdf",
      url: "#download-pdf-standard",
      previewUrl: "/sample-notice.pdf",
      description: "Bản xuất PDF chuẩn in ấn",
    });
    supplementaryFiles.push({
      id: `${item.id}-sheet`,
      name: item.fileName.replace(/\.docx?$/i, "_Dap_An_Ma_Tran.xlsx"),
      size: "380 KB",
      format: "excel",
      url: "#download-matrix",
      description: "Ma trận đề thi và đáp án chi tiết",
    });
  } else {
    supplementaryFiles.push({
      id: `${item.id}-handout`,
      name: item.fileName.replace(/\.[^.]+$/, "_Tai_Lieu_Huong_Dan.pdf"),
      size: "1.5 MB",
      format: "pdf",
      url: "#download-guide",
      previewUrl: "/sample-notice.pdf",
      description: "Tài liệu hướng dẫn thực hành",
    });
  }

  return [mainFile, ...supplementaryFiles];
};
