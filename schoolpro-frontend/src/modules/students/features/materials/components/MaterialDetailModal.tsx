import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { message } from "@/components/ui/Message";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { MaterialItem, MaterialFormat, MaterialCategory } from "@/modules/students/features/materials/types";

interface MaterialDetailModalProps {
  item: MaterialItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (item: MaterialItem) => void;
  onToggleBookmark: (id: string) => void;
}

export const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onDownload,
  onToggleBookmark,
}) => {
  const { t } = useTranslation();
  if (!item) return null;

  const getFormatBadge = (fmt: MaterialFormat) => {
    switch (fmt) {
      case "pdf":
        return (
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            PDF Document
          </span>
        );
      case "word":
        return (
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Word DOCX
          </span>
        );
      case "powerpoint":
        return (
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
            PowerPoint PPTX
          </span>
        );
      case "excel":
        return (
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Excel XLSX
          </span>
        );
      case "video":
        return (
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
            Video MP4
          </span>
        );
      case "audio":
        return (
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            Audio MP3
          </span>
        );
      case "archive":
      default:
        return (
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-[#f0f0f0]">
            ZIP Archive
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: MaterialCategory) => {
    switch (cat) {
      case "lecture":
        return t("card:materials.categories.lecture", "Bài giảng");
      case "outline":
        return t("card:materials.categories.outline", "Đề cương");
      case "textbook":
        return t("card:materials.categories.textbook", "Sách giáo khoa");
      case "exam_prep":
        return t("card:materials.categories.exam_prep", "Đề thi");
      case "reference":
      default:
        return t("card:materials.categories.reference", "Tham khảo");
    }
  };

  const renderPreviewSection = () => {
    if (item.format === "video") {
      return (
        <div className="bg-slate-900 rounded-xl overflow-hidden p-2 text-center text-white">
          <div className="aspect-video bg-slate-950 flex flex-col items-center justify-center rounded-lg relative overflow-hidden">
            <Icon name="video" size={48} className="text-purple-400 mb-2" />
            <p className="text-sm font-medium text-slate-300">Trình phát video trực tuyến</p>
            <p className="text-xs text-slate-500">Độ phân giải Full HD 1080p</p>
            <div className="mt-4 flex items-center gap-3">
              <Button
                variant="primary"
                onClick={() => message.info(t("card:materials.actions.preview", "Xem trước tài liệu"))}
              >
                <Icon name="video" size={15} className="mr-1.5" />
                <span>{t("card:materials.actions.preview", "Xem trước tài liệu")}</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (item.format === "audio") {
      return (
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
            <Icon name="music" size={28} />
          </div>
          <h4 className="font-semibold text-slate-800 text-sm mb-1">{item.title}</h4>
          <p className="text-xs text-slate-500 mb-4">File nghe chất lượng cao (320 kbps)</p>
          <div className="w-full max-w-md bg-white border border-amber-200 rounded-lg p-3 shadow-2xs flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => message.info(t("card:materials.actions.preview", "Xem trước tài liệu"))}
            >
              <Icon name="music" size={15} className="mr-1.5" />
              <span>{t("card:materials.actions.preview", "Xem trước tài liệu")}</span>
            </Button>
            <span className="text-xs text-slate-400">00:00 / 18:45</span>
          </div>
        </div>
      );
    }

    // Documents (PDF, Word, PPTX, Excel, ZIP)
    return (
      <div className="bg-slate-50 border border-[#f0f0f0] rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#f0f0f0] shadow-2xs flex items-center justify-center text-blue-600 shrink-0">
              <Icon name="fileText" size={26} />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm mb-0.5">{item.fileName}</h4>
              <p className="text-xs text-slate-500">
                {t("card:materials.modal.fileSize", "Dung lượng")}: <strong>{item.fileSize}</strong> • {t("card:materials.modal.format", "Định dạng")}: <strong>{item.format.toUpperCase()}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="primary"
              onClick={() => onDownload(item)}
            >
              <Icon name="download" size={15} />
              <span>{t("card:materials.actions.downloadSimple", "Tải về")}</span>
            </Button>
          </div>
        </div>

        {/* Simulated Document Preview Page */}
        <div className="mt-4 p-4 bg-white rounded-lg border border-[#f0f0f0] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 mb-2 border-b border-[#f0f0f0]">
            <span>Trang 1 / 15</span>
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <Icon name="checkCircle" size={13} />
              Đã kiểm duyệt sư phạm
            </span>
          </div>
          <div className="text-xs text-slate-700 leading-relaxed font-sans italic bg-slate-50/60 p-3 rounded border border-dashed border-[#f0f0f0]">
            {item.description}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={780}
      centered
      className="material-detail-modal"
    >
      <div className="space-y-5 pt-2">
        {/* Row 1: Badges & Semester */}
        <div className="flex flex-wrap items-center justify-evenly gap-2 border-b border-[#f0f0f0] pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getFormatBadge(item.format)}
            <Tag color="blue" className="font-medium">
              {item.subjectName}
            </Tag>
            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
              {getCategoryLabel(item.category)}
            </span>
            <span className="text-xs text-slate-400">
              • {item.semester}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleBookmark(item.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              item.isBookmarked
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "border-[#f0f0f0] text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon name="bookmark" size={14} className={item.isBookmarked ? "text-amber-600" : "text-slate-400"} />
            <span>
              {item.isBookmarked
                ? t("card:materials.actions.bookmarked", "Đã lưu yêu thích")
                : t("card:materials.actions.bookmark", "Lưu vào yêu thích")}
            </span>
          </button>
        </div>

        {/* Row 2: Title & Meta */}
        <div className="space-y-1.5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {item.title}
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
            <span>{t("card:materials.meta.author", { author: item.author, defaultValue: `Tác giả: ${item.author}` })}</span>
            <span>•</span>
            <span>{t("card:materials.meta.uploadDate", { date: item.uploadDate, defaultValue: `Ngày đăng: ${item.uploadDate}` })}</span>
            <span>•</span>
            <span>{t("card:materials.meta.downloadsCount", { count: item.downloadsCount, defaultValue: `${item.downloadsCount} lượt tải` })}</span>
          </div>
        </div>

        {/* Row 3: Preview Container */}
        {renderPreviewSection()}

        {/* Row 4: Table of contents if present */}
        {item.tableOfContents && item.tableOfContents.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#f0f0f0]">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <Icon name="fileText" size={14} className="text-blue-600" />
              <span>{t("card:materials.modal.tableOfContentsTitle", "Mục lục tài liệu")}</span>
            </h4>
            <div className="bg-slate-50 border border-[#f0f0f0] rounded-lg p-3">
              <ul className="space-y-1.5 text-xs text-slate-700">
                {item.tableOfContents.map((toc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{toc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Row 5: Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t("card:materials.actions.close", "Đóng")}
          </Button>

          <Button
            variant="primary"
            onClick={() => onDownload(item)}
          >
            <Icon name="download" size={15} />
            <span>{t("card:materials.actions.download", { size: item.fileSize, defaultValue: `Tải về (${item.fileSize})` })}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
