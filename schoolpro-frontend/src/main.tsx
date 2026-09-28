import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@/index.css"
import "@/i18n/i18n";
import { AppProvider } from "./app/providers/AppProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider />
  </StrictMode>,
)
