import AppLayout from "./components/AppLayout";
import React from "react";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import OutlierAnalysis from "./pages/OutlierAnalysis";
import ProcessDiscovery from "./pages/ProcessDiscovery";
import CCM from "./pages/CCM";
import OverallAIInsights from "./pages/OverallAIInsights";

const MainRoutes = () => (
  <AppLayout>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/outlier-analysis" element={<OutlierAnalysis />} />
      <Route path="/process-discovery" element={<ProcessDiscovery />} />
      <Route path="/ccm" element={<CCM />} />
      <Route path="/ai-insights" element={<OverallAIInsights />} />
    </Routes>
  </AppLayout>
);

export default MainRoutes;
