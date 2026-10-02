import type {
  ModalProps as AntModalProps,
  ModalFuncProps as AntModalFuncProps,
} from "antd";
import type { ModalSize } from "@/components/ui/Modal/constants";

export type ModalFuncProps = AntModalFuncProps;

export interface ModalProps extends AntModalProps {
  /**
   * Predefined size for the modal:
   * - `sm`: 400px
   * - `md`: 520px
   * - `lg`: 800px
   * - `xl`: 1000px
   *
   * If `width` is explicitly provided, it will take precedence.
   */
  size?: ModalSize;
}
