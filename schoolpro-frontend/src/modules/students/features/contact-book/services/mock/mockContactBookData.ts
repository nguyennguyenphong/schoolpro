import type {
  ContactBookSummary,
  SubjectFeedbackItem,
  WeeklyReportItem,
  ParentNoteItem,
} from "@/modules/students/features/contact-book/types";

export const mockContactBookSummary: ContactBookSummary = {
  studentName: "Nguyễn Văn An",
  studentCode: "HS202688",
  dateOfBirth: "15/10/2009",
  gender: "Nam",
  className: "11A1",
  academicYear: "2025 - 2026",
  semester: "Học kỳ 1",
  homeroomTeacher: {
    name: "Cô Nguyễn Thị Mai",
    phone: "0912.345.678",
    email: "mainguyen@schoolpro.edu.vn",
    subject: "Giáo viên Toán & Chủ nhiệm",
  },
  parentInfo: {
    fatherName: "Nguyễn Văn Bình",
    fatherPhone: "0912.345.678",
    fatherJob: "Kỹ sư công nghệ thông tin",
    motherName: "Lê Thị Thảo",
    motherPhone: "0987.654.321",
    motherJob: "Bác sĩ nhi khoa",
    address: "Số 25, Phố Hoàng Cầu, Phường Ô Chợ Dừa, Quận Đống Đa, Hà Nội",
  },
  currentGpa: 8.6,
  conduct: "Tốt",
  ranking: 4,
  totalStudents: 42,
  attendanceRate: 98.2,
  excusedAbsence: 1,
  unexcusedAbsence: 0,
  lateCount: 0,
  disciplineScore: 96,
  latestTeacherComment:
    "Em An học tập rất chăm chỉ, tư duy toán học và tiếng Anh vượt trội, chấp hành tốt nội quy nề nếp của trường lớp. Cần tiếp tục duy trì và giúp đỡ các bạn trong tổ.",
  parentConfirmed: true,
  parentFeedbackCount: 3,
};

export const mockWeeklyReports: WeeklyReportItem[] = [
  {
    id: "week-04",
    weekNumber: 4,
    startDate: "22/09/2026",
    endDate: "27/09/2026",
    studyComment:
      "Tích cực xây dựng bài trên lớp, bài kiểm tra 15 phút môn Toán đạt điểm 10. Hoàn thành đầy đủ các bài tập tự học trên hệ thống LMS.",
    disciplineComment:
      "Thực hiện nghiêm túc đồng phục, đi học đúng giờ, tham gia nhiệt tình buổi sinh hoạt đầu tuần và phong trào vệ sinh lớp học.",
    attendanceSummary: {
      present: 6,
      excused: 0,
      unexcused: 0,
      late: 0,
    },
    disciplinePoints: 100,
    teacherSignature: "Nguyễn Thị Mai",
    signedDate: "27/09/2026",
    parentFeedback: {
      content:
        "Gia đình rất vui vì kết quả tuần này của cháu. Ở nhà cháu tự giác học bài và rèn luyện thể thao đều đặn. Cảm ơn cô giáo đã luôn quan tâm sát sao.",
      senderName: "Nguyễn Văn Bình (Bố học sinh)",
      submittedAt: "28/09/2026 19:30",
      isConfirmed: true,
    },
  },
  {
    id: "week-03",
    weekNumber: 3,
    startDate: "15/09/2026",
    endDate: "20/09/2026",
    studyComment:
      "Nắm bài tốt môn Hóa học và Tiếng Anh. Có bài thuyết trình nhóm môn Sinh học được thầy cô đánh giá cao.",
    disciplineComment:
      "Ngoan ngoãn, hòa đồng với bạn bè. Trong giờ tự quản giữ trật tự tốt.",
    attendanceSummary: {
      present: 5,
      excused: 1,
      unexcused: 0,
      late: 0,
    },
    disciplinePoints: 95,
    teacherSignature: "Nguyễn Thị Mai",
    signedDate: "20/09/2026",
    parentFeedback: {
      content:
        "Thứ Tư cháu bị cảm nhẹ nên xin phép nghỉ 1 buổi. Gia đình đã kèm cháu học bù bài vở kịp thời. Cảm ơn cô.",
      senderName: "Nguyễn Văn Bình (Bố học sinh)",
      submittedAt: "21/09/2026 20:15",
      isConfirmed: true,
    },
  },
  {
    id: "week-02",
    weekNumber: 2,
    startDate: "08/09/2026",
    endDate: "13/09/2026",
    studyComment:
      "Chuẩn bị bài vở trước khi đến lớp chu đáo. Điểm kiểm tra miệng môn Lịch sử đạt 9 điểm.",
    disciplineComment:
      "Đạt điểm cộng nề nếp do tích cực tham gia chuẩn bị Đại hội Chi đoàn 11A1.",
    attendanceSummary: {
      present: 6,
      excused: 0,
      unexcused: 0,
      late: 0,
    },
    disciplinePoints: 98,
    teacherSignature: "Nguyễn Thị Mai",
    signedDate: "13/09/2026",
    parentFeedback: {
      content: "Gia đình đã xem và ký xác nhận sổ liên lạc tuần.",
      senderName: "Lê Thị Thảo (Mẹ học sinh)",
      submittedAt: "14/09/2026 18:00",
      isConfirmed: true,
    },
  },
  {
    id: "week-01",
    weekNumber: 1,
    startDate: "01/09/2026",
    endDate: "06/09/2026",
    studyComment:
      "Tuần đầu năm học mới bắt nhịp học tập nhanh chóng, mang đầy đủ sách giáo khoa và dụng cụ học tập.",
    disciplineComment:
      "Lễ phép chào hỏi thầy cô, giữ gìn vệ sinh chung, xếp hàng chào cờ nghiêm trang.",
    attendanceSummary: {
      present: 6,
      excused: 0,
      unexcused: 0,
      late: 0,
    },
    disciplinePoints: 100,
    teacherSignature: "Nguyễn Thị Mai",
    signedDate: "06/09/2026",
  },
];

export const mockSubjectFeedbacks: SubjectFeedbackItem[] = [
  {
    id: "sub-toan",
    subjectCode: "MATH",
    subjectName: "Toán học",
    teacherName: "Cô Nguyễn Thị Mai",
    regularScores: [9, 10, 8.5],
    midtermScore: 9.0,
    finalScore: null,
    averageScore: 9.1,
    teacherComment:
      "Tư duy logic nhạy bén, giải nhanh các bài toán cực trị và hình học không gian. Rất hăng hái phát biểu.",
    status: "excellent",
  },
  {
    id: "sub-van",
    subjectCode: "LIT",
    subjectName: "Ngữ văn",
    teacherName: "Thầy Trần Hữu Trọng",
    regularScores: [7.5, 8.0],
    midtermScore: 8.0,
    finalScore: null,
    averageScore: 7.8,
    teacherComment:
      "Cảm thụ văn học khá tốt, hành văn mạch lạc và có cảm xúc. Chú ý đào sâu thêm phần liên hệ thực tế.",
    status: "good",
  },
  {
    id: "sub-anh",
    subjectCode: "ENG",
    subjectName: "Tiếng Anh",
    teacherName: "Cô Đặng Thu Hà",
    regularScores: [9.5, 9.0, 9.5],
    midtermScore: 9.2,
    finalScore: null,
    averageScore: 9.3,
    teacherComment:
      "Khả năng nghe và phản xạ giao tiếp tự tin, vốn từ vựng phong phú. Giữ vững phong độ!",
    status: "excellent",
  },
  {
    id: "sub-ly",
    subjectCode: "PHYS",
    subjectName: "Vật lý",
    teacherName: "Thầy Lê Hoàng Long",
    regularScores: [8.5, 8.0],
    midtermScore: 8.5,
    finalScore: null,
    averageScore: 8.5,
    teacherComment:
      "Nắm chắc các công thức dao động cơ và sóng cơ. Thao tác thực hành trong phòng thí nghiệm cẩn thận.",
    status: "good",
  },
  {
    id: "sub-hoa",
    subjectCode: "CHEM",
    subjectName: "Hóa học",
    teacherName: "Cô Vũ Minh Châu",
    regularScores: [8.0, 8.5],
    midtermScore: 8.0,
    finalScore: null,
    averageScore: 8.2,
    teacherComment:
      "Cân bằng phản ứng oxi hóa - khử tốt, tính toán bài toán dung dịch thành thạo.",
    status: "good",
  },
  {
    id: "sub-sinh",
    subjectCode: "BIO",
    subjectName: "Sinh học",
    teacherName: "Cô Phạm Thanh Thúy",
    regularScores: [8.5, 9.0],
    midtermScore: 8.5,
    finalScore: null,
    averageScore: 8.7,
    teacherComment:
      "Hiểu rõ quy luật di truyền Men-đen, bài thuyết trình về đột biến gen chuẩn bị rất công phu.",
    status: "good",
  },
  {
    id: "sub-su",
    subjectCode: "HIST",
    subjectName: "Lịch sử",
    teacherName: "Thầy Bùi Văn Quang",
    regularScores: [9.0, 8.5],
    midtermScore: null,
    finalScore: null,
    averageScore: 8.8,
    teacherComment:
      "Ghi nhớ các mốc lịch sử chính xác, có tinh thần ham học hỏi các giai đoạn lịch sử hiện đại.",
    status: "good",
  },
  {
    id: "sub-tin",
    subjectCode: "INFO",
    subjectName: "Tin học",
    teacherName: "Thầy Đỗ Minh Tuấn",
    regularScores: [10, 9.5],
    midtermScore: 9.5,
    finalScore: null,
    averageScore: 9.7,
    teacherComment:
      "Lập trình thuật toán Python rất tốt, thường xuyên hoàn thành bài tập sớm nhất lớp và hỗ trợ các bạn.",
    status: "excellent",
  },
];

export const mockParentNotes: ParentNoteItem[] = [
  {
    id: "note-04",
    weekNumber: 4,
    parentName: "Nguyễn Văn Bình",
    parentRole: "Bố học sinh",
    phone: "0912.345.678",
    homeStudyComment:
      "Ở nhà cháu tự giác ngồi vào bàn học đúng 19h30, hoàn thành bài tập Toán và Tiếng Anh trước khi đi ngủ. Tinh thần học tập phấn khởi, sức khỏe tốt.",
    generalOpinion:
      "Gia đình rất mừng vì sự tiến bộ của cháu trong đợt kiểm tra vừa qua. Rất mong cô giáo tiếp tục rèn giũa và bồi dưỡng thêm cho cháu môn Tin học và Tiếng Anh.",
    signedAt: "28/09/2026 19:30",
    isConfirmed: true,
    teacherResponse: {
      teacherName: "Cô Nguyễn Thị Mai (Giáo viên chủ nhiệm)",
      content:
        "Cảm ơn gia đình đã luôn đồng hành cùng nhà trường. Em An đã được chọn vào đội dự tuyển học sinh giỏi Tin học của trường, cô sẽ theo sát hỗ trợ em.",
      respondedAt: "29/09/2026 08:15",
    },
  },
  {
    id: "note-03",
    weekNumber: 3,
    parentName: "Nguyễn Văn Bình",
    parentRole: "Bố học sinh",
    phone: "0912.345.678",
    homeStudyComment:
      "Cháu có bị cảm sốt nhẹ vào giữa tuần nên phải nghỉ 1 buổi. Gia đình đã cho cháu nghỉ ngơi và kèm cháu chép bài, làm bù đầy đủ bài tập môn Hóa.",
    generalOpinion:
      "Gia đình xin chân thành cảm ơn cô giáo chủ nhiệm và các bạn trong tổ đã quan tâm, gửi bài vở kịp thời cho cháu.",
    signedAt: "21/09/2026 20:15",
    isConfirmed: true,
    teacherResponse: {
      teacherName: "Cô Nguyễn Thị Mai (Giáo viên chủ nhiệm)",
      content: "Em An đã hoàn thành bài bù rất tốt, sức khỏe trên lớp ổn định.",
      respondedAt: "22/09/2026 09:00",
    },
  },
  {
    id: "note-02",
    weekNumber: 2,
    parentName: "Lê Thị Thảo",
    parentRole: "Mẹ học sinh",
    phone: "0987.654.321",
    homeStudyComment:
      "Cháu chuẩn bị sách vở và trang phục chu đáo. Tích cực tham gia các hoạt động Đoàn đội của lớp.",
    generalOpinion:
      "Gia đình đã xem kết quả nề nếp và học tập tuần 2 của cháu, hoàn toàn nhất trí với nhận xét của giáo viên chủ nhiệm.",
    signedAt: "14/09/2026 18:00",
    isConfirmed: true,
  },
];

// Giữ alias tương thích
export const mockParentMessages = mockParentNotes;
