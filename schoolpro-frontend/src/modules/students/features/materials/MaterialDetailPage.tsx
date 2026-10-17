import type React from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { message } from "@/components/ui/Message";
import {
  MaterialDetailHeader,
  MaterialWorkflowCard,
  MaterialContentCard,
  MaterialFilesCard,
  MaterialPreviewModal,
  MaterialOutlineCard,
  MaterialDetailSidebar,
  MaterialDetailSkeleton,
} from "@/modules/students/features/materials/components/detail";
import { useMaterialDetail } from "@/modules/students/features/materials/hooks/useMaterialDetail";
import { getMaterialFileList } from "@/modules/students/features/materials/utils";
import type { MaterialFileItem } from "@/modules/students/features/materials/types";

export const MaterialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(["card", "button", "message"]);

  const { item, loading, downloading, handleDownload, handleToggleBookmark } =
    useMaterialDetail(id);

  // Preview Modal state
  const [previewFile, setPreviewFile] = useState<MaterialFileItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Selective downloading state
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);

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
          {t("card:materials.empty.notFoundDescription")}
        </p>
        <Button variant="primary" onClick={() => navigate("/student/materials")}>
          {t("card:materials.header.backToSubjects")}
        </Button>
      </div>
    );
  }

  const fileList = getMaterialFileList(item);

  const handleOpenPreview = (file: MaterialFileItem) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  const handleDownloadSingle = (file: MaterialFileItem) => {
    message.success(
      t("card:materials.modal.downloadStarted", { fileName: file.name }),
    );
    const link = document.createElement("a");
    link.href = file.url || "#";
    link.download = file.name;
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSelected = (selectedFiles: MaterialFileItem[]) => {
    setIsBatchDownloading(true);
    message.success(
      t("card:materials.modal.downloadBatchStarted", {
        count: selectedFiles.length,
      }),
    );
    // Simulate batch archive download
    setTimeout(() => {
      setIsBatchDownloading(false);
      selectedFiles.forEach((f) => {
        const link = document.createElement("a");
        link.href = f.url || "#";
        link.download = f.name;
        link.target = "_blank";
        link.rel = "noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }, 700);
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-8">
      {/* 1. Header Card synchronized with LeaveRequestDetailHeader */}
      <MaterialDetailHeader
        item={item}
        downloading={downloading}
        onBack={() => navigate("/student/materials")}
        onDownload={handleDownload}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* 2. Full-Width Release & Workflow Card synchronized with LeaveRequestWorkflowCard */}
      <MaterialWorkflowCard item={item} />

      {/* 3. Main 2:1 Grid matching LeaveRequest layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
        {/* Left Column (2 Cols): Content Overview + Files List + Outline */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <MaterialContentCard item={item} />

          {/* Files List Card: select & download, preview modal trigger */}
          <MaterialFilesCard
            files={fileList}
            onPreviewFile={handleOpenPreview}
            onDownloadSingle={handleDownloadSingle}
            onDownloadSelected={handleDownloadSelected}
            downloading={isBatchDownloading}
          />

          <MaterialOutlineCard item={item} />
        </div>

        {/* Right Column (1 Col): Sidebar (Specs + Teacher info + Quick Actions) */}
        <div>
          <MaterialDetailSidebar
            item={item}
            downloading={downloading}
            onDownload={handleDownload}
            onToggleBookmark={handleToggleBookmark}
          />
        </div>
      </div>

      {/* 4. Enterprise File Preview Modal supporting PDF, Audio, Video, Word, Excel, PPT */}
      <MaterialPreviewModal
        open={isPreviewOpen}
        onClose={handleClosePreview}
        file={previewFile}
        materialTitle={item.title}
        onDownloadFile={handleDownloadSingle}
      />
    </div>
  );
};

export default MaterialDetailPage;
