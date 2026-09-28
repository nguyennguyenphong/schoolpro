import { homeService } from "@/modules/students/features/home/services";
import { dashboardService } from "@/modules/students/features/dashboard/services";
import { timetableService } from "@/modules/students/features/timetable/services";

export { homeService, dashboardService, timetableService };
export const studentService = homeService;
