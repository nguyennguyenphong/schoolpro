"""
Management command to seed 20 diverse Users and their Role assignments.
Tables: "core"."users", "core"."user_roles"
Usage:
    python manage.py seed_users
"""

from datetime import date

import uuid6
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.role import Role, UserRole
from apps.core.models.user import User
from apps.master.models.school import School


class Command(BaseCommand):
    help = (
        "Seeds 20 standard Users (Admins, Teachers, Students, Parents) and their Role assignments."
    )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding 20 Users (core.users & user_roles)..."))
        school = School.objects.first()

        roles = {
            "ADMIN": Role.objects.filter(name="Quản trị viên toàn quyền hệ thống").first()
            or Role.objects.filter(code="R_ADMIN_839201").first(),
            "TEACHER": Role.objects.filter(name="Giáo viên bộ môn").first()
            or Role.objects.filter(name="Giáo viên").first()
            or Role.objects.filter(code="R_TEACHER").first(),
            "STUDENT": Role.objects.filter(name="Học sinh").first()
            or Role.objects.filter(code="R_STUDENT").first(),
            "PARENT": Role.objects.filter(name="Phụ huynh học sinh").first()
            or Role.objects.filter(name="Phụ huynh").first()
            or Role.objects.filter(code="R_PARENT").first(),
        }

        # 20 Users representing School Community
        raw_default_pwd = "password123"
        pwd_hash = make_password(raw_default_pwd)
        admin_pwd_hash = make_password("admin")

        users_data = [
            # 1 - 2: System Administrators
            {
                "username": "admin@schoolpro.edu.vn",
                "email": "admin@schoolpro.edu.vn",
                "phone": "0901234501",
                "full_name": "Quản trị viên Hệ thống (Super Admin)",
                "gender": "MALE",
                "role_type": "ADMIN",
                "pwd": admin_pwd_hash,
            },
            {
                "username": "admin_vp@schoolpro.edu.vn",
                "email": "admin_vp@schoolpro.edu.vn",
                "phone": "0901234502",
                "full_name": "Nguyễn Hoàng Nam (Văn phòng)",
                "gender": "MALE",
                "role_type": "ADMIN",
                "pwd": pwd_hash,
            },
            # 3 - 8: Teachers (6 Giáo viên bộ môn)
            {
                "username": "gv_nguyentoan",
                "email": "toan.nguyen@schoolpro.edu.vn",
                "phone": "0987654301",
                "full_name": "Nguyễn Văn Toán",
                "gender": "MALE",
                "role_type": "TEACHER",
                "pwd": pwd_hash,
            },
            {
                "username": "gv_tranvan",
                "email": "van.tran@schoolpro.edu.vn",
                "phone": "0987654302",
                "full_name": "Trần Thị Văn",
                "gender": "FEMALE",
                "role_type": "TEACHER",
                "pwd": pwd_hash,
            },
            {
                "username": "gv_leanh",
                "email": "anh.le@schoolpro.edu.vn",
                "phone": "0987654303",
                "full_name": "Lê Mai Anh",
                "gender": "FEMALE",
                "role_type": "TEACHER",
                "pwd": pwd_hash,
            },
            {
                "username": "gv_phamly",
                "email": "ly.pham@schoolpro.edu.vn",
                "phone": "0987654304",
                "full_name": "Phạm Quang Lý",
                "gender": "MALE",
                "role_type": "TEACHER",
                "pwd": pwd_hash,
            },
            {
                "username": "gv_vuhoa",
                "email": "hoa.vu@schoolpro.edu.vn",
                "phone": "0987654305",
                "full_name": "Vũ Thu Hóa",
                "gender": "FEMALE",
                "role_type": "TEACHER",
                "pwd": pwd_hash,
            },
            {
                "username": "gv_dosinh",
                "email": "sinh.do@schoolpro.edu.vn",
                "phone": "0987654306",
                "full_name": "Đỗ Trọng Sinh",
                "gender": "MALE",
                "role_type": "TEACHER",
                "pwd": pwd_hash,
            },
            # 9 - 16: Students (8 Học sinh)
            {
                "username": "hs_lehoangnam",
                "email": "nam.le@student.schoolpro.edu.vn",
                "phone": "0912345701",
                "full_name": "Lê Hoàng Nam",
                "gender": "MALE",
                "role_type": "STUDENT",
                "pwd": pwd_hash,
            },
            {
                "username": "hs_phamquynhanh",
                "email": "quynhanh.pham@student.schoolpro.edu.vn",
                "phone": "0912345702",
                "full_name": "Phạm Quỳnh Anh",
                "gender": "FEMALE",
                "role_type": "STUDENT",
                "pwd": pwd_hash,
            },
            {
                "username": "hs_tranminhtri",
                "email": "tri.tran@student.schoolpro.edu.vn",
                "phone": "0912345703",
                "full_name": "Trần Minh Trí",
                "gender": "MALE",
                "role_type": "STUDENT",
                "pwd": pwd_hash,
            },
            {
                "username": "hs_nguyenthuyduong",
                "email": "duong.nguyen@student.schoolpro.edu.vn",
                "phone": "0912345704",
                "full_name": "Nguyễn Thùy Dương",
                "gender": "FEMALE",
                "role_type": "STUDENT",
                "pwd": pwd_hash,
            },
            {
                "username": "hs_hoangducphong",
                "email": "phong.hoang@student.schoolpro.edu.vn",
                "phone": "0912345705",
                "full_name": "Hoàng Đức Phong",
                "gender": "MALE",
                "role_type": "STUDENT",
                "pwd": pwd_hash,
            },
            {
                "username": "hs_buihaimy",
                "email": "my.bui@student.schoolpro.edu.vn",
                "phone": "0912345706",
                "full_name": "Bùi Hải My",
                "gender": "FEMALE",
                "role_type": "STUDENT",
                "pwd": pwd_hash,
            },
            {
                "username": "hs_dangquocbao",
                "email": "bao.dang@student.schoolpro.edu.vn",
                "phone": "0912345707",
                "full_name": "Đặng Quốc Bảo",
                "gender": "MALE",
                "role_type": "STUDENT",
                "pwd": pwd_hash,
            },
            {
                "username": "hs_ngoxuanmai",
                "email": "mai.ngo@student.schoolpro.edu.vn",
                "phone": "0912345708",
                "full_name": "Ngô Xuân Mai",
                "gender": "FEMALE",
                "role_type": "STUDENT",
                "pwd": pwd_hash,
            },
            # 17 - 20: Parents (4 Phụ huynh)
            {
                "username": "ph_levantuan",
                "email": "tuan.le.parent@gmail.com",
                "phone": "0933456701",
                "full_name": "Lê Văn Tuấn (Phụ huynh)",
                "gender": "MALE",
                "role_type": "PARENT",
                "pwd": pwd_hash,
            },
            {
                "username": "ph_nguyenthilan",
                "email": "lan.nguyen.parent@gmail.com",
                "phone": "0933456702",
                "full_name": "Nguyễn Thị Lan (Phụ huynh)",
                "gender": "FEMALE",
                "role_type": "PARENT",
                "pwd": pwd_hash,
            },
            {
                "username": "ph_trandinhlong",
                "email": "long.tran.parent@gmail.com",
                "phone": "0933456703",
                "full_name": "Trần Đình Long (Phụ huynh)",
                "gender": "MALE",
                "role_type": "PARENT",
                "pwd": pwd_hash,
            },
            {
                "username": "ph_phamthanhhuong",
                "email": "huong.pham.parent@gmail.com",
                "phone": "0933456704",
                "full_name": "Phạm Thanh Hương (Phụ huynh)",
                "gender": "FEMALE",
                "role_type": "PARENT",
                "pwd": pwd_hash,
            },
        ]

        with transaction.atomic():
            for idx, u_info in enumerate(users_data, start=1):
                user = (
                    User.objects.filter(username=u_info["username"]).first()
                    or User.objects.filter(email=u_info["email"]).first()
                )
                created = False

                if not user:
                    user = User.objects.create(
                        id=uuid6.uuid7(),
                        school=school,
                        username=u_info["username"],
                        email=u_info["email"],
                        phone=u_info["phone"],
                        password_hash=u_info["pwd"],
                        full_name=u_info["full_name"],
                        gender_code=u_info["gender"],
                        status_code="ACTIVE",
                        is_verified=True,
                    )
                    created = True
                else:
                    user.password_hash = u_info["pwd"]
                    user.status_code = "ACTIVE"
                    user.failed_login_attempts = 0
                    user.locked_at = None
                    user.save(
                        update_fields=[
                            "password_hash",
                            "status_code",
                            "failed_login_attempts",
                            "locked_at",
                        ]
                    )

                # Bind User Role
                target_role = roles.get(u_info["role_type"])
                if target_role:
                    ur, _ = UserRole.objects.get_or_create(
                        user=user,
                        role=target_role,
                        defaults={
                            "id": uuid6.uuid7(),
                            "is_primary": True,
                            "effective_from": date.today(),
                            "status": "ACTIVE",
                        },
                    )
                    if not ur.is_primary or ur.status != "ACTIVE":
                        ur.is_primary = True
                        ur.status = "ACTIVE"
                        ur.save(update_fields=["is_primary", "status"])

                status_msg = "Created" if created else "Updated"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  [{idx}/20] Processed ({u_info['role_type']}): {user.username} - {user.full_name} ({status_msg})"
                    )
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded all 20 Users and UserRoles!"))
