import React, { useEffect, useMemo } from "react";
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

// Default steps if no data is provided
const defaultSteps = [
  "Application Submission",
  "Initial Assessment",
  "Pre-Approval",
  "Appraisal Request",
  "Valuation Accepted",
  "Underwriting Approved",
  "Final Approval",
  "Loan Funding",
  "Disbursement of Funds",
];

const defaultPatternCounts = [6764, 3100, 2306, 1289, 1071, 876, 838, 580, 300];

// Define interface for graph data
interface GraphData {
  nodes: any[];
  edges: any[];
}

interface ProcessFlowGraphProps {
  data?: GraphData;
}

const nodeGap = 110;
const nodeX = 100;
const nodeYStart = 40;

const nodes = defaultSteps.map((label, i) => ({
  id: `n${i}`,
  data: { label },
  position: { x: nodeX, y: nodeYStart + i * nodeGap },
  draggable: false,
  selectable: false,
}));

const edges = defaultSteps.slice(0, -1).map((_, i) => ({
  id: `e${i}`,
  source: `n${i}`,
  target: `n${i + 1}`,
  type: "default",
  animated: false,
  style: {
    stroke: "#d77",
    strokeDasharray: "6 6",
    strokeWidth: 2,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#d77",
    width: 24,
    height: 24,
  },
  label: defaultPatternCounts[i] ? `${defaultPatternCounts[i]}` : "",
  labelStyle: {
    fill: "#d77",
    fontWeight: 600,
    fontSize: 14,
    background: "#fff",
    padding: "2px 8px",
    borderRadius: 6,
    border: "1px solid #d77",
    boxShadow: "0 1px 2px #0001",
  },
  labelBgStyle: {
    fill: "#fff",
    fillOpacity: 1,
    stroke: "#d77",
    strokeWidth: 1,
    rx: 6,
    ry: 6,
  },
  labelBgPadding: [6, 4] as [number, number],
  labelBgBorderRadius: 6,
}));

export default function ProcessFlowGraph() {
  const [rfNodes] = useNodesState(nodes);
  const [rfEdges] = useEdgesState(edges);

  return (
    <div
      style={{
        width: 500,
        height: 1600,
        background: "#f7f8fa",
        borderRadius: 16,
        margin: "0 auto",
        boxShadow: "0 2px 12px #0001",
      }}
    >
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        fitView
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        panOnScroll={false}
        elementsSelectable={false}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        minZoom={1}
        maxZoom={1}
        style={{ background: "transparent" }}
      >
        <Background color="#eee" gap={32} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
