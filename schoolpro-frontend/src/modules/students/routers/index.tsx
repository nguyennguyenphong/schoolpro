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

const AssignmentsPage = lazy(() =>
  import("@/modules/students/features/assignments").then(({ AssignmentsPage }) => ({
    default: AssignmentsPage,
  }))
);

const AssignmentSubmitPage = lazy(() =>
  import("@/modules/students/features/assignments").then(({ AssignmentSubmitPage }) => ({
    default: AssignmentSubmitPage,
  }))
);

const MaterialsPage = lazy(() =>
  import("@/modules/students/features/materials").then(({ MaterialsPage }) => ({
    default: MaterialsPage,
  }))
);

const SubjectMaterialsPage = lazy(() =>
  import("@/modules/students/features/materials").then(({ SubjectMaterialsPage }) => ({
    default: SubjectMaterialsPage,
  }))
);

const GradebookPage = lazy(() =>
  import("@/modules/students/features/gradebook").then(({ GradebookPage }) => ({
    default: GradebookPage,
  }))
);

const EvaluationPage = lazy(() =>
  import("@/modules/students/features/evaluation").then(({ EvaluationPage }) => ({
    default: EvaluationPage,
  }))
);

const SurveyDetailPage = lazy(() =>
  import("@/modules/students/features/evaluation").then(({ SurveyDetailPage }) => ({
    default: SurveyDetailPage,
  }))
);

const AttendancePage = lazy(() =>
  import("@/modules/students/features/attendance").then(({ AttendancePage }) => ({
    default: AttendancePage,
  }))
);

const ExamsPage = lazy(() =>
  import("@/modules/students/features/exams").then(({ ExamsPage }) => ({
    default: ExamsPage,
  }))
);

const ExamDetailPage = lazy(() =>
  import("@/modules/students/features/exams").then(({ ExamDetailPage }) => ({
    default: ExamDetailPage,
  }))
);

const ContactBookPage = lazy(() =>
  import("@/modules/students/features/contact-book").then(({ ContactBookPage }) => ({
    default: ContactBookPage,
  }))
);

export const StudentRoutes = (
  <Route element={<StudentLayout />}>
    <Route path="/student/home" element={<HomePage />} />
    <Route path="/student/dashboard" element={<DashboardPage />} />
    <Route path="/student/timetable" element={<TimetablePage />} />
    <Route path="/student/attendance" element={<AttendancePage />} />
    <Route path="/student/contact-book" element={<ContactBookPage />} />
    <Route path="/student/exams" element={<ExamsPage />} />
    <Route path="/student/exams/:id" element={<ExamDetailPage />} />
    <Route path="/student/notices" element={<AnnouncementsPage />} />
    <Route path="/student/assignments" element={<AssignmentsPage />} />
    <Route path="/student/assignments/:id" element={<AssignmentSubmitPage />} />
    <Route path="/student/materials" element={<MaterialsPage />} />
    <Route path="/student/materials/:subjectCode" element={<SubjectMaterialsPage />} />
    <Route path="/student/gradebook" element={<GradebookPage />} />
    <Route path="/student/evaluations" element={<EvaluationPage />} />
    <Route path="/student/evaluations/:id" element={<SurveyDetailPage />} />
    <Route path="/student/surveys/:id" element={<SurveyDetailPage />} />
    <Route path="/student/surveys" element={<Navigate to="/student/evaluations" replace />} />
    <Route path="/student/grades" element={<Navigate to="/student/gradebook" replace />} />
    <Route path="/student/announcements" element={<Navigate to="/student/notices" replace />} />
    <Route path="/student/schedule" element={<Navigate to="/student/timetable" replace />} />
    <Route path="/student" element={<Navigate to="/student/home" replace />} />
  </Route>
);