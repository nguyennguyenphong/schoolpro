import { useState, useEffect, useMemo } from "react";
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
  allOptionLabel = "Tất cả mức độ",
  allOptionValue = "all",
}: UsePriorityOptions = {}): UsePriorityReturn => {
  const [priorities, setPriorities] = useState<PriorityItem[]>(MOCK_PRIORITIES);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
        label: allOptionLabel,
        value: allOptionValue,
      });
    }

    effectivePriorities.forEach((p) => {
      list.push({
        label: p.name,
        value: p.id,
        priority: p,
      });
    });

    return list;
  }, [effectivePriorities, includeAllOption, allOptionLabel, allOptionValue]);

  return {
    priorities: effectivePriorities,
    isLoading,
    options,
  };
};
