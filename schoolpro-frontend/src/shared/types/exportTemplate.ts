/**
 * Type definitions for Export Templates (sys.export_templates).
 */

export type TemplateType =
  | "ANNOUNCEMENT"
  | "ACADEMIC"
  | "STUDENT_PROFILE"
  | "ATTENDANCE"
  | "EMULATION"
  | "FEE_RECEIPT"
  | "GENERAL";

export type FileFormat = "HTML_PRINT" | "PDF" | "EXCEL" | "WORD";

export interface PlaceholderField {
  key: string;
  label: string;
  example?: string;
}

export interface ExportTemplate {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  template_type: TemplateType;
  template_type_display?: string;
  file_format: FileFormat;
  file_format_display?: string;
  content: string;
  header_content?: string;
  footer_content?: string;
  style_content?: string;
  page_size?: string;
  page_orientation?: "PORTRAIT" | "LANDSCAPE";
  margins?: Record<string, string>;
  placeholders_schema?: PlaceholderField[];
  sample_data?: Record<string, unknown>;
  is_default: boolean;
  is_active: boolean;
  school_id?: string | null;
  school_name?: string | null;
  department_id?: string | null;
  department_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RenderTemplateResponse {
  html: string;
  template_id: string;
  template_code: string;
  template_name: string;
}
