import type { TFunction } from "i18next";
import { message } from "@/components/ui/Message";
import type {
  MaterialCategory,
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
