"""
Management command to seed complete Timetable schedule, class subject teacher assignments,
and student enrollments for Class 10A1.

Usage:
    uv run python manage.py seed_class_timetable
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.academic.models.infrastructure import Period, Room
from apps.academic.models.timetable import Timetable
from apps.core.models.organization import ClassSubjectTeacher, SchoolClass, StudentClassEnrollment
from apps.core.models.profile import Student, Teacher
from apps.master.models import AcademicYear, Semester, Subject


class Command(BaseCommand):
    help = (
        "Seeds complete timetable schedule, CST assignments, and student enrollment for Class 10A1."
    )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("🚀 Starting Timetable Seeding for Class 10A1..."))

        with transaction.atomic():
            # 1. Resolve Class, Academic Year, and Semester
            school_class = SchoolClass.objects.filter(name="10A1").first()
            if not school_class:
                self.stderr.write(self.style.ERROR("❌ Class 10A1 not found!"))
                return

            academic_year = (
                AcademicYear.objects.filter(is_current=True).first() or AcademicYear.objects.first()
            )
            semester = Semester.objects.filter(is_current=True).first() or Semester.objects.first()

            if not academic_year or not semester:
                self.stderr.write(self.style.ERROR("❌ Academic Year or Semester not found!"))
                return

            self.stdout.write(
                self.style.SUCCESS(
                    f"✔ Target: Class {school_class.name} | AY: {academic_year.name} | Semester: {semester.name}"
                )
            )

            # 2. Seed Student Enrollments for Class 10A1 (core.student_class_enrollments)
            students = Student.objects.filter(current_class=school_class)
            enrollment_created_count = 0
            for stu in students:
                enrollment, created = StudentClassEnrollment.objects.get_or_create(
                    student=stu,
                    school_class=school_class,
                    defaults={
                        "id": uuid6.uuid7(),
                        "enroll_date": academic_year.start_date,
                        "status": "ACTIVE",
                    },
                )
                if created:
                    enrollment_created_count += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"✔ Student Enrollments: {students.count()} students processed ({enrollment_created_count} newly enrolled)."
                )
            )

            # 3. Seed ClassSubjectTeacher assignments for Class 10A1
            subjects = {s.name: s for s in Subject.objects.all()}
            teachers = list(Teacher.objects.select_related("user").all())

            # Priority subjects mapping with periods per week
            subject_configs = [
                ("Toán", 4, "blue"),
                ("Ngữ văn", 4, "violet"),
                ("Ngoại ngữ 1", 3, "amber"),
                ("Vật lí", 2, "cyan"),
                ("Hóa học", 2, "rose"),
                ("Sinh học", 2, "emerald"),
                ("Lịch sử", 2, "amber"),
                ("Địa lí", 2, "emerald"),
                ("Tin học", 2, "indigo"),
                ("Giáo dục thể chất", 2, "emerald"),
                ("Giáo dục quốc phòng và an ninh", 1, "rose"),
                ("Hoạt động trải nghiệm, hướng nghiệp", 2, "violet"),
            ]

            cst_map: dict[str, ClassSubjectTeacher] = {}
            for idx, (subj_name, periods_count, _) in enumerate(subject_configs):
                subj = subjects.get(subj_name)
                if not subj:
                    continue

                assigned_teacher = teachers[idx % len(teachers)]
                cst, _ = ClassSubjectTeacher.objects.get_or_create(
                    school_class=school_class,
                    subject=subj,
                    semester=semester,
                    defaults={
                        "id": uuid6.uuid7(),
                        "teacher": assigned_teacher,
                        "periods_per_week": periods_count,
                        "effective_from": semester.start_date,
                        "effective_to": semester.end_date,
                        "status": "ACTIVE",
                        "notes": f"Phân công giảng dạy môn {subj_name} lớp {school_class.name}",
                    },
                )
                cst_map[subj_name] = cst

            self.stdout.write(
                self.style.SUCCESS(f"✔ ClassSubjectTeacher: {len(cst_map)} subjects configured.")
            )

            # 4. Resolve Periods and Rooms
            periods = {p.period_no: p for p in Period.objects.all()}
            default_room = Room.objects.filter(code="P301").first() or Room.objects.first()
            lab_room = Room.objects.filter(code="LAB_HOA").first() or default_room
            gym_room = Room.objects.filter(code="SAN_TD").first() or default_room

            # 5. Define weekly schedule matrix (Thứ 2 đến Thứ 7)
            # Tuple format: (day_of_week, period_no, subject_name, class_type, color_theme, topic, room)
            schedule_matrix = [
                # --- Thứ 2 (Day 2) ---
                (2, 1, "Toán", "THEORY", "blue", "Mệnh đề toán học & Tập hợp", default_room),
                (2, 2, "Toán", "THEORY", "blue", "Các phép toán trên tập hợp", default_room),
                (
                    2,
                    3,
                    "Ngữ văn",
                    "THEORY",
                    "violet",
                    "Chiến thắng Mtao Mxây (Sử thi Đăm Săn)",
                    default_room,
                ),
                (
                    2,
                    4,
                    "Ngữ văn",
                    "THEORY",
                    "violet",
                    "Thực hành tiếng Việt: Từ Hán Việt",
                    default_room,
                ),
                (
                    2,
                    6,
                    "Giáo dục thể chất",
                    "PRACTICE",
                    "emerald",
                    "Chạy cự ly ngắn & Kỹ thuật xuất phát",
                    gym_room,
                ),
                # --- Thứ 3 (Day 3) ---
                (
                    3,
                    1,
                    "Ngoại ngữ 1",
                    "THEORY",
                    "amber",
                    "Unit 1: Family Life - Reading",
                    default_room,
                ),
                (
                    3,
                    2,
                    "Ngoại ngữ 1",
                    "PRACTICE",
                    "amber",
                    "Unit 1: Language & Pronunciation",
                    default_room,
                ),
                (3, 3, "Vật lí", "THEORY", "cyan", "Chuyển động thẳng đều & Vận tốc", default_room),
                (3, 4, "Vật lí", "PRACTICE", "cyan", "Thực hành đo vận tốc chuyển động", lab_room),
                (
                    3,
                    6,
                    "Tin học",
                    "PRACTICE",
                    "indigo",
                    "Lập trình Python cơ bản - Cú pháp và Biến",
                    default_room,
                ),
                # --- Thứ 4 (Day 4) ---
                (
                    4,
                    1,
                    "Hóa học",
                    "THEORY",
                    "rose",
                    "Thành phần nguyên tử & Hạt nhân",
                    default_room,
                ),
                (
                    4,
                    2,
                    "Hóa học",
                    "PRACTICE",
                    "rose",
                    "Thí nghiệm mô hình cấu tạo nguyên tử",
                    lab_room,
                ),
                (
                    4,
                    3,
                    "Sinh học",
                    "THEORY",
                    "emerald",
                    "Giới thiệu chung về thế giới sống",
                    default_room,
                ),
                (
                    4,
                    4,
                    "Lịch sử",
                    "THEORY",
                    "amber",
                    "Hiện thực lịch sử và nhận thức lịch sử",
                    default_room,
                ),
                # --- Thứ 5 (Day 5) ---
                (5, 1, "Toán", "THEORY", "blue", "Bất phương trình bậc nhất hai ẩn", default_room),
                (5, 2, "Toán", "PRACTICE", "blue", "Luyện tập biểu diễn miền nghiệm", default_room),
                (
                    5,
                    3,
                    "Ngữ văn",
                    "THEORY",
                    "violet",
                    "Gặp Ka-ríp và Xi-la (Sử thi Ô-đi-xê)",
                    default_room,
                ),
                (
                    5,
                    4,
                    "Địa lí",
                    "THEORY",
                    "emerald",
                    "Bản đồ và các phương pháp biểu hiện",
                    default_room,
                ),
                (
                    5,
                    6,
                    "Giáo dục quốc phòng và an ninh",
                    "THEORY",
                    "rose",
                    "Truyền thống đánh giặc giữ nước của dân tộc",
                    default_room,
                ),
                # --- Thứ 6 (Day 6) ---
                (
                    6,
                    1,
                    "Ngoại ngữ 1",
                    "THEORY",
                    "amber",
                    "Unit 1: Listening & Writing",
                    default_room,
                ),
                (
                    6,
                    2,
                    "Vật lí",
                    "THEORY",
                    "cyan",
                    "Chuyển động biến đổi đều & Gia tốc",
                    default_room,
                ),
                (
                    6,
                    3,
                    "Hóa học",
                    "THEORY",
                    "rose",
                    "Bảng tuần hoàn các nguyên tố hóa học",
                    default_room,
                ),
                (
                    6,
                    4,
                    "Tin học",
                    "PRACTICE",
                    "indigo",
                    "Cấu trúc rẽ nhánh if-else trong Python",
                    default_room,
                ),
                # --- Thứ 7 (Day 7) ---
                (
                    7,
                    1,
                    "Toán",
                    "THEORY",
                    "blue",
                    "Hệ bất phương trình bậc nhất hai ẩn",
                    default_room,
                ),
                (
                    7,
                    2,
                    "Ngữ văn",
                    "THEORY",
                    "violet",
                    "Viết văn bản nghị luận phân tích nhân vật",
                    default_room,
                ),
                (
                    7,
                    3,
                    "Sinh học",
                    "PRACTICE",
                    "emerald",
                    "Các cấp độ tổ chức của sự sống",
                    default_room,
                ),
                (
                    7,
                    4,
                    "Hoạt động trải nghiệm, hướng nghiệp",
                    "THEORY",
                    "violet",
                    "Sinh hoạt lớp & Kế hoạch rèn luyện",
                    default_room,
                ),
            ]

            # Clear existing timetables for 10A1 to avoid slot duplicate integrity errors
            Timetable.objects.filter(school_class=school_class).delete()

            timetable_records = []
            for day, period_no, subj_name, class_type, color_theme, topic, room in schedule_matrix:
                cst = cst_map.get(subj_name)
                period_obj = periods.get(period_no)
                if not cst or not period_obj:
                    continue

                timetable_records.append(
                    Timetable(
                        id=uuid6.uuid7(),
                        school_class=school_class,
                        semester=semester,
                        day_of_week=day,
                        period=period_obj,
                        class_subject_teacher=cst,
                        room=room,
                        class_type=class_type,
                        learning_mode="OFFLINE",
                        is_online=False,
                        lesson_topic=topic,
                        notes=f"Chuẩn bị tài liệu môn {subj_name}",
                        color_theme=color_theme,
                        effective_from=semester.start_date,
                        effective_to=semester.end_date,
                    )
                )

            Timetable.objects.bulk_create(timetable_records)
            self.stdout.write(
                self.style.SUCCESS(
                    f"✔ Timetables: Created {len(timetable_records)} weekly recurring slots for Class {school_class.name}."
                )
            )

        self.stdout.write(self.style.SUCCESS("🎉 Seeding Timetable completed successfully!"))
