import React, { useMemo } from "react";
import { Select } from "antd";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["input"]);

  const categoryOptions = useMemo(() => {
    const allOption: { label: string; value: AnnouncementCategory } = {
      label: t("input:filter.allCategories"),
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
      { label: t("input:categories.exam"), value: "exam" },
      { label: t("input:categories.academic"), value: "academic" },
      { label: t("input:categories.tuition"), value: "tuition" },
      { label: t("input:categories.activity"), value: "activity" },
      { label: t("input:categories.homeroom"), value: "homeroom" },
      { label: t("input:categories.general"), value: "general" },
    ];
  }, [categories, t]);

  return (
    <Select
      value={value}
      onChange={onChange}
      options={categoryOptions}
      className={className}
    />
  );
};
