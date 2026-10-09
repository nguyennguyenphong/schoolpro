import { useState, useEffect, useCallback } from "react";
import { moduleApi } from "@/modules/students/services/moduleApi";
import type { FeatureItem } from "@/modules/students/features/home/types";

export const useModule = () => {
  const [modules, setModules] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await moduleApi.getModules();
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
        const data = await moduleApi.getModules();
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

  return {
    modules,
    loading,
    error,
    refetch: fetchModules,
  };
};
