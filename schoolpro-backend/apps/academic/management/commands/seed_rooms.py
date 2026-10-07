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

        rooms_data = [
            {
                "name": "Phòng học A101",
                "room_type": "CLASSROOM",
                "building": "Dãy A",
                "floor": 1,
                "capacity": 45,
            },
            {
                "name": "Phòng học A102",
                "room_type": "CLASSROOM",
                "building": "Dãy A",
                "floor": 1,
                "capacity": 45,
            },
            {
                "name": "Phòng Tin học 1",
                "room_type": "LAB",
                "building": "Dãy B",
                "floor": 2,
                "capacity": 40,
            },
            {
                "name": "Hội trường lớn",
                "room_type": "HALL",
                "building": "Nhà Đa Năng",
                "floor": 1,
                "capacity": 300,
            },
        ]

        with transaction.atomic():
            for r in rooms_data:
                room_obj = Room.objects.filter(school=school, name=r["name"]).first()
                created = False
                if not room_obj:
                    room_obj = Room.objects.create(
                        id=uuid6.uuid7(),
                        code=generate_unique_code(Room, "code"),
                        school=school,
                        name=r["name"],
                        room_type=r["room_type"],
                        building=r["building"],
                        floor=r["floor"],
                        capacity=r["capacity"],
                        is_active=True,
                    )
                    created = True
                status_msg = "Created" if created else "Already exists"
                self.stdout.write(
                    self.style.SUCCESS(f"  Processed Room: {room_obj.name} ({status_msg})")
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Rooms!"))
