
import React, { useState } from "react";
import ProcessFlowGraph from "../components/ProcessFlowGraph";
import MortgageLifecycleGraph from "../components/MortgageLifecycleGraph";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProcessDiscovery = () => {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-slate-100 mb-8 tracking-tight">Process Discovery</h2>
      
      <Tabs defaultValue="object-lifecycle" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-slate-700">
          <TabsTrigger 
            value="object-lifecycle" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
          >
            Object Lifecycle
          </TabsTrigger>
          <TabsTrigger 
            value="mortgage-lifecycle" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
          >
            Mortgage Application Lifecycle
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="object-lifecycle" className="mt-6">
          <div className="enterprise-card p-8">
            <h3 className="text-xl font-semibold text-slate-100 mb-6 tracking-tight">
              Object Lifecycle
            </h3>
            <ProcessFlowGraph />
          </div>
        </TabsContent>
        
        <TabsContent value="mortgage-lifecycle" className="mt-6">
          <div className="enterprise-card p-8">
            <h3 className="text-xl font-semibold text-slate-100 mb-6 tracking-tight">
              Mortgage Application Lifecycle
            </h3>
            <p className="text-slate-400 mb-6 text-sm">
              Interactive process flow visualization based on SOP deviation patterns. 
              Node size represents frequency, edge thickness shows transition volume, 
              and red elements indicate SOP deviations.
            </p>
            <MortgageLifecycleGraph />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProcessDiscovery;
