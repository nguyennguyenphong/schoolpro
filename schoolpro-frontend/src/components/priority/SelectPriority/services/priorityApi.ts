import type { PriorityItem } from "@/components/priority/SelectPriority/types";

/**
 * Standard enterprise priority dictionary items.
 */
export const MOCK_PRIORITIES: PriorityItem[] = [
  {
    id: "urgent",
    code: "URGENT",
    name: "Khẩn cấp",
    level: 4,
    color: "red",
    badgeColor: "#ef4444",
  },
  {
    id: "high",
    code: "HIGH",
    name: "Quan trọng",
    level: 3,
    color: "orange",
    badgeColor: "#f97316",
  },
  {
    id: "normal",
    code: "NORMAL",
    name: "Bình thường",
    level: 2,
    color: "blue",
    badgeColor: "#3b82f6",
  },
  {
    id: "low",
    code: "LOW",
    name: "Thấp",
    level: 1,
    color: "gray",
    badgeColor: "#94a3b8",
  },
];

class PriorityApi {
  /**
   * Fetch available priorities list.
   */
  async fetchPriorities(): Promise<PriorityItem[]> {
    // Fast in-memory resolution with enterprise async contract
    return Promise.resolve(MOCK_PRIORITIES);
  }
}

export const priorityApi = new PriorityApi();
