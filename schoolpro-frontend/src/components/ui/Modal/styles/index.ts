import type { CSSProperties } from "react";

export const modalStyles = {
  header: {
    marginBottom: 16,
  } as CSSProperties,
  body: {
    fontSize: 14,
    lineHeight: 1.5714,
  } as CSSProperties,
  footer: {
    marginTop: 20,
  } as CSSProperties,
  container: {
    borderRadius: 8,
  } as CSSProperties,
  mask: {
    backdropFilter: "blur(2px)",
    WebkitBackdropFilter: "blur(2px)",
  } as CSSProperties,
};
