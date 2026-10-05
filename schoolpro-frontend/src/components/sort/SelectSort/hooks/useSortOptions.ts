import { useMemo } from "react";
import type { SortOptionItem } from "@/components/sort/SelectSort/types";
import { getSortOptionsByPreset } from "@/components/sort/SelectSort/services/sortPresets";

export interface UseSortOptionsProps {
  options?: SortOptionItem[];
  preset?: "announcements" | "general" | "alphabetical";
}

/**
 * Hook to resolve sort options either from custom prop or preset.
 */
export const useSortOptions = ({
  options,
  preset = "announcements",
}: UseSortOptionsProps = {}) => {
  const resolvedOptions = useMemo(() => {
    if (options && options.length > 0) {
      return options;
    }
    return getSortOptionsByPreset(preset);
  }, [options, preset]);

  return {
    options: resolvedOptions,
  };
};
