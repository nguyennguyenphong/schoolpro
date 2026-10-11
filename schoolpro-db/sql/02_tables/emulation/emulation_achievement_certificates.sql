-- =====================================================================
-- TABLE: emulation.achievement_certificates
-- Comprehensive institutional Hall of Fame & Achievement Certificates
-- Showcasing honors, awards, and certifications for students, teachers,
-- staff, classes, grades, and the entire school
-- =====================================================================

CREATE TABLE IF NOT EXISTS emulation.achievement_certificates (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id               UUID NOT NULL REFERENCES core.schools(id) ON DELETE CASCADE,
  academic_year_id        UUID REFERENCES core.academic_years(id) ON DELETE SET NULL,
  semester_id             UUID REFERENCES core.semesters(id) ON DELETE SET NULL,

  -- Recipient / Holder Scope (Individual or Collective)
  recipient_type          VARCHAR(20) NOT NULL DEFAULT 'STUDENT'
                            CHECK (recipient_type IN ('STUDENT', 'TEACHER', 'STAFF', 'CLASS', 'GRADE', 'SCHOOL', 'COLLECTIVE', 'INDIVIDUAL')),
  recipient_name          VARCHAR(255) NOT NULL,               -- Tên cá nhân hoặc tập thể được vinh danh (E.g. 'Nguyễn Văn A', 'Tập thể Lớp 10A1')
  user_id                 UUID REFERENCES core.users(id) ON DELETE SET NULL,
  student_id              UUID REFERENCES core.students(id) ON DELETE SET NULL,
  teacher_id              UUID REFERENCES core.teachers(id) ON DELETE SET NULL,
  staff_id                UUID REFERENCES core.staff(id) ON DELETE SET NULL,
  class_id                UUID REFERENCES core.classes(id) ON DELETE SET NULL,
  grade_id                UUID REFERENCES core.grades(id) ON DELETE SET NULL,

  -- Category of Achievement / Certification
  category                VARCHAR(50) NOT NULL DEFAULT 'ACADEMIC'
                            CHECK (category IN (
                              'ACADEMIC',              -- Học thuật, Nghiên cứu khoa học, Olympic, Học sinh giỏi
                              'FOREIGN_LANGUAGE',      -- Chứng chỉ ngoại ngữ: IELTS, TOEFL, HSK, JLPT, VSTEP...
                              'INFORMATICS_TECH',      -- Tin học, Lập trình, MOS, IC3, STEM, Robotics...
                              'TEACHING_PEDAGOGY',     -- Giáo viên dạy giỏi, Sáng kiến kinh nghiệm, Nghiệp vụ sư phạm
                              'EMULATION_TITLE',       -- Chiến sĩ thi đua, Lao động tiên tiến, Tập thể xuất sắc
                              'COMMENDATION',          -- Bằng khen, Giấy khen các cấp
                              'GOVERNMENT_HONOR',      -- Huân huy chương, Cờ thi đua Chính phủ, Kỷ niệm chương
                              'SPORTS_ARTS',           -- Thể dục thể thao, Văn hóa văn nghệ, Hội khỏe Phù Đổng
                              'COMMUNITY_LEADERSHIP',  -- Công tác Đoàn - Đội, Tình nguyện, Dự án vì cộng đồng
                              'VOCATIONAL_SKILLS',     -- Nghề phổ thông, Chứng chỉ nghề kỹ thuật
                              'OTHER'
                            )),

  -- Certificate & Honor Details
  title                   VARCHAR(255) NOT NULL,               -- Tiêu đề thành tích / Tên chứng chỉ (E.g. 'IELTS Academic 8.0', 'Giải Nhất Giáo viên Giỏi Tỉnh', 'Bằng khen Thủ tướng')
  certificate_code        VARCHAR(100),                        -- Số hiệu chứng chỉ / Số văn bằng
  decision_number         VARCHAR(100),                        -- Số quyết định khen thưởng / công nhận
  decision_date           DATE,                                -- Ngày ký quyết định
  issuing_organization    VARCHAR(255) NOT NULL,               -- Đơn vị / Cơ quan ban hành (Bộ GD&ĐT, UBND Tỉnh, Sở GD&ĐT, IDP, British Council...)
  issue_date              DATE NOT NULL DEFAULT CURRENT_DATE,  -- Ngày cấp
  expiry_date             DATE,                                -- Ngày hết hạn (NULL nếu có giá trị vĩnh viễn)
  level                   VARCHAR(30) NOT NULL DEFAULT 'SCHOOL'
                            CHECK (level IN ('CLASS', 'SCHOOL', 'DISTRICT', 'PROVINCIAL', 'MINISTERIAL', 'NATIONAL', 'INTERNATIONAL')),
  prize_or_rank           VARCHAR(100),                        -- Xếp loại / Giải thưởng: 'Giải Nhất', 'Huy chương Vàng', 'Band 8.0', 'Loại Xuất Sắc'...
  score_details           JSONB DEFAULT '{}'::jsonb,           -- Điểm chi tiết các phần thi/kỹ năng (E.g. {"reading": 8.5, "listening": 8.0})
  summary                 TEXT,                                -- Tóm tắt thành tích vinh danh / Nội dung khen thưởng
  certificate_file_url    TEXT,                                -- Đường dẫn scan/PDF văn bằng chứng chỉ
  badge_icon_url          TEXT,                                -- Icon huy hiệu / Cúp vinh danh hiển thị trên bảng vàng
  verification_url        TEXT,                                -- Link cổng tra cứu xác thực online
  verification_code       VARCHAR(100),                        -- Mã PIN / Tra cứu trên cổng cấp chứng chỉ

  -- Public Showcase & Hall of Fame Controls
  is_public               BOOLEAN NOT NULL DEFAULT TRUE,       -- Công khai cho mọi người cùng chiêm ngưỡng trên Bảng thành tích
  is_featured             BOOLEAN NOT NULL DEFAULT FALSE,      -- Ghim nổi bật trên Bảng vàng trang chủ (Hall of Fame)
  display_order           SMALLINT NOT NULL DEFAULT 0,         -- Thứ tự ưu tiên hiển thị
  views_count             INT NOT NULL DEFAULT 0,              -- Số lượt xem và ngưỡng mộ thành tích

  -- Verification Workflow
  status                  VARCHAR(20) NOT NULL DEFAULT 'APPROVED'
                            CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
  verified_by             UUID REFERENCES core.users(id) ON DELETE SET NULL,
  verified_at             TIMESTAMPTZ,
  rejection_reason        TEXT,
  metadata                JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optimized Indexes
CREATE INDEX IF NOT EXISTS ix_achieve_cert_school ON emulation.achievement_certificates(school_id);
CREATE INDEX IF NOT EXISTS ix_achieve_cert_recipient ON emulation.achievement_certificates(recipient_type, recipient_name);
CREATE INDEX IF NOT EXISTS ix_achieve_cert_user ON emulation.achievement_certificates(user_id);
CREATE INDEX IF NOT EXISTS ix_achieve_cert_student ON emulation.achievement_certificates(student_id);
CREATE INDEX IF NOT EXISTS ix_achieve_cert_teacher ON emulation.achievement_certificates(teacher_id);
CREATE INDEX IF NOT EXISTS ix_achieve_cert_class ON emulation.achievement_certificates(class_id);
CREATE INDEX IF NOT EXISTS ix_achieve_cert_category ON emulation.achievement_certificates(category);
CREATE INDEX IF NOT EXISTS ix_achieve_cert_public ON emulation.achievement_certificates(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS ix_achieve_cert_featured ON emulation.achievement_certificates(is_featured) WHERE is_featured = TRUE;

COMMENT ON TABLE emulation.achievement_certificates IS 'Institutional Hall of Fame & Achievement Certificates showcasing individual and collective accolades';
COMMENT ON COLUMN emulation.achievement_certificates.recipient_type IS 'Target entity type: STUDENT, TEACHER, STAFF, CLASS, GRADE, SCHOOL, COLLECTIVE';
COMMENT ON COLUMN emulation.achievement_certificates.is_public IS 'Flag allowing any visitor or student to view this achievement on the school showcase board';
COMMENT ON COLUMN emulation.achievement_certificates.is_featured IS 'Featured spotlight flag for top accolades pinned on the home Hall of Fame board';
