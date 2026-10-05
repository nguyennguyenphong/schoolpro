import React from "react";
import { Upload as AntUpload } from "antd";
import type { UploadProps } from "@/components/ui/Upload/types";
import { uploadStyles } from "@/components/ui/Upload/styles";

export const Upload: React.FC<UploadProps> & {
  Dragger: typeof AntUpload.Dragger;
} = ({ style, ...props }) => {
  return (
    <AntUpload
      {...props}
      style={{
        ...uploadStyles,
        ...style,
      }}
    />
  );
};

Upload.displayName = "Upload";
Upload.Dragger = AntUpload.Dragger;
