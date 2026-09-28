export interface ExamScheduleDetail {
  id: string;
  courseCode: string;
  courseName: string;
  examDate: string;
  examTime: string;
  room: string;
  building: string;
  seatNumber: string;
  format: "essay" | "multiple_choice" | "practice";
  examRegulationsUrl?: string;
}
