import React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Empty } from "@/components/ui/Empty";
import { Icon } from "@/components/ui/Icon";
import { useAuthStore } from "@/shared/store/useAuthStore";
import {
  TimetableFilterBar,
  WeeklyGridView,
  ListView,
  TimetableSkeleton,
} from "@/modules/students/features/timetable/components";
import { useTimetable } from "@/modules/students/features/timetable/hooks";
import {
  printTimetable,
} from "@/modules/students/features/timetable/utils";

export const TimetablePage: React.FC = () => {
  const { t } = useTranslation(["navigation", "button", "message", "common", "card"]);
  const { user } = useAuthStore();
  const [isPrinting, setIsPrinting] = React.useState(false);
  const {
    slots,
    filter,
    loading,
    error,
    hasActiveFilters,
    currentWeekLabel,
    semesterLabel,
    isOutsideSemester,
    vacationReason,
    minDate,
    maxDate,
    setSelectedDate,
    setViewMode,
    resetFilters,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    refetch,
  } = useTimetable();

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printTimetable({
        selectedDate: filter.selectedDate,
        slots,
        className: slots[0]?.className,
        currentWeekLabel,
        semesterLabel,
        studentName: user?.full_name || user?.name || "Học sinh",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* 1. Page Header with integrated Breadcrumb */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-2">
        <Breadcrumb
          items={[
            {
              href: "/student/home",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                  <span>{t("navigation:breadcrumb.home")}</span>
                </span>
              ),
            },
            {
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                  <Icon name="calendar" size={13} className="text-blue-600 shrink-0" />
                  <span>{t("navigation:breadcrumb.timetable")}</span>
                </span>
              ),
            },
          ]}
        />

        <div className="pt-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              {t("navigation:pageTitle.timetable")}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("navigation:pageSubtitle.timetable")}
          </p>
        </div>
      </div>

      {/* 2. Filter Bar (Select by week and view mode) */}
      <TimetableFilterBar
        selectedDate={filter.selectedDate}
        viewMode={filter.viewMode}
        currentWeekLabel={currentWeekLabel}
        semesterLabel={semesterLabel}
        minDate={minDate}
        maxDate={maxDate}
        hasActiveFilters={hasActiveFilters}
        isPrinting={isPrinting}
        onDateChange={setSelectedDate}
        onViewModeChange={setViewMode}
        onResetFilters={resetFilters}
        onTodayClick={goToToday}
        onPrevWeekClick={goToPreviousDay}
        onNextWeekClick={goToNextDay}
        onPrint={handlePrint}
      />

      {/* 3. Schedule Results View (Grid & List) */}
      {loading && slots.length === 0 ? (
        <TimetableSkeleton />
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-xl border border-rose-200 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <Icon name="warning" size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {t("message:failedToLoadTimetable")}
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
            {error.message || t("message:serverConnectionError")}
          </p>
          <Button variant="primary" onClick={() => refetch()}>
            {t("button:reloadTimetable")}
          </Button>
        </div>
      ) : slots.length === 0 ? (
        <div className="p-10 sm:p-14 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs">
          <Empty
            description={
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-700 mb-0">
                  {isOutsideSemester
                    ? t("message:empty.outsideSemester")
                    : t("message:empty.noTimetable")}
                </p>
                <p className="text-xs text-slate-500 mb-0 max-w-md mx-auto">
                  {vacationReason || t("message:empty.noTimetableDesc")}
                </p>
              </div>
            }
          >
            {hasActiveFilters && (
              <Button
                variant="primary"
                onClick={goToToday}
                className="mt-3"
              >
                <Icon name="calendar" size={14} />
                {t("button:backToCurrentWeek")}
              </Button>
            )}
          </Empty>
        </div>
      ) : filter.viewMode === "grid" ? (
        <WeeklyGridView
          selectedDate={filter.selectedDate}
          slots={slots}
        />
      ) : (
        <ListView slots={slots} />
      )}
    </div>
  );
};
