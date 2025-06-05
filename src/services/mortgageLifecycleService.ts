
export interface MortgageNode {
  id: string;
  name: string;
  type: 'start' | 'intermediate' | 'end';
  frequency: number;
  is_deviation: boolean;
  color_code: string;
  phase_id: string;
}

export interface MortgageEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  frequency: number;
  is_sop_deviation: boolean;
}

export interface MortgagePhase {
  id: string;
  name: string;
  color: string;
  node_ids: string[];
  edge_ids: string[];
}

export interface MortgageGraphData {
  nodes: MortgageNode[];
  edges: MortgageEdge[];
  phases: MortgagePhase[];
}

class MortgageLifecycleService {
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private determinePhase(nodeName: string): string {
    const name = nodeName.toLowerCase();
    if (name.includes('application') || name.includes('submission')) {
      return 'application';
    }
    if (name.includes('assessment') || name.includes('pre-approval')) {
      return 'credit_assessment';
    }
    if (name.includes('appraisal') || name.includes('valuation') || name.includes('underwriting')) {
      return 'underwriting';
    }
    if (name.includes('approval') || name.includes('signing') || name.includes('funding') || name.includes('disbursement')) {
      return 'funding';
    }
    if (name.includes('closure') || name.includes('rejected')) {
      return 'closure';
    }
    return 'intermediate';
  }

  private getNodeColor(isDeviation: boolean, phase: string): string {
    if (isDeviation) {
      return '#ef4444'; // Red for deviations
    }
    
    const phaseColors = {
      application: '#3b82f6',    // Blue
      credit_assessment: '#8b5cf6', // Purple
      underwriting: '#06b6d4',   // Cyan
      funding: '#10b981',        // Green
      closure: '#f59e0b',        // Amber
      intermediate: '#6b7280'    // Gray
    };
    
    return phaseColors[phase as keyof typeof phaseColors] || '#6b7280';
  }

  async processSOPDeviationData(): Promise<MortgageGraphData> {
    try {
      const response = await fetch('/sopdeviation.json');
      const data = await response.json();
      
      // Extract all unique nodes from sequences
      const nodeFrequencyMap = new Map<string, { frequency: number; isDeviation: boolean }>();
      const edgeFrequencyMap = new Map<string, { frequency: number; isDeviation: boolean }>();
      
      // Process each pattern
      data.data.forEach((pattern: any) => {
        const sequence = pattern.sop_deviation_sequence_preview;
        const patternCount = parseInt(pattern.pattern_count);
        const isDeviation = pattern.is_sop_deviation === 1;
        
        // Process nodes
        const uniqueNodesInSequence = [...new Set(sequence.filter((step: string) => step.trim() !== ''))];
        uniqueNodesInSequence.forEach((nodeName: string) => {
          const existing = nodeFrequencyMap.get(nodeName) || { frequency: 0, isDeviation: false };
          nodeFrequencyMap.set(nodeName, {
            frequency: existing.frequency + patternCount,
            isDeviation: existing.isDeviation || isDeviation
          });
        });
        
        // Process edges
        for (let i = 0; i < sequence.length - 1; i++) {
          const source = sequence[i];
          const target = sequence[i + 1];
          
          if (source.trim() && target.trim() && source !== target) {
            const edgeId = `${this.slugify(source)}→${this.slugify(target)}`;
            const existing = edgeFrequencyMap.get(edgeId) || { frequency: 0, isDeviation: false };
            edgeFrequencyMap.set(edgeId, {
              frequency: existing.frequency + patternCount,
              isDeviation: existing.isDeviation || isDeviation
            });
          }
        }
      });
      
      // Create nodes
      const nodes: MortgageNode[] = Array.from(nodeFrequencyMap.entries()).map(([name, data]) => {
        const phase = this.determinePhase(name);
        const nodeType = name.toLowerCase().includes('application') ? 'start' :
                        (name.toLowerCase().includes('closure') || name.toLowerCase().includes('rejected')) ? 'end' : 'intermediate';
        
        return {
          id: this.slugify(name),
          name,
          type: nodeType,
          frequency: data.frequency,
          is_deviation: data.isDeviation,
          color_code: this.getNodeColor(data.isDeviation, phase),
          phase_id: phase
        };
      });
      
      // Create edges
      const edges: MortgageEdge[] = Array.from(edgeFrequencyMap.entries()).map(([edgeKey, data]) => {
        const [sourceSlug, targetSlug] = edgeKey.split('→');
        return {
          id: edgeKey,
          source_node_id: sourceSlug,
          target_node_id: targetSlug,
          frequency: data.frequency,
          is_sop_deviation: data.isDeviation
        };
      });
      
      // Create phases
      const phases: MortgagePhase[] = [
        {
          id: 'application',
          name: 'Application Phase',
          color: '#3b82f6',
          node_ids: nodes.filter(n => n.phase_id === 'application').map(n => n.id),
          edge_ids: edges.filter(e => 
            nodes.find(n => n.id === e.source_node_id)?.phase_id === 'application' ||
            nodes.find(n => n.id === e.target_node_id)?.phase_id === 'application'
          ).map(e => e.id)
        },
        {
          id: 'credit_assessment',
          name: 'Credit Assessment',
          color: '#8b5cf6',
          node_ids: nodes.filter(n => n.phase_id === 'credit_assessment').map(n => n.id),
          edge_ids: edges.filter(e => 
            nodes.find(n => n.id === e.source_node_id)?.phase_id === 'credit_assessment' ||
            nodes.find(n => n.id === e.target_node_id)?.phase_id === 'credit_assessment'
          ).map(e => e.id)
        },
        {
          id: 'underwriting',
          name: 'Underwriting',
          color: '#06b6d4',
          node_ids: nodes.filter(n => n.phase_id === 'underwriting').map(n => n.id),
          edge_ids: edges.filter(e => 
            nodes.find(n => n.id === e.source_node_id)?.phase_id === 'underwriting' ||
            nodes.find(n => n.id === e.target_node_id)?.phase_id === 'underwriting'
          ).map(e => e.id)
        },
        {
          id: 'funding',
          name: 'Funding',
          color: '#10b981',
          node_ids: nodes.filter(n => n.phase_id === 'funding').map(n => n.id),
          edge_ids: edges.filter(e => 
            nodes.find(n => n.id === e.source_node_id)?.phase_id === 'funding' ||
            nodes.find(n => n.id === e.target_node_id)?.phase_id === 'funding'
          ).map(e => e.id)
        },
        {
          id: 'closure',
          name: 'Closure',
          color: '#f59e0b',
          node_ids: nodes.filter(n => n.phase_id === 'closure').map(n => n.id),
          edge_ids: edges.filter(e => 
            nodes.find(n => n.id === e.source_node_id)?.phase_id === 'closure' ||
            nodes.find(n => n.id === e.target_node_id)?.phase_id === 'closure'
          ).map(e => e.id)
        }
      ];
      
      console.log('Processed mortgage lifecycle data:', { nodes: nodes.length, edges: edges.length, phases: phases.length });
      
      return { nodes, edges, phases };
    } catch (error) {
      console.error('Error processing SOP deviation data:', error);
      return { nodes: [], edges: [], phases: [] };
    }
  }

  async validateFrequencyConsistency(graphData: MortgageGraphData): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    // Validate node frequency consistency
    graphData.nodes.forEach(node => {
      const incomingEdges = graphData.edges.filter(e => e.target_node_id === node.id);
      const outgoingEdges = graphData.edges.filter(e => e.source_node_id === node.id);
      
      const incomingFreq = incomingEdges.reduce((sum, e) => sum + e.frequency, 0);
      const outgoingFreq = outgoingEdges.reduce((sum, e) => sum + e.frequency, 0);
      
      // For start nodes, only check outgoing; for end nodes, only check incoming
      if (node.type === 'start' && Math.abs(outgoingFreq - node.frequency) > node.frequency * 0.1) {
        issues.push(`Start node ${node.name}: frequency mismatch (node: ${node.frequency}, outgoing: ${outgoingFreq})`);
      } else if (node.type === 'end' && Math.abs(incomingFreq - node.frequency) > node.frequency * 0.1) {
        issues.push(`End node ${node.name}: frequency mismatch (node: ${node.frequency}, incoming: ${incomingFreq})`);
      } else if (node.type === 'intermediate') {
        const avgFlow = (incomingFreq + outgoingFreq) / 2;
        if (Math.abs(avgFlow - node.frequency) > node.frequency * 0.2) {
          issues.push(`Intermediate node ${node.name}: flow inconsistency (node: ${node.frequency}, avg flow: ${avgFlow})`);
        }
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

export const mortgageLifecycleService = new MortgageLifecycleService();
