import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { useMaterialDetail } from "@/modules/students/features/materials/hooks/useMaterialDetail";
import type { MaterialFormat, MaterialCategory } from "@/modules/students/features/materials/types";

export const MaterialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(["card", "button", "message"]);

  const { item, loading, downloading, handleDownload, handleToggleBookmark } =
    useMaterialDetail(id);

  const getFormatBadge = (fmt: MaterialFormat, size: string) => {
    switch (fmt) {
      case "pdf":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 shrink-0">
            <Icon name="file" size={13} />
            PDF • {size}
          </span>
        );
      case "word":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 shrink-0">
            <Icon name="fileText" size={13} />
            DOCX • {size}
          </span>
        );
      case "powerpoint":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1.5 shrink-0">
            <Icon name="presentation" size={13} />
            PPTX • {size}
          </span>
        );
      case "excel":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shrink-0">
            <Icon name="fileSpreadsheet" size={13} />
            XLSX • {size}
          </span>
        );
      case "video":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5 shrink-0">
            <Icon name="video" size={13} />
            MP4 • {size}
          </span>
        );
      case "audio":
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 shrink-0">
            <Icon name="music" size={13} />
            MP3 • {size}
          </span>
        );
      case "archive":
      default:
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-[#f0f0f0] flex items-center gap-1.5 shrink-0">
            <Icon name="archive" size={13} />
            ZIP • {size}
          </span>
        );
    }
  };

  const getCategoryConfig = (cat: MaterialCategory) => {
    switch (cat) {
      case "lecture":
        return { label: t("card:materials.categories.lecture", "Bài giảng"), color: "blue" };
      case "outline":
        return { label: t("card:materials.categories.outline", "Đề cương"), color: "orange" };
      case "textbook":
        return { label: t("card:materials.categories.textbook", "Sách giáo khoa"), color: "purple" };
      case "exam_prep":
        return { label: t("card:materials.categories.exam_prep", "Đề thi"), color: "green" };
      case "reference":
      default:
        return { label: t("card:materials.categories.reference", "Tham khảo"), color: "default" };
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-5 animate-pulse pb-10">
        <div className="h-28 bg-white rounded-xl border border-[#f0f0f0] p-5 shadow-2xs space-y-3">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          <div className="h-7 w-3/4 bg-slate-200 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-96 bg-white rounded-xl border border-[#f0f0f0] shadow-2xs" />
          <div className="h-96 bg-white rounded-xl border border-[#f0f0f0] shadow-2xs" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-10 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs my-6 space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Icon name="file" size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          {t("card:materials.empty.noMaterialsTitle", "Không tìm thấy tài liệu phù hợp")}
        </h3>
        <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
          {t("card:materials.empty.notFoundDesc", "Tài liệu học tập bạn đang tìm không tồn tại hoặc đã bị gỡ bỏ.")}
        </p>
        <Button variant="primary" onClick={() => navigate("/student/materials")}>
          <Icon name="arrow-left" size={14} />
          <span>{t("card:materials.header.breadcrumbMaterials", "Quay lại danh sách tài liệu")}</span>
        </Button>
      </div>
    );
  }

  const categoryConfig = getCategoryConfig(item.category);

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* 1. Header Card with Breadcrumb */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        <Breadcrumb
          items={[
            {
              href: "/student/home",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                  <span>{t("card:materials.header.breadcrumbHome", "Trang chủ")}</span>
                </span>
              ),
            },
            {
              href: "/student/materials",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="download" size={13} className="text-slate-400 shrink-0" />
                  <span>{t("card:materials.header.breadcrumbMaterials", "Tài liệu học tập")}</span>
                </span>
              ),
            },
            {
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium truncate max-w-[200px] sm:max-w-xs">
                  <span>{item.title}</span>
                </span>
              ),
            },
          ]}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="ghost"
                onClick={() => navigate("/student/materials")}
                className="text-slate-600 hover:text-blue-600 hover:bg-slate-100 p-1.5 h-auto"
                title={t("button:back", "Quay lại")}
              >
                <Icon name="arrow-left" size={18} />
              </Button>

              <Tag color="blue" className="m-0 font-medium text-xs">
                {item.subjectName}
              </Tag>
              <Tag color={categoryConfig.color} className="m-0 font-medium text-xs">
                {categoryConfig.label}
              </Tag>
              {getFormatBadge(item.format, item.fileSize)}
              <span className="text-xs text-slate-400 font-medium">
                • {item.semester} ({item.academicYear})
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 mb-0 leading-snug">
              {item.title}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                item.isBookmarked
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "border-[#f0f0f0] text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon
                name="bookmark"
                size={14}
                className={item.isBookmarked ? "text-amber-500 fill-amber-500" : "text-slate-400"}
              />
              <span>
                {item.isBookmarked
                  ? t("card:materials.actions.bookmarked", "Đã lưu yêu thích")
                  : t("card:materials.actions.bookmark", "Lưu vào yêu thích")}
              </span>
            </button>

            <Button
              variant="primary"
              onClick={handleDownload}
              disabled={downloading}
              className="text-xs px-3.5 py-2 font-semibold"
            >
              <Icon name="download" size={14} />
              <span>
                {downloading
                  ? t("card:materials.actions.downloading", "Đang tải...")
                  : t("card:materials.actions.download", { size: item.fileSize, defaultValue: `Tải về (${item.fileSize})` })}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Main Detail Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
        {/* Left Column (Main Viewer & Description) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* File Card & Simulated Viewer */}
          <Card className="rounded-xl shadow-2xs border-[#f0f0f0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f0f0] mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
                <h3 className="text-sm font-bold text-slate-800 mb-0">
                  {t("card:materials.modal.filePreviewTitle", "Bản xem trước tệp tài liệu")}
                </h3>
              </div>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Icon name="checkCircle" size={13} />
                {t("card:materials.modal.verifiedPedagogy", "Đã kiểm duyệt sư phạm")}
              </span>
            </div>

            <div className="bg-slate-50 border border-[#f0f0f0] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#f0f0f0] shadow-2xs flex items-center justify-center text-blue-600 shrink-0">
                  <Icon name="fileText" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-0.5">{item.fileName}</h4>
                  <p className="text-xs text-slate-500 mb-0">
                    {item.fileSize} • {item.format.toUpperCase()}
                  </p>
                </div>
              </div>

              <Button variant="primary" onClick={handleDownload} disabled={downloading}>
                <Icon name="download" size={14} />
                <span>{t("card:materials.actions.downloadSimple", "Tải tệp này về máy")}</span>
              </Button>
            </div>

            {/* Document Reader Simulator */}
            <div className="mt-4 p-4 bg-white rounded-lg border border-[#f0f0f0] shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-[#f0f0f0]">
                <span>Trang 1 / 15 • Bản chuẩn sư phạm</span>
                <span className="text-slate-500 font-medium">Chế độ xem trước trực quan</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans bg-slate-50/70 p-4 rounded-lg border border-dashed border-[#f0f0f0]">
                <p className="font-semibold text-slate-800 mb-2">Tóm tắt nội dung bài học:</p>
                <p className="mb-0 text-slate-600">{item.description}</p>
              </div>
            </div>
          </Card>

          {/* Table of Contents (Mục lục) */}
          {item.tableOfContents && item.tableOfContents.length > 0 && (
            <Card className="rounded-xl shadow-2xs border-[#f0f0f0]">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
                <h3 className="text-sm font-bold text-slate-800 mb-0">
                  {t("card:materials.modal.tableOfContentsTitle", "Mục lục tài liệu")}
                </h3>
              </div>

              <div className="bg-slate-50 border border-[#f0f0f0] rounded-lg p-3 sm:p-4">
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 list-none p-0 m-0">
                  {item.tableOfContents.map((toc, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-slate-800">{toc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (Sidebar with File Specs and Subject Info) */}
        <div className="space-y-4 sm:space-y-5">
          {/* File Specs */}
          <Card className="rounded-xl shadow-2xs border-[#f0f0f0]">
            <div className="flex items-center gap-2 pb-3 border-b border-[#f0f0f0] mb-3">
              <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
              <h3 className="text-sm font-bold text-slate-800 mb-0">
                {t("card:materials.modal.fileInfoTitle", "Thông tin tệp tin")}
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">{t("card:materials.modal.fileName", "Tên tệp")}:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[160px]" title={item.fileName}>
                  {item.fileName}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">{t("card:materials.modal.fileSize", "Dung lượng")}:</span>
                <span className="font-semibold text-slate-800">{item.fileSize}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">{t("card:materials.modal.format", "Định dạng")}:</span>
                <span className="font-semibold text-slate-800">{item.format.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">{t("card:materials.modal.academicYear", "Năm học")}:</span>
                <span className="font-semibold text-slate-800">{item.academicYear}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">{t("card:materials.modal.semester", "Học kỳ")}:</span>
                <span className="font-semibold text-slate-800">{item.semester}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">{t("card:materials.modal.uploadDate", "Ngày tải lên")}:</span>
                <span className="font-semibold text-slate-800">{item.uploadDate}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">{t("card:materials.modal.downloads", "Lượt tải về")}:</span>
                <span className="font-bold text-emerald-600">{item.downloadsCount}</span>
              </div>
            </div>
          </Card>

          {/* Teacher & Subject Card */}
          <Card className="rounded-xl shadow-2xs border-[#f0f0f0]">
            <div className="flex items-center gap-2 pb-3 border-b border-[#f0f0f0] mb-3">
              <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
              <h3 className="text-sm font-bold text-slate-800 mb-0">
                {t("card:materials.modal.authorInfoTitle", "Giáo viên phụ trách")}
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200">
                  <Icon name="user" size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-0">{item.author}</h4>
                  <p className="text-xs text-slate-500 mb-0">Tổ Chuyên môn {item.subjectName}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#f0f0f0]">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/student/materials?subject=${item.subjectCode}`)}
                  className="w-full text-xs font-semibold justify-center"
                >
                  <Icon name="book" size={13} />
                  <span>{t("card:materials.meta.viewSubjectMaterials", { name: item.subjectName, defaultValue: `Xem thêm tài liệu môn ${item.subjectName}` })}</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
