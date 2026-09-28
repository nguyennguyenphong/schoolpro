import type {
  HomeData,
  StudentProfile,
  ClassScheduleItem,
  AssignmentItem,
} from "@/modules/students/features/home/types";
import { mockHomeData } from "@/modules/students/features/home/services/mock/mockHomeData";

/**
 * Service layer for Student Home feature.
 * Currently backed by structured mock data with simulated async latency.
 * Ready for REST / GraphQL API integration.
 */
class HomeService {
  private latency = 350;

  /**
   * Fetches full home page data for student
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
   * Fetches today's schedule
   */
  async getTodaySchedule(): Promise<ClassScheduleItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockHomeData.todaySchedule]);
      }, this.latency);
    });
  }

  /**
   * Simulates submitting an assignment
   */
  async submitAssignment(assignmentId: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = mockHomeData.urgentAssignments.find((a) => a.id === assignmentId);
        if (item) {
          item.isSubmitted = true;
        }
        resolve({ success: true, message: "Nộp bài thành công!" });
      }, 500);
    });
  }

  /**
   * Fetches urgent assignments
   */
  async getUrgentAssignments(): Promise<AssignmentItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockHomeData.urgentAssignments]);
      }, this.latency);
    });
  }
}

export const homeService = new HomeService();
