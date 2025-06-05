
import React from "react";
import ProcessFlowGraph from "../components/ProcessFlowGraph";

const ProcessDiscovery = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-slate-100 mb-8 tracking-tight">Process Discovery</h2>
      <div className="enterprise-card p-8">
        <h3 className="text-xl font-semibold text-slate-100 mb-6 tracking-tight">
          Object Lifecycle
        </h3>
        <ProcessFlowGraph />
      </div>
    </div>
  );
};

export default ProcessDiscovery;
