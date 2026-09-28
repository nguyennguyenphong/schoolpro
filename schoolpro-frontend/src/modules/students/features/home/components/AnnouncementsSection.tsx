import React, { useState } from "react";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { AcademicNoticeItem } from "@/modules/students/features/home/types";

interface AnnouncementsSectionProps {
  notices?: AcademicNoticeItem[];
  onViewAll?: () => void;
  onNoticeClick?: (notice: AcademicNoticeItem) => void;
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  notices = [],
  onViewAll,
  onNoticeClick,
}) => {
  const { t } = useTranslation(["student"]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const top10Notices = notices.slice(0, 10);

  const filteredNotices =
    selectedCategory === "all"
      ? top10Notices
      : top10Notices.filter((n) => n.category === selectedCategory);

  const handleClick = (notice: AcademicNoticeItem) => {
    if (onNoticeClick) {
      onNoticeClick(notice);
    } else {
      message.info(`${notice.title}`);
    }
  };

  const getCategoryMeta = (category: AcademicNoticeItem["category"]) => {
    switch (category) {
      case "registration":
        return { label: "Đào tạo", color: "blue" as const };
      case "exam":
        return { label: "Khảo thí", color: "purple" as const };
      case "scholarship":
        return { label: "Học bổng", color: "warning" as const };
      case "finance":
        return { label: "Học phí", color: "success" as const };
      case "activity":
        return { label: "Hoạt động", color: "cyan" as const };
      case "general":
      default:
        return { label: "Chung", color: "default" as const };
    }
  };

  const filterCategories = [
    { key: "all", label: "Tất cả (10)" },
    { key: "registration", label: "Đào tạo" },
    { key: "exam", label: "Khảo thí" },
    { key: "scholarship", label: "Học bổng" },
    { key: "finance", label: "Học phí" },
    { key: "activity", label: "Hoạt động" },
  ];

  return (
    <section aria-labelledby="announcements-section-title" className="space-y-4">
      <Card className="p-6 border-slate-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
              <h2
                id="announcements-section-title"
                className="text-lg sm:text-xl font-bold text-slate-900 mb-0"
              >
                {t("student:noticesSection.title", { defaultValue: "Thông báo" })}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                10 thông báo mới nhất
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-0">
              {t("student:noticesSection.subtitle", {
                defaultValue: "10 thông báo mới nhất từ các phòng ban, khoa và đơn vị đào tạo",
              })}
            </p>
          </div>

          <Button
            variant="link"
            onClick={
              onViewAll ||
              (() =>
                message.info(
                  t("student:noticesSection.viewAll", {
                    defaultValue: "Xem tất cả thông báo",
                  })
                ))
            }
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 p-0! flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>{t("student:noticesSection.viewAll", { defaultValue: "Xem tất cả thông báo" })}</span>
            <Icon name="arrow-right" size={14} />
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {filterCategories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat.key
                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Top 10 Notices List */}
        {filteredNotices.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            Không tìm thấy thông báo thuộc danh mục này.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotices.map((notice, index) => {
              const categoryMeta = getCategoryMeta(notice.category);

              return (
                <div
                  key={notice.id}
                  onClick={() => handleClick(notice)}
                  className="py-3.5 first:pt-0 last:pb-0 px-2 rounded-xl group hover:bg-slate-50/70 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Meta Tags & Department */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>

                        <Tag color={categoryMeta.color} className="text-[11px] font-bold mr-0">
                          {categoryMeta.label}
                        </Tag>

                        {notice.isImportant && (
                          <Tag color="error" className="text-[10px] font-bold mr-0 px-1.5 py-0.5">
                            {t("student:academicAlerts.important", { defaultValue: "Khẩn" })}
                          </Tag>
                        )}

                        <span className="text-[11px] text-slate-400 font-medium">
                          {notice.department} • {notice.publishDate}
                        </span>
                      </div>

                      {/* Notice Title */}
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-0 leading-snug line-clamp-1">
                        {notice.title}
                      </h3>

                      {/* Summary Snippet */}
                      <p className="text-xs text-slate-500 mb-0 line-clamp-1 leading-relaxed">
                        {notice.summary}
                      </p>
                    </div>

                    {/* Right Arrow Action */}
                    <div className="shrink-0 pt-2 hidden sm:flex items-center text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
                      <Icon name="arrow-right" size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </section>
  );
};
