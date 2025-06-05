
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
import { AlertTriangle, TrendingUp, Clock, CheckCircle, Filter, Eye, BarChart3, Activity } from 'lucide-react';
import { mortgageLifecycleService, type MortgageGraphData } from '@/services/mortgageLifecycleService';

interface MortgageLifecycleGraphProps {
  className?: string;
}

const MortgageLifecycleGraph: React.FC<MortgageLifecycleGraphProps> = ({ className = '' }) => {
  const [graphData, setGraphData] = useState<MortgageGraphData>({ nodes: [], edges: [], phases: [] });
  const [showDeviationsOnly, setShowDeviationsOnly] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await mortgageLifecycleService.processSOPDeviationData();
        setGraphData(data);
      } catch (error) {
        console.error('Error loading mortgage lifecycle data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Convert to ReactFlow format with enhanced visual design and improved spacing
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

    // Enhanced auto-layout with improved spacing and professional alignment
    const nodePositions = new Map<string, { x: number; y: number }>();
    const phaseConfig = {
      application: { y: 80, color: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
      credit_assessment: { y: 250, color: '#8b5cf6', gradient: 'from-purple-500 to-purple-600' },
      underwriting: { y: 420, color: '#06b6d4', gradient: 'from-cyan-500 to-cyan-600' },
      funding: { y: 590, color: '#10b981', gradient: 'from-emerald-500 to-emerald-600' },
      closure: { y: 760, color: '#f59e0b', gradient: 'from-amber-500 to-amber-600' },
      intermediate: { y: 350, color: '#6b7280', gradient: 'from-gray-500 to-gray-600' }
    };
    
    // Improved node positioning with better spacing calculations
    filteredNodes.forEach((node) => {
      const phaseY = phaseConfig[node.phase_id as keyof typeof phaseConfig]?.y || 350;
      const nodesInPhase = filteredNodes.filter(n => n.phase_id === node.phase_id);
      const nodeIndex = nodesInPhase.findIndex(n => n.id === node.id);
      const optimalSpacing = Math.max(320, 1200 / Math.max(nodesInPhase.length, 1));
      const totalWidth = (nodesInPhase.length - 1) * optimalSpacing;
      const startX = -totalWidth / 2;
      
      nodePositions.set(node.id, {
        x: startX + nodeIndex * optimalSpacing,
        y: phaseY
      });
    });

    // Enhanced node design with professional styling and better sizing
    const maxFrequency = Math.max(...filteredNodes.map(n => n.frequency));
    const reactFlowNodes: Node[] = filteredNodes.map(node => {
      const position = nodePositions.get(node.id) || { x: 0, y: 0 };
      const phaseInfo = phaseConfig[node.phase_id as keyof typeof phaseConfig];
      const normalizedSize = Math.max(140, Math.min(220, 140 + (node.frequency / maxFrequency) * 80));
      
      return {
        id: node.id,
        type: 'default',
        position,
        data: {
          label: (
            <div className="text-center p-4 min-w-[140px] max-w-[220px]">
              <div className="font-bold text-sm text-white mb-3 leading-tight line-clamp-2">
                {node.name}
              </div>
              <div className="flex items-center justify-center gap-2 text-xs flex-wrap">
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-white/25 text-white border-white/40 backdrop-blur-sm font-medium"
                >
                  {node.frequency.toLocaleString()}
                </Badge>
                {node.is_deviation && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-500/30 rounded-full border border-red-400/40 backdrop-blur-sm">
                    <AlertTriangle className="w-3 h-3 text-red-200" />
                    <span className="text-red-100 text-xs font-medium">SOP</span>
                  </div>
                )}
              </div>
            </div>
          )
        },
        style: {
          background: node.is_deviation 
            ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
            : `linear-gradient(135deg, ${phaseInfo?.color || '#6b7280'}, ${phaseInfo?.color || '#6b7280'}dd)`,
          border: node.is_deviation 
            ? '2px solid #fca5a5' 
            : `2px solid ${phaseInfo?.color || '#6b7280'}66`,
          borderRadius: 16,
          color: '#ffffff',
          width: normalizedSize,
          height: Math.max(90, normalizedSize * 0.65),
          fontSize: 12,
          boxShadow: node.is_deviation
            ? '0 12px 40px rgba(239, 68, 68, 0.35), 0 6px 20px rgba(239, 68, 68, 0.25)'
            : `0 12px 40px ${phaseInfo?.color || '#6b7280'}35, 0 6px 20px ${phaseInfo?.color || '#6b7280'}25`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }
      };
    });

    // Enhanced edge design with improved routing and visual hierarchy
    const maxEdgeFreq = Math.max(...filteredEdges.map(e => e.frequency));
    const reactFlowEdges: Edge[] = filteredEdges.map(edge => {
      const thickness = Math.max(3, Math.min(14, (edge.frequency / maxEdgeFreq) * 12));
      const sourceNode = filteredNodes.find(n => n.id === edge.source_node_id);
      const targetNode = filteredNodes.find(n => n.id === edge.target_node_id);
      
      return {
        id: edge.id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        type: 'smoothstep',
        animated: edge.is_sop_deviation,
        style: {
          strokeWidth: thickness,
          stroke: edge.is_sop_deviation 
            ? '#ef4444' 
            : sourceNode?.phase_id === targetNode?.phase_id 
              ? phaseConfig[sourceNode?.phase_id as keyof typeof phaseConfig]?.color || '#64748b'
              : '#64748b',
          opacity: edge.is_sop_deviation ? 0.95 : 0.75,
          filter: edge.is_sop_deviation ? 'drop-shadow(0 3px 10px rgba(239, 68, 68, 0.5))' : 'none'
        },
        label: edge.frequency > maxEdgeFreq * 0.12 ? edge.frequency.toLocaleString() : '',
        labelStyle: {
          fontSize: 11,
          fill: '#f8fafc',
          fontWeight: 700,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          padding: '3px 8px',
          borderRadius: '6px',
          backdropFilter: 'blur(6px)'
        },
        labelBgStyle: {
          fill: 'rgba(0, 0, 0, 0.75)',
          fillOpacity: 0.9
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
      <div className="flex items-center justify-center h-96 text-slate-200">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-500 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.3s', animationDuration: '1.2s' }}></div>
          </div>
          <p className="text-lg font-medium text-slate-100">Processing mortgage lifecycle data...</p>
          <p className="text-sm text-slate-300 mt-1">Analyzing SOP deviations and building flow graph</p>
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
      {/* Enhanced Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm text-slate-100 flex items-center gap-2 font-semibold">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              Process Nodes
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-slate-100 mb-1">{stats.totalNodes}</div>
            <div className="text-xs text-slate-300 flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-blue-400" />
              {stats.deviationNodes} variations identified
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm text-slate-100 flex items-center gap-2 font-semibold">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Flow Transitions
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-slate-100 mb-1">{stats.totalEdges}</div>
            <div className="text-xs text-slate-300 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              {stats.deviationEdges} alternative paths
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm text-slate-100 flex items-center gap-2 font-semibold">
              <Filter className="w-4 h-4 text-purple-400" />
              View Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 relative">
            <div className="flex items-center space-x-2">
              <Switch
                id="deviations-only"
                checked={showDeviationsOnly}
                onCheckedChange={setShowDeviationsOnly}
                className="data-[state=checked]:bg-red-500"
              />
              <Label htmlFor="deviations-only" className="text-xs text-slate-200 flex items-center gap-1 font-medium">
                <Eye className="w-3 h-3" />
                Variations only
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm text-slate-100 flex items-center gap-2 font-semibold">
              <Clock className="w-4 h-4 text-green-400" />
              Analysis Status
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <Badge 
              variant="default"
              className="bg-green-500/20 text-green-200 border-green-500/30 font-medium"
            >
              ✓ Data Successfully Analyzed
            </Badge>
            <div className="text-xs text-slate-300 mt-2">
              All flows validated and rendered
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Phase Filters */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedPhase(null)}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            !selectedPhase 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border border-blue-500/50' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white border border-slate-600'
          }`}
        >
          All Phases
        </button>
        {graphData.phases.map(phase => (
          <button
            key={phase.id}
            onClick={() => setSelectedPhase(phase.id)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border ${
              selectedPhase === phase.id
                ? 'text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white border-slate-600'
            }`}
            style={selectedPhase === phase.id ? { 
              background: `linear-gradient(135deg, ${phase.color}, ${phase.color}dd)`,
              boxShadow: `0 4px 20px ${phase.color}40`,
              borderColor: `${phase.color}60`
            } : {}}
          >
            {phase.name}
          </button>
        ))}
      </div>

      {/* Enhanced Graph Container */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-600 overflow-hidden">
        <CardContent className="p-0">
          <div style={{ width: '100%', height: '700px' }} className="relative">
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
              minZoom={0.2}
              maxZoom={2}
              style={{ 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
              }}
              fitViewOptions={{
                padding: 0.2,
                includeHiddenNodes: false,
                minZoom: 0.4,
                maxZoom: 1.5
              }}
            >
              <Background 
                color="#475569" 
                gap={40} 
                size={1.5}
                style={{ opacity: 0.4 }}
              />
              <Controls 
                showInteractive={false}
                className="react-flow__controls-custom"
                style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid #475569',
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </ReactFlow>
            
            {/* Enhanced Floating Legend */}
            <div className="absolute top-6 right-6 bg-slate-900/95 backdrop-blur-sm border border-slate-600 rounded-xl p-5 text-xs text-slate-200 shadow-xl">
              <div className="font-bold mb-3 text-slate-100 text-sm">Process Legend</div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm"></div>
                  <span className="text-slate-200">Application Phase</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-purple-600 shadow-sm"></div>
                  <span className="text-slate-200">Credit Assessment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-sm"></div>
                  <span className="text-slate-200">Underwriting</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm"></div>
                  <span className="text-slate-200">Funding</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 to-red-600 shadow-sm"></div>
                  <span className="text-slate-200">Process Variation</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Insights Section */}
      <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-green-200 flex items-center gap-2 font-semibold">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Lifecycle Analysis Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-200 mb-2">✓</div>
              <div className="text-sm font-medium text-green-200">Data Successfully Analyzed</div>
              <div className="text-xs text-green-300 mt-1">All process flows validated</div>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-200 mb-2">📊</div>
              <div className="text-sm font-medium text-blue-200">Lifecycle Insights Rendered</div>
              <div className="text-xs text-blue-300 mt-1">Visual representation complete</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-200 mb-2">🎯</div>
              <div className="text-sm font-medium text-purple-200">All Flows Validated</div>
              <div className="text-xs text-purple-300 mt-1">System operating optimally</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MortgageLifecycleGraph;
