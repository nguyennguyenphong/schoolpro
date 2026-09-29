import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { message } from "antd";
import type {
  AnnouncementItem,
  AnnouncementFilter,
  AnnouncementSummary,
  AnnouncementCategory,
  AnnouncementPriority,
  AnnouncementSortOption,
} from "@/modules/students/features/announcements/types";
import { announcementService } from "@/modules/students/features/announcements/services";

export const useAnnouncements = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filter state from URL params
  const initialFilter: AnnouncementFilter = useMemo(() => {
    const q = searchParams.get("q") || "";
    const category = (searchParams.get("category") as AnnouncementCategory) || "all";
    const department = searchParams.get("department") || "all";
    const readStatus = (searchParams.get("status") as "all" | "unread" | "read") || "all";
    const priority = (searchParams.get("priority") as "all" | "urgent" | "high" | "normal") || "all";
    const sortBy = (searchParams.get("sort") as AnnouncementSortOption) || "newest";
    const viewMode = searchParams.get("view") === "list" ? "list" : "grid";
    const parsedPage = parseInt(searchParams.get("page") || "1", 10);
    const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const parsedPageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const pageSize = Number.isInteger(parsedPageSize) && parsedPageSize > 0 ? parsedPageSize : 10;

    return {
      searchQuery: q,
      category,
      department,
      readStatus,
      priority,
      sortBy,
      viewMode,
      page,
      pageSize,
    };
  }, [searchParams]);

  const [filter, setFilter] = useState<AnnouncementFilter>(initialFilter);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [summary, setSummary] = useState<AnnouncementSummary | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Detail Modal
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Selection Checkbox state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Update URL whenever filter changes (only non-empty / non-default values)
  const updateUrlParams = useCallback(
    (newFilter: AnnouncementFilter) => {
      const params = new URLSearchParams();

      if (newFilter.searchQuery.trim()) {
        params.set("q", newFilter.searchQuery.trim());
      }
      if (newFilter.category && newFilter.category !== "all") {
        params.set("category", newFilter.category);
      }
      if (newFilter.department && newFilter.department !== "all") {
        params.set("department", newFilter.department);
      }
      if (newFilter.readStatus && newFilter.readStatus !== "all") {
        params.set("status", newFilter.readStatus);
      }
      if (newFilter.priority && newFilter.priority !== "all") {
        params.set("priority", newFilter.priority);
      }
      if (newFilter.sortBy && newFilter.sortBy !== "newest") {
        params.set("sort", newFilter.sortBy);
      }
      if (newFilter.viewMode && newFilter.viewMode !== "grid") {
        params.set("view", newFilter.viewMode);
      }
      if (newFilter.page > 1) {
        params.set("page", String(newFilter.page));
      }
      if (newFilter.pageSize !== 9) {
        params.set("pageSize", String(newFilter.pageSize));
      }

      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [listResult, summaryData, deptData] = await Promise.all([
        announcementService.getAnnouncements(filter),
        announcementService.getSummary(),
        announcementService.getDepartments(),
      ]);
      setAnnouncements(listResult.items);
      setTotal(listResult.total);
      setTotalPages(listResult.totalPages);
      setSummary(summaryData);
      setDepartments(deptData);
    } catch {
      message.error("Lỗi khi tải danh sách thông báo. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [listResult, summaryData, deptData] = await Promise.all([
          announcementService.getAnnouncements(filter),
          announcementService.getSummary(),
          announcementService.getDepartments(),
        ]);
        if (!ignore) {
          setAnnouncements(listResult.items);
          setTotal(listResult.total);
          setTotalPages(listResult.totalPages);
          setSummary(summaryData);
          setDepartments(deptData);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          message.error("Lỗi khi tải danh sách thông báo. Vui lòng thử lại!");
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [filter]);

  // Actions that update filter & sync URL
  const setSearchQuery = (query: string) => {
    setFilter((prev) => {
      const next = { ...prev, searchQuery: query, page: 1 };
      updateUrlParams(next);
      return next;
    });
  };

  const setCategory = (category: AnnouncementCategory) => {
    setFilter((prev) => {
      const next = { ...prev, category, page: 1 };
      updateUrlParams(next);
      return next;
    });
  };

  const setDepartment = (dept: string) => {
    setFilter((prev) => {
      const next = { ...prev, department: dept, page: 1 };
      updateUrlParams(next);
      return next;
    });
  };

  const setReadStatus = (readStatus: "all" | "unread" | "read") => {
    setFilter((prev) => {
      const next = { ...prev, readStatus, page: 1 };
      updateUrlParams(next);
      return next;
    });
  };

  const setPriority = (priority: "all" | AnnouncementPriority) => {
    setFilter((prev) => {
      const next = { ...prev, priority, page: 1 };
      updateUrlParams(next);
      return next;
    });
  };

  const setSortBy = (sortBy: AnnouncementSortOption) => {
    setFilter((prev) => {
      const next = { ...prev, sortBy, page: 1 };
      updateUrlParams(next);
      return next;
    });
  };

  const setViewMode = (viewMode: "grid" | "list") => {
    setFilter((prev) => {
      const next = { ...prev, viewMode };
      updateUrlParams(next);
      return next;
    });
  };

  const setPage = (page: number, pageSize?: number) => {
    setFilter((prev) => {
      const next = { ...prev, page, pageSize: pageSize || prev.pageSize };
      updateUrlParams(next);
      return next;
    });
  };

  const resetFilters = () => {
    setFilter((prev) => {
      const next: AnnouncementFilter = {
        searchQuery: "",
        category: "all",
        department: "all",
        readStatus: "all",
        priority: "all",
        sortBy: "newest",
        viewMode: prev.viewMode,
        page: 1,
        pageSize: prev.pageSize,
      };
      updateUrlParams(next);
      return next;
    });
    setSelectedIds([]);
  };

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    const currentPageIds = announcements.map((item) => item.id);
    const allSelected = currentPageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      // Deselect current page items
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      // Select all current page items
      const newSelected = Array.from(new Set([...selectedIds, ...currentPageIds]));
      setSelectedIds(newSelected);
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const markSelectedAsRead = async () => {
    if (selectedIds.length === 0) return;
    await announcementService.markMultipleAsRead(selectedIds);
    setAnnouncements((prev) =>
      prev.map((item) => (selectedIds.includes(item.id) ? { ...item, isRead: true } : item)),
    );
    const summaryData = await announcementService.getSummary();
    setSummary(summaryData);
    message.success(`Đã đánh dấu ${selectedIds.length} thông báo là đã đọc`);
    setSelectedIds([]);
  };

  const markSelectedAsUnread = async () => {
    if (selectedIds.length === 0) return;
    await announcementService.markMultipleAsUnread(selectedIds);
    setAnnouncements((prev) =>
      prev.map((item) => (selectedIds.includes(item.id) ? { ...item, isRead: false } : item)),
    );
    const summaryData = await announcementService.getSummary();
    setSummary(summaryData);
    message.success(`Đã đánh dấu ${selectedIds.length} thông báo là chưa đọc`);
    setSelectedIds([]);
  };

  const openDetail = async (item: AnnouncementItem) => {
    setSelectedAnnouncement(item);
    setIsDetailOpen(true);
    if (!item.isRead) {
      await announcementService.markAsRead(item.id);
      setAnnouncements((prev) =>
        prev.map((ann) => (ann.id === item.id ? { ...ann, isRead: true } : ann)),
      );
      if (summary) {
        setSummary({
          ...summary,
          unreadCount: Math.max(0, summary.unreadCount - 1),
        });
      }
    }
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedAnnouncement(null);
  };

  const markAllAsRead = async () => {
    await announcementService.markAllAsRead();
    setAnnouncements((prev) => prev.map((ann) => ({ ...ann, isRead: true })));
    if (summary) {
      setSummary({
        ...summary,
        unreadCount: 0,
      });
    }
    message.success("Đã đánh dấu tất cả thông báo là đã đọc!");
  };

  const isAllCurrentPageSelected =
    announcements.length > 0 && announcements.every((item) => selectedIds.includes(item.id));

  return {
    announcements,
    total,
    totalPages,
    summary,
    departments,
    loading,
    filter,
    selectedAnnouncement,
    isDetailOpen,
    selectedIds,
    isAllCurrentPageSelected,
    setSearchQuery,
    setCategory,
    setDepartment,
    setReadStatus,
    setPriority,
    setSortBy,
    setViewMode,
    setPage,
    resetFilters,
    toggleSelect,
    selectAll,
    clearSelection,
    markSelectedAsRead,
    markSelectedAsUnread,
    openDetail,
    closeDetail,
    markAllAsRead,
    refetch: fetchData,
  };
};
