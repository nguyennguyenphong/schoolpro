import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type {
  PriorityItem,
  PriorityLevel,
} from "@/components/priority/SelectPriority/types";
import {
  priorityApi,
  MOCK_PRIORITIES,
} from "@/components/priority/SelectPriority/services/priorityApi";

export interface UsePriorityOptions {
  initialPriorities?: PriorityItem[];
  includeAllOption?: boolean;
  allOptionLabel?: string;
  allOptionValue?: PriorityLevel;
}

export interface UsePriorityReturn {
  priorities: PriorityItem[];
  isLoading: boolean;
  options: Array<{
    label: string;
    value: PriorityLevel;
    priority?: PriorityItem;
  }>;
}

/**
 * Hook to manage priority items and formatted Select options.
 */
export const usePriority = ({
  initialPriorities,
  includeAllOption = true,
  allOptionLabel,
  allOptionValue = "all",
}: UsePriorityOptions = {}): UsePriorityReturn => {
  const { t, i18n } = useTranslation(["input", "card"]);
  const [priorities, setPriorities] = useState<PriorityItem[]>(MOCK_PRIORITIES);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const effectiveAllOptionLabel =
    allOptionLabel ?? t("input:filter.allPriorities");

  const effectivePriorities = useMemo(() => {
    if (initialPriorities && initialPriorities.length > 0) {
      return initialPriorities;
    }
    return priorities;
  }, [initialPriorities, priorities]);

  useEffect(() => {
    if (initialPriorities && initialPriorities.length > 0) {
      return;
    }

    let isMounted = true;

    priorityApi
      .fetchPriorities()
      .then((data) => {
        if (isMounted) {
          setPriorities(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPriorities(MOCK_PRIORITIES);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialPriorities]);

  const options = useMemo(() => {
    const list: Array<{
      label: string;
      value: PriorityLevel;
      priority?: PriorityItem;
    }> = [];

    if (includeAllOption) {
      list.push({
        label: effectiveAllOptionLabel,
        value: allOptionValue,
      });
    }

    effectivePriorities.forEach((p) => {
      const transKey = `card:priority.${p.id}`;
      const label = i18n.exists(transKey) ? t(transKey as any) : (p.name || p.id);
      list.push({
        label,
        value: p.id,
        priority: p,
      });
    });

    return list;
  }, [effectivePriorities, includeAllOption, effectiveAllOptionLabel, allOptionValue, t, i18n]);

  return {
    priorities: effectivePriorities,
    isLoading,
    options,
  };
};
