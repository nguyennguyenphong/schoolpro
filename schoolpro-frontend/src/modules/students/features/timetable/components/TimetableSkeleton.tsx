import React from "react";

export const TimetableSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* 1. Mobile & Small Tablet View Skeleton */}
      <div className="block md:hidden space-y-3.5">
        {[1, 2, 3].map((dayIdx) => (
          <div
            key={dayIdx}
            className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden"
          >
            {/* Day Header Skeleton */}
            <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-200" />
                <div className="h-4 w-28 bg-slate-200 rounded" />
              </div>
              <div className="h-5 w-16 bg-slate-200 rounded-full" />
            </div>

            {/* Day Slots List Skeleton */}
            <div className="p-3 space-y-3">
              <div className="p-3.5 border border-[#f0f0f0] rounded-xl bg-white space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
                  <div className="h-5 w-24 bg-blue-100/80 rounded-xl" />
                  <div className="h-4 w-16 bg-slate-100 rounded" />
                </div>
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="space-y-1.5 pt-1">
                  <div className="h-3.5 w-32 bg-slate-100 rounded" />
                  <div className="h-3.5 w-40 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Desktop & Tablet Large View: 7-Column Weekly Grid Skeleton */}
      <div className="hidden md:block bg-white border border-[#f0f0f0] rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[2160px] border-collapse table-fixed text-left">
            {/* Header: Shift column + 7 Day columns */}
            <thead>
              <tr className="bg-slate-50 border-b border-[#f0f0f0]">
                <th className="w-36 min-w-36 p-3 text-center border-r border-[#f0f0f0]">
                  <div className="h-3.5 w-16 bg-slate-200 rounded mx-auto" />
                </th>
                {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                  <th
                    key={col}
                    className="p-3 text-center border-r border-[#f0f0f0] last:border-r-0 w-72 min-w-72"
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="h-3.5 w-12 bg-slate-200 rounded" />
                      <div className="h-5 w-16 bg-slate-200 rounded-full" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body: 2 Shifts (Morning & Afternoon) */}
            <tbody className="divide-y divide-slate-200">
              {[
                { shiftName: "Ca Sáng", activeDays: [1, 2, 4, 5] },
                { shiftName: "Ca Chiều", activeDays: [2, 3, 6] },
              ].map((shift, sIdx) => (
                <tr key={sIdx} className="align-top">
                  {/* Shift Column */}
                  <td className="p-3 border-r border-[#f0f0f0] bg-slate-50/50 text-center w-36 min-w-36 align-middle h-1">
                    <div className="h-4 w-16 bg-slate-200 rounded mx-auto mb-1.5" />
                    <div className="h-3 w-20 bg-slate-100 rounded mx-auto" />
                  </td>

                  {/* 7 Days */}
                  {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                    const hasSlot = shift.activeDays.includes(dayNum);
                    return (
                      <td
                        key={dayNum}
                        className="p-2.5 border-r border-[#f0f0f0] last:border-r-0 w-72 min-w-72 align-top h-1"
                      >
                        {hasSlot ? (
                          <div className="w-full h-full min-h-105 border border-[#f0f0f0] rounded-xl p-3.5 sm:p-4 flex flex-col justify-between bg-white shadow-2xs">
                            {/* Top Info */}
                            <div className="space-y-3">
                              {/* Class Badge & Course Title */}
                              <div className="pb-2 border-b border-[#f0f0f0] space-y-2">
                                <div className="h-5 w-24 bg-blue-100/70 rounded-xl" />
                                <div className="h-4 w-4/5 bg-slate-200 rounded" />
                                <div className="h-3.5 w-3/5 bg-slate-100 rounded" />
                              </div>

                              {/* Room */}
                              <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full bg-slate-200 shrink-0" />
                                <div className="h-3.5 w-32 bg-slate-200 rounded" />
                              </div>

                              {/* Time */}
                              <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full bg-slate-200 shrink-0" />
                                <div className="h-3.5 w-24 bg-slate-200 rounded" />
                              </div>

                              {/* Teacher */}
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 rounded-full bg-slate-200 shrink-0" />
                                  <div className="h-3.5 w-28 bg-slate-200 rounded" />
                                </div>
                                <div className="h-3 w-36 bg-slate-100 rounded ml-5.5" />
                              </div>

                              {/* Tags */}
                              <div className="flex items-center justify-between pt-1">
                                <div className="h-3 w-16 bg-slate-100 rounded" />
                                <div className="h-4.5 w-16 bg-slate-200 rounded-md" />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="h-3 w-16 bg-slate-100 rounded" />
                                <div className="h-4.5 w-16 bg-slate-200 rounded-md" />
                              </div>
                            </div>

                            {/* Bottom Notes & Actions */}
                            <div className="pt-2.5 border-t border-[#f0f0f0] space-y-2">
                              <div className="h-10 w-full bg-slate-50 rounded-lg border border-[#f0f0f0]" />
                              <div className="h-6 w-28 bg-slate-100 rounded-lg" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full min-h-105 border border-dashed border-[#f0f0f0] rounded-xl bg-slate-50/30 flex items-center justify-center">
                            <div className="h-3 w-20 bg-slate-100 rounded" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
