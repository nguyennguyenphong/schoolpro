import type { StudentAnalyticsData } from "@/modules/students/features/dashboard/types";
import { mockDashboardData } from "@/modules/students/features/dashboard/services/mock/mockDashboardData";

/**
 * Service for Student Analytics & Dashboard feature.
 * Currently backed by structured mock data with simulated async latency.
 */
class DashboardService {
  private latency = 300;

  /**
   * Fetches full analytics and academic performance data
   */
  async getAnalyticsData(): Promise<StudentAnalyticsData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockDashboardData });
      }, this.latency);
    });
  }
}

export const dashboardService = new DashboardService();
