import React from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  useNodesState,
  useEdgesState,
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

const nodeGap = 110;
const nodeX = 100;
const nodeYStart = 40;

const nodes = steps.map((label, i) => ({
  id: `n${i}`,
  data: { label },
  position: { x: nodeX, y: nodeYStart + i * nodeGap },
  draggable: false,
  selectable: false,
}));

const edges = steps.slice(0, -1).map((_, i) => ({
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
  label: patternCounts[i] ? `${patternCounts[i]}` : "",
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
