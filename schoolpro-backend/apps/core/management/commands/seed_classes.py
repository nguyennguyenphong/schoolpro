"""
Management command to seed comprehensive School Classes across Grades 10, 11, and 12.
Creates 70 classes in total:
  - Grade 10: 10A1 -> 10A24 (24 classes)
  - Grade 11: 11A1 -> 11A23 (23 classes)
  - Grade 12: 12A1 -> 12A23 (23 classes)

Allocates rooms harmoniously across MORNING and AFTERNOON shifts while
strictly maintaining designated reserve/backup contingency classrooms in every wing.
Table: "core"."classes"

Usage:
    python manage.py seed_classes
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.academic.models.infrastructure import Room
from apps.core.models.organization import SchoolClass
from apps.core.models.profile import Teacher
from apps.master.models.academic_year import AcademicYear
from apps.master.models.grade import Grade
from apps.master.models.school import School
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = (
        "Seeds 70 comprehensive School Classes (10A1-10A24, 11A1-11A23, 12A1-12A23) "
        "distributed harmoniously across Morning and Afternoon shifts with dedicated contingency rooms."
    )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.NOTICE(
                "Seeding 70 Classes (10A1-10A24, 11A1-11A23, 12A1-12A23) into core.classes..."
            )
        )
        school = School.objects.first()
        ay = AcademicYear.objects.filter(is_current=True).first() or AcademicYear.objects.first()

        grade_10 = (
            Grade.objects.filter(order_no=10).first()
            or Grade.objects.filter(name="Khối 10").first()
        )
        grade_11 = (
            Grade.objects.filter(order_no=11).first()
            or Grade.objects.filter(name="Khối 11").first()
        )
        grade_12 = (
            Grade.objects.filter(order_no=12).first()
            or Grade.objects.filter(name="Khối 12").first()
        )

        if not grade_10 or not grade_11 or not grade_12:
            self.stdout.write(
                self.style.ERROR("Grades 10, 11, or 12 not found. Please seed Grades first.")
            )
            return

        # Cache key homeroom teachers
        teacher_map = {
            t.user.username: t for t in Teacher.objects.select_related("user").filter(school=school)
        }

        # Cache rooms dictionary by name
        room_map = {r.name: r for r in Room.objects.filter(school=school)}

        # Helper to determine curriculum stream
        def get_stream(index: int) -> str:
            if index <= 8:
                return "NATURAL_SCIENCE"
            elif index <= 16:
                return "SOCIAL_SCIENCE"
            return "BASIC"

        classes_data = []

        # =========================================================================
        # 1. GRADE 10: 10A1 -> 10A24 (24 CLASSES)
        # Dedicated wing: Building A (Dãy A)
        # Contingency reserve rooms kept untouched: Phòng học A209, Phòng học A210
        # =========================================================================
        grade_10_teachers = {
            1: teacher_map.get("gvcn_10a1"),
            2: teacher_map.get("gv_toan_01"),
            3: teacher_map.get("gv_van_01"),
            4: teacher_map.get("gvbm_tienganh"),
            5: teacher_map.get("gv_ly_01"),
            6: teacher_map.get("gv_hoa_01"),
            7: teacher_map.get("gv_sinh_01"),
            8: teacher_map.get("gv_su_01"),
            9: teacher_map.get("gv_dia_01"),
            10: teacher_map.get("gv_ktpl_01"),
        }

        slogans_10 = [
            "Đoàn kết, Sáng tạo, Tự tin tỏa sáng",
            "Vững bước tương lai, Chinh phục thử thách",
            "Năng động, Hội nhập, Tiên phong",
            "Vươn tầm cao mới, Tri thức là sức mạnh",
            "Nhiệt huyết thanh xuân, Khát khao vươn xa",
            "Thắp sáng ước mơ, Khởi nguồn sáng tạo",
            "Kỷ cương, Tình thương, Trách nhiệm",
            "Bứt phá mọi giới hạn",
            "Cùng nhau bước tới đỉnh vinh quang",
            "Tự tin khẳng định bản thân",
            "Học hết mình, Chơi nhiệt tình",
            "Đoàn kết là sức mạnh vô địch",
            "Sáng tạo không ngừng, Thành công bền vững",
            "Vượt sóng vươn khơi",
            "Tri thức soi đường, Đam mê dẫn lối",
            "Vươn lên từ ý chí",
            "Kết nối tình bạn, Vững bước ngày mai",
            "Tỏa sáng theo cách riêng của bạn",
            "Trẻ trung, Sôi nổi, Đoàn kết",
            "Tự hào là học sinh SchoolPro",
            "Vững vàng tri thức, Khát vọng tương lai",
            "Nỗ lực từng ngày, Gặt hái tương lai",
            "Năng động sáng tạo, Hội nhập quốc tế",
            "24 sắc màu - Một mái nhà chung 10A",
        ]

        for i in range(1, 25):
            cls_name = f"10A{i}"
            stream = get_stream(i)

            # Shift & Room allocation:
            # - 10A1 -> 10A12: MORNING shift (Rooms A101-A110, A201-A202)
            # - 10A13 -> 10A24: AFTERNOON shift (Rooms A101-A110, A201-A202)
            if i <= 12:
                shift = "MORNING"
                room_num = f"A1{i:02d}" if i <= 10 else f"A20{i - 10}"
            else:
                shift = "AFTERNOON"
                idx = i - 12
                room_num = f"A1{idx:02d}" if idx <= 10 else f"A20{idx - 10}"

            room_name = f"Phòng học {room_num}"
            room_obj = room_map.get(room_name)

            classes_data.append(
                {
                    "name": cls_name,
                    "grade": grade_10,
                    "teacher": grade_10_teachers.get(i),
                    "stream": stream,
                    "room": room_obj,
                    "room_name": room_name,
                    "shift": shift,
                    "slogan": f"{cls_name} - {slogans_10[i - 1]}",
                    "backup_room": "Phòng học A209",
                }
            )

        # =========================================================================
        # 2. GRADE 11: 11A1 -> 11A23 (23 CLASSES)
        # Dedicated wing: Building B (Dãy B)
        # Contingency reserve rooms kept untouched: Phòng học B209, Phòng học B210
        # =========================================================================
        grade_11_teachers = {
            1: teacher_map.get("topho_toan"),
            2: teacher_map.get("topho_van"),
            3: teacher_map.get("topho_ngoaingu"),
            4: teacher_map.get("topho_ly"),
            5: teacher_map.get("topho_hoasinh"),
            6: teacher_map.get("topho_sudia"),
            7: teacher_map.get("topho_ktpl"),
            8: teacher_map.get("topho_gdtc_qpan"),
            9: teacher_map.get("topho_nghethuat"),
            10: teacher_map.get("topho_trainghiem"),
        }

        slogans_11 = [
            "Chinh phục đỉnh cao tri thức",
            "Bứt phá ngoạn mục, Chạm tới ước mơ",
            "Đoàn kết một lòng, Vững bước tiên phong",
            "Vững vàng tri thức, Bền bỉ ý chí",
            "Sáng tạo hôm nay, Thành công ngày mai",
            "Tự tin bước tới, Tỏa sáng tài năng",
            "Nơi ươm mầm những khát vọng",
            "Vượt mọi rào cản, Vươn tới thành công",
            "Học nhiệt tình, Khởi sắc tương lai",
            "Cùng nhau chung bước, Kiến tạo tương lai",
            "Tỏa sáng đam mê, Vững vàng phong cách",
            "Năng động, Sáng tạo, Bản lĩnh",
            "Tinh thần đồng đội, Sức mạnh tập thể",
            "Thắp lửa đam mê, Đón chào cơ hội",
            "Hành trình kỳ diệu, Tri thức vững vàng",
            "Đoàn kết là then chốt, Tri thức là vũ khí",
            "Khát khao học hỏi, Tự tin tỏa sáng",
            "Một tập thể, Một trái tim",
            "Chạm tới đỉnh cao, Khẳng định vị thế",
            "Bản lĩnh tuổi 17",
            "Ước mơ không đợi chờ",
            "Tiên phong trong mọi hoạt động",
            "Vươn xa cùng SchoolPro",
        ]

        for i in range(1, 24):
            cls_name = f"11A{i}"
            stream = get_stream(i)

            # Shift & Room allocation:
            # - 11A1 -> 11A12: MORNING shift (Rooms B101-B110, B201-B202)
            # - 11A13 -> 11A23: AFTERNOON shift (Rooms B101-B110, B201)
            if i <= 12:
                shift = "MORNING"
                room_num = f"B1{i:02d}" if i <= 10 else f"B20{i - 10}"
            else:
                shift = "AFTERNOON"
                idx = i - 12
                room_num = f"B1{idx:02d}" if idx <= 10 else f"B20{idx - 10}"

            room_name = f"Phòng học {room_num}"
            room_obj = room_map.get(room_name)

            classes_data.append(
                {
                    "name": cls_name,
                    "grade": grade_11,
                    "teacher": grade_11_teachers.get(i),
                    "stream": stream,
                    "room": room_obj,
                    "room_name": room_name,
                    "shift": shift,
                    "slogan": f"{cls_name} - {slogans_11[i - 1]}",
                    "backup_room": "Phòng học B209",
                }
            )

        # =========================================================================
        # 3. GRADE 12: 12A1 -> 12A23 (23 CLASSES)
        # Dedicated wing: Building C (Dãy C)
        # Contingency reserve rooms kept untouched: Phòng học C209, Phòng học C210
        # =========================================================================
        grade_12_teachers = {
            1: teacher_map.get("totruong_toan"),
            2: teacher_map.get("totruong_van"),
            3: teacher_map.get("totruong_ngoaingu"),
            4: teacher_map.get("totruong_ly"),
            5: teacher_map.get("totruong_hoasinh"),
            6: teacher_map.get("totruong_sudia"),
            7: teacher_map.get("totruong_ktpl"),
            8: teacher_map.get("totruong_gdtc_qpan"),
            9: teacher_map.get("totruong_nghethuat"),
            10: teacher_map.get("totruong_trainghiem"),
        }

        slogans_12 = [
            "Vượt vũ môn hóa rồng",
            "Quyết tâm đỗ nguyện vọng 1",
            "Cháy hết mình cho mùa thi thắng lợi",
            "12 năm đèn sách - Một bước thăng hoa",
            "Bản lĩnh sĩ tử SchoolPro",
            "Vững vàng tâm lý, Chắc bước tương lai",
            "Không bao giờ bỏ cuộc",
            "Chinh phục cánh cổng giảng đường đại học",
            "Mùa hạ cuối cùng - Tỏa sáng rực rỡ",
            "Khát vọng dẫn lối thành công",
            "Tự tin bước vào kỳ thi quốc gia",
            "Mỗi ngày một nỗ lực, Tương lai rộng mở",
            "Chiến binh 12A, Quyết tâm chiến thắng",
            "Hành trang tri thức, Vững bước vào đời",
            "Nơi khởi đầu của những ước mơ lớn",
            "Tự hào là thế hệ vàng SchoolPro",
            "Kỷ luật là cầu nối thành công",
            "Bền gan vững chí, Gặt hái thủ khoa",
            "Tập trung cao độ, Đạt điểm tối đa",
            "Thanh xuân rực rỡ, Tương lai huy hoàng",
            "Chiến thắng thuộc về người kiên trì",
            "Chạm tay vào ước mơ đại học",
            "Dấu ấn thanh xuân 12A trọn vẹn",
        ]

        for i in range(1, 24):
            cls_name = f"12A{i}"
            stream = get_stream(i)

            # Shift & Room allocation:
            # - 12A1 -> 12A12: MORNING shift (Rooms C101-C110, C201-C202)
            # - 12A13 -> 12A23: AFTERNOON shift (Rooms C101-C110, C201)
            if i <= 12:
                shift = "MORNING"
                room_num = f"C1{i:02d}" if i <= 10 else f"C20{i - 10}"
            else:
                shift = "AFTERNOON"
                idx = i - 12
                room_num = f"C1{idx:02d}" if idx <= 10 else f"C20{idx - 10}"

            room_name = f"Phòng học {room_num}"
            room_obj = room_map.get(room_name)

            classes_data.append(
                {
                    "name": cls_name,
                    "grade": grade_12,
                    "teacher": grade_12_teachers.get(i),
                    "stream": stream,
                    "room": room_obj,
                    "room_name": room_name,
                    "shift": shift,
                    "slogan": f"{cls_name} - {slogans_12[i - 1]}",
                    "backup_room": "Phòng học C209",
                }
            )

        total_classes = len(classes_data)
        created_count = 0
        updated_count = 0

        # Execute transaction
        with transaction.atomic():
            for idx, c in enumerate(classes_data, start=1):
                cls_obj = SchoolClass.objects.filter(
                    school=school, academic_year=ay, name=c["name"]
                ).first()
                created = False

                meta_payload = {
                    "contingency_backup_room": c["backup_room"],
                    "designated_wing": (
                        "Dãy A"
                        if "10A" in c["name"]
                        else ("Dãy B" if "11A" in c["name"] else "Dãy C")
                    ),
                    "shift_category": c["shift"],
                    "standard_period_count": 5 if c["shift"] != "EVENING" else 3,
                }

                if not cls_obj:
                    cls_obj = SchoolClass.objects.create(
                        id=uuid6.uuid7(),
                        code=generate_unique_code(SchoolClass, "code"),
                        school=school,
                        academic_year=ay,
                        grade=c["grade"],
                        name=c["name"],
                        homeroom_teacher=c["teacher"],
                        class_stream_code=c["stream"],
                        room=c["room"],
                        room_name=c["room_name"],
                        shift=c["shift"],
                        slogan=c["slogan"],
                        max_students=45,
                        is_active=True,
                        metadata=meta_payload,
                    )
                    created = True
                    created_count += 1
                else:
                    cls_obj.grade = c["grade"]
                    cls_obj.homeroom_teacher = c["teacher"]
                    cls_obj.class_stream_code = c["stream"]
                    cls_obj.room = c["room"]
                    cls_obj.room_name = c["room_name"]
                    cls_obj.shift = c["shift"]
                    cls_obj.slogan = c["slogan"]
                    cls_obj.max_students = 45
                    cls_obj.is_active = True
                    cls_obj.metadata = meta_payload
                    cls_obj.save(
                        update_fields=[
                            "grade",
                            "homeroom_teacher",
                            "class_stream_code",
                            "room",
                            "room_name",
                            "shift",
                            "slogan",
                            "max_students",
                            "is_active",
                            "metadata",
                        ]
                    )
                    updated_count += 1

                teacher_name = (
                    cls_obj.homeroom_teacher.user.full_name
                    if cls_obj.homeroom_teacher
                    else "Chưa phân công"
                )
                status_msg = "Created" if created else "Updated"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  [{idx:>2}/{total_classes}] {cls_obj.name:<6} "
                        f"| {cls_obj.shift:<10} "
                        f"| {cls_obj.room_name or 'N/A':<15} "
                        f"| {cls_obj.class_stream_code:<16} "
                        f"| GVCN: {teacher_name:<26} ({status_msg})"
                    )
                )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {total_classes} Classes across Grades 10, 11, and 12! "
                f"(Created: {created_count}, Updated: {updated_count})\n"
                f"Contingency Reserve Rooms untouched and ready: "
                f"A209, A210, B209, B210, C209, C210, D101-D110, D201-D210."
            )
        )
