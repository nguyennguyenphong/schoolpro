import { useMainLayout } from "@/hooks/useMainLayout";

/**
 * @deprecated Use useMainLayout from "@/hooks/useMainLayout" instead.
 * Kept for backward compatibility.
 */
export const useStudentLayout = () => {
  const layout = useMainLayout();

  return {
    ...layout,
    studentName: layout.displayName,
    studentCode: layout.userCode,
    studentClass: layout.subInfo,
    studentRoleTag: layout.roleTag,
  };
};

export default useStudentLayout;
