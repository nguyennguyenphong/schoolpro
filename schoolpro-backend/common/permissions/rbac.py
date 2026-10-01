from rest_framework.permissions import BasePermission
from common.constants.roles import RoleCode


class IsSchoolAdmin(BasePermission):
    """
    Allows access only to School Administrators and Superusers.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser or request.user.is_staff:
            return True
        return hasattr(request.user, "roles") and request.user.roles.filter(
            code__in=[RoleCode.ADMIN, RoleCode.PRINCIPAL]
        ).exists()


class IsTeacher(BasePermission):
    """
    Allows access to users with Teacher or Homeroom Teacher role.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser:
            return True
        return hasattr(request.user, "roles") and request.user.roles.filter(
            code__in=[RoleCode.TEACHER, RoleCode.HOMEROOM_TEACHER, RoleCode.ADMIN]
        ).exists()


class IsStudent(BasePermission):
    """
    Allows access to authenticated Students.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return hasattr(request.user, "roles") and request.user.roles.filter(
            code=RoleCode.STUDENT
        ).exists()


class IsGuardian(BasePermission):
    """
    Allows access to Parents / Legal Guardians.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return hasattr(request.user, "roles") and request.user.roles.filter(
            code=RoleCode.GUARDIAN
        ).exists()


class HasModulePermission(BasePermission):
    """
    Checks if the user has specific module-level action permission (e.g. 'academic.score.update').
    """
    required_permission: str = ""

    def __init__(self, permission_code: str = ""):
        if permission_code:
            self.required_permission = permission_code

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser:
            return True

        perm = getattr(view, "required_permission", self.required_permission)
        if not perm:
            return True

        user_perms = getattr(request.user, "all_permissions", None)
        if user_perms is not None:
            return perm in user_perms

        return False
