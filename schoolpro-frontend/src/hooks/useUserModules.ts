import { useState, useEffect, useCallback } from "react";
import { moduleService, type UserModuleItem } from "@/shared/services/moduleService";

export interface UseUserModulesResult {
  modules: UserModuleItem[];
  loading: boolean;
  error: Error | null;
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  refetch: () => Promise<void>;
}

export const useUserModules = (): UseUserModulesResult => {
  const [modules, setModules] = useState<UserModuleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await moduleService.getUserModules();
      setModules(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Lỗi tải danh sách modules"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await moduleService.getUserModules();
        if (!ignore) {
          setModules(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err : new Error("Lỗi tải danh sách modules"));
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  return {
    modules,
    loading,
    error,
    isMenuOpen,
    openMenu,
    closeMenu,
    toggleMenu,
    refetch: fetchModules,
  };
};
