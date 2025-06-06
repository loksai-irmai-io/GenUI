
import AppLayout from "./components/AppLayout";
import React from "react";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import OutlierAnalysis from "./pages/OutlierAnalysis";
import ProcessDiscovery from "./pages/ProcessDiscovery";
import CCM from "./pages/CCM";
import OverallAIInsights from "./pages/OverallAIInsights";
import PredictiveRisk from "./pages/PredictiveRisk";
import Compliance from "./pages/Compliance";
import Admin from "./pages/Admin";
import ScenarioAnalysis from "./pages/ScenarioAnalysis";
import RiskCatalog from "./pages/RiskCatalog";
import IncidentManagement from "./pages/IncidentManagement";
import FMEA from "./pages/FMEA";

const MainRoutes = () => (
  <AppLayout>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/outlier-analysis" element={<OutlierAnalysis />} />
      <Route path="/process-discovery" element={<ProcessDiscovery />} />
      <Route path="/ccm" element={<CCM />} />
      <Route path="/ai-insights" element={<OverallAIInsights />} />
      <Route path="/predictive-risk" element={<PredictiveRisk />} />
      <Route path="/compliance" element={<Compliance />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/scenario-analysis" element={<ScenarioAnalysis />} />
      <Route path="/risk-catalog" element={<RiskCatalog />} />
      <Route path="/incident-management" element={<IncidentManagement />} />
      <Route path="/fmea" element={<FMEA />} />
    </Routes>
  </AppLayout>
);

export default MainRoutes;
