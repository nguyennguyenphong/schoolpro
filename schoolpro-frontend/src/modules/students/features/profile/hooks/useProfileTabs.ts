import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { ProfileTabKey } from "@/modules/students/features/profile/types";

export interface UseProfileTabsReturn {
  activeTab: ProfileTabKey;
  setTab: (tab: ProfileTabKey) => void;
}

/**
 * Custom hook to manage active profile tab synchronized with URL query params.
 */
export const useProfileTabs = (): UseProfileTabsReturn => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get("tab");

  const activeTab: ProfileTabKey = useMemo(() => {
    switch (tabParam) {
      case "academic":
        return "academic";
      case "guardians":
      case "parents":
        return "guardians";
      case "health":
      case "medical":
        return "health";
      default:
        return "personal";
    }
  }, [tabParam]);

  const setTab = (nextTab: ProfileTabKey) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.set("tab", nextTab);
      return updated;
    });
  };

  return {
    activeTab,
    setTab,
  };
};
