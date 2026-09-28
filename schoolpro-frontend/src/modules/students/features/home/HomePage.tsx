import React from "react";
import { useTranslation } from "react-i18next";
import { useHome } from "@/modules/students/features/home/hooks";
import {
  HomeSkeleton,
  WelcomeBanner,
  FunctionalCardsGrid,
  RemindersCarousel,
  AnnouncementsSection,
} from "@/modules/students/features/home/components";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export const HomePage: React.FC = () => {
  const { t } = useTranslation(["common", "student"]);
  const { data, loading, error, refetch, submitAssignment } = useHome();

  if (loading && !data) {
    return <HomeSkeleton />;
  }

  if (error && !data) {
    return (
      <Card className="p-8 border-red-200 bg-red-50/20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <Icon name="info" size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">
            Không thể tải dữ liệu Trang chủ
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {error.message || "Đã xảy ra lỗi khi kết nối máy chủ. Vui lòng thử lại sau."}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => refetch()}
          className="rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700"
        >
          {t("common:actions.retry", { defaultValue: "Thử lại" })}
        </Button>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* 1. Hero Welcome Banner (Bordered & Accessible) */}
      <WelcomeBanner profile={data.profile} />

      {/* 2. Functional Cards Grid (360 Ecosystem Features) */}
      <FunctionalCardsGrid features={data.features} />

      {/* 3. Section Nhắc nhở (Carousel of Reminder Cards) */}
      <RemindersCarousel
        schedule={data.todaySchedule}
        assignments={data.urgentAssignments}
        exams={data.upcomingExams}
        onSubmitAssignment={submitAssignment}
      />

      {/* 4. Section Thông báo (Top 10 Announcements List) */}
      <AnnouncementsSection notices={data.notices} />
    </div>
  );
};
