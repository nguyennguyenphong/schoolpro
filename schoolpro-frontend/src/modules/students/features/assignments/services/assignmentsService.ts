import type {
  AssignmentItem,
  AssignmentSummary,
  AssignmentFilter,
  AssignmentSubmission,
} from "@/modules/students/features/assignments/types";
import { mockAssignmentsData } from "@/modules/students/features/assignments/services/mock/mockAssignmentsData";

class AssignmentsService {
  private assignments: AssignmentItem[] = [...mockAssignmentsData];
  private latency = 300;

  async getAssignments(filter?: Partial<AssignmentFilter>): Promise<AssignmentItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...this.assignments];

        if (filter?.subject && filter.subject !== "all") {
          result = result.filter((item) => item.subjectCode === filter.subject);
        }

        if (filter?.status && filter.status !== "all") {
          result = result.filter((item) => item.status === filter.status);
        }

        if (filter?.type && filter.type !== "all") {
          result = result.filter((item) => item.type === filter.type);
        }

        if (filter?.searchQuery && filter.searchQuery.trim()) {
          const q = filter.searchQuery.toLowerCase().trim();
          result = result.filter(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              item.subjectName.toLowerCase().includes(q) ||
              item.teacherName.toLowerCase().includes(q),
          );
        }

        resolve(result);
      }, this.latency);
    });
  }

  calculateSummary(items: AssignmentItem[]): AssignmentSummary {
    const total = items.length;
    const pendingCount = items.filter((i) => i.status === "pending").length;
    const submittedCount = items.filter((i) => i.status === "submitted").length;
    const gradedCount = items.filter((i) => i.status === "graded").length;
    const overdueCount = items.filter((i) => i.status === "overdue").length;

    const gradedItems = items.filter((i) => i.status === "graded" && i.score !== undefined);
    const averageScore =
      gradedItems.length > 0
        ? Math.round(
            (gradedItems.reduce((acc, cur) => acc + (cur.score || 0), 0) /
              gradedItems.length) *
              10,
          ) / 10
        : 0;

    return {
      total,
      pendingCount,
      submittedCount,
      gradedCount,
      overdueCount,
      averageScore,
    };
  }

  async getAssignmentById(id: string): Promise<AssignmentItem | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = this.assignments.find((a) => a.id === id);
        resolve(item ? { ...item } : null);
      }, this.latency);
    });
  }

  async submitAssignment(
    assignmentId: string,
    submission: AssignmentSubmission,
  ): Promise<AssignmentItem> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.assignments.findIndex((a) => a.id === assignmentId);
        if (index === -1) {
          reject(new Error("Không tìm thấy bài tập"));
          return;
        }

        const updated: AssignmentItem = {
          ...this.assignments[index],
          status: "submitted",
          submission,
        };

        this.assignments[index] = updated;
        resolve(updated);
      }, this.latency);
    });
  }

  async requestReopenAssignment(
    assignmentId: string,
    reason: string,
  ): Promise<AssignmentItem> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.assignments.findIndex((a) => a.id === assignmentId);
        if (index === -1) {
          reject(new Error("Không tìm thấy bài tập"));
          return;
        }

        const teacherEmail =
          this.assignments[index].teacherEmail ||
          `${this.assignments[index].teacherName.toLowerCase().replace(/[^a-z]/g, "")}@schoolpro.edu.vn`;

        const updated: AssignmentItem = {
          ...this.assignments[index],
          reopenRequest: {
            requestedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
            reason,
            teacherEmail,
            status: "pending",
          },
        };

        this.assignments[index] = updated;
        resolve(updated);
      }, this.latency);
    });
  }
}

export const assignmentsService = new AssignmentsService();
