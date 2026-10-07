"""
Management command to seed Guardian profiles for parents and committee heads.
Table: "core"."guardians"

Usage:
    python manage.py seed_guardians
"""

import uuid6
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.profile import Guardian, Student
from apps.core.models.user import User


class Command(BaseCommand):
    help = "Seeds Guardian profiles linked to parent users and student committee representatives."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Guardians (core.guardians)..."))

        # Find target students to associate with guardians
        student_nam = Student.objects.filter(user__username="loptruong_10a1").first()
        student_tri = Student.objects.filter(user__username="loppho_laodong_10a1").first()
        student_anh = Student.objects.filter(user__username="loppho_hoctap_10a1").first()

        guardians_data = [
            {
                "username": "phuhuynh_01",
                "student": student_nam,
                "relationship": "FATHER",
                "is_primary": True,
                "is_committee": False,
                "committee_role": None,
            },
            {
                "username": "truongban_phuhuynh_truong",
                "student": student_tri,
                "relationship": "FATHER",
                "is_primary": True,
                "is_committee": True,
                "committee_role": "Trưởng ban Đại diện Cha mẹ học sinh Trường",
            },
            {
                "username": "truongban_phuhuynh_lop",
                "student": student_anh,
                "relationship": "MOTHER",
                "is_primary": True,
                "is_committee": True,
                "committee_role": "Trưởng ban Đại diện Cha mẹ học sinh Lớp 10A1",
            },
        ]

        with transaction.atomic():
            for g_info in guardians_data:
                user = User.objects.filter(username=g_info["username"]).first()
                if not user or not g_info["student"]:
                    self.stdout.write(
                        self.style.WARNING(
                            f"User '{g_info['username']}' or associated student not found, skipping..."
                        )
                    )
                    continue

                guardian_obj = Guardian.objects.filter(user=user).first()
                created = False

                if not guardian_obj:
                    guardian_obj = Guardian.objects.create(
                        id=uuid6.uuid7(),
                        student=g_info["student"],
                        user=user,
                        full_name=user.full_name,
                        relationship=g_info["relationship"],
                        phone=user.phone,
                        email=user.email,
                        address=user.address,
                        is_primary_contact=g_info["is_primary"],
                        is_emergency_contact=True,
                        is_parent_committee=g_info["is_committee"],
                        committee_role=g_info["committee_role"],
                    )
                    created = True
                else:
                    guardian_obj.student = g_info["student"]
                    guardian_obj.full_name = user.full_name
                    guardian_obj.phone = user.phone
                    guardian_obj.email = user.email
                    guardian_obj.is_parent_committee = g_info["is_committee"]
                    guardian_obj.committee_role = g_info["committee_role"]
                    guardian_obj.save(
                        update_fields=[
                            "student",
                            "full_name",
                            "phone",
                            "email",
                            "is_parent_committee",
                            "committee_role",
                        ]
                    )

                status_msg = "Created" if created else "Updated"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Processed Guardian: {user.full_name:<35} for Student {g_info['student'].user.full_name} ({status_msg})"
                    )
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded all Guardian profiles!"))
