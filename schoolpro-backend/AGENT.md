# 🤖 AGENT CODING GUIDELINES - SchoolPro Backend

**Phiên bản:** 1.0  
**Thời gian cập nhật:** 2026-10-01  
**Mục đích:** Hướng dẫn AI Agent thực hiện công việc coding đúng chuẩn Enterprise cho SchoolPro Backend

---

## 📋 MỤC LỤC

1. [Quy tắc chung](#1-quy-tắc-chung)
2. [Kiến trúc dự án](#2-kiến-trúc-dự-án)
3. [Chuẩn code Python/Django](#3-chuẩn-code-pythondjango)
4. [Cấu trúc ứng dụng (Apps)](#4-cấu-trúc-ứng-dụng-apps)
5. [Quy tắc đặt tên](#5-quy-tắc-đặt-tên)
6. [Phát triển Models](#6-phát-triển-models)
7. [Phát triển Views & Serializers](#7-phát-triển-views--serializers)
8. [Services & Business Logic](#8-services--business-logic)
9. [Quy tắc kiểm thử](#9-quy-tắc-kiểm-thử)
10. [Tích hợp Celery](#10-tích-hợp-celery)
11. [Git & Commit Workflow](#11-git--commit-workflow)

---

## 1. QUY TẮC CHUNG

### 1.1 Ngôn ngữ & Công nghệ

- **Python:** 3.13+
- **Django:** 6.1.1
- **Django REST Framework:** 3.18.1
- **Database:** PostgreSQL 16+
- **Task Queue:** Celery 5.6.3 với Redis
- **API Doc:** drf-spectacular (OpenAPI 3.0)

### 1.2 Kiểu code & Linting

```bash
# ✅ Code phải tuân thủ Ruff
ruff check .                    # Kiểm tra lỗi
ruff format .                   # Tự động format
ruff check --fix .              # Tự động sửa lỗi

# ✅ Kiểm tra Django
python manage.py check

# ✅ Chạy test trước khi commit
DJANGO_ENV=testing pytest -v
```

### 1.3 Môi trường & Cấu hình

- **Development:** `.env.local.example` → `.env`
- **Staging:** `.env.staging.example`
- **Production:** `.env.prod.example`
- Không commit file `.env` - dùng `.env.*.example`

### 1.4 Luôn tuân thủ

- ✅ DRY (Don't Repeat Yourself)
- ✅ SOLID Principles
- ✅ Clean Code
- ✅ Clean Architecture (Layered)
- ✅ Domain-Driven Design (DDD)

---

## 2. KIẾN TRÚC DỰ ÁN

### 2.1 Cây thư mục chính

```
schoolpro-backend/
├── config/                          # Cấu hình Django global
│   ├── settings/
│   │   ├── base.py                 # Cấu hình chung
│   │   ├── development.py
│   │   ├── staging.py
│   │   ├── production.py
│   │   └── testing.py
│   ├── asgi.py                     # WebSocket
│   ├── wsgi.py                     # HTTP
│   ├── celery.py                   # Task Queue
│   └── urls.py                     # URL Router
│
├── apps/                            # 7 Domain Modules
│   ├── core/                        # Tổ chức, Identity, Auth
│   ├── master/                      # Dữ liệu tham chiếu
│   ├── academic/                    # Học vụ, Điểm, Thi cử
│   ├── evaluation/                  # Khảo sát, Đánh giá
│   ├── emulation/                   # Thi đua, Kỷ luật
│   ├── notification/                # Thông báo, Messages
│   └── system/                      # Audit, Config, Health
│
├── common/                          # Shared Kernel
│   ├── constants.py                 # Enum, Status, Roles
│   ├── exceptions.py                # Custom Exceptions
│   ├── middleware/                  # Request handling
│   ├── models/                      # Base Models
│   ├── permissions/                 # RBAC Permissions
│   ├── pagination/                  # Standard Pagination
│   ├── repositories/                # Data Access Pattern
│   ├── responses/                   # JSend Format
│   └── services/                    # Base Services
│
├── requirements/
│   ├── base.txt                     # Core
│   ├── local.txt                    # Dev
│   └── production.txt               # Prod
│
├── manage.py
├── Dockerfile
├── docker-compose.yml
├── .env.local.example
├── .env.prod.example
├── pyproject.toml                   # Ruff config
├── README.md
├── STRUCTURE.md                     # Chi tiết kiến trúc
└── AGENT.md                         # File này
```

### 2.2 Mô hình Layered Architecture

Mỗi **app domain** tuân thủ cấu trúc 4 layers:

```
apps/<domain>/
├── models.py                        # [Layer 1] Database Models
├── serializers.py                   # [Layer 2] Input/Output DTOs
├── views.py                         # [Layer 3] API Endpoints (ViewSets)
├── services.py                      # [Layer 4] Business Logic
├── repositories.py                  # [Layer 4] Data Access (Optional)
├── permissions.py                   # [Layer 3] Authorization Rules
├── filters.py                       # [Layer 3] Query Filters
├── urls.py                          # [Layer 3] Routing
├── admin.py                         # Django Admin
├── apps.py                          # App Config
├── tasks.py                         # Celery Tasks (if async)
├── signals.py                       # Django Signals (if needed)
├── constants.py                     # Domain-specific Enums
├── exceptions.py                    # Domain-specific Exceptions
├── migrations/                      # Database migrations
│   └── 0001_initial.py
└── tests/                           # Unit & Integration Tests
    ├── __init__.py
    ├── test_models.py
    ├── test_serializers.py
    ├── test_views.py
    └── test_services.py
```

---

## 3. CHUẨN CODE PYTHON/DJANGO

### 3.1 Import Order

```python
# 1. Standard library
import os
import sys
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, date
from decimal import Decimal

# 2. Third-party (Django)
from django.db import models
from django.utils import timezone
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import Q, F, Count, Sum

# 3. Third-party (DRF)
from rest_framework import serializers, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# 4. Local imports
from apps.core.models import User, School
from apps.master.serializers import SubjectSerializer
from common.responses import success_response, error_response
from common.permissions import IsSchoolAdmin, IsTenantAdmin
```

### 3.2 Type Hints (Bắt buộc)

```python
# ✅ ĐÚNG
def get_students_by_class(
    class_id: int,
    active_only: bool = True
) -> List[Dict[str, Any]]:
    pass

def process_score(value: Decimal, min_score: int = 0) -> Optional[float]:
    pass

# ❌ SAI
def get_students_by_class(class_id, active_only=True):
    pass
```

### 3.3 Docstrings

```python
def calculate_gpa(scores: List[float], weights: List[float]) -> float:
    """
    Tính toán điểm GPA từ danh sách điểm và trọng số.
    
    Args:
        scores (List[float]): Danh sách điểm số (0-10)
        weights (List[float]): Danh sách trọng số tương ứng (0-1)
    
    Returns:
        float: GPA tính toán (0-10)
    
    Raises:
        ValueError: Nếu số lượng scores và weights không khớp
        
    Example:
        >>> calculate_gpa([8.5, 7.0, 9.0], [0.4, 0.3, 0.3])
        8.2
    """
    if len(scores) != len(weights):
        raise ValueError("Số lượng điểm và trọng số phải khớp")
    
    return sum(s * w for s, w in zip(scores, weights))
```

### 3.4 Logging

```python
import logging

logger = logging.getLogger(__name__)

# ✅ ĐÚNG
logger.info(f"Xử lý sinh viên: {student_id} từ lớp {class_id}")
logger.warning(f"Điểm không hợp lệ: {score} cho sinh viên {student_id}")
logger.error(f"Lỗi cập nhật GPA cho user_id={user_id}", exc_info=True)

# ❌ SAI
print(f"Student: {student_id}")  # Không dùng print
```

### 3.5 Exception Handling

```python
from common.exceptions import BusinessLogicError, ResourceNotFoundError

try:
    student = Student.objects.get(id=student_id)
    student.score = calculate_score(...)
    student.save()
except Student.DoesNotExist:
    raise ResourceNotFoundError(
        detail=f"Sinh viên với ID {student_id} không tồn tại"
    )
except ValueError as e:
    raise BusinessLogicError(detail=str(e))
```

---

## 4. CẤU TRÚC ỨNG DỤNG (APPS)

### 4.1 7 Domain Apps

| App | Schema | Mục đích |
|-----|--------|---------|
| **core** | `core_` | Tổ chức, Identity, User, Auth, Roles, Permissions |
| **master** | `master_` | Dữ liệu tham chiếu: Năm học, Học kì, Môn học, Lớp, Phòng |
| **academic** | `academic_` | Học vụ: Điểm, Thi cử, Lịch học, Tham dự |
| **evaluation** | `evaluation_` | Đánh giá: Khảo sát, CSVC, GPA, Bảng điểm |
| **emulation** | `emulation_` | Thi đua: Nề nếp, Kỷ luật, Khen thưởng, Xếp hạng |
| **notification** | `notification_` | Thông báo: Message, Announcement, Push, Reminder |
| **system** | `system_` | Hệ thống: Audit Log, Config, Backup, Health |

### 4.2 Khi thêm App mới

```python
# 1. Tạo app
python manage.py startapp <app_name> apps/<app_name>

# 2. Cập nhật apps.py
# apps/<app_name>/apps.py
from django.apps import AppConfig

class <AppName>Config(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.<app_name>"
    label = "<app_name>"
    verbose_name = "Domain Name"

# 3. Thêm vào config/settings/base.py
INSTALLED_APPS = [
    # ...
    "apps.<app_name>",
]

# 4. Tạo migrations
python manage.py makemigrations <app_name>
python manage.py migrate

# 5. Đăng ký URL
# config/urls.py hoặc apps/<app_name>/urls.py
```

---

## 5. QUY TẮC ĐẶT TÊN

### 5.1 Python Naming Convention

```python
# ✅ Classes - PascalCase
class StudentEnrollment:
    pass

class AcademicYearFactory:
    pass

# ✅ Functions/Methods - snake_case
def calculate_gpa():
    pass

def get_active_students():
    pass

# ✅ Constants - UPPER_SNAKE_CASE
MAX_SCORE = 10
MIN_PASSING_SCORE = 5
DEFAULT_SEMESTER_DURATION_WEEKS = 18

# ✅ Private/Protected - leading underscore
def _validate_score(score: float) -> bool:
    pass

class _InternalService:
    pass

# ✅ Booleans - is_/has_/can_ prefix
is_active = True
has_permission = False
can_edit = True
```

### 5.2 Model Fields Naming

```python
class Student(models.Model):
    # ✅ ĐÚNG
    user = models.OneToOneField(User, ...)
    academic_year = models.ForeignKey(AcademicYear, ...)
    enrollment_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # ❌ SAI
    st_user = models.OneToOneField(User, ...)  # Tránh viết tắt
    enrollment_dt = models.DateField()         # Tránh viết tắt
```

### 5.3 API URL Naming

```text
# ✅ ĐÚNG - Plural nouns, lowercase
GET    /api/v1/students/                          # List
POST   /api/v1/students/                          # Create
GET    /api/v1/students/{id}/                     # Retrieve
PUT    /api/v1/students/{id}/                     # Update
DELETE /api/v1/students/{id}/                     # Delete

# Custom actions
GET    /api/v1/students/{id}/transcripts/         # Sub-resource list
POST   /api/v1/students/{id}/enroll/              # Custom action
GET    /api/v1/students/search/?q=name            # Search

# ❌ SAI
/api/v1/getStudents/
/api/v1/student/{id}/
/api/v1/createStudent/
```

---

## 6. PHÁT TRIỂN MODELS

### 6.1 Base Models

Luôn kế thừa từ Base Model:

```python
from common.models import UUIDModel, AuditableModel, SoftDeleteModel

# ✅ ĐÚNG
class Student(AuditableModel, SoftDeleteModel):
    """
    Mô hình Sinh viên - Tính toán điểm, GPA, bảng xếp hạng.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="student",
        help_text="Tài khoản người dùng sinh viên"
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.PROTECT,
        related_name="students"
    )
    enrollment_date = models.DateField(
        help_text="Ngày nhập học"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Trạng thái hoạt động"
    )
    
    class Meta:
        app_label = "academic"
        db_table = "academic_student"
        verbose_name = "Sinh viên"
        verbose_name_plural = "Sinh viên"
        indexes = [
            models.Index(fields=["academic_year", "is_active"]),
            models.Index(fields=["user"]),
        ]
        unique_together = [("user", "academic_year")]
        ordering = ["-created_at"]
    
    def __str__(self) -> str:
        return f"{self.user.full_name} ({self.academic_year})"
    
    def calculate_gpa(self) -> Decimal:
        """Tính GPA cho sinh viên trong năm học này."""
        # Business logic
        pass
```

### 6.2 Validators

```python
from django.core.exceptions import ValidationError

def validate_score(value: float) -> None:
    """Điểm phải từ 0 đến 10."""
    if not (0 <= value <= 10):
        raise ValidationError("Điểm phải nằm trong khoảng 0-10")

class ExamScore(models.Model):
    score = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=[validate_score]
    )
```

### 6.3 Signals (nếu cần)

```python
# apps/academic/signals.py
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from apps.academic.models import Enrollment

@receiver(post_save, sender=Enrollment)
def enrollment_created(sender, instance, created, **kwargs):
    """Tính toán lại GPA khi sinh viên đăng ký học phần mới."""
    if created:
        instance.student.calculate_gpa()
        logger.info(f"GPA recalculated for student {instance.student.id}")

# apps/academic/apps.py
class AcademicConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.academic"
    
    def ready(self):
        import apps.academic.signals  # noqa
```

---

## 7. PHÁT TRIỂN VIEWS & SERIALIZERS

### 7.1 Serializers

```python
from rest_framework import serializers
from apps.academic.models import Student

class StudentListSerializer(serializers.ModelSerializer):
    """Serializer cho danh sách sinh viên (minimal info)."""
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    
    class Meta:
        model = Student
        fields = ["id", "user_name", "academic_year", "is_active"]
        read_only_fields = ["id"]

class StudentDetailSerializer(serializers.ModelSerializer):
    """Serializer chi tiết sinh viên (full info)."""
    user = UserDetailSerializer(read_only=True)
    gpa = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = [
            "id", "user", "academic_year", "enrollment_date",
            "is_active", "gpa", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at", "gpa"]
    
    def get_gpa(self, obj: Student) -> Decimal:
        return obj.calculate_gpa()

class StudentCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer tạo/cập nhật sinh viên."""
    
    class Meta:
        model = Student
        fields = ["user", "academic_year", "enrollment_date", "is_active"]
    
    def validate_enrollment_date(self, value):
        if value > timezone.now().date():
            raise serializers.ValidationError("Ngày nhập học không thể trong tương lai")
        return value
```

### 7.2 ViewSets

```python
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.academic.models import Student
from apps.academic.serializers import (
    StudentListSerializer,
    StudentDetailSerializer,
    StudentCreateUpdateSerializer
)
from apps.academic.services import StudentService
from common.permissions import IsSchoolAdmin, IsTenantAdmin
from common.responses import success_response, error_response

class StudentViewSet(viewsets.ModelViewSet):
    """
    API ViewSet quản lý Sinh viên.
    
    GET    /students/              - Danh sách
    POST   /students/              - Tạo mới
    GET    /students/{id}/         - Chi tiết
    PUT    /students/{id}/         - Cập nhật
    DELETE /students/{id}/         - Xóa
    GET    /students/{id}/gpa/     - Tính GPA
    """
    
    queryset = Student.objects.select_related("user", "academic_year")
    permission_classes = [IsAuthenticated, IsSchoolAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["academic_year", "is_active"]
    search_fields = ["user__full_name", "user__email"]
    ordering_fields = ["created_at", "user__full_name"]
    ordering = ["-created_at"]
    
    def get_serializer_class(self):
        """Chọn serializer dựa trên action."""
        if self.action == "list":
            return StudentListSerializer
        elif self.action == "create" or self.action == "partial_update":
            return StudentCreateUpdateSerializer
        return StudentDetailSerializer
    
    def create(self, request, *args, **kwargs):
        """Tạo sinh viên mới."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            instance = StudentService.create_student(
                user_id=serializer.validated_data["user"].id,
                academic_year_id=serializer.validated_data["academic_year"].id,
                enrollment_date=serializer.validated_data["enrollment_date"]
            )
            return Response(
                success_response(StudentDetailSerializer(instance).data),
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Error creating student: {str(e)}", exc_info=True)
            return Response(
                error_response(detail=str(e)),
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=["get"])
    def gpa(self, request, pk=None):
        """Lấy GPA cho sinh viên."""
        student = self.get_object()
        gpa = student.calculate_gpa()
        return Response(
            success_response({"student_id": student.id, "gpa": gpa})
        )
    
    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        """Kích hoạt sinh viên."""
        student = self.get_object()
        student.is_active = True
        student.save()
        return Response(
            success_response(StudentDetailSerializer(student).data)
        )
```

---

## 8. SERVICES & BUSINESS LOGIC

### 8.1 Service Layer

```python
# apps/academic/services.py
from typing import List, Dict, Any
from decimal import Decimal
from apps.academic.models import Student, Enrollment, ExamScore
from apps.academic.repositories import StudentRepository

logger = logging.getLogger(__name__)

class StudentService:
    """
    Business logic cho quản lý sinh viên.
    Xử lý tính toán phức tạp, validation, orchestration.
    """
    
    def __init__(self):
        self.repository = StudentRepository()
    
    @staticmethod
    def create_student(
        user_id: int,
        academic_year_id: int,
        enrollment_date: str
    ) -> Student:
        """
        Tạo sinh viên mới với validation và setup ban đầu.
        
        Args:
            user_id: ID người dùng
            academic_year_id: ID năm học
            enrollment_date: Ngày nhập học
        
        Returns:
            Student: Đối tượng sinh viên mới
        
        Raises:
            BusinessLogicError: Nếu user hoặc academic_year không tồn tại
        """
        try:
            user = User.objects.get(id=user_id)
            academic_year = AcademicYear.objects.get(id=academic_year_id)
        except User.DoesNotExist:
            raise BusinessLogicError("User không tồn tại")
        except AcademicYear.DoesNotExist:
            raise BusinessLogicError("Năm học không tồn tại")
        
        if Student.objects.filter(user=user, academic_year=academic_year).exists():
            raise BusinessLogicError("Sinh viên đã tồn tại trong năm học này")
        
        student = Student.objects.create(
            user=user,
            academic_year=academic_year,
            enrollment_date=enrollment_date
        )
        
        logger.info(f"Created student: {student.id} for user {user_id}")
        return student
    
    @staticmethod
    def calculate_gpa_batch(
        academic_year_id: int
    ) -> Dict[int, Decimal]:
        """
        Tính toán GPA batch cho tất cả sinh viên trong năm học.
        
        Args:
            academic_year_id: ID năm học
        
        Returns:
            Dict[int, Decimal]: Mapping {student_id: gpa}
        """
        students = Student.objects.filter(academic_year_id=academic_year_id)
        results = {}
        
        for student in students:
            try:
                gpa = student.calculate_gpa()
                results[student.id] = gpa
            except Exception as e:
                logger.error(f"GPA calc error for student {student.id}: {e}")
                results[student.id] = Decimal("0.00")
        
        return results
    
    @staticmethod
    def get_student_transcripts(
        student_id: int
    ) -> List[Dict[str, Any]]:
        """Lấy bảng điểm sinh viên."""
        # Logic phức tạp
        pass
```

### 8.2 Repository Pattern (Optional)

```python
# apps/academic/repositories.py
from typing import List, Optional
from common.repositories import BaseRepository
from apps.academic.models import Student

class StudentRepository(BaseRepository[Student]):
    """
    Data access layer cho Student model.
    Centralize query logic.
    """
    
    model = Student
    
    def get_active_students(self, academic_year_id: int) -> List[Student]:
        """Lấy danh sách sinh viên hoạt động."""
        return self.model.objects.filter(
            academic_year_id=academic_year_id,
            is_active=True
        ).select_related("user")
    
    def get_by_email(self, email: str) -> Optional[Student]:
        """Tìm sinh viên bằng email."""
        return self.model.objects.filter(
            user__email=email
        ).first()
```

---

## 9. QUY TẮC KIỂM THỬ

### 9.1 Cấu trúc Test

```
apps/<app_name>/tests/
├── __init__.py
├── conftest.py                  # Pytest fixtures
├── test_models.py               # Model tests
├── test_serializers.py          # Serializer tests
├── test_views.py                # API endpoint tests
└── test_services.py             # Business logic tests
```

### 9.2 Viết Test

```python
# apps/academic/tests/test_models.py
import pytest
from datetime import date
from django.utils import timezone
from apps.academic.models import Student
from apps.core.models import User
from apps.master.models import AcademicYear

@pytest.mark.django_db
class TestStudentModel:
    """Test cases cho Student model."""
    
    @pytest.fixture
    def user(self):
        return User.objects.create(
            email="student@test.com",
            full_name="Nguyễn Văn A"
        )
    
    @pytest.fixture
    def academic_year(self):
        return AcademicYear.objects.create(
            name="2024-2025",
            start_date=date(2024, 9, 1),
            end_date=date(2025, 6, 30)
        )
    
    def test_create_student(self, user, academic_year):
        """Test tạo sinh viên."""
        student = Student.objects.create(
            user=user,
            academic_year=academic_year,
            enrollment_date=date(2024, 9, 1)
        )
        
        assert student.id is not None
        assert student.is_active is True
        assert student.user == user
    
    def test_student_string_representation(self, user, academic_year):
        """Test string representation của Student."""
        student = Student.objects.create(
            user=user,
            academic_year=academic_year,
            enrollment_date=date(2024, 9, 1)
        )
        
        assert str(student) == f"{user.full_name} (2024-2025)"

# apps/academic/tests/test_views.py
import pytest
from rest_framework.test import APIClient
from rest_framework import status

@pytest.mark.django_db
class TestStudentViewSet:
    """Test cases cho Student API endpoints."""
    
    @pytest.fixture
    def client(self):
        return APIClient()
    
    @pytest.fixture
    def authenticated_user(self):
        user = User.objects.create_user(
            email="admin@test.com",
            password="testpass123"
        )
        user.is_staff = True
        user.save()
        return user
    
    def test_list_students(self, client, authenticated_user):
        """Test GET /students/"""
        client.force_authenticate(user=authenticated_user)
        response = client.get("/api/v1/students/")
        
        assert response.status_code == status.HTTP_200_OK
        assert "results" in response.data or isinstance(response.data, list)
    
    def test_create_student_unauthorized(self, client):
        """Test tạo student khi chưa authenticate."""
        response = client.post("/api/v1/students/", {})
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
```

### 9.3 Chạy Test

```bash
# Chạy tất cả test
DJANGO_ENV=testing pytest -v

# Chạy test cho 1 app
DJANGO_ENV=testing pytest apps/academic/tests/ -v

# Chạy test với coverage
DJANGO_ENV=testing pytest --cov=apps --cov-report=html

# Chạy test cụ thể
DJANGO_ENV=testing pytest apps/academic/tests/test_models.py::TestStudentModel::test_create_student -v
```

---

## 10. TÍCH HỢP CELERY

### 10.1 Định nghĩa Tasks

```python
# apps/academic/tasks.py
from celery import shared_task
from django.core.mail import send_mail
from apps.academic.models import Student
from apps.academic.services import StudentService

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def calculate_gpa_for_academic_year(self, academic_year_id: int):
    """
    Tính toán GPA cho tất cả sinh viên trong năm học.
    
    Args:
        academic_year_id: ID năm học
    
    Retry: Tối đa 3 lần nếu lỗi, chờ 60 giây
    """
    try:
        logger.info(f"Starting GPA calculation for academic_year {academic_year_id}")
        results = StudentService.calculate_gpa_batch(academic_year_id)
        logger.info(f"Completed GPA calculation: {len(results)} students")
        return {"status": "success", "count": len(results)}
    except Exception as exc:
        logger.error(f"GPA calculation failed: {exc}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

@shared_task
def send_enrollment_confirmation_email(student_id: int):
    """Gửi email xác nhận nhập học."""
    try:
        student = Student.objects.get(id=student_id)
        send_mail(
            subject="Xác nhận nhập học",
            message=f"Xin chào {student.user.full_name}...",
            from_email="noreply@schoolpro.edu.vn",
            recipient_list=[student.user.email],
        )
        logger.info(f"Enrollment email sent to {student.user.email}")
    except Student.DoesNotExist:
        logger.error(f"Student {student_id} not found")
```

### 10.2 Gọi Tasks

```python
# Async call (non-blocking)
from apps.academic.tasks import calculate_gpa_for_academic_year

calculate_gpa_for_academic_year.delay(academic_year_id=1)

# Scheduled call
from celery.utils.log import get_task_logger

# config/celery.py
app.conf.beat_schedule = {
    "calculate-gpa-daily": {
        "task": "apps.academic.tasks.calculate_gpa_for_academic_year",
        "schedule": crontab(hour=23, minute=59),  # Hàng ngày lúc 23:59
        "args": (1,),
    },
}
```

---

## 11. GIT & COMMIT WORKFLOW

### 11.1 Branch Naming

```bash
# Feature branch
git checkout -b feature/add-gpa-calculation

# Bug fix
git checkout -b bugfix/fix-enrollment-validation

# Hotfix (production)
git checkout -b hotfix/critical-payment-issue

# Refactor
git checkout -b refactor/optimize-query-performance
```

### 11.2 Commit Messages (Conventional Commits)

```bash
# Format: type(scope): description

# ✅ ĐÚNG
git commit -m "feat(academic): add GPA calculation for students"
git commit -m "fix(student): validate enrollment date before saving"
git commit -m "docs(README): update setup instructions"
git commit -m "refactor(pagination): improve query performance"
git commit -m "test(student): add test for GPA calculation"

# ❌ SAI
git commit -m "fixed bug"
git commit -m "wip"
git commit -m "update"
```

### 11.3 Commit Types

| Type | Mục đích |
|------|---------|
| `feat` | Thêm tính năng mới |
| `fix` | Sửa bug |
| `docs` | Cập nhật tài liệu |
| `style` | Format code (không thay đổi logic) |
| `refactor` | Tái cấu trúc code |
| `test` | Thêm/cập nhật test |
| `chore` | Dependency, config, build |

### 11.4 Push & Pull Request

```bash
# 1. Đảm bảo code tuân thủ chuẩn
ruff check --fix .
ruff format .

# 2. Chạy test
DJANGO_ENV=testing pytest -v

# 3. Commit
git add .
git commit -m "feat(academic): implement GPA calculation"

# 4. Push
git push origin feature/add-gpa-calculation

# 5. Tạo Pull Request
# - Tiêu đề rõ ràng
# - Mô tả chi tiết thay đổi
# - Link liên quan issue (nếu có)
# - Chụp ảnh/video demo (nếu cần)
```

### 11.5 Before Submitting PR

```bash
# ✅ Checklist
- [ ] Code được format với Ruff
- [ ] Tất cả test pass
- [ ] Không có merge conflicts
- [ ] Docstrings cập nhật
- [ ] Type hints đầy đủ
- [ ] Migrations tạo đúng cách
- [ ] .env files không commit
- [ ] No print() statements (dùng logger)
- [ ] No hardcoded values
```

---

## 🎯 QUICK REFERENCE

### Tạo Model mới

```python
# 1. Định nghĩa trong models.py
class NewModel(AuditableModel):
    name = models.CharField(max_length=100)
    class Meta:
        app_label = "app_name"
        db_table = "app_name_newmodel"

# 2. Tạo migration
python manage.py makemigrations app_name

# 3. Apply migration
python manage.py migrate
```

### Tạo API Endpoint mới

```python
# 1. Serializers
class NewModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewModel
        fields = ["id", "name", ...]

# 2. ViewSet
class NewModelViewSet(viewsets.ModelViewSet):
    queryset = NewModel.objects.all()
    serializer_class = NewModelSerializer

# 3. URLs
router = DefaultRouter()
router.register(r"new-models", NewModelViewSet)

# 4. Include in urls.py
urlpatterns += router.urls
```

### Chạy Commands Phổ biến

```bash
# Development
python manage.py runserver 0.0.0.0:8000

# Migrations
python manage.py makemigrations
python manage.py migrate

# Django Shell
python manage.py shell

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Test
DJANGO_ENV=testing pytest -v

# Linting
ruff check --fix .
ruff format .

# Celery Worker
celery -A config worker -l info

# Celery Beat (Scheduler)
celery -A config beat -l info
```

---

## 📞 SUPPORT & TROUBLESHOOTING

### Lỗi thường gặp

| Lỗi | Giải pháp |
|-----|----------|
| `ModuleNotFoundError` | Cài đặt dependencies: `pip install -r requirements/local.txt` |
| `ProgrammingError` | Chạy migrate: `python manage.py migrate` |
| `PermissionDenied` | Kiểm tra permissions trong views |
| `ValidationError` | Kiểm tra validators trong models/serializers |
| `Celery not working` | Kiểm tra Redis connection, celery worker log |

---

## 📚 TÀI LIỆU THAM KHẢO

- [Django 6.1 Documentation](https://docs.djangoproject.com/en/6.1/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Celery Documentation](https://docs.celeryproject.org/)
- [PostgreSQL 16](https://www.postgresql.org/docs/16/)
- [Python 3.13](https://docs.python.org/3.13/)
- [drf-spectacular OpenAPI](https://drf-spectacular.readthedocs.io/)

---

**Phiên bản:** 1.0  
**Cập nhật lần cuối:** 2026-10-01  
**Tác giả:** AI Agent Guidelines for SchoolPro Backend Team
