import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { message } from "@/components/ui/Message";
import type { MaterialItem } from "@/modules/students/features/materials/types";
import { materialsService } from "@/modules/students/features/materials/services";

export const useMaterialDetail = (id?: string) => {
  const { t } = useTranslation(["card", "message"]);
  const [item, setItem] = useState<MaterialItem | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadDetail() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await materialsService.getMaterialById(id);
        if (!ignore) {
          setItem(res);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setItem(null);
          setLoading(false);
        }
      }
    }

    void loadDetail();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleDownload = useCallback(async () => {
    if (!item) return;
    setDownloading(true);
    try {
      materialsService.incrementDownload(item.id);
      setItem((prev) => (prev ? { ...prev, downloadsCount: prev.downloadsCount + 1 } : null));
      message.success(
        t("card:materials.modal.downloadStarted", {
          fileName: item.fileName,
          defaultValue: `Đang bắt đầu tải tệp: ${item.fileName}`,
        }),
      );
    } catch {
      message.error(t("message:failedToDownloadFile", "Lỗi khi tải tài liệu học tập."));
    } finally {
      setDownloading(false);
    }
  }, [item, t]);

  const handleToggleBookmark = useCallback(() => {
    if (!item) return;
    const isBookmarked = materialsService.toggleBookmark(item.id);
    setItem((prev) => (prev ? { ...prev, isBookmarked } : null));
    message.success(
      isBookmarked
        ? t("card:materials.modal.bookmarkSuccess", "Đã thêm tài liệu vào mục lưu trữ quan trọng")
        : t("card:materials.modal.unbookmarkSuccess", "Đã gỡ tài liệu khỏi mục lưu trữ"),
    );
  }, [item, t]);

  return {
    item,
    loading,
    downloading,
    handleDownload,
    handleToggleBookmark,
  };
};
