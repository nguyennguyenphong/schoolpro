"""
Management command to seed 37 comprehensive Enterprise Users corresponding to all 37 system Roles.
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
from common.utils.code_generator import generate_unique_code


class Command(BaseCommand):
    help = "Seeds 37 comprehensive Users mapped to each individual educational Role with @schoolpro.edu.vn emails."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.NOTICE("Seeding 37 Enterprise Users (core.users & user_roles)...")
        )
        school = School.objects.first()

        raw_default_pwd = "password123"
        default_pwd_hash = make_password(raw_default_pwd)
        admin_pwd_hash = make_password("admin")

        # Master dataset of 37 users corresponding exactly to the 37 roles in seed_roles.py
        users_data = [
            # =========================================================================
            # 1. BOARD OF DIRECTORS & SYSTEM ADMINISTRATION (6 USERS)
            # =========================================================================
            {
                "username": "admin",
                "email": "admin@schoolpro.edu.vn",
                "phone": "0901234501",
                "first_name": "Admin",
                "last_name": "Super",
                "full_name": "Quản trị viên Toàn quyền Hệ thống",
                "gender": "MALE",
                "dob": date(1985, 1, 15),
                "address": "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
                "role_name": "Quản trị viên toàn quyền hệ thống",
                "pwd": admin_pwd_hash,
            },
            {
                "username": "hieutruong",
                "email": "hieutruong@schoolpro.edu.vn",
                "phone": "0901234502",
                "first_name": "Nghĩa",
                "last_name": "Lê Trọng",
                "full_name": "Lê Trọng Nghĩa (Hiệu trưởng)",
                "gender": "MALE",
                "dob": date(1975, 4, 20),
                "address": "Số 15 Phố Huế, Hoàn Kiếm, Hà Nội",
                "role_name": "Hiệu trưởng",
                "pwd": default_pwd_hash,
            },
            {
                "username": "pht_chuyenmon",
                "email": "pht_chuyenmon@schoolpro.edu.vn",
                "phone": "0901234503",
                "first_name": "Minh",
                "last_name": "Trần Đức",
                "full_name": "Trần Đức Minh (Phó Hiệu trưởng Chuyên môn)",
                "gender": "MALE",
                "dob": date(1978, 8, 12),
                "address": "Số 88 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội",
                "role_name": "Phó Hiệu trưởng phụ trách Chuyên môn",
                "pwd": default_pwd_hash,
            },
            {
                "username": "pht_hocsinh",
                "email": "pht_hocsinh@schoolpro.edu.vn",
                "phone": "0901234504",
                "first_name": "Phong",
                "last_name": "Nguyễn Hoàng",
                "full_name": "Nguyễn Hoàng Phong (Phó Hiệu trưởng Nề nếp)",
                "gender": "MALE",
                "dob": date(1980, 11, 5),
                "address": "Số 42 Giải Phóng, Đống Đa, Hà Nội",
                "role_name": "Phó Hiệu trưởng phụ trách Công tác học sinh",
                "pwd": default_pwd_hash,
            },
            {
                "username": "thuky_hoidong",
                "email": "thuky_hoidong@schoolpro.edu.vn",
                "phone": "0901234505",
                "first_name": "Ngọc",
                "last_name": "Vũ Bích",
                "full_name": "Vũ Bích Ngọc (Thư ký Hội đồng)",
                "gender": "FEMALE",
                "dob": date(1983, 3, 25),
                "address": "Số 102 Xã Đàn, Đống Đa, Hà Nội",
                "role_name": "Thư ký Hội đồng trường",
                "pwd": default_pwd_hash,
            },
            {
                "username": "thanhtra_nhandan",
                "email": "thanhtra_nhandan@schoolpro.edu.vn",
                "phone": "0901234506",
                "first_name": "Tuấn",
                "last_name": "Phạm Quốc",
                "full_name": "Phạm Quốc Tuấn (Trưởng ban Thanh tra)",
                "gender": "MALE",
                "dob": date(1979, 6, 18),
                "address": "Số 56 Chùa Bộc, Đống Đa, Hà Nội",
                "role_name": "Trưởng ban Thanh tra nhân dân",
                "pwd": default_pwd_hash,
            },
            # =========================================================================
            # 2. ADMINISTRATIVE, SPECIALIZED & SUPPORT STAFF (11 USERS)
            # =========================================================================
            {
                "username": "giaovu",
                "email": "giaovu@schoolpro.edu.vn",
                "phone": "0901234507",
                "first_name": "Lan",
                "last_name": "Đặng Mai",
                "full_name": "Đặng Mai Lan (Giáo vụ trường học)",
                "gender": "FEMALE",
                "dob": date(1987, 9, 14),
                "address": "Số 23 Lê Thanh Nghị, Hai Bà Trưng, Hà Nội",
                "role_name": "Giáo vụ trường học",
                "pwd": default_pwd_hash,
            },
            {
                "username": "yte",
                "email": "yte@schoolpro.edu.vn",
                "phone": "0901234508",
                "first_name": "Hạnh",
                "last_name": "Hoàng Bích",
                "full_name": "Hoàng Bích Hạnh (Cán bộ Y tế)",
                "gender": "FEMALE",
                "dob": date(1989, 12, 3),
                "address": "Số 79 Nguyễn An Ninh, Hoàng Mai, Hà Nội",
                "role_name": "Cán bộ Y tế học đường",
                "pwd": default_pwd_hash,
            },
            {
                "username": "thuvien",
                "email": "thuvien@schoolpro.edu.vn",
                "phone": "0901234509",
                "first_name": "Hà",
                "last_name": "Bùi Thu",
                "full_name": "Bùi Thu Hà (Cán bộ Thư viện)",
                "gender": "FEMALE",
                "dob": date(1988, 5, 29),
                "address": "Số 114 Đại La, Hai Bà Trưng, Hà Nội",
                "role_name": "Cán bộ Thư viện",
                "pwd": default_pwd_hash,
            },
            {
                "username": "ketoan",
                "email": "ketoan@schoolpro.edu.vn",
                "phone": "0901234510",
                "first_name": "Hằng",
                "last_name": "Ngô Thị",
                "full_name": "Ngô Thị Hằng (Kế toán)",
                "gender": "FEMALE",
                "dob": date(1986, 7, 8),
                "address": "Số 65 Trường Chinh, Thanh Xuân, Hà Nội",
                "role_name": "Kế toán trường học",
                "pwd": default_pwd_hash,
            },
            {
                "username": "thuquy",
                "email": "thuquy@schoolpro.edu.vn",
                "phone": "0901234511",
                "first_name": "Thư",
                "last_name": "Đỗ Minh",
                "full_name": "Đỗ Minh Thư (Thủ quỹ)",
                "gender": "FEMALE",
                "dob": date(1991, 10, 22),
                "address": "Số 34 Bạch Mai, Hai Bà Trưng, Hà Nội",
                "role_name": "Thủ quỹ trường học",
                "pwd": default_pwd_hash,
            },
            {
                "username": "it_admin",
                "email": "it_admin@schoolpro.edu.vn",
                "phone": "0901234512",
                "first_name": "Tân",
                "last_name": "Trịnh Duy",
                "full_name": "Trịnh Duy Tân (Quản trị viên CNTT)",
                "gender": "MALE",
                "dob": date(1992, 2, 17),
                "address": "Số 80 Tạ Quang Bửu, Hai Bà Trưng, Hà Nội",
                "role_name": "Quản trị viên CNTT & Kỹ thuật",
                "pwd": default_pwd_hash,
            },
            {
                "username": "quanly_lab",
                "email": "quanly_lab@schoolpro.edu.vn",
                "phone": "0901234513",
                "first_name": "Phước",
                "last_name": "Lâm Hữu",
                "full_name": "Lâm Hữu Phước (Cán bộ Phòng Lab)",
                "gender": "MALE",
                "dob": date(1984, 4, 30),
                "address": "Số 19 Vọng Đức, Hoàn Kiếm, Hà Nội",
                "role_name": "Cán bộ Quản lý Thiết bị & Phòng Lab",
                "pwd": default_pwd_hash,
            },
            {
                "username": "giamthi",
                "email": "giamthi@schoolpro.edu.vn",
                "phone": "0901234514",
                "first_name": "Dũng",
                "last_name": "Đoàn Văn",
                "full_name": "Đoàn Văn Dũng (Giám thị)",
                "gender": "MALE",
                "dob": date(1981, 8, 19),
                "address": "Số 48 Lò Đúc, Hai Bà Trưng, Hà Nội",
                "role_name": "Giám thị / Quản sinh",
                "pwd": default_pwd_hash,
            },
            {
                "username": "tuvan_tamly",
                "email": "tuvan_tamly@schoolpro.edu.vn",
                "phone": "0901234515",
                "first_name": "Vân",
                "last_name": "Phan Thanh",
                "full_name": "Phan Thanh Vân (Tư vấn tâm lý)",
                "gender": "FEMALE",
                "dob": date(1990, 6, 11),
                "address": "Số 92 Bà Triệu, Hoàn Kiếm, Hà Nội",
                "role_name": "Chuyên viên Tư vấn tâm lý học đường",
                "pwd": default_pwd_hash,
            },
            {
                "username": "baove",
                "email": "baove@schoolpro.edu.vn",
                "phone": "0901234516",
                "first_name": "Thắng",
                "last_name": "Nguyễn Văn",
                "full_name": "Nguyễn Văn Thắng (Bảo vệ trường)",
                "gender": "MALE",
                "dob": date(1976, 1, 9),
                "address": "Số 15 Tân Mai, Hoàng Mai, Hà Nội",
                "role_name": "Nhân viên Bảo vệ & An ninh",
                "pwd": default_pwd_hash,
            },
            {
                "username": "haucan",
                "email": "haucan@schoolpro.edu.vn",
                "phone": "0901234517",
                "first_name": "Lệ",
                "last_name": "Trần Thị",
                "full_name": "Trần Thị Lệ (Hậu cần tạp vụ)",
                "gender": "FEMALE",
                "dob": date(1979, 11, 28),
                "address": "Số 63 Trương Định, Hai Bà Trưng, Hà Nội",
                "role_name": "Nhân viên Hậu cần & Tạp vụ",
                "pwd": default_pwd_hash,
            },
            # =========================================================================
            # 3. TEACHING & PEDAGOGICAL FACULTY (4 USERS)
            # =========================================================================
            {
                "username": "totruong_toan",
                "email": "totruong_toan@schoolpro.edu.vn",
                "phone": "0987654301",
                "first_name": "Toán",
                "last_name": "Nguyễn Văn",
                "full_name": "Nguyễn Văn Toán (Tổ trưởng Toán)",
                "gender": "MALE",
                "dob": date(1982, 3, 14),
                "address": "Số 71 Kim Ngưu, Hai Bà Trưng, Hà Nội",
                "role_name": "Tổ trưởng chuyên môn",
                "pwd": default_pwd_hash,
            },
            {
                "username": "topho_toan",
                "email": "topho_toan@schoolpro.edu.vn",
                "phone": "0987654302",
                "first_name": "Đại",
                "last_name": "Lê Quang",
                "full_name": "Lê Quang Đại (Tổ phó Toán)",
                "gender": "MALE",
                "dob": date(1986, 7, 21),
                "address": "Số 52 Minh Khai, Hai Bà Trưng, Hà Nội",
                "role_name": "Tổ phó chuyên môn",
                "pwd": default_pwd_hash,
            },
            {
                "username": "gvcn_10a1",
                "email": "gvcn_10a1@schoolpro.edu.vn",
                "phone": "0987654303",
                "first_name": "Văn",
                "last_name": "Trần Thị",
                "full_name": "Trần Thị Văn (Giáo viên chủ nhiệm 10A1)",
                "gender": "FEMALE",
                "dob": date(1985, 9, 30),
                "address": "Số 28 Lạc Trung, Hai Bà Trưng, Hà Nội",
                "role_name": "Giáo viên chủ nhiệm",
                "pwd": default_pwd_hash,
            },
            {
                "username": "gvbm_tienganh",
                "email": "gvbm_tienganh@schoolpro.edu.vn",
                "phone": "0987654304",
                "first_name": "Anh",
                "last_name": "Lê Mai",
                "full_name": "Lê Mai Anh (Giáo viên Tiếng Anh)",
                "gender": "FEMALE",
                "dob": date(1991, 12, 16),
                "address": "Số 105 Thanh Nhàn, Hai Bà Trưng, Hà Nội",
                "role_name": "Giáo viên bộ môn",
                "pwd": default_pwd_hash,
            },
            # =========================================================================
            # 4. YOUTH UNION & EMULATION MOVEMENT (4 USERS)
            # =========================================================================
            {
                "username": "bithu_doantruong",
                "email": "bithu_doantruong@schoolpro.edu.vn",
                "phone": "0987654305",
                "first_name": "Tùng",
                "last_name": "Nguyễn Thanh",
                "full_name": "Nguyễn Thanh Tùng (Bí thư Đoàn)",
                "gender": "MALE",
                "dob": date(1988, 5, 4),
                "address": "Số 66 Đại La, Hai Bà Trưng, Hà Nội",
                "role_name": "Bí thư Đoàn trường",
                "pwd": default_pwd_hash,
            },
            {
                "username": "phobithu_doantruong",
                "email": "phobithu_doantruong@schoolpro.edu.vn",
                "phone": "0987654306",
                "first_name": "Chi",
                "last_name": "Phạm Thị Kim",
                "full_name": "Phạm Thị Kim Chi (Phó Bí thư Đoàn)",
                "gender": "FEMALE",
                "dob": date(1993, 8, 25),
                "address": "Số 89 Mai Động, Hoàng Mai, Hà Nội",
                "role_name": "Phó Bí thư Đoàn trường",
                "pwd": default_pwd_hash,
            },
            {
                "username": "bch_doantruong",
                "email": "bch_doantruong@schoolpro.edu.vn",
                "phone": "0987654307",
                "first_name": "Đăng",
                "last_name": "Vũ Hải",
                "full_name": "Vũ Hải Đăng (Ủy viên BCH Đoàn)",
                "gender": "MALE",
                "dob": date(1995, 2, 10),
                "address": "Số 43 Định Công, Hoàng Mai, Hà Nội",
                "role_name": "Ủy viên Ban Chấp hành Đoàn trường",
                "pwd": default_pwd_hash,
            },
            {
                "username": "codo_truong",
                "email": "codo_truong@schoolpro.edu.vn",
                "phone": "0912345801",
                "first_name": "Thư",
                "last_name": "Đặng Anh",
                "full_name": "Đặng Anh Thư (Đội trưởng Cờ đỏ)",
                "gender": "FEMALE",
                "dob": date(2009, 6, 17),
                "address": "Số 12 Tam Trinh, Hoàng Mai, Hà Nội",
                "role_name": "Cán bộ Đội Cờ đỏ / Sao đỏ",
                "pwd": default_pwd_hash,
            },
            # =========================================================================
            # 5. CLASS STUDENT COMMITTEE LEADERSHIP (8 USERS)
            # =========================================================================
            {
                "username": "loptruong_10a1",
                "email": "loptruong_10a1@schoolpro.edu.vn",
                "phone": "0912345802",
                "first_name": "Nam",
                "last_name": "Lê Hoàng",
                "full_name": "Lê Hoàng Nam (Lớp trưởng 10A1)",
                "gender": "MALE",
                "dob": date(2010, 5, 15),
                "address": "Số 10 Nguyễn Khoái, Hai Bà Trưng, Hà Nội",
                "role_name": "Lớp trưởng",
                "pwd": default_pwd_hash,
            },
            {
                "username": "loppho_hoctap_10a1",
                "email": "loppho_hoctap_10a1@schoolpro.edu.vn",
                "phone": "0912345803",
                "first_name": "Anh",
                "last_name": "Phạm Quỳnh",
                "full_name": "Phạm Quỳnh Anh (Lớp phó Học tập)",
                "gender": "FEMALE",
                "dob": date(2010, 8, 20),
                "address": "Số 25 Vĩnh Tuy, Hai Bà Trưng, Hà Nội",
                "role_name": "Lớp phó học tập",
                "pwd": default_pwd_hash,
            },
            {
                "username": "loppho_laodong_10a1",
                "email": "loppho_laodong_10a1@schoolpro.edu.vn",
                "phone": "0912345804",
                "first_name": "Trí",
                "last_name": "Trần Minh",
                "full_name": "Trần Minh Trí (Lớp phó Lao động)",
                "gender": "MALE",
                "dob": date(2010, 10, 2),
                "address": "Số 38 Minh Khai, Hai Bà Trưng, Hà Nội",
                "role_name": "Lớp phó lao động và Đời sống",
                "pwd": default_pwd_hash,
            },
            {
                "username": "loppho_vanthemy_10a1",
                "email": "loppho_vanthemy_10a1@schoolpro.edu.vn",
                "phone": "0912345805",
                "first_name": "Dương",
                "last_name": "Nguyễn Thùy",
                "full_name": "Nguyễn Thùy Dương (Lớp phó Văn thể mỹ)",
                "gender": "FEMALE",
                "dob": date(2010, 4, 18),
                "address": "Số 47 Kim Ngưu, Hai Bà Trưng, Hà Nội",
                "role_name": "Lớp phó Văn - Thể - Mỹ",
                "pwd": default_pwd_hash,
            },
            {
                "username": "bithu_chidoan_10a1",
                "email": "bithu_chidoan_10a1@schoolpro.edu.vn",
                "phone": "0912345806",
                "first_name": "Phong",
                "last_name": "Hoàng Đức",
                "full_name": "Hoàng Đức Phong (Bí thư Chi đoàn)",
                "gender": "MALE",
                "dob": date(2010, 1, 12),
                "address": "Số 69 Lĩnh Nam, Hoàng Mai, Hà Nội",
                "role_name": "Bí thư Chi đoàn lớp",
                "pwd": default_pwd_hash,
            },
            {
                "username": "phobithu_chidoan_10a1",
                "email": "phobithu_chidoan_10a1@schoolpro.edu.vn",
                "phone": "0912345807",
                "first_name": "My",
                "last_name": "Bùi Hải",
                "full_name": "Bùi Hải My (Phó Bí thư Chi đoàn)",
                "gender": "FEMALE",
                "dob": date(2010, 7, 23),
                "address": "Số 88 Tân Mai, Hoàng Mai, Hà Nội",
                "role_name": "Phó Bí thư Chi đoàn lớp",
                "pwd": default_pwd_hash,
            },
            {
                "username": "totruong_to1_10a1",
                "email": "totruong_to1_10a1@schoolpro.edu.vn",
                "phone": "0912345808",
                "first_name": "Bảo",
                "last_name": "Đặng Quốc",
                "full_name": "Đặng Quốc Bảo (Tổ trưởng Tổ 1)",
                "gender": "MALE",
                "dob": date(2010, 9, 7),
                "address": "Số 14 Giáp Bát, Hoàng Mai, Hà Nội",
                "role_name": "Tổ trưởng tổ học tập",
                "pwd": default_pwd_hash,
            },
            {
                "username": "topho_to1_10a1",
                "email": "topho_to1_10a1@schoolpro.edu.vn",
                "phone": "0912345809",
                "first_name": "Mai",
                "last_name": "Ngô Xuân",
                "full_name": "Ngô Xuân Mai (Tổ phó Tổ 1)",
                "gender": "FEMALE",
                "dob": date(2010, 11, 29),
                "address": "Số 32 Đại Từ, Hoàng Mai, Hà Nội",
                "role_name": "Tổ phó tổ học tập",
                "pwd": default_pwd_hash,
            },
            # =========================================================================
            # 6. GENERAL STUDENTS & GUARDIANS (PARENTS) (4 USERS)
            # =========================================================================
            {
                "username": "hocsinh_01",
                "email": "hocsinh_01@schoolpro.edu.vn",
                "phone": "0912345810",
                "first_name": "Quân",
                "last_name": "Đỗ Minh",
                "full_name": "Đỗ Minh Quân",
                "gender": "MALE",
                "dob": date(2010, 3, 21),
                "address": "Số 75 Hoàng Mai, Hà Nội",
                "role_name": "Học sinh",
                "pwd": default_pwd_hash,
            },
            {
                "username": "phuhuynh_01",
                "email": "phuhuynh_01@schoolpro.edu.vn",
                "phone": "0933456701",
                "first_name": "Tuấn",
                "last_name": "Lê Văn",
                "full_name": "Lê Văn Tuấn (Phụ huynh Nam)",
                "gender": "MALE",
                "dob": date(1977, 8, 14),
                "address": "Số 10 Nguyễn Khoái, Hai Bà Trưng, Hà Nội",
                "role_name": "Phụ huynh học sinh",
                "pwd": default_pwd_hash,
            },
            {
                "username": "truongban_phuhuynh_truong",
                "email": "truongban_phuhuynh_truong@schoolpro.edu.vn",
                "phone": "0933456702",
                "first_name": "Long",
                "last_name": "Trần Đình",
                "full_name": "Trần Đình Long (Trưởng ban PH Trường)",
                "gender": "MALE",
                "dob": date(1974, 12, 1),
                "address": "Số 99 Bà Triệu, Hoàn Kiếm, Hà Nội",
                "role_name": "Trưởng ban đại diện Cha mẹ học sinh trường",
                "pwd": default_pwd_hash,
            },
            {
                "username": "truongban_phuhuynh_lop",
                "email": "truongban_phuhuynh_lop@schoolpro.edu.vn",
                "phone": "0933456703",
                "first_name": "Hương",
                "last_name": "Phạm Thanh",
                "full_name": "Phạm Thanh Hương (Trưởng ban PH Lớp)",
                "gender": "FEMALE",
                "dob": date(1979, 4, 19),
                "address": "Số 25 Vĩnh Tuy, Hai Bà Trưng, Hà Nội",
                "role_name": "Trưởng ban đại diện Cha mẹ học sinh lớp",
                "pwd": default_pwd_hash,
            },
        ]

        with transaction.atomic():
            for idx, u_info in enumerate(users_data, start=1):
                # Look up existing user by username or email for idempotency
                user = (
                    User.objects.filter(username=u_info["username"]).first()
                    or User.objects.filter(email=u_info["email"]).first()
                )
                created = False

                if not user:
                    # Dynamically generate 12-digit random National ID code using existing utility
                    national_id = generate_unique_code(User, "national_id")

                    user = User.objects.create(
                        id=uuid6.uuid7(),
                        school=school,
                        username=u_info["username"],
                        email=u_info["email"],
                        phone=u_info["phone"],
                        password_hash=u_info["pwd"],
                        full_name=u_info["full_name"],
                        first_name=u_info["first_name"],
                        last_name=u_info["last_name"],
                        preferred_name=u_info["first_name"],
                        date_of_birth=u_info["dob"],
                        gender_code=u_info["gender"],
                        national_id=national_id,
                        address=u_info["address"],
                        locale="vi-VN",
                        timezone="Asia/Ho_Chi_Minh",
                        status_code="ACTIVE",
                        must_change_password=False,
                        is_verified=True,
                    )
                    created = True
                else:
                    # Update fields to synchronize complete demographic attributes
                    user.email = u_info["email"]
                    user.phone = u_info["phone"]
                    user.password_hash = u_info["pwd"]
                    user.full_name = u_info["full_name"]
                    user.first_name = u_info["first_name"]
                    user.last_name = u_info["last_name"]
                    user.preferred_name = u_info["first_name"]
                    user.date_of_birth = u_info["dob"]
                    user.gender_code = u_info["gender"]
                    user.address = u_info["address"]
                    user.status_code = "ACTIVE"
                    user.failed_login_attempts = 0
                    user.locked_at = None
                    user.is_verified = True
                    user.save(
                        update_fields=[
                            "email",
                            "phone",
                            "password_hash",
                            "full_name",
                            "first_name",
                            "last_name",
                            "preferred_name",
                            "date_of_birth",
                            "gender_code",
                            "address",
                            "status_code",
                            "failed_login_attempts",
                            "locked_at",
                            "is_verified",
                        ]
                    )

                # Bind corresponding security Role via UserRole
                target_role = Role.objects.filter(name=u_info["role_name"]).first()
                if target_role:
                    # Demote any conflicting active primary role for this user to satisfy ux_user_roles_primary
                    UserRole.objects.filter(user=user, is_primary=True, status="ACTIVE").exclude(
                        role=target_role
                    ).update(is_primary=False)

                    ur = UserRole.objects.filter(user=user, role=target_role).first()
                    if not ur:
                        ur = UserRole.objects.create(
                            id=uuid6.uuid7(),
                            user=user,
                            role=target_role,
                            is_primary=True,
                            effective_from=date.today(),
                            status="ACTIVE",
                        )
                    else:
                        if not ur.is_primary or ur.status != "ACTIVE":
                            ur.is_primary = True
                            ur.status = "ACTIVE"
                            ur.save(update_fields=["is_primary", "status"])

                status_msg = "Created" if created else "Updated"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  [{idx:>2}/37] User: {user.username:<32} | {user.email:<38} -> Role: {u_info['role_name']} ({status_msg})"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {len(users_data)} comprehensive Enterprise Users!"
            )
        )
