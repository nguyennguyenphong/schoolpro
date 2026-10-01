import type {
  ContactBookSummary,
  WeeklyReportItem,
  SubjectFeedbackItem,
  ParentNoteItem,
  SendFeedbackPayload,
} from "@/modules/students/features/contact-book/types";
import {
  mockContactBookSummary,
  mockWeeklyReports,
  mockSubjectFeedbacks,
  mockParentNotes,
} from "@/modules/students/features/contact-book/services/mock/mockContactBookData";

class ContactBookService {
  private summary: ContactBookSummary = { ...mockContactBookSummary };
  private weeklyReports: WeeklyReportItem[] = [...mockWeeklyReports];
  private subjectFeedbacks: SubjectFeedbackItem[] = [...mockSubjectFeedbacks];
  private parentNotes: ParentNoteItem[] = [...mockParentNotes];
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

  async getParentNotes(): Promise<ParentNoteItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.parentNotes]);
      }, this.latency);
    });
  }

  // Alias tương thích
  async getParentMessages(): Promise<ParentNoteItem[]> {
    return this.getParentNotes();
  }

  async confirmWeeklyReport(
    weekNumber: number,
    feedback: string,
    parentName: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = this.weeklyReports.find((w) => w.weekNumber === weekNumber);
        const now = new Date();
        const formatted = `${String(now.getDate()).padStart(2, "0")}/${String(
          now.getMonth() + 1
        ).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(
          2,
          "0"
        )}:${String(now.getMinutes()).padStart(2, "0")}`;

        if (found) {
          found.parentFeedback = {
            content: feedback,
            senderName: parentName,
            submittedAt: formatted,
            isConfirmed: true,
          };
        }

        // Cũng thêm vào mục lưu ý kiến của cha mẹ học sinh
        const existingNoteIndex = this.parentNotes.findIndex(
          (n) => n.weekNumber === weekNumber
        );
        if (existingNoteIndex >= 0) {
          this.parentNotes[existingNoteIndex] = {
            ...this.parentNotes[existingNoteIndex],
            generalOpinion: feedback,
            parentName,
            signedAt: formatted,
            isConfirmed: true,
          };
        } else {
          this.parentNotes.unshift({
            id: `note-${Date.now()}`,
            weekNumber,
            parentName,
            parentRole: "Bố/Mẹ học sinh",
            phone: "0912.345.678",
            homeStudyComment: "Gia đình đã kiểm tra bài vở và nề nếp sinh hoạt tại nhà.",
            generalOpinion: feedback,
            signedAt: formatted,
            isConfirmed: true,
          });
          this.summary.parentFeedbackCount += 1;
        }

        resolve(true);
      }, this.latency);
    });
  }

  async addParentNote(payload: SendFeedbackPayload): Promise<ParentNoteItem> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date();
        const formatted = `${String(now.getDate()).padStart(2, "0")}/${String(
          now.getMonth() + 1
        ).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(
          2,
          "0"
        )}:${String(now.getMinutes()).padStart(2, "0")}`;

        const weekNum = payload.weekNumber ?? 4;
        const opinion = payload.generalOpinion || payload.content || "";
        const homeStudy =
          payload.homeStudyComment ||
          "Gia đình đã kiểm tra bài vở và tình hình học tập tại nhà.";

        const newNote: ParentNoteItem = {
          id: `note-${Date.now()}`,
          weekNumber: weekNum,
          parentName: payload.parentName,
          parentRole: payload.parentRole || "Bố/Mẹ học sinh",
          phone: payload.phone,
          homeStudyComment: homeStudy,
          generalOpinion: opinion,
          signedAt: formatted,
          isConfirmed: true,
        };

        // Đồng bộ vào weekly report nếu có
        const report = this.weeklyReports.find((r) => r.weekNumber === weekNum);
        if (report) {
          report.parentFeedback = {
            content: opinion || homeStudy,
            senderName: `${payload.parentName} (${payload.parentRole || "Phụ huynh"})`,
            submittedAt: formatted,
            isConfirmed: true,
          };
        }

        this.parentNotes.unshift(newNote);
        this.summary.parentFeedbackCount += 1;
        resolve(newNote);
      }, this.latency);
    });
  }

  // Alias tương thích
  async sendMessage(payload: SendFeedbackPayload): Promise<ParentNoteItem> {
    return this.addParentNote(payload);
  }
}

export const contactBookService = new ContactBookService();
