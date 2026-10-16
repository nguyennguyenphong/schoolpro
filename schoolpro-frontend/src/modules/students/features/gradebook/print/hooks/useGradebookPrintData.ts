import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { gradebookService } from "@/modules/students/features/gradebook/services";
import type {
  SubjectGradeItem,
  GradeSummary,
  TranscriptData,
} from "@/modules/students/features/gradebook/types";

export interface GradebookPrintStudentProfile {
  studentName: string;
  studentCode: string;
  className: string;
  academicYear: string;
  semester: string;
  schoolName: string;
  principalName: string;
  homeroomTeacher: string;
  cohort?: string;
}

export const useGradebookPrintData = () => {
  const [searchParams] = useSearchParams();
  const academicContext = useAuthStore((state) => state.academicContext);
  const profileContext = useAuthStore((state) => state.profileContext);
  const user = useAuthStore((state) => state.user);

  const academicYearParam =
    searchParams.get("academicYear") ||
    searchParams.get("academic_year_id") ||
    searchParams.get("academicYearId") ||
    academicContext?.academic_year_id ||
    "";

  const semesterParam =
    searchParams.get("semester") ||
    searchParams.get("semester_id") ||
    searchParams.get("semesterId") ||
    academicContext?.semester_id ||
    "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<GradeSummary | null>(null);
  const [grades, setGrades] = useState<SubjectGradeItem[]>([]);
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const params = {
          academicYear: academicYearParam !== "all" ? academicYearParam : undefined,
          semester: semesterParam !== "all" ? semesterParam : undefined,
        };

        const [summaryRes, gradesRes, transcriptRes] = await Promise.all([
          gradebookService.getGradeSummary(params),
          gradebookService.getSubjectGrades({
            academicYear: academicYearParam,
            semester: semesterParam,
            sortBy: "name_asc",
          }),
          gradebookService.getTranscript(params),
        ]);

        if (!ignore) {
          setSummary(summaryRes);
          setGrades(gradesRes.items);
          setTranscriptData(transcriptRes);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Không thể tải dữ liệu bảng điểm");
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [academicYearParam, semesterParam]);

  const studentProfile: GradebookPrintStudentProfile = {
    studentName:
      transcriptData?.studentName ||
      user?.full_name ||
      "Đỗ Minh Quân",
    studentCode:
      transcriptData?.studentCode ||
      profileContext?.student_code ||
      user?.username ||
      "105494395865",
    className:
      transcriptData?.className ||
      (profileContext?.class_name ? `Lớp ${profileContext.class_name}` : summary?.className) ||
      "Lớp 10A1",
    academicYear:
      summary?.academicYear ||
      transcriptData?.academicYear ||
      academicContext?.academic_year ||
      "2025-2026",
    semester:
      summary?.semester ||
      transcriptData?.semester ||
      academicContext?.semester ||
      "Học kỳ 1",
    schoolName:
      transcriptData?.schoolName ||
      "Trường Trung học Phổ thông Chuyên Khoa học Tự nhiên",
    principalName:
      transcriptData?.principalName ||
      "PGS.TS. Trần Quốc Tuấn",
    homeroomTeacher:
      profileContext?.homeroom_teacher_name ||
      transcriptData?.homeroomTeacher ||
      summary?.homeroomTeacher ||
      "Thầy Nguyễn Văn Chủ Nhiệm",
  };

  return {
    loading,
    error,
    summary,
    grades,
    transcriptData,
    studentProfile,
  };
};
