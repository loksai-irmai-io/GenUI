
import React from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";

const steps = [
  "Application Submission",
  "Initial Assessment", 
  "Rejected",
  "Initial Assessment",
  "Rejected", 
  "Pre-Approval",
  "Appraisal Request",
  "Valuation Accepted",
  "Underwriting Approved",
  "Final Approval",
  "Signing of Loan Agreement",
  "Loan Funding",
  "Disbursement of Funds",
  "Loan Closure",
];

const patternCounts = [
  6764, 3100, 2803, 2306, 1604, 1289, 1071, 876, 838, 580, 1, 1, 1,
];

// Custom node component for circular process nodes
const ProcessNode = ({ data }: { data: any }) => {
  return (
    <div className="group relative">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-4 border-white">
        <div className="text-white text-xs font-semibold text-center leading-tight px-1">
          {data.shortLabel}
        </div>
      </div>
      
      {/* Hover tooltip */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {data.label}
        <div className="text-blue-300 font-medium">Count: {data.count?.toLocaleString()}</div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
      
      {/* Count badge */}
      <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md">
        {data.count > 999 ? `${Math.floor(data.count / 1000)}k` : data.count}
      </div>
    </div>
  );
};

// Create abbreviated labels for circular nodes
const createShortLabel = (label: string): string => {
  const words = label.split(' ');
  if (words.length === 1) return words[0].substring(0, 8);
  if (words.length === 2) return `${words[0].substring(0, 4)}\n${words[1].substring(0, 4)}`;
  return `${words[0].substring(0, 3)}\n${words[1].substring(0, 3)}\n${words[2]?.substring(0, 3) || ''}`;
};

// Calculate positions for left-to-right flow with better spacing
const nodeWidth = 140;
const nodeHeight = 120;
const columns = 5;
const startX = 50;
const startY = 50;

const nodes: Node[] = steps.map((label, i) => {
  const col = i % columns;
  const row = Math.floor(i / columns);
  
  return {
    id: `process-${i}`,
    type: 'processNode',
    position: { 
      x: startX + col * nodeWidth, 
      y: startY + row * nodeHeight 
    },
    data: { 
      label,
      shortLabel: createShortLabel(label),
      count: patternCounts[i] || 0
    },
    draggable: false,
    selectable: true,
  };
});

// Create edges with transition counts
const edges: Edge[] = steps.slice(0, -1).map((_, i) => {
  const sourceCol = i % columns;
  const sourceRow = Math.floor(i / columns);
  const targetCol = (i + 1) % columns;
  const targetRow = Math.floor((i + 1) / columns);
  
  // Determine edge type based on direction
  let edgeType = 'smoothstep';
  if (sourceRow === targetRow) {
    // Same row - horizontal flow
    edgeType = 'straight';
  } else {
    // Different row - curved flow
    edgeType = 'smoothstep';
  }

  return {
    id: `process-edge-${i}`,
    source: `process-${i}`,
    target: `process-${i + 1}`,
    type: edgeType,
    animated: patternCounts[i] > 1000,
    style: {
      stroke: patternCounts[i] > 1000 ? '#3B82F6' : '#94A3B8',
      strokeWidth: Math.min(Math.max(patternCounts[i] / 1000, 2), 6),
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: patternCounts[i] > 1000 ? '#3B82F6' : '#94A3B8',
      width: 20,
      height: 20,
    },
    label: patternCounts[i] ? patternCounts[i].toLocaleString() : '',
    labelStyle: {
      fill: '#374151',
      fontWeight: 600,
      fontSize: 12,
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '4px 8px',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    labelBgStyle: {
      fill: 'rgba(255, 255, 255, 0.9)',
      fillOpacity: 1,
      stroke: '#E5E7EB',
      strokeWidth: 1,
      rx: 12,
      ry: 12,
    },
    labelBgPadding: [8, 6] as [number, number],
    labelBgBorderRadius: 12,
  };
});

const nodeTypes = {
  processNode: ProcessNode,
};

export default function ProcessFlowGraph() {
  const [rfNodes] = useNodesState(nodes);
  const [rfEdges] = useEdgesState(edges);

  return (
    <div
      style={{
        width: '100%',
        height: 600,
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
    >
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        elementsSelectable={true}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        minZoom={0.5}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        style={{ background: "transparent" }}
      >
        <Background 
          color="#cbd5e1" 
          gap={20} 
          size={1}
          variant="dots"
        />
        <Controls 
          showInteractive={false}
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
      </ReactFlow>
    </div>
  );
}
