import type React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  LeaveRequestDetailHeader,
  LeaveRequestDetailSidebar,
  LeaveRequestDetailSkeleton,
  LeaveRequestStatusBanner,
  LeaveRequestStepsLogCard,
} from "@/modules/students/features/leave-requests/components/detail";
import { useLeaveRequestDetail } from "@/modules/students/features/leave-requests/hooks";

const LeaveRequestDetailPage: React.FC = () => {
  const { t } = useTranslation(["message", "button"]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    item,
    loading,
    downloading,
    printing,
    deleting,
    handleDownloadPdf,
    handlePrint,
    handleDelete,
  } = useLeaveRequestDetail(id);

  if (loading) {
    return <LeaveRequestDetailSkeleton />;
  }

  if (!item) {
    return (
      <div className="p-10 text-center bg-white rounded-xl border border-[#f0f0f0] shadow-2xs my-6">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Icon name="file-text" size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          {t("message:empty.leaveRequestNotFoundTitle")}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {t("message:empty.leaveRequestNotFoundDesc")}
        </p>
        <Button variant="primary" onClick={() => navigate("/student/leave-requests")}>
          {t("button:backToLeaveRequests")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-8">
      {/* 1. Header with Breadcrumbs & Action Buttons */}
      <LeaveRequestDetailHeader
        item={item}
        downloading={downloading}
        printing={printing}
        deleting={deleting}
        onBack={() => navigate("/student/leave-requests")}
        onEdit={() => navigate(`/student/leave-requests/${item.id}/edit`)}
        onDownloadPdf={handleDownloadPdf}
        onPrint={handlePrint}
        onDelete={handleDelete}
      />

      {/* 2. Student-friendly Status & Progress Banner */}
      <LeaveRequestStatusBanner item={item} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
        <div className="lg:col-span-2">
          <LeaveRequestStepsLogCard item={item} />
        </div>

        <div>
          <LeaveRequestDetailSidebar item={item} />
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestDetailPage;
