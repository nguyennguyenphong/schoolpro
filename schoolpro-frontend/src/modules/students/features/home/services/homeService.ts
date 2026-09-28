import type {
  HomeData,
  StudentProfile,
  FeatureItem,
} from "@/modules/students/features/home/types";
import { mockHomeData } from "@/modules/students/features/home/services/mock/mockHomeData";

/**
 * Service layer for Student Home feature.
 * Backed by structured mock data with simulated async latency.
 * Ready for REST / GraphQL API integration.
 */
class HomeService {
  private latency = 350;

  /**
   * Fetches full home page data for student (profile and functional cards)
   */
  async getHomeData(): Promise<HomeData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockHomeData });
      }, this.latency);
    });
  }

  // Backward compatibility method
  async getDashboardData(): Promise<HomeData> {
    return this.getHomeData();
  }

  /**
   * Fetches student profile
   */
  async getProfile(): Promise<StudentProfile> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockHomeData.profile });
      }, this.latency);
    });
  }

  /**
   * Fetches functional cards list
   */
  async getFeatures(): Promise<FeatureItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockHomeData.features]);
      }, this.latency);
    });
  }
}

export const homeService = new HomeService();
