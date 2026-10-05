import React, { useMemo } from "react";
import { Select } from "antd";
import type {
  AnnouncementCategory,
  AnnouncementCategoryOption,
} from "@/modules/students/features/announcements/types";

export interface AnnouncementCategorySelectProps {
  /**
   * Currently selected category value.
   */
  value: AnnouncementCategory;

  /**
   * Callback fired when category selection changes.
   */
  onChange: (category: AnnouncementCategory) => void;

  /**
   * Dynamic categories loaded from backend for user's school.
   */
  categories?: AnnouncementCategoryOption[];

  /**
   * Optional custom className.
   */
  className?: string;
}

/**
 * Dropdown select for announcement categories, supporting dynamic backend categories with counts.
 */
export const AnnouncementCategorySelect: React.FC<AnnouncementCategorySelectProps> = ({
  value,
  onChange,
  categories,
  className = "w-44",
}) => {
  const categoryOptions = useMemo(() => {
    const allOption: { label: string; value: AnnouncementCategory } = {
      label: "Tất cả chuyên mục",
      value: "all",
    };

    if (categories && categories.length > 0) {
      const dynamicList = categories.map((c) => ({
        label: c.count !== undefined && c.count > 0 ? `${c.label} (${c.count})` : c.label,
        value: c.value as AnnouncementCategory,
      }));
      return [allOption, ...dynamicList];
    }

    // Fallback options before API loads
    return [
      allOption,
      { label: "Khảo thí & Lịch thi", value: "exam" },
      { label: "Đào tạo & Học vụ", value: "academic" },
      { label: "Học phí & Khoản thu", value: "tuition" },
      { label: "Đoàn trường & Ngoại khóa", value: "activity" },
      { label: "Lớp & GVCN", value: "homeroom" },
      { label: "Thông báo chung", value: "general" },
    ];
  }, [categories]);

  return (
    <Select
      value={value}
      onChange={onChange}
      options={categoryOptions}
      className={className}
    />
  );
};
