import { homeService } from "@/modules/students/features/home/services";
import type { FeatureItem } from "@/modules/students/features/home/types";

export const moduleApi = {
  /**
   * Fetches the student's dynamic functional modules from /system/modules/
   */
  getModules: async (): Promise<FeatureItem[]> => {
    return homeService.getFeatures();
  },
};
