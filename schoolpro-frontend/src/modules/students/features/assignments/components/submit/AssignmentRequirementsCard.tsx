import React from "react";

interface AssignmentRequirementsCardProps {
  description: string;
}

export const AssignmentRequirementsCard: React.FC<AssignmentRequirementsCardProps> = ({
  description,
}) => {
  return (
    <div className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
        <h3 className="text-base font-bold text-slate-900 mb-0">
          Nội dung yêu cầu đề bài
        </h3>
      </div>
      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-0">
        {description}
      </p>
    </div>
  );
};
