import type {
  ExamItem,
  ExamSummary,
  ExamSubmission,
  ExamFilter,
} from "@/modules/students/features/exams/types";
import {
  mockExams,
  mockSubmissions,
} from "@/modules/students/features/exams/services/mock/mockExamsData";

class ExamsService {
  private exams: ExamItem[] = [...mockExams];
  private submissions: Record<string, ExamSubmission> = { ...mockSubmissions };

  async getExams(filter?: Partial<ExamFilter>): Promise<ExamItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return this.exams.filter((item) => {
      // Status
      if (filter?.status && filter.status !== "all" && item.status !== filter.status) {
        return false;
      }

      // Search query
      if (filter?.searchQuery?.trim()) {
        const q = filter.searchQuery.trim().toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchCourse = item.courseName.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchCourse) return false;
      }

      // Semester
      if (filter?.semester && filter.semester !== "all" && item.semester !== filter.semester) {
        return false;
      }

      return true;
    });
  }

  async getExamById(id: string): Promise<ExamItem | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const found = this.exams.find((e) => e.id === id);
    return found || null;
  }

  async getExamSummary(): Promise<ExamSummary> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const total = this.exams.length;
    const pendingCount = this.exams.filter((e) => e.status === "pending").length;
    const completedCount = this.exams.filter((e) => e.status === "completed").length;
    const expiredCount = this.exams.filter((e) => e.status === "expired").length;

    const completedExams = this.exams.filter((e) => e.status === "completed" && e.score !== undefined);
    const avgScore =
      completedExams.length > 0
        ? Math.round(
            (completedExams.reduce((acc, cur) => acc + (cur.score || 0), 0) / completedExams.length) *
              10
          ) / 10
        : 0;

    return {
      total,
      pendingCount,
      completedCount,
      expiredCount,
      averageScore: avgScore,
    };
  }

  async getSubmission(examId: string): Promise<ExamSubmission | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.submissions[examId] || null;
  }

  async submitExam(
    examId: string,
    answers: Record<string, number | string | string[]>
  ): Promise<{ success: boolean; score: number; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const exam = this.exams.find((e) => e.id === examId);

    if (!exam) {
      throw new Error("Không tìm thấy đề thi.");
    }

    // Calculate score based on correct answers
    let earnedPoints = 0;
    let totalGradedPoints = 0;

    exam.questions.forEach((q) => {
      const qPoints = q.points || 1.0;
      if (q.type !== "rating") {
        totalGradedPoints += qPoints;
      }

      const userAns = answers[q.id];
      if (!userAns || !q.correctAnswer) return;

      if (q.type === "radio" || q.type === "single_choice") {
        if (typeof userAns === "string" && userAns.trim() === String(q.correctAnswer).trim()) {
          earnedPoints += qPoints;
        }
      } else if (q.type === "checkbox" || q.type === "multiple_choice") {
        if (Array.isArray(userAns) && Array.isArray(q.correctAnswer)) {
          const sortedUser = [...userAns].sort();
          const sortedCorrect = [...q.correctAnswer].sort();
          if (
            sortedUser.length === sortedCorrect.length &&
            sortedUser.every((v, idx) => v === sortedCorrect[idx])
          ) {
            earnedPoints += qPoints;
          }
        }
      } else if (q.type === "input" || q.type === "text") {
        if (
          typeof userAns === "string" &&
          userAns.trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()
        ) {
          earnedPoints += qPoints;
        }
      }
    });

    const scaledScore =
      totalGradedPoints > 0
        ? Math.round((earnedPoints / totalGradedPoints) * 10 * 10) / 10
        : 10;

    exam.status = "completed";
    exam.score = scaledScore;
    exam.completedAt = new Date().toISOString().replace("T", " ").substring(0, 16);

    this.submissions[examId] = {
      examId,
      answers,
      score: scaledScore,
      submittedAt: exam.completedAt,
    };

    return {
      success: true,
      score: scaledScore,
      message: `Nộp bài thi thành công! Điểm số của bạn: ${scaledScore} / 10.`,
    };
  }
}

export const examsService = new ExamsService();
