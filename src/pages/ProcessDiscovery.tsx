
import React from "react";
import MortgageLifecycleGraph from "../components/MortgageLifecycleGraph";

const ProcessDiscovery = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3 tracking-tight">Process Discovery</h2>
          <p className="text-slate-400 text-lg">
            Interactive mortgage application lifecycle visualization with real-time SOP deviation analysis
          </p>
        </div>
        
        <div className="enterprise-card p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-slate-100 mb-3 tracking-tight">
              Mortgage Application Lifecycle
            </h3>
            <p className="text-slate-400 mb-6">
              Advanced process flow visualization with intelligent deviation detection. 
              Node size represents frequency, edge thickness shows transition volume, 
              and red elements highlight SOP deviations for immediate attention.
            </p>
          </div>
          <MortgageLifecycleGraph />
        </div>
      </div>
    </div>
  );
};

export default ProcessDiscovery;
