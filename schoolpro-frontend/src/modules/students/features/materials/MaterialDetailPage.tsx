import type React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  MaterialDetailHeader,
  MaterialPreviewCard,
  MaterialOutlineCard,
  MaterialDetailSidebar,
  MaterialDetailSkeleton,
} from "@/modules/students/features/materials/components/detail";
import { useMaterialDetail } from "@/modules/students/features/materials/hooks/useMaterialDetail";

export const MaterialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(["card", "button", "message"]);

  const { item, loading, downloading, handleDownload, handleToggleBookmark } =
    useMaterialDetail(id);

  if (loading) {
    return <MaterialDetailSkeleton />;
  }

  if (!item) {
    return (
      <div className="p-10 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs my-6">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Icon name="file" size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          {t("card:materials.empty.noMaterialsTitle")}
        </h3>
        <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
          Tài liệu học tập bạn tìm kiếm không tồn tại hoặc đã được gỡ bỏ khỏi hệ thống.
        </p>
        <Button variant="primary" onClick={() => navigate("/student/materials")}>
          {t("card:materials.header.backToSubjects")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-8">
      {/* 1. Detail Header Card with Breadcrumb, Title, Badges & Actions */}
      <MaterialDetailHeader
        item={item}
        downloading={downloading}
        onBack={() => navigate("/student/materials")}
        onDownload={handleDownload}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* 2. Main 3-Column Grid matching LeaveRequestDetailPage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
        {/* Left Column (2 Cols): Document Overview & Preview + Outline Table of Contents */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <MaterialPreviewCard
            item={item}
            downloading={downloading}
            onDownload={handleDownload}
          />
          <MaterialOutlineCard item={item} />
        </div>

        {/* Right Column (1 Col): File Specifications + Teacher Info + Quick Actions */}
        <div>
          <MaterialDetailSidebar
            item={item}
            downloading={downloading}
            onDownload={handleDownload}
            onToggleBookmark={handleToggleBookmark}
          />
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailPage;
