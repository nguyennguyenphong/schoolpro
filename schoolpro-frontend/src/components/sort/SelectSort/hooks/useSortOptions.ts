import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { SortOptionItem } from "@/components/sort/SelectSort/types";
import { getSortOptionsByPreset } from "@/components/sort/SelectSort/services/sortPresets";

export interface UseSortOptionsProps {
  options?: SortOptionItem[];
  preset?: "announcements" | "general" | "alphabetical";
}

/**
 * Hook to resolve sort options either from custom prop or preset with i18n support.
 */
export const useSortOptions = ({
  options,
  preset = "announcements",
}: UseSortOptionsProps = {}) => {
  const { t, i18n } = useTranslation(["input"]);

  const resolvedOptions = useMemo(() => {
    const rawOptions =
      options && options.length > 0 ? options : getSortOptionsByPreset(preset);

    return rawOptions.map((opt) => {
      const key = `input:sortOptions.${opt.value}`;
      return {
        ...opt,
        label: i18n.exists(key) ? t(key as any) : opt.label,
      };
    });
  }, [options, preset, t, i18n]);

  return {
    options: resolvedOptions,
  };
};
