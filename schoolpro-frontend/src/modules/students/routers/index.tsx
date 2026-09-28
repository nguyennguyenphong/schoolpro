import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { StudentLayout } from "@/modules/students/layouts/StudentLayout";

const HomePage = lazy(() =>
  import("@/modules/students/features/home").then(({ HomePage }) => ({
    default: HomePage,
  }))
);

const DashboardPage = lazy(() =>
  import("@/modules/students/features/dashboard").then(({ DashboardPage }) => ({
    default: DashboardPage,
  }))
);

const TimetablePage = lazy(() =>
  import("@/modules/students/features/timetable").then(({ TimetablePage }) => ({
    default: TimetablePage,
  }))
);

const AnnouncementsPage = lazy(() =>
  import("@/modules/students/features/announcements").then(({ AnnouncementsPage }) => ({
    default: AnnouncementsPage,
  }))
);

export const StudentRoutes = (
  <Route element={<StudentLayout />}>
    <Route path="/student/home" element={<HomePage />} />
    <Route path="/student/dashboard" element={<DashboardPage />} />
    <Route path="/student/timetable" element={<TimetablePage />} />
    <Route path="/student/notices" element={<AnnouncementsPage />} />
    <Route path="/student/announcements" element={<Navigate to="/student/notices" replace />} />
    <Route path="/student/schedule" element={<Navigate to="/student/timetable" replace />} />
    <Route path="/student" element={<Navigate to="/student/home" replace />} />
  </Route>
);