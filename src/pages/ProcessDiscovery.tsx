import React from "react";
import ProcessFlowGraph from "../components/ProcessFlowGraph";

const ProcessDiscovery = () => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Process Discovery</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Object Lifecycle
        </h3>
        <ProcessFlowGraph />
      </div>
    </div>
  );
};

export default ProcessDiscovery;
