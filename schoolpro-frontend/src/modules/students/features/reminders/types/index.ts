export type ReminderType = "schedule" | "assignment" | "exam" | "tuition" | "survey";
export type ReminderPriority = "critical" | "urgent" | "normal";

export interface ReminderItem {
  id: string;
  type: ReminderType;
  title: string;
  subtitle?: string;
  dueDate?: string;
  daysLeft?: number;
  priority: ReminderPriority;
  isCompleted: boolean;
  linkUrl?: string;
}
