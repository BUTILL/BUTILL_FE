import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import SimulationAnalysisWebPage from "./pages/SimulationAnalysisWebPage";
import RawMaterialsAnalysisWebPage from "./pages/RawMaterialsAnalysisWebPage";
import TaxAnalysisWebPage from "./pages/TaxAnalysisWebPage";
import "./pages/SimulationAnalysisWebPage.css";
import "./pages/RawMaterialsAnalysisWebPage.css";

const page = window.location.pathname.replace(/\/+$/, "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {page === "/tax" ? (
      <TaxAnalysisWebPage />
    ) : page === "/raw-materials" ? (
      <RawMaterialsAnalysisWebPage />
    ) : (
      <SimulationAnalysisWebPage />
    )}
  </StrictMode>,
);
