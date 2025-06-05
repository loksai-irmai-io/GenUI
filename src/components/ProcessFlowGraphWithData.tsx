import React, { useMemo } from "react";
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

// Define interfaces for graph data
interface GraphNode {
  id: string;
  type?: string;
  data?: {
    label?: string;
    [key: string]: any;
  };
  position?: {
    x: number;
    y: number;
  };
  [key: string]: any;
}

interface GraphEdge {
  id?: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  data?: {
    [key: string]: any;
  };
  [key: string]: any;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface ProcessFlowGraphWithDataProps {
  data: GraphData;
}

const ProcessFlowGraphWithData: React.FC<ProcessFlowGraphWithDataProps> = ({
  data,
}) => {
  // Transform the input data to match ReactFlow's expected format
  const reactFlowNodes: Node[] = useMemo(() => {
    return data.nodes.map((node) => ({
      id: node.id,
      type: node.type || "default",
      data: node.data || { label: node.id },
      position: node.position || { x: 0, y: 0 },
      ...node,
    }));
  }, [data.nodes]);

  const reactFlowEdges: Edge[] = useMemo(() => {
    return data.edges.map((edge, index) => ({
      id: edge.id || `edge-${index}`,
      source: edge.source,
      target: edge.target,
      type: edge.type || "default",
      label: edge.label,
      data: edge.data,
      ...edge,
    }));
  }, [data.edges]);

  const [nodes, setNodes] = useNodesState(reactFlowNodes);
  const [edges, setEdges] = useEdgesState(reactFlowEdges);

  return (
    <div
      style={{
        width: "100%",
        height: 400,
        background: "#f7f8fa",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        elementsSelectable={false}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={true}
        minZoom={0.5}
        maxZoom={2}
        style={{ background: "transparent" }}
      >
        <Background color="#eee" gap={32} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

export default ProcessFlowGraphWithData;
