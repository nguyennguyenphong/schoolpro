import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { PdfViewer } from "@/components/pdf";
import { MaterialFormatBadge } from "@/modules/students/features/materials/components/MaterialFormatBadge";
import type { MaterialFileItem } from "@/modules/students/features/materials/types";
import { MATERIAL_FORMAT_META } from "@/modules/students/features/materials/utils";

interface MaterialPreviewModalProps {
  open: boolean;
  onClose: () => void;
  file: MaterialFileItem | null;
  materialTitle?: string;
  onDownloadFile?: (file: MaterialFileItem) => void;
}

export const MaterialPreviewModal: React.FC<MaterialPreviewModalProps> = ({
  open,
  onClose,
  file,
  materialTitle,
  onDownloadFile,
}) => {
  const { t } = useTranslation(["card", "button", "message"]);
  const [activeSlide, setActiveSlide] = useState(0);

  if (!file) return null;

  const formatMeta = MATERIAL_FORMAT_META[file.format] || MATERIAL_FORMAT_META.archive;

  const handleDownload = () => {
    if (onDownloadFile) {
      onDownloadFile(file);
    } else {
      const link = document.createElement("a");
      link.href = file.url || "#";
      link.download = file.name;
      link.target = "_blank";
      link.rel = "noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getModalWidth = () => {
    switch (file.format) {
      case "pdf":
        return 1000;
      case "word":
      case "excel":
      case "powerpoint":
        return 920;
      case "video":
      case "audio":
        return 680;
      default:
        return 540;
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={getModalWidth()}
      centered
      title={
        <div className="flex items-center justify-between gap-3 pr-6 py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${formatMeta.badgeClass}`}
            >
              <Icon name={formatMeta.icon} size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800 truncate mb-0" title={file.name}>
                {file.name}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                <span>{file.size}</span>
                <span>|</span>
                <span className="uppercase">{file.format}</span>
                {materialTitle && (
                  <>
                    <span>|</span>
                    <span className="text-slate-600 truncate max-w-60">{materialTitle}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="small"
              onClick={handleDownload}
              className="text-xs"
            >
              <Icon name="download" size={13} />
              <span>{t("button:downloadFile")}</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="py-2 space-y-4">
        {/* 1. PDF PREVIEW VIA ENTERPRISE PDF VIEWER */}
        {file.format === "pdf" && (
          <div className="rounded-xl overflow-hidden border border-[#f0f0f0] bg-slate-100 shadow-inner">
            <PdfViewer
              fileUrl={file.previewUrl || file.url || "/sample-notice.pdf"}
              className="h-[68vh] w-full"
            />
          </div>
        )}

        {/* 2. AUDIO PREVIEW PLAYER */}
        {file.format === "audio" && (
          <div className="p-6 sm:p-8 bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-5 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
              <Icon name="music" size={36} />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 mb-0">
                {t("card:materials.previewModal.audioPlaying")}
              </h4>
              <p className="text-xs text-amber-800 max-w-md mx-auto">
                {t("card:materials.previewModal.audioDesc")}
              </p>
              <div className="inline-flex items-center gap-2 mt-2">
                <Tag color="gold" className="m-0 text-xs font-semibold">
                  {file.name}
                </Tag>
                <Tag color="default" className="m-0 text-xs">
                  {file.size}
                </Tag>
              </div>
            </div>

            <div className="p-4 bg-white/90 backdrop-blur-xs rounded-xl border border-amber-200/80 shadow-xs">
              <audio
                controls
                src={file.previewUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* 3. VIDEO PREVIEW PLAYER */}
        {file.format === "video" && (
          <div className="bg-black rounded-xl overflow-hidden shadow-lg border border-slate-800">
            <video
              controls
              autoPlay
              src={file.previewUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
              className="w-full max-h-[62vh] object-contain"
            />
          </div>
        )}

        {/* 4. WORD DOCUMENT PREVIEW */}
        {file.format === "word" && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Icon name="info" size={15} className="text-blue-600 shrink-0" />
                <span>{t("card:materials.previewModal.wordNotice")}</span>
              </div>
              <span className="font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200 shrink-0">
                DOCX
              </span>
            </div>

            <div className="border border-slate-300 bg-slate-100 rounded-xl p-4 sm:p-6 overflow-y-auto max-h-[60vh] shadow-inner">
              <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t("card:materials.preview.schoolHeader")}
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {t("card:materials.preview.internalDistribution")}
                  </span>
                </div>

                <div className="text-center py-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                    {file.name.replace(/\.[^.]+$/, "")}
                  </h3>
                  <p className="text-xs text-slate-500 mb-0">
                    {file.description || t("card:materials.files.primaryFileBadge")}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="h-3.5 w-11/12 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-3 w-4/5 bg-slate-200 rounded" />
                  <div className="h-3 w-5/6 bg-slate-200 rounded" />
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5 my-3">
                  <div className="font-bold text-slate-800">
                    {t("card:materials.preview.keyObjectives")}
                  </div>
                  <ul className="text-slate-600 list-disc list-inside space-y-0.5">
                    <li>{t("card:materials.preview.objective1")}</li>
                    <li>{t("card:materials.preview.objective2")}</li>
                  </ul>
                </div>

                <div className="space-y-2 pt-1 opacity-70">
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-3 w-5/6 bg-slate-200 rounded" />
                  <div className="h-3 w-3/4 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. EXCEL SPREADSHEET PREVIEW */}
        {file.format === "excel" && (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <Icon name="info" size={15} className="text-emerald-600 shrink-0" />
                <span>{t("card:materials.previewModal.excelNotice")}</span>
              </div>
              <span className="font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                XLSX
              </span>
            </div>

            <div className="border border-slate-300 rounded-xl bg-white overflow-hidden shadow-xs">
              {/* Formula Bar */}
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                <span className="font-mono font-bold text-slate-400">fx</span>
                <span className="h-4 w-px bg-slate-300" />
                <span className="font-mono text-slate-700">=SUM(C2:C6)</span>
              </div>

              {/* Table Grid Simulator */}
              <div className="overflow-x-auto max-h-[55vh]">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                      <th className="w-10 px-2 py-1.5 text-center bg-slate-200/80 font-mono text-[11px] border-r border-slate-300">
                        #
                      </th>
                      <th className="px-3 py-2 border-r border-slate-200 font-semibold">A. Chuyên đề / Nội dung</th>
                      <th className="px-3 py-2 border-r border-slate-200 font-semibold w-28 text-center">B. Số câu</th>
                      <th className="px-3 py-2 border-r border-slate-200 font-semibold w-28 text-center">C. Tỉ lệ (%)</th>
                      <th className="px-3 py-2 font-semibold w-32 text-center">D. Điểm số</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[
                      { id: 1, name: "Phần 1: Kiến thức nhận biết căn bản", count: "12 câu", percent: "30%", score: "3.0 điểm" },
                      { id: 2, name: "Phần 2: Thông hiểu & Biến đổi đại số", count: "10 câu", percent: "25%", score: "2.5 điểm" },
                      { id: 3, name: "Phần 3: Vận dụng giải quyết bài toán", count: "10 câu", percent: "25%", score: "2.5 điểm" },
                      { id: 4, name: "Phần 4: Vận dụng cao & Phân hóa học sinh", count: "8 câu", percent: "20%", score: "2.0 điểm" },
                      { id: 5, name: "Tổng kết toàn bộ chuyên đề", count: "40 câu", percent: "100%", score: "10.0 điểm" },
                    ].map((row) => (
                      <tr key={row.id} className={row.id === 5 ? "bg-slate-50 font-bold" : "hover:bg-blue-50/30"}>
                        <td className="px-2 py-2 text-center bg-slate-100 font-mono text-[11px] border-r border-slate-200 text-slate-500">
                          {row.id}
                        </td>
                        <td className="px-3 py-2 border-r border-slate-200 text-slate-800">{row.name}</td>
                        <td className="px-3 py-2 border-r border-slate-200 text-center text-slate-700">{row.count}</td>
                        <td className="px-3 py-2 border-r border-slate-200 text-center text-emerald-700 font-semibold">{row.percent}</td>
                        <td className="px-3 py-2 text-center text-blue-700 font-semibold">{row.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. POWERPOINT PRESENTATION PREVIEW */}
        {file.format === "powerpoint" && (
          <div className="space-y-3">
            <div className="p-3 bg-orange-50/80 border border-orange-200 rounded-xl flex items-center justify-between text-xs text-orange-900">
              <div className="flex items-center gap-2">
                <Icon name="info" size={15} className="text-orange-600 shrink-0" />
                <span>{t("card:materials.previewModal.powerpointNotice")}</span>
              </div>
              <span className="font-semibold text-orange-700 bg-white px-2 py-0.5 rounded border border-orange-200 shrink-0">
                PPTX
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Slide Thumbnails strip */}
              <div className="space-y-2 md:col-span-1 border-r border-slate-200 pr-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Danh sách Slides
                </span>
                {[
                  { id: 0, title: "Slide 1: Giới thiệu" },
                  { id: 1, title: "Slide 2: Mục tiêu" },
                  { id: 2, title: "Slide 3: Lý thuyết" },
                  { id: 3, title: "Slide 4: Bài tập mẫu" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSlide(s.id)}
                    className={`w-full text-left p-2 rounded-lg text-xs font-semibold transition-all border ${
                      activeSlide === s.id
                        ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              {/* Main Presentation Screen */}
              <div className="md:col-span-3 bg-linear-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 sm:p-8 min-h-70 flex flex-col justify-between shadow-md">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">
                    SchoolPro Presentation
                  </span>
                  <span className="text-xs text-slate-400">
                    {t("card:materials.previewModal.slideCounter", { current: activeSlide + 1, total: 4 })}
                  </span>
                </div>

                <div className="py-4 space-y-3">
                  {activeSlide === 0 && (
                    <div className="space-y-2 text-center py-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                        {file.name.replace(/\.[^.]+$/, "")}
                      </h2>
                      <p className="text-xs text-slate-300">
                        {file.description || t("card:materials.files.primaryFileBadge")}
                      </p>
                    </div>
                  )}
                  {activeSlide === 1 && (
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-orange-400">
                        {t("card:materials.preview.keyObjectives")}
                      </h3>
                      <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside">
                        <li>{t("card:materials.preview.objective1")}</li>
                        <li>{t("card:materials.preview.objective2")}</li>
                      </ul>
                    </div>
                  )}
                  {activeSlide === 2 && (
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-orange-400">Tóm tắt cấu trúc bài học</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Hệ thống hóa toàn bộ công thức và các dạng định lý trọng tâm theo chương trình giáo dục phổ thông.
                      </p>
                    </div>
                  )}
                  {activeSlide === 3 && (
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-orange-400">Hướng dẫn bài tập rèn luyện</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Học sinh quét mã QR hoặc tải tệp đính kèm để làm phiếu bài tập tự luyện có lời giải chi tiết.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700 text-xs text-slate-400">
                  <span>Trường THPT SchoolPro</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={activeSlide === 0}
                      onClick={() => setActiveSlide((prev) => Math.max(0, prev - 1))}
                      className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      disabled={activeSlide === 3}
                      onClick={() => setActiveSlide((prev) => Math.min(3, prev + 1))}
                      className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. ARCHIVE / UNSUPPORTED FORMATS (FALLBACK VIEW) */}
        {(file.format === "archive" || (!["pdf", "audio", "video", "word", "excel", "powerpoint"].includes(file.format))) && (
          <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center mx-auto shadow-xs">
              <Icon name="archive" size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 mb-0">
                {t("card:materials.previewModal.unsupportedTitle")}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {t("card:materials.previewModal.unsupportedDesc")}
              </p>
            </div>
            <div className="pt-2">
              <Button variant="primary" onClick={handleDownload} className="font-semibold text-xs sm:text-sm">
                <Icon name="download" size={14} />
                <span>{t("button:downloadFile")} ({file.size})</span>
              </Button>
            </div>
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#f0f0f0]">
          <div className="flex items-center gap-2">
            <MaterialFormatBadge format={file.format} fileSize={file.size} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownload} className="text-xs">
              <Icon name="download" size={13} />
              <span>{t("button:downloadFile")}</span>
            </Button>
            <Button variant="primary" onClick={onClose} className="text-xs">
              {t("button:closePreview")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
