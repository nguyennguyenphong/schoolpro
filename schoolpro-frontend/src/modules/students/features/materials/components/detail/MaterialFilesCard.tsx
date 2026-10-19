import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { MaterialFileItem } from "@/modules/students/features/materials/types";
import { MATERIAL_FORMAT_META } from "@/modules/students/features/materials/utils";

interface MaterialFilesCardProps {
  files: MaterialFileItem[];
  onPreviewFile: (file: MaterialFileItem) => void;
  onDownloadSingle: (file: MaterialFileItem) => void;
  onDownloadSelected: (selectedFiles: MaterialFileItem[]) => void;
  downloading?: boolean;
}

export const MaterialFilesCard: React.FC<MaterialFilesCardProps> = ({
  files,
  onPreviewFile,
  onDownloadSingle,
  onDownloadSelected,
  downloading = false,
}) => {
  const { t } = useTranslation(["card", "button"]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isAllSelected = files.length > 0 && selectedIds.length === files.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < files.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(files.map((f) => f.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDownloadSelected = () => {
    const selected = files.filter((f) => selectedIds.includes(f.id));
    if (selected.length > 0) {
      onDownloadSelected(selected);
    }
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
      {/* 1. Header with file count tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0f0] pb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
            {t("card:materials.files.cardTitle")}
          </h3>
        </div>

        <Tag color="blue" className="m-0 text-xs font-semibold px-2.5 py-0.5">
          {t("card:materials.files.totalFilesBadge", { count: files.length })}
        </Tag>
      </div>

      {/* 2. Selection Control Toolbar */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onChange={toggleSelectAll}
          >
            <span className="text-xs font-semibold text-slate-700">
              {isAllSelected
                ? t("card:materials.files.deselectAll")
                : t("card:materials.files.selectAll")}
            </span>
          </Checkbox>

          <span className="text-xs text-slate-500">
            {t("card:materials.files.selectedCount", {
              count: selectedIds.length,
              total: files.length,
            })}
          </span>
        </div>

        <Button
          variant="primary"
          size="small"
          onClick={handleDownloadSelected}
          disabled={selectedIds.length === 0 || downloading}
          loading={downloading}
          className="text-xs font-semibold"
        >
          <Icon name="download" size={13} />
          <span>
            {t("card:materials.files.downloadSelected", {
              count: selectedIds.length,
            })}
          </span>
        </Button>
      </div>

      {/* 3. Files List */}
      <div className="space-y-2.5 pt-1">
        {files.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-[#f0f0f0]">
            {t("card:materials.files.noFiles")}
          </div>
        ) : (
          files.map((file, idx) => {
            const formatMeta = MATERIAL_FORMAT_META[file.format] || MATERIAL_FORMAT_META.archive;
            const isSelected = selectedIds.includes(file.id);

            return (
              <div
                key={file.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-blue-50/40 border-blue-300 shadow-2xs"
                    : "bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300"
                }`}
              >
                {/* Left: Checkbox + Icon + Name + Meta */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="pt-0.5 sm:pt-0 shrink-0">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleSelect(file.id)}
                    />
                  </div>

                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${formatMeta.badgeClass}`}
                  >
                    <Icon name={formatMeta.icon} size={18} />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-xs sm:text-sm truncate" title={file.name}>
                        {file.name}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.2 rounded shrink-0">
                          {t("card:materials.files.primaryFileBadge")}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                      <span>{file.size}</span>
                      <span>|</span>
                      <span className="uppercase font-medium text-slate-600">{file.format}</span>
                      {file.description && (
                        <>
                          <span>|</span>
                          <span className="truncate text-slate-400 max-w-72">{file.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons (Preview + Download) */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pl-7 sm:pl-0">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => onPreviewFile(file)}
                    className="text-xs font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-400"
                  >
                    <Icon name="eye" size={13} />
                    <span>{t("button:preview")}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => onDownloadSingle(file)}
                    className="text-xs font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-400"
                  >
                    <Icon name="download" size={13} />
                    <span>{t("button:download")}</span>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
