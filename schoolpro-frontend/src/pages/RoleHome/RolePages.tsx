import React from "react";
import { RoleHomePage } from "@/pages/RoleHome";

export const TeacherHomePage: React.FC = () => (
  <RoleHomePage
    roleTitle="Giáo viên"
    roleSubtitle="Không gian quản lý sổ điểm, lịch báo giảng, giáo án điện tử và tương tác học sinh."
    roleBadgeColor="#2563EB"
    roleIcon="presentation"
  />
);

export const StaffHomePage: React.FC = () => (
  <RoleHomePage
    roleTitle="Cán bộ nhân viên"
    roleSubtitle="Cổng quản lý văn thư, y tế học đường, cơ sở vật chất và tài vụ nhà trường."
    roleBadgeColor="#0D9488"
    roleIcon="settings"
  />
);

export const AdminHomePage: React.FC = () => (
  <RoleHomePage
    roleTitle="Quản trị viên hệ thống"
    roleSubtitle="Bảng điều khiển trung tâm vận hành hạ tầng số, phân quyền bảo mật và danh mục trường học."
    roleBadgeColor="#1E293B"
    roleIcon="lock"
  />
);

export const ParentHomePage: React.FC = () => (
  <RoleHomePage
    roleTitle="Phụ huynh học sinh"
    roleSubtitle="Sổ liên lạc điện tử, theo dõi tiến độ chuyên cần, kết quả học tập và thông báo nhà trường."
    roleBadgeColor="#EA580C"
    roleIcon="userCheck"
  />
);

export const SupervisorHomePage: React.FC = () => (
  <RoleHomePage
    roleTitle="Giám thị học đường"
    roleSubtitle="Quản lý nề nếp kỷ luật, theo dõi điểm thi đua các lớp và an toàn khuôn viên trường."
    roleBadgeColor="#D97706"
    roleIcon="check"
  />
);
