import type { SortOptionItem } from "@/components/sort/SelectSort/types";

export const ANNOUNCEMENT_SORT_OPTIONS: SortOptionItem[] = [
  { value: "newest", label: "Mới nhất trước" },
  { value: "oldest", label: "Cũ nhất trước" },
  { value: "views", label: "Xem nhiều nhất" },
  { value: "priority", label: "Ưu tiên khẩn cấp" },
];

export const GENERAL_SORT_OPTIONS: SortOptionItem[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "name_asc", label: "Tên (A - Z)" },
  { value: "name_desc", label: "Tên (Z - A)" },
];

export const ALPHABETICAL_SORT_OPTIONS: SortOptionItem[] = [
  { value: "asc", label: "Tăng dần (A - Z)" },
  { value: "desc", label: "Giảm dần (Z - A)" },
];

export const getSortOptionsByPreset = (
  preset: "announcements" | "general" | "alphabetical" = "announcements"
): SortOptionItem[] => {
  switch (preset) {
    case "general":
      return GENERAL_SORT_OPTIONS;
    case "alphabetical":
      return ALPHABETICAL_SORT_OPTIONS;
    case "announcements":
    default:
      return ANNOUNCEMENT_SORT_OPTIONS;
  }
};
