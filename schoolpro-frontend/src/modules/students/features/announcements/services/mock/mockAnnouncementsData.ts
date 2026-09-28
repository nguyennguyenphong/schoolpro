import type { AnnouncementItem } from "@/modules/students/features/announcements/types";

export const mockAnnouncements: AnnouncementItem[] = [
  {
    id: "ann-01",
    title: "Thông báo khẩn về Lịch thi Giữa Học kỳ 1 và Quy chế phòng thi",
    summary:
      "Nhà trường công bố lịch thi chi tiết các môn Toán, Văn, Anh và các môn tổ hợp tự chọn KHTN/KHXH cho toàn thể học sinh.",
    content: `Kính gửi Quý Phụ huynh và các em Học sinh,

Ban Giám hiệu và Hội đồng Khảo thí Nhà trường thông báo kế hoạch tổ chức kiểm tra đánh giá định kỳ Giữa Học kỳ 1 năm học 2026 - 2027 như sau:

1. Thời gian tổ chức: Từ ngày 15/10/2026 đến hết ngày 20/10/2026.
2. Hình thức thi: Kết hợp trắc nghiệm khách quan trên giấy và bài thi tự luận. Riêng môn Tin học thi trực tiếp trên hệ thống máy tính School Pro.
3. Yêu cầu đối với thí sinh:
   - Có mặt tại phòng thi trước giờ phát đề ít nhất 15 phút.
   - Mang theo thẻ học sinh hoặc giấy tờ tùy thân có dán ảnh.
   - Nghiêm cấm mang điện thoại di động và thiết bị thu phát sóng vào phòng thi.

Thí sinh tra cứu số báo danh và phòng thi chi tiết trong tệp đính kèm bên dưới. Mọi thắc mắc vui lòng liên hệ Văn phòng Khảo thí tại Phòng A.102.`,
    publishDate: "2026-09-28 08:30",
    author: "ThS. Hoàng Văn Nam",
    department: "Phòng Khảo thí & Đảm bảo CLGD",
    category: "exam",
    priority: "urgent",
    isPinned: true,
    isRead: false,
    viewsCount: 1420,
    targetAudience: "Toàn thể học sinh Khối 10, 11, 12",
    attachments: [
      {
        id: "att-01",
        name: "Lich_thi_giua_ky_1_2026.pdf",
        url: "#",
        size: "1.2 MB",
        fileType: "pdf",
      },
      {
        id: "att-02",
        name: "Danh_sach_phong_thi_va_SBD.xlsx",
        url: "#",
        size: "850 KB",
        fileType: "xlsx",
      },
    ],
  },
  {
    id: "ann-02",
    title: "Kế hoạch tổ chức Hội trại Thanh niên & Hội thao Chào mừng Ngày Nhà giáo",
    summary:
      "Đoàn trường phát động chuỗi hoạt động văn hóa, văn nghệ, giải bóng đá mini nam - nữ và hội chợ ẩm thực học sinh.",
    content: `Thực hiện kế hoạch năm học 2026 - 2027, Đoàn Thanh niên Trường phát động chuỗi hoạt động thi đua lập thành tích chào mừng ngày 20/11:

1. Giải bóng đá mini nam - nữ giữa các chi đoàn lớp (khởi tranh từ 05/10/2026).
2. Hội diễn văn nghệ 'Giai điệu Tri ân' cấp trường.
3. Hội trại truyền thống và gian hàng sáng tạo STEM của các khối lớp.

Ban Chấp hành các Chi đoàn nộp danh sách đăng ký tham gia về Văn phòng Đoàn trường trước ngày 02/10/2026. Chi tiết điều lệ thi đấu xem tại tệp đính kèm.`,
    publishDate: "2026-09-27 14:15",
    author: "Bí thư Đoàn Trường",
    department: "Đoàn Thanh niên & Công tác Học sinh",
    category: "activity",
    priority: "high",
    isPinned: true,
    isRead: false,
    viewsCount: 890,
    targetAudience: "Đoàn viên & Thanh niên các Chi đoàn",
    attachments: [
      {
        id: "att-03",
        name: "Dieu_le_giai_bong_da_2026.pdf",
        url: "#",
        size: "620 KB",
        fileType: "pdf",
      },
    ],
  },
  {
    id: "ann-03",
    title: "Thông báo thu Bảo hiểm Y tế bắt buộc và Học phí Học kỳ 1 (Đợt 1)",
    summary:
      "Phòng Kế hoạch - Tài chính hướng dẫn thủ tục tra cứu và thanh toán học phí, BHYT qua cổng thanh toán số trên School Pro.",
    content: `Căn cứ Luật Bảo hiểm Y tế và quy định mức thu học phí năm học 2026 - 2027:

1. Khoản thu BHYT học sinh (12 tháng): 972.000 VNĐ (đã có hỗ trợ từ ngân sách nhà nước).
2. Học phí Học kỳ 1: Theo thông báo chi tiết của từng khối lớp.
3. Thời hạn hoàn thành: Đến hết ngày 10/10/2026.

Học sinh và Phụ huynh có thể thanh toán trực tiếp qua Cổng thanh toán trực tuyến của School Pro hoặc quét mã QR VietQR tại mục 'Học phí & Khoản thu' trên ứng dụng di động.`,
    publishDate: "2026-09-26 10:00",
    author: "Kế toán trưởng",
    department: "Phòng Kế hoạch - Tài chính",
    category: "tuition",
    priority: "high",
    isPinned: false,
    isRead: true,
    viewsCount: 1650,
    targetAudience: "Tất cả học sinh",
    attachments: [
      {
        id: "att-04",
        name: "Huong_dan_thanh_toan_online_VietQR.pdf",
        url: "#",
        size: "2.1 MB",
        fileType: "pdf",
      },
    ],
  },
  {
    id: "ann-04",
    title: "Kế hoạch khảo sát năng lực Ngoại ngữ chuẩn đầu ra cho Học sinh Khối 12",
    summary:
      "Tổ Ngoại ngữ tổ chức đợt thi thử IELTS/VSTEP định dạng quốc tế nhằm phân loại và hỗ trợ bồi dưỡng học sinh trước kỳ thi TN THPT.",
    content: `Nhằm đánh giá đúng năng lực và xây dựng lộ trình bồi dưỡng tiếng Anh cho học sinh lớp 12 chuẩn bị xét tuyển đại học:

- Đối tượng: Toàn bộ học sinh khối 12 chưa có chứng chỉ quốc tế IELTS >= 5.5.
- Thời gian thi: Chủ Nhật, ngày 18/10/2026.
- Địa điểm: Tầng 3 Nhà Thư viện & Ngoại ngữ.
- Bài thi gồm 4 kỹ năng: Nghe, Đọc, Viết và Nói trực tiếp với giáo viên bản ngữ.`,
    publishDate: "2026-09-25 16:45",
    author: "Tổ trưởng Tổ Ngoại ngữ",
    department: "Tổ Chuyên môn Ngoại ngữ",
    category: "academic",
    priority: "normal",
    isPinned: false,
    isRead: true,
    viewsCount: 740,
    targetAudience: "Học sinh Khối 12",
    attachments: [
      {
        id: "att-05",
        name: "Format_de_thi_khao_sat_tieng_anh.pdf",
        url: "#",
        size: "940 KB",
        fileType: "pdf",
      },
    ],
  },
  {
    id: "ann-05",
    title: "Thông báo Họp Phụ huynh Định kỳ và Triển khai Sổ Liên lạc Điện tử Tuần 4",
    summary:
      "Giáo viên chủ nhiệm lớp gửi phiếu nhận xét rèn luyện nề nếp và kết quả học tập tháng 9 của học sinh tới Quý Phụ huynh.",
    content: `Kính gửi Quý Cha Mẹ Học sinh lớp 12A1,

Thầy/Cô chủ nhiệm trân trọng thông báo:
1. Phiếu nhận xét nề nếp, chuyên cần và điểm kiểm tra 15 phút tháng 9 đã được cập nhật trên mục Sổ liên lạc điện tử.
2. Buổi gặp gỡ định kỳ giữa GVCN và Đại diện Ban phụ huynh lớp sẽ diễn ra vào sáng Thứ Bảy lúc 08h30 ngày 03/10/2026 tại phòng học 12A1.
3. Kính mong phụ huynh xác nhận đã xem thông tin trên hệ thống School Pro.`,
    publishDate: "2026-09-24 09:10",
    author: "Thầy Lê Minh Tuấn",
    department: "Ban Cố vấn & GVCN Lớp 12A1",
    category: "homeroom",
    priority: "normal",
    isPinned: false,
    isRead: false,
    viewsCount: 45,
    targetAudience: "Học sinh & Phụ huynh Lớp 12A1",
  },
  {
    id: "ann-06",
    title: "Đăng ký tham gia Câu lạc bộ Sáng tạo Khoa học Kỹ thuật & Robotics",
    summary:
      "CLB Robotics trường mở đợt tuyển thành viên mới khóa 2026, chuẩn bị tham gia giải đấu VEX Robotics và Ngày hội STEM cấp Thành phố.",
    content: `Các bạn học sinh đam mê Lập trình, Cơ điện tử và Trí tuệ nhân tạo (AI):

Câu lạc bộ STEM - Robotics chính thức mở đơn chiêu mộ thành viên đợt 1 năm học 2026:
- Các ban tuyển dụng: Lập trình điều khiển, Thiết kế 3D/Cơ khí, Truyền thông & Hậu cần.
- Quyền lợi: Được hướng dẫn bởi chuyên gia, sử dụng phòng Lab công nghệ cao, nhận giấy chứng nhận và điểm cộng thi đua khen thưởng.
- Link đăng ký trực tuyến mở đến 23h59 ngày 05/10/2026.`,
    publishDate: "2026-09-23 15:20",
    author: "Chủ nhiệm CLB STEM",
    department: "CLB Sáng tạo Trẻ",
    category: "activity",
    priority: "normal",
    isPinned: false,
    isRead: true,
    viewsCount: 580,
    targetAudience: "Toàn trường",
  },
  {
    id: "ann-07",
    title: "Quy định về Đồng phục, Nề nếp Kỷ luật và Chấm điểm Thi đua Cờ đỏ",
    summary:
      "Ban Giám thị phối hợp cùng Đội Cờ đỏ triển khai biểu điểm chấm thi đua mới áp dụng theo mô hình trường học số thông minh.",
    content: `Nhằm xây dựng môi trường học đường văn minh, kỷ cương và thanh lịch:

1. Học sinh mặc đồng phục đúng quy định các ngày trong tuần: Áo sơ mi trắng có phù hiệu trường, quần tây xanh đen/tối màu, giày có quai hậu hoặc giày thể thao.
2. Thứ Hai chào cờ đầu tuần: Mặc đồng phục áo vest/áo dài truyền thống.
3. Giờ giấc: Cổng trường đóng vào lúc 07h00 sáng. Mọi trường hợp đi trễ sẽ được ghi nhận vào hệ thống điểm danh điện tử và trừ điểm thi đua của chi đoàn.
4. Đội Cờ đỏ thực hiện giám sát độc lập và gửi kết quả tổng kết về Ban Thi đua vào 16h00 Thứ Sáu hàng tuần.`,
    publishDate: "2026-09-22 11:30",
    author: "Thầy Trịnh Xuân Bách",
    department: "Ban Giám thị & Quản lý Học sinh",
    category: "general",
    priority: "normal",
    isPinned: false,
    isRead: true,
    viewsCount: 1120,
    targetAudience: "Toàn thể học sinh",
    attachments: [
      {
        id: "att-06",
        name: "Noi_quy_ne_nep_hoc_sinh_2026.pdf",
        url: "#",
        size: "450 KB",
        fileType: "pdf",
      },
    ],
  },
  {
    id: "ann-08",
    title: "Lịch sinh hoạt Chuyên đề Kỹ năng sống & Tư vấn Tâm lý Học đường",
    summary:
      "Phòng Tham vấn Tâm lý tổ chức buổi chia sẻ 'Vượt qua áp lực học tập và quản lý thời gian hiệu quả' tại Hội trường lớn.",
    content: `Nhằm trang bị cho học sinh các kỹ năng giải tỏa căng thẳng và lập kế hoạch học tập khoa học trong giai đoạn thi cử:

- Diễn giả khách mời: Chuyên gia tâm lý học giáo dục TS. Vũ Thùy Linh.
- Thời gian: Tiết 4-5 sáng Thứ Năm (ngày 08/10/2026).
- Địa điểm: Hội trường A, Tầng 2.
- Học sinh có câu hỏi hoặc cần tư vấn 1-1 riêng tư có thể đặt lịch trước qua hòm thư điện tử tâm lý học đường trên School Pro.`,
    publishDate: "2026-09-21 09:00",
    author: "Ban Tư vấn Tâm lý",
    department: "Phòng Y tế & Tư vấn Học đường",
    category: "activity",
    priority: "normal",
    isPinned: false,
    isRead: true,
    viewsCount: 430,
    targetAudience: "Toàn thể học sinh",
  },
  {
    id: "ann-09",
    title: "Đăng ký tham gia Kỳ thi Chọn Học sinh Giỏi cấp Trường năm học 2026 - 2027",
    summary:
      "Phòng Đào tạo phát động đăng ký thi HSG các môn Toán, Lý, Hóa, Sinh, Tin, Văn, Sử, Địa, Tiếng Anh cho khối 10, 11 và 12.",
    content: `Căn cứ kế hoạch bồi dưỡng đội tuyển học sinh giỏi tham dự kỳ thi cấp Tỉnh/Thành phố:

1. Đối tượng dự thi: Học sinh có điểm tổng kết môn đạt từ 8.0 trở lên trong năm học trước.
2. Thời gian thi tuyển cấp Trường: Ngày 24/10/2026.
3. Hình thức làm bài: Tự luận và thực hành (môn Tin học).
4. Học sinh đạt giải Nhất, Nhì, Ba sẽ được tuyển chọn vào đội tuyển bồi dưỡng của trường và nhận điểm thưởng thi đua nề nếp.`,
    publishDate: "2026-09-20 10:00",
    author: "Tổ Bồi dưỡng HSG",
    department: "Phòng Đào tạo & Quản lý Học sinh",
    category: "academic",
    priority: "urgent",
    isPinned: false,
    isRead: false,
    viewsCount: 1350,
    targetAudience: "Học sinh có nguyện vọng dự thi HSG",
    attachments: [
      {
        id: "att-07",
        name: "Quy_che_thi_HSG_cap_truong_2026.pdf",
        url: "#",
        size: "720 KB",
        fileType: "pdf",
      },
    ],
  },
  {
    id: "ann-10",
    title: "Chương trình Học bổng 'Thắp sáng Ước mơ' của Hội Cựu Học sinh Niên khóa 2000",
    summary:
      "Quỹ Khuyến học nhà trường tiếp nhận hồ sơ xét cấp 30 suất học bổng toàn phần dành cho học sinh có hoàn cảnh khó khăn vươn lên học tốt.",
    content: `Quỹ Học bổng 'Thắp sáng Ước mơ' tài trợ bởi Hội Cựu học sinh trường:

- Giá trị mỗi suất: 5.000.000 VNĐ tiền mặt và 1 bộ tài liệu học tập toàn diện.
- Tiêu chuẩn xét duyệt: Học sinh thuộc diện hộ nghèo/cận nghèo, mồ côi hoặc gia đình có hoàn cảnh đặc biệt khó khăn; hạnh kiểm Tốt, học lực Khá trở lên.
- Hạn chót nộp hồ sơ tại Văn phòng Đoàn trường: 12/10/2026.`,
    publishDate: "2026-09-19 14:00",
    author: "Hội Khuyến học Trường",
    department: "Phòng Kế hoạch - Tài chính",
    category: "tuition",
    priority: "high",
    isPinned: false,
    isRead: true,
    viewsCount: 920,
    targetAudience: "Học sinh diện chính sách & vượt khó",
    attachments: [
      {
        id: "att-08",
        name: "Don_xin_xet_cap_hoc_bong_2026.docx",
        url: "#",
        size: "120 KB",
        fileType: "docx",
      },
    ],
  },
  {
    id: "ann-11",
    title: "Kế hoạch Khám Sức khỏe Định kỳ và Cấp phát Thuốc Y tế Đầu năm học",
    summary:
      "Trạm Y tế phối hợp với Trung tâm Y tế Quận tổ chức khám chuyên khoa Mắt, Răng Hàm Mặt, Tai Mũi Họng và đo khúc xạ.",
    content: `Thực hiện công tác chăm sóc sức khỏe học đường năm học 2026 - 2027:

- Địa điểm khám: Nhà Đa năng, Tầng 1.
- Khối 10: Sáng Thứ Hai (ngày 05/10/2026).
- Khối 11: Chiều Thứ Hai (ngày 05/10/2026).
- Khối 12: Sáng Thứ Ba (ngày 06/10/2026).
- Học sinh có bệnh lý mãn tính mang theo hồ sơ bệnh án để được bác sĩ tư vấn miễn phí.`,
    publishDate: "2026-09-18 08:30",
    author: "Bác sĩ Trường",
    department: "Phòng Y tế & Tư vấn Học đường",
    category: "general",
    priority: "normal",
    isPinned: false,
    isRead: true,
    viewsCount: 610,
    targetAudience: "Toàn thể học sinh",
  },
  {
    id: "ann-12",
    title: "Lịch Thi Thử Tốt Nghiệp THPT Đợt 1 Chuẩn Cấu Trúc Bộ Giáo Dục",
    summary:
      "Tổ Khảo thí tổ chức đợt thi thử trực tuyến mô phỏng đề thi minh họa tốt nghiệp THPT theo chương trình GDPT 2018.",
    content: `Chuẩn bị cho kỳ thi tốt nghiệp THPT quốc gia năm 2027:

- Hình thức: Làm bài trực tuyến trên hệ thống thi số School Pro Exam.
- Thời gian mở cổng thi thử: Từ 08h00 ngày 25/10 đến 22h00 ngày 26/10/2026.
- Kết quả được phân tích tự động bằng biểu đồ năng lực theo từng dạng bài và mức độ câu hỏi nhận thức.`,
    publishDate: "2026-09-17 16:00",
    author: "Hội đồng Khảo thí",
    department: "Phòng Khảo thí & Đảm bảo CLGD",
    category: "exam",
    priority: "high",
    isPinned: false,
    isRead: false,
    viewsCount: 1850,
    targetAudience: "Học sinh Khối 12",
  },
  {
    id: "ann-13",
    title: "Phát Động Chiến Dịch Tình Nguyện 'Áo Ấm Mùa Đông' và Tủ Sách Cho Em",
    summary:
      "Đoàn trường kêu gọi quyên góp áo ấm, sách giáo khoa cũ và dụng cụ học tập gửi tặng học sinh điểm trường vùng cao.",
    content: `Phát huy truyền thống tương thân tương ái, Đoàn TNCS Hồ Chí Minh trường phát động chiến dịch thiện nguyện:

1. Thời gian tiếp nhận quyên góp: Từ ngày 01/10 đến 15/10/2026 tại Sảnh Hội trường lớn.
2. Các hiện vật tiếp nhận: Áo ấm, chăn bông mới, truyện thiếu nhi, sách giáo khoa THCS/THPT còn dùng tốt.
3. Chi đoàn có đóng góp tích cực sẽ được tuyên dương tại Lễ Chào cờ đầu tuần và cộng điểm phong trào.`,
    publishDate: "2026-09-16 11:00",
    author: "Đoàn Trường",
    department: "Đoàn Thanh niên & Công tác Học sinh",
    category: "activity",
    priority: "normal",
    isPinned: false,
    isRead: true,
    viewsCount: 780,
    targetAudience: "Học sinh các Chi đoàn",
  },
  {
    id: "ann-14",
    title: "Hướng Dẫn Bầu Cán Bộ Lớp và Ban Chấp Hành Chi Đoàn Khóa 2026",
    summary:
      "Giáo viên chủ nhiệm hướng dẫn tiêu chí lựa chọn Lớp trưởng, Lớp phó học tập, Bí thư chi đoàn và các tổ trưởng.",
    content: `Nhằm kiện toàn ban cán sự lớp và ban chấp hành chi đoàn cho năm học mới:

- Tiêu chuẩn: Gương mẫu trong học tập và nề nếp, nhiệt tình tham gia hoạt động tập thể, có năng lực lãnh đạo và kết nối bạn bè.
- Đại hội Chi đoàn lớp sẽ tiến hành vào tiết Sinh hoạt lớp Thứ Bảy (ngày 03/10/2026).
- Kết quả bầu cử được lập biên bản và gửi về Phòng Công tác Học sinh trước ngày 05/10/2026.`,
    publishDate: "2026-09-15 09:30",
    author: "Thầy Lê Minh Tuấn",
    department: "Ban Cố vấn & GVCN Lớp 12A1",
    category: "homeroom",
    priority: "normal",
    isPinned: false,
    isRead: true,
    viewsCount: 390,
    targetAudience: "Học sinh Lớp 12A1",
  },
];
