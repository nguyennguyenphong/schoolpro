import type {
  ContactBookSummary,
  WeeklyReportItem,
  SubjectFeedbackItem,
  ParentMessage,
  SendFeedbackPayload,
} from "@/modules/students/features/contact-book/types";
import {
  mockContactBookSummary,
  mockWeeklyReports,
  mockSubjectFeedbacks,
  mockParentMessages,
} from "@/modules/students/features/contact-book/services/mock/mockContactBookData";

class ContactBookService {
  private summary: ContactBookSummary = { ...mockContactBookSummary };
  private weeklyReports: WeeklyReportItem[] = [...mockWeeklyReports];
  private subjectFeedbacks: SubjectFeedbackItem[] = [...mockSubjectFeedbacks];
  private messages: ParentMessage[] = [...mockParentMessages];
  private latency = 200;

  async getSummary(): Promise<ContactBookSummary> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...this.summary });
      }, this.latency);
    });
  }

  async getWeeklyReports(week?: number | "all"): Promise<WeeklyReportItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!week || week === "all") {
          resolve([...this.weeklyReports]);
        } else {
          resolve(this.weeklyReports.filter((r) => r.weekNumber === Number(week)));
        }
      }, this.latency);
    });
  }

  async getSubjectFeedbacks(): Promise<SubjectFeedbackItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.subjectFeedbacks]);
      }, this.latency);
    });
  }

  async getParentMessages(): Promise<ParentMessage[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.messages]);
      }, this.latency);
    });
  }

  async confirmWeeklyReport(
    weekNumber: number,
    feedback: string,
    parentName: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = this.weeklyReports.find((w) => w.weekNumber === weekNumber);
        if (found) {
          const now = new Date();
          const formatted = `${String(now.getDate()).padStart(2, "0")}/${String(
            now.getMonth() + 1
          ).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(
            2,
            "0"
          )}:${String(now.getMinutes()).padStart(2, "0")}`;

          found.parentFeedback = {
            content: feedback,
            senderName: parentName,
            submittedAt: formatted,
            isConfirmed: true,
          };
          this.summary.parentFeedbackCount += 1;
        }
        resolve(true);
      }, this.latency);
    });
  }

  async sendMessage(payload: SendFeedbackPayload): Promise<ParentMessage> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date();
        const formatted = `${String(now.getDate()).padStart(2, "0")}/${String(
          now.getMonth() + 1
        ).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(
          2,
          "0"
        )}:${String(now.getMinutes()).padStart(2, "0")}`;

        const newMsg: ParentMessage = {
          id: `msg-${Date.now()}`,
          senderRole: "parent",
          senderName: `${payload.parentName} (Phụ huynh)`,
          content: payload.content,
          createdAt: formatted,
          weekNumber: payload.weekNumber,
          isRead: false,
        };

        this.messages.unshift(newMsg);
        resolve(newMsg);
      }, this.latency);
    });
  }
}

export const contactBookService = new ContactBookService();
