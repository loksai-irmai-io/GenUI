
import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { mortgageLifecycleService, type MortgageGraphData } from '@/services/mortgageLifecycleService';

interface MortgageLifecycleGraphProps {
  className?: string;
}

const MortgageLifecycleGraph: React.FC<MortgageLifecycleGraphProps> = ({ className = '' }) => {
  const [graphData, setGraphData] = useState<MortgageGraphData>({ nodes: [], edges: [], phases: [] });
  const [showDeviationsOnly, setShowDeviationsOnly] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; issues: string[] } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await mortgageLifecycleService.processSOPDeviationData();
        setGraphData(data);
        
        const validation = await mortgageLifecycleService.validateFrequencyConsistency(data);
        setValidationResult(validation);
      } catch (error) {
        console.error('Error loading mortgage lifecycle data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Convert to ReactFlow format
  const { reactFlowNodes, reactFlowEdges } = useMemo(() => {
    if (!graphData.nodes.length) return { reactFlowNodes: [], reactFlowEdges: [] };

    // Filter nodes based on deviation filter and phase selection
    let filteredNodes = graphData.nodes;
    let filteredEdges = graphData.edges;

    if (showDeviationsOnly) {
      filteredNodes = graphData.nodes.filter(node => node.is_deviation);
      filteredEdges = graphData.edges.filter(edge => edge.is_sop_deviation);
    }

    if (selectedPhase) {
      const phase = graphData.phases.find(p => p.id === selectedPhase);
      if (phase) {
        filteredNodes = filteredNodes.filter(node => phase.node_ids.includes(node.id));
        filteredEdges = filteredEdges.filter(edge => phase.edge_ids.includes(edge.id));
      }
    }

    // Auto-layout nodes in a flow
    const nodePositions = new Map<string, { x: number; y: number }>();
    const phaseYPositions = { application: 100, credit_assessment: 200, underwriting: 300, funding: 400, closure: 500 };
    
    filteredNodes.forEach((node, index) => {
      const phaseY = phaseYPositions[node.phase_id as keyof typeof phaseYPositions] || 300;
      const nodesInPhase = filteredNodes.filter(n => n.phase_id === node.phase_id);
      const nodeIndex = nodesInPhase.findIndex(n => n.id === node.id);
      const spacing = 200;
      const startX = -(nodesInPhase.length - 1) * spacing / 2;
      
      nodePositions.set(node.id, {
        x: startX + nodeIndex * spacing,
        y: phaseY
      });
    });

    const reactFlowNodes: Node[] = filteredNodes.map(node => {
      const position = nodePositions.get(node.id) || { x: 0, y: 0 };
      return {
        id: node.id,
        type: 'default',
        position,
        data: {
          label: (
            <div className="text-center p-2">
              <div className="font-semibold text-xs text-slate-100 mb-1">{node.name}</div>
              <div className="flex items-center justify-center gap-2 text-xs">
                <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-200">
                  {node.frequency}
                </Badge>
                {node.is_deviation && (
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                )}
              </div>
            </div>
          )
        },
        style: {
          background: node.color_code,
          border: node.is_deviation ? '2px solid #ef4444' : '1px solid #374151',
          borderRadius: 8,
          color: '#f1f5f9',
          minWidth: 150,
          fontSize: 12
        }
      };
    });

    const maxFreq = Math.max(...filteredEdges.map(e => e.frequency));
    const reactFlowEdges: Edge[] = filteredEdges.map(edge => {
      const thickness = Math.max(1, (edge.frequency / maxFreq) * 8);
      return {
        id: edge.id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        type: 'smoothstep',
        animated: edge.is_sop_deviation,
        style: {
          strokeWidth: thickness,
          stroke: edge.is_sop_deviation ? '#ef4444' : '#64748b'
        },
        label: edge.frequency.toString(),
        labelStyle: {
          fontSize: 10,
          fill: '#f1f5f9',
          fontWeight: 600
        }
      };
    });

    return { reactFlowNodes, reactFlowEdges };
  }, [graphData, showDeviationsOnly, selectedPhase]);

  const [nodes, setNodes] = useNodesState(reactFlowNodes);
  const [edges, setEdges] = useEdgesState(reactFlowEdges);

  useEffect(() => {
    setNodes(reactFlowNodes);
    setEdges(reactFlowEdges);
  }, [reactFlowNodes, reactFlowEdges, setNodes, setEdges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-300">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Processing mortgage lifecycle data...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalNodes: graphData.nodes.length,
    deviationNodes: graphData.nodes.filter(n => n.is_deviation).length,
    totalEdges: graphData.edges.length,
    deviationEdges: graphData.edges.filter(e => e.is_sop_deviation).length
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Total Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{stats.totalNodes}</div>
            <div className="text-xs text-slate-400">{stats.deviationNodes} with deviations</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Transitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{stats.totalEdges}</div>
            <div className="text-xs text-slate-400">{stats.deviationEdges} deviation paths</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-200">Filter Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="deviations-only"
                checked={showDeviationsOnly}
                onCheckedChange={setShowDeviationsOnly}
              />
              <Label htmlFor="deviations-only" className="text-xs text-slate-300">
                Show deviations only
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Data Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validationResult && (
              <div className="space-y-1">
                <Badge variant={validationResult.isValid ? "default" : "destructive"} className="text-xs">
                  {validationResult.isValid ? 'Valid' : 'Issues Found'}
                </Badge>
                {validationResult.issues.length > 0 && (
                  <div className="text-xs text-slate-400">
                    {validationResult.issues.length} consistency issues
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Phase Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedPhase(null)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            !selectedPhase 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          All Phases
        </button>
        {graphData.phases.map(phase => (
          <button
            key={phase.id}
            onClick={() => setSelectedPhase(phase.id)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedPhase === phase.id
                ? 'text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            style={selectedPhase === phase.id ? { backgroundColor: phase.color } : {}}
          >
            {phase.name}
          </button>
        ))}
      </div>

      {/* Graph */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div style={{ width: '100%', height: '600px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              panOnDrag={true}
              zoomOnScroll={true}
              zoomOnPinch={true}
              panOnScroll={false}
              elementsSelectable={true}
              nodesDraggable={true}
              nodesConnectable={false}
              edgesFocusable={true}
              minZoom={0.3}
              maxZoom={2}
              style={{ background: 'transparent' }}
            >
              <Background color="#374151" gap={32} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      {/* Validation Issues */}
      {validationResult && validationResult.issues.length > 0 && (
        <Card className="bg-amber-900/20 border-amber-700">
          <CardHeader>
            <CardTitle className="text-sm text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Data Validation Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-xs text-amber-200">
              {validationResult.issues.slice(0, 5).map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
              {validationResult.issues.length > 5 && (
                <li className="text-amber-300">... and {validationResult.issues.length - 5} more issues</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MortgageLifecycleGraph;
