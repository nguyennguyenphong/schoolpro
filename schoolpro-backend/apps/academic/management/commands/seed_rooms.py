"""
Management command to seed Rooms.
Table: "academic"."rooms"
Usage:
    python manage.py seed_rooms
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.academic.models.infrastructure import Room
from apps.master.models.school import School
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds academic Rooms and facilities."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Rooms (academic.rooms)..."))

        school = School.objects.first()

        if not school:
            self.stdout.write(self.style.ERROR("No school found. Please seed School first."))
            return

        rooms_data = []

        classroom_buildings = [
            ("Dãy A", 1, "A1"),
            ("Dãy A", 2, "A2"),
            ("Dãy B", 1, "B1"),
            ("Dãy B", 2, "B2"),
            ("Dãy C", 1, "C1"),
            ("Dãy C", 2, "C2"),
            ("Dãy D", 1, "D1"),
            ("Dãy D", 2, "D2"),
        ]

        for building, floor, prefix in classroom_buildings:
            for number in range(1, 11):
                room_number = f"{prefix}{number:02d}"

                rooms_data.append(
                    {
                        "name": f"Phòng học {room_number}",
                        "room_type": "CLASSROOM",
                        "capacity": 45,
                        "building": building,
                        "floor": floor,
                        "status": "AVAILABLE",
                        "area_sqm": 54.00,
                        "has_projector": True,
                        "has_air_conditioner": True,
                        "has_camera": True,
                        "has_audio_system": False,
                        "qr_checkin_code": f"ROOM-{room_number}",
                        "longitude": None,
                        "latitude": None,
                        "map_embedding_url": None,
                        "notes": None,
                    }
                )

        specialized_rooms = [
            {
                "name": "Phòng Tin học 1",
                "room_type": "COMPUTER_LAB",
                "capacity": 40,
                "building": "Dãy E",
                "floor": 1,
                "area_sqm": 72.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng máy tính.",
            },
            {
                "name": "Phòng Tin học 2",
                "room_type": "COMPUTER_LAB",
                "capacity": 40,
                "building": "Dãy E",
                "floor": 1,
                "area_sqm": 72.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng máy tính.",
            },
            {
                "name": "Phòng Tin học 3",
                "room_type": "COMPUTER_LAB",
                "capacity": 40,
                "building": "Dãy E",
                "floor": 2,
                "area_sqm": 72.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng máy tính.",
            },
            {
                "name": "Phòng Tin học 4",
                "room_type": "COMPUTER_LAB",
                "capacity": 40,
                "building": "Dãy E",
                "floor": 2,
                "area_sqm": 72.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng máy tính.",
            },
            {
                "name": "Phòng thí nghiệm Vật lý 1",
                "room_type": "LAB",
                "capacity": 40,
                "building": "Dãy E",
                "floor": 1,
                "area_sqm": 72.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng thí nghiệm Vật lý.",
            },
            {
                "name": "Phòng thí nghiệm Vật lý 2",
                "room_type": "LAB",
                "capacity": 40,
                "building": "Dãy E",
                "floor": 1,
                "area_sqm": 72.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng thí nghiệm Vật lý.",
            },
            {
                "name": "Phòng thí nghiệm Hóa học 1",
                "room_type": "LAB",
                "capacity": 40,
                "building": "Dãy E",
                "floor": 2,
                "area_sqm": 72.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng thí nghiệm Hóa học.",
            },
            {
                "name": "Phòng thí nghiệm Hóa học 2",
                "room_type": "LAB",
                "capacity": 40,
                "building": "Dãy E",
                "floor": 2,
                "area_sqm": 72.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng thí nghiệm Hóa học.",
            },
            {
                "name": "Phòng thí nghiệm Sinh học 1",
                "room_type": "LAB",
                "capacity": 40,
                "building": "Dãy E",
                "floor": 3,
                "area_sqm": 72.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng thí nghiệm Sinh học.",
            },
            {
                "name": "Phòng thí nghiệm Sinh học 2",
                "room_type": "LAB",
                "capacity": 40,
                "building": "Dãy E",
                "floor": 3,
                "area_sqm": 72.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng thí nghiệm Sinh học.",
            },
            {
                "name": "Phòng Ngoại ngữ 1",
                "room_type": "LANGUAGE_LAB",
                "capacity": 40,
                "building": "Dãy F",
                "floor": 1,
                "area_sqm": 60.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng học Ngoại ngữ.",
            },
            {
                "name": "Phòng Ngoại ngữ 2",
                "room_type": "LANGUAGE_LAB",
                "capacity": 40,
                "building": "Dãy F",
                "floor": 1,
                "area_sqm": 60.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng học Ngoại ngữ.",
            },
            {
                "name": "Phòng Ngoại ngữ 3",
                "room_type": "LANGUAGE_LAB",
                "capacity": 40,
                "building": "Dãy F",
                "floor": 2,
                "area_sqm": 60.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng học Ngoại ngữ.",
            },
            {
                "name": "Phòng Ngoại ngữ 4",
                "room_type": "LANGUAGE_LAB",
                "capacity": 40,
                "building": "Dãy F",
                "floor": 2,
                "area_sqm": 60.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng học Ngoại ngữ.",
            },
            {
                "name": "Phòng STEM 1",
                "room_type": "STEM",
                "capacity": 35,
                "building": "Nhà STEM",
                "floor": 1,
                "area_sqm": 80.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Không gian thực hành STEM.",
            },
            {
                "name": "Phòng STEM 2",
                "room_type": "STEM",
                "capacity": 35,
                "building": "Nhà STEM",
                "floor": 1,
                "area_sqm": 80.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Không gian thực hành STEM.",
            },
            {
                "name": "Phòng Mỹ thuật 1",
                "room_type": "ART_ROOM",
                "capacity": 35,
                "building": "Dãy F",
                "floor": 3,
                "area_sqm": 70.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": False,
                "has_audio_system": False,
                "notes": "Phòng học Mỹ thuật.",
            },
            {
                "name": "Phòng Mỹ thuật 2",
                "room_type": "ART_ROOM",
                "capacity": 35,
                "building": "Dãy F",
                "floor": 3,
                "area_sqm": 70.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": False,
                "has_audio_system": False,
                "notes": "Phòng học Mỹ thuật.",
            },
            {
                "name": "Phòng Âm nhạc 1",
                "room_type": "MUSIC_ROOM",
                "capacity": 35,
                "building": "Dãy F",
                "floor": 4,
                "area_sqm": 70.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": False,
                "has_audio_system": True,
                "notes": "Phòng học Âm nhạc.",
            },
            {
                "name": "Phòng Âm nhạc 2",
                "room_type": "MUSIC_ROOM",
                "capacity": 35,
                "building": "Dãy F",
                "floor": 4,
                "area_sqm": 70.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": False,
                "has_audio_system": True,
                "notes": "Phòng học Âm nhạc.",
            },
            {
                "name": "Thư viện chính",
                "room_type": "LIBRARY",
                "capacity": 100,
                "building": "Thư viện",
                "floor": 1,
                "area_sqm": 180.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Thư viện trung tâm.",
            },
            {
                "name": "Phòng đọc",
                "room_type": "READING_ROOM",
                "capacity": 60,
                "building": "Thư viện",
                "floor": 2,
                "area_sqm": 100.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": False,
                "notes": "Không gian đọc sách và tự học.",
            },
            {
                "name": "Hội trường lớn",
                "room_type": "HALL",
                "capacity": 500,
                "building": "Nhà Đa năng",
                "floor": 1,
                "area_sqm": 500.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Hội trường lớn.",
            },
            {
                "name": "Hội trường nhỏ",
                "room_type": "HALL",
                "capacity": 200,
                "building": "Nhà Đa năng",
                "floor": 2,
                "area_sqm": 250.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Hội trường nhỏ.",
            },
            {
                "name": "Phòng họp Ban Giám hiệu",
                "room_type": "MEETING_ROOM",
                "capacity": 20,
                "building": "Khu Hiệu bộ",
                "floor": 1,
                "area_sqm": 45.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng họp Ban Giám hiệu.",
            },
            {
                "name": "Phòng họp Hội đồng",
                "room_type": "MEETING_ROOM",
                "capacity": 40,
                "building": "Khu Hiệu bộ",
                "floor": 1,
                "area_sqm": 70.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng họp Hội đồng sư phạm.",
            },
            {
                "name": "Phòng Y tế",
                "room_type": "MEDICAL",
                "capacity": 5,
                "building": "Khu Hiệu bộ",
                "floor": 1,
                "area_sqm": 35.00,
                "has_projector": False,
                "has_air_conditioner": True,
                "has_camera": False,
                "has_audio_system": False,
                "notes": "Phòng chăm sóc sức khỏe học sinh.",
            },
            {
                "name": "Phòng Tư vấn học sinh 1",
                "room_type": "COUNSELING",
                "capacity": 8,
                "building": "Khu Hiệu bộ",
                "floor": 2,
                "area_sqm": 25.00,
                "has_projector": False,
                "has_air_conditioner": True,
                "has_camera": False,
                "has_audio_system": False,
                "notes": "Phòng tư vấn học sinh.",
            },
            {
                "name": "Phòng Tư vấn học sinh 2",
                "room_type": "COUNSELING",
                "capacity": 8,
                "building": "Khu Hiệu bộ",
                "floor": 2,
                "area_sqm": 25.00,
                "has_projector": False,
                "has_air_conditioner": True,
                "has_camera": False,
                "has_audio_system": False,
                "notes": "Phòng tư vấn học sinh.",
            },
            {
                "name": "Phòng Giáo viên",
                "room_type": "STAFF_ROOM",
                "capacity": 60,
                "building": "Khu Hiệu bộ",
                "floor": 2,
                "area_sqm": 100.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": False,
                "notes": "Phòng làm việc chung của giáo viên.",
            },
            {
                "name": "Nhà thi đấu đa năng",
                "room_type": "GYM",
                "capacity": 300,
                "building": "Nhà Đa năng",
                "floor": 1,
                "area_sqm": 800.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Nhà thi đấu và giáo dục thể chất.",
            },
            {
                "name": "Phòng thể chất",
                "room_type": "SPORTS_ROOM",
                "capacity": 50,
                "building": "Nhà Đa năng",
                "floor": 2,
                "area_sqm": 120.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng tập thể chất trong nhà.",
            },
            {
                "name": "Phòng Thiết bị dạy học",
                "room_type": "EQUIPMENT",
                "capacity": 10,
                "building": "Khu Hiệu bộ",
                "floor": 1,
                "area_sqm": 60.00,
                "has_projector": False,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": False,
                "notes": "Kho và phòng quản lý thiết bị dạy học.",
            },
            {
                "name": "Phòng Đoàn Thanh niên",
                "room_type": "OFFICE",
                "capacity": 15,
                "building": "Khu Hiệu bộ",
                "floor": 2,
                "area_sqm": 35.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": False,
                "has_audio_system": False,
                "notes": "Văn phòng Đoàn Thanh niên.",
            },
            {
                "name": "Phòng học chuyên đề",
                "room_type": "SPECIALIZED_CLASSROOM",
                "capacity": 30,
                "building": "Dãy F",
                "floor": 3,
                "area_sqm": 48.00,
                "has_projector": True,
                "has_air_conditioner": True,
                "has_camera": True,
                "has_audio_system": True,
                "notes": "Phòng học chuyên đề.",
            },
        ]

        rooms_data.extend(specialized_rooms)

        if len(rooms_data) != 100:
            raise ValueError(f"Expected exactly 100 rooms, got {len(rooms_data)}.")

        with transaction.atomic():
            created_count = 0
            existing_count = 0

            for room_data in rooms_data:
                room_obj = Room.objects.filter(
                    school=school,
                    name=room_data["name"],
                ).first()

                if room_obj:
                    existing_count += 1
                    self.stdout.write(self.style.WARNING(f"  Already exists: {room_obj.name}"))
                    continue

                room_obj = Room.objects.create(
                    id=uuid6.uuid7(),
                    code=generate_unique_code(Room, "code"),
                    school=school,
                    name=room_data["name"],
                    room_type=room_data["room_type"],
                    capacity=room_data["capacity"],
                    building=room_data["building"],
                    floor=room_data["floor"],
                    status=room_data.get("status", "AVAILABLE"),
                    area_sqm=room_data["area_sqm"],
                    has_projector=room_data["has_projector"],
                    has_air_conditioner=room_data["has_air_conditioner"],
                    has_camera=room_data["has_camera"],
                    has_audio_system=room_data["has_audio_system"],
                    qr_checkin_code=room_data.get("qr_checkin_code"),
                    longitude=room_data.get("longitude"),
                    latitude=room_data.get("latitude"),
                    map_embedding_url=room_data.get("map_embedding_url"),
                    notes=room_data.get("notes"),
                )

                created_count += 1

                self.stdout.write(
                    self.style.SUCCESS(f"  Created Room: {room_obj.code} - {room_obj.name}")
                )

        total_count = Room.objects.filter(school=school).count()

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully processed 100 room definitions. "
                f"Created: {created_count}, "
                f"Already exists: {existing_count}, "
                f"Total rooms for school: {total_count}"
            )
        )
