import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ZoomIn, ZoomOut, Sparkles, Loader2, X, PenLine, Network, 
  BookOpen, RefreshCw, ArrowRight, Link2
} from "lucide-react";
import { suggestConnections } from "@/lib/openai";
import { Sidebar } from "@/components/Sidebar";

interface Concept {
  id: number;
  label: string;
  x: number;
  y: number;
  size: number;
  groupId: number;
  noteCount?: number;
}

interface Connection {
  from: string;
  to: string;
  explanation: string;
  strength?: number;
}

interface NoteInfo {
  title: string;
  excerpt: string;
}

interface ConceptGroup {
  id: number;
  name: string;
  concepts: string[];
  color: GroupColor;
  centerX?: number;
  centerY?: number;
  radius?: number;
}

interface GroupColor {
  bg: string;
  bgSolid: string;
  border: string;
  text: string;
  line: string;
}

// Clean color palette
const groupColors: GroupColor[] = [
  { bg: 'rgba(219, 234, 254, 0.6)', bgSolid: '#dbeafe', border: '#3b82f6', text: '#1e40af', line: '#3b82f6' },
  { bg: 'rgba(220, 252, 231, 0.6)', bgSolid: '#dcfce7', border: '#22c55e', text: '#166534', line: '#22c55e' },
  { bg: 'rgba(254, 226, 226, 0.6)', bgSolid: '#fee2e2', border: '#ef4444', text: '#991b1b', line: '#ef4444' },
  { bg: 'rgba(237, 233, 254, 0.6)', bgSolid: '#ede9fe', border: '#8b5cf6', text: '#5b21b6', line: '#8b5cf6' },
  { bg: 'rgba(255, 237, 213, 0.6)', bgSolid: '#ffedd5', border: '#f97316', text: '#9a3412', line: '#f97316' },
  { bg: 'rgba(207, 250, 254, 0.6)', bgSolid: '#cffafe', border: '#06b6d4', text: '#155e75', line: '#06b6d4' },
];

// Semantic clustering
const conceptCategories: { name: string; keywords: string[] }[] = [
  { name: "Memory", keywords: ["memory", "storage", "retention", "recall", "recollection", "recognition", "familiarity", "remember", "duration"] },
  { name: "Encoding", keywords: ["encoding", "encode", "processing", "depth", "shallow", "deep", "semantic", "phonemic", "structural", "levels"] },
  { name: "Learning", keywords: ["study", "learning", "practice", "testing", "self-test", "flashcard", "session", "spaced", "spacing", "repetition", "active", "retrieval", "improved"] },
  { name: "Cognitive", keywords: ["understanding", "comprehension", "transform", "context", "meaning", "concept", "knowledge", "metacognition", "misconception", "cognitive", "load", "mental", "effort"] },
];

const clusterConcepts = (concepts: string[]): ConceptGroup[] => {
  const groups: ConceptGroup[] = [];
  const assigned = new Set<string>();
  
  conceptCategories.forEach((category) => {
    const matching = concepts.filter(concept => {
      if (assigned.has(concept)) return false;
      const lower = concept.toLowerCase();
      return category.keywords.some(kw => lower.includes(kw));
    });
    
    if (matching.length > 0) {
      matching.forEach(c => assigned.add(c));
      groups.push({
        id: groups.length,
        name: category.name,
        concepts: matching,
        color: groupColors[groups.length % groupColors.length],
      });
    }
  });
  
  const remaining = concepts.filter(c => !assigned.has(c));
  if (remaining.length > 0) {
    groups.push({
      id: groups.length,
      name: "Other",
      concepts: remaining,
      color: groupColors[groups.length % groupColors.length],
    });
  }
  
  return groups;
};

const getStoredConcepts = (): string[] => {
  try {
    const stored = localStorage.getItem("neuranoteConcepts");
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const getStoredNotes = (): any[] => {
  try {
    const stored = localStorage.getItem("neuranoteNotes");
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

// Calculate bubble size based on label
const calculateBubbleSize = (label: string, index: number): number => {
  const words = label.split(/[\s-]+/);
  const longestWord = Math.max(...words.map(w => w.length));
  const baseSize = 45 + longestWord * 3;
  const variety = ((index * 7) % 4) * 4;
  return Math.max(50, Math.min(85, baseSize + variety));
};

// Grid-based layout - NO overlapping clusters
const gridLayout = (
  nodes: { id: string; size: number; groupId: number }[],
  groups: ConceptGroup[],
  width: number,
  height: number
): { positions: Map<string, { x: number; y: number }>; groupData: Map<number, { cx: number; cy: number; r: number }> } => {
  const positions = new Map<string, { x: number; y: number }>();
  const groupData = new Map<number, { cx: number; cy: number; r: number }>();
  
  const numGroups = groups.length;
  const padding = 60;
  
  // Calculate grid layout for groups
  let cols: number, rows: number;
  if (numGroups <= 2) {
    cols = numGroups; rows = 1;
  } else if (numGroups <= 4) {
    cols = 2; rows = 2;
  } else if (numGroups <= 6) {
    cols = 3; rows = 2;
  } else {
    cols = 3; rows = Math.ceil(numGroups / 3);
  }
  
  const cellWidth = (width - padding * 2) / cols;
  const cellHeight = (height - padding * 2) / rows;
  
  // Position each group in its grid cell
  groups.forEach((group, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    
    const cellCenterX = padding + cellWidth * col + cellWidth / 2;
    const cellCenterY = padding + cellHeight * row + cellHeight / 2;
    
    // Calculate group radius based on concept count
    const conceptCount = group.concepts.length;
    const maxRadius = Math.min(cellWidth, cellHeight) / 2 - 30;
    const minRadius = 60;
    const groupRadius = Math.min(maxRadius, Math.max(minRadius, 50 + Math.sqrt(conceptCount) * 25));
    
    groupData.set(group.id, {
      cx: cellCenterX,
      cy: cellCenterY,
      r: groupRadius,
    });
    
    // Position concepts within the group in a circular pattern
    const groupNodes = nodes.filter(n => n.groupId === group.id);
    const numNodes = groupNodes.length;
    
    if (numNodes === 1) {
      positions.set(groupNodes[0].id, { x: cellCenterX, y: cellCenterY });
    } else {
      // Arrange in concentric circles
      const layers: typeof groupNodes[] = [];
      const nodesPerLayer = 8;
      
      for (let i = 0; i < numNodes; i += nodesPerLayer) {
        layers.push(groupNodes.slice(i, i + nodesPerLayer));
      }
      
      layers.forEach((layer, layerIdx) => {
        const layerRadius = (layerIdx + 1) * (groupRadius / (layers.length + 0.5));
        layer.forEach((node, nodeIdx) => {
          const angle = (nodeIdx / layer.length) * Math.PI * 2 - Math.PI / 2;
          positions.set(node.id, {
            x: cellCenterX + Math.cos(angle) * layerRadius,
            y: cellCenterY + Math.sin(angle) * layerRadius,
          });
        });
      });
    }
  });
  
  // Run collision detection to prevent bubble overlap
  for (let iter = 0; iter < 50; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const posA = positions.get(a.id)!;
        const posB = positions.get(b.id)!;
        
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = (a.size + b.size) / 2 + 8;
        
        if (dist < minDist) {
          const overlap = (minDist - dist) / 2;
          const fx = (dx / dist) * overlap;
          const fy = (dy / dist) * overlap;
          
          posA.x -= fx;
          posA.y -= fy;
          posB.x += fx;
          posB.y += fy;
        }
      }
    }
    
    // Keep nodes within their group bounds
    nodes.forEach(node => {
      const pos = positions.get(node.id)!;
      const group = groupData.get(node.groupId)!;
      if (!group) return;
      
      const dx = pos.x - group.cx;
      const dy = pos.y - group.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = group.r - node.size / 2 - 5;
      
      if (dist > maxDist && maxDist > 0) {
        pos.x = group.cx + (dx / dist) * maxDist;
        pos.y = group.cy + (dy / dist) * maxDist;
      }
    });
  }

  return { positions, groupData };
};

const ConceptMap = () => {
  const [storedConcepts, setStoredConcepts] = useState<string[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [aiConnections, setAiConnections] = useState<Connection[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [zoom, setZoom] = useState(0.8);
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null);

  const canvasSize = { width: 1200, height: 900 };

  useEffect(() => {
    setStoredConcepts(getStoredConcepts());
    setNotes(getStoredNotes());
  }, []);

  const groups = useMemo(() => clusterConcepts(storedConcepts), [storedConcepts]);

  const { concepts, groupsWithBounds } = useMemo(() => {
    if (storedConcepts.length === 0) return { concepts: [], groupsWithBounds: [] };

    const conceptCounts: Record<string, number> = {};
    notes.forEach(note => {
      (note.concepts || []).forEach((c: string) => {
        conceptCounts[c] = (conceptCounts[c] || 0) + 1;
      });
    });

    const nodes = storedConcepts.map((label, index) => {
      const groupId = groups.findIndex(g => g.concepts.includes(label));
      return {
        id: label,
        size: calculateBubbleSize(label, index),
        groupId: groupId >= 0 ? groupId : 0,
      };
    });

    const { positions, groupData } = gridLayout(nodes, groups, canvasSize.width, canvasSize.height);

    const conceptList = nodes.map((node, idx) => {
      const pos = positions.get(node.id)!;
      return {
        id: idx + 1,
        label: node.id,
        x: pos.x,
        y: pos.y,
        size: node.size,
        groupId: node.groupId,
        noteCount: conceptCounts[node.id] || 1,
      };
    });

    return { 
      concepts: conceptList, 
      groupsWithBounds: groups.map(g => ({ ...g, ...groupData.get(g.id) }))
    };
  }, [storedConcepts, notes, groups]);

  useEffect(() => {
    if (storedConcepts.length >= 2) loadConnections();
  }, [storedConcepts]);

  const loadConnections = async () => {
    if (storedConcepts.length < 2) return;
    setIsLoadingConnections(true);
    try {
      const connections = await suggestConnections(storedConcepts);
      setAiConnections(connections.map((conn, i) => ({
        ...conn,
        strength: 0.5 + (0.5 * (1 - i / connections.length))
      })));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  const getConceptByLabel = useCallback((label: string) => concepts.find(c => c.label === label), [concepts]);
  const getRelatedConnections = useCallback((label: string) => aiConnections.filter(c => c.from === label || c.to === label), [aiConnections]);
  const getRelatedNotes = useCallback((label: string): NoteInfo[] => 
    notes.filter(n => (n.concepts || []).includes(label)).map(n => ({ title: n.title, excerpt: n.content?.substring(0, 80) + '...' || '' })), [notes]);
  const getConceptColor = useCallback((c: Concept) => groupColors[c.groupId % groupColors.length], []);
  const isHighlighted = useCallback((conn: Connection) => {
    const active = selectedConcept?.label || hoveredConcept;
    return active ? (conn.from === active || conn.to === active) : false;
  }, [selectedConcept, hoveredConcept]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        {storedConcepts.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                <Network className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Your Concept Map</h2>
              <p className="text-gray-500 mb-6">Create notes and extract concepts to visualize connections.</p>
              <Link to="/notes">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  <PenLine className="w-4 h-4 mr-2" />Create Your First Note
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 flex items-center justify-between bg-white/90 backdrop-blur-sm border-b border-gray-200">
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Concept Map</h1>
                <p className="text-sm text-gray-500">{groups.length} clusters · {concepts.length} concepts</p>
              </div>
              <div className="flex items-center gap-3">
                {isLoadingConnections ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />Finding connections...
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Sparkles className="w-4 h-4 text-amber-500" />{aiConnections.length} connections
                  </div>
                )}
                <div className="flex items-center gap-1 ml-4 bg-gray-100 rounded-lg p-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(Math.max(zoom - 0.1, 0.4))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-gray-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(Math.min(zoom + 0.1, 1.5))}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={loadConnections} disabled={isLoadingConnections}>
                  <RefreshCw className={`w-4 h-4 ${isLoadingConnections ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Canvas */}
            <div className="absolute inset-0 pt-16 flex items-center justify-center overflow-hidden" onClick={() => setSelectedConcept(null)}>
              <div style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}>
                <svg width={canvasSize.width} height={canvasSize.height} className="overflow-visible">
                  
                  {/* Group circles - separate, not overlapping */}
                  {groupsWithBounds.map((group) => {
                    if (!group.cx || !group.cy || !group.r) return null;
                    return (
                      <g key={`group-${group.id}`}>
                        <circle 
                          cx={group.cx} 
                          cy={group.cy} 
                          r={group.r} 
                          fill={group.color.bg} 
                          stroke={group.color.border} 
                          strokeWidth={2}
                        />
                        {/* Group label at top */}
                        <g transform={`translate(${group.cx}, ${group.cy - group.r - 15})`}>
                          <rect x={-45} y={-12} width={90} height={24} rx={12} fill="white" stroke={group.color.border} strokeWidth={2} />
                          <text x={0} y={1} textAnchor="middle" dominantBaseline="middle" fill={group.color.text} fontSize="11" fontWeight="700">
                            {group.name.toUpperCase()}
                          </text>
                        </g>
                        {/* Concept count */}
                        <g transform={`translate(${group.cx + 35}, ${group.cy - group.r - 15})`}>
                          <circle r={10} fill={group.color.border} />
                          <text x={0} y={1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="700">
                            {group.concepts.length}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* Connections - curved lines between groups */}
                  {aiConnections.map((conn, i) => {
                    const from = getConceptByLabel(conn.from);
                    const to = getConceptByLabel(conn.to);
                    if (!from || !to) return null;
                    const hl = isHighlighted(conn);
                    const cross = from.groupId !== to.groupId;
                    
                    // Create curved path for cross-group connections
                    if (cross) {
                      const midX = (from.x + to.x) / 2;
                      const midY = (from.y + to.y) / 2 - 30;
                      return (
                        <path 
                          key={i}
                          d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
                          fill="none"
                          stroke={hl ? "#4f46e5" : "#cbd5e1"}
                          strokeWidth={hl ? 2 : 1}
                          strokeOpacity={hl ? 1 : 0.4}
                          strokeDasharray={!hl ? "4 2" : "none"}
                        />
                      );
                    }
                    
                    return (
                      <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        stroke={hl ? "#4f46e5" : "#e2e8f0"} strokeWidth={hl ? 2 : 1}
                        strokeOpacity={hl ? 1 : 0.5} />
                    );
                  })}

                  {/* Concept bubbles */}
                  {concepts.map((concept) => {
                    const isSelected = selectedConcept?.id === concept.id;
                    const isHovered = hoveredConcept === concept.label;
                    const isRelated = selectedConcept ? getRelatedConnections(selectedConcept.label).some(c => c.from === concept.label || c.to === concept.label) : false;
                    const color = getConceptColor(concept);
                    const active = isSelected || isHovered;
                    const dimmed = selectedConcept && !isSelected && !isRelated;
                    
                    // Split long labels
                    const words = concept.label.split(/[\s-]+/);
                    let line1 = concept.label;
                    let line2 = '';
                    if (concept.label.length > 10 && words.length >= 2) {
                      const mid = Math.ceil(words.length / 2);
                      line1 = words.slice(0, mid).join(' ');
                      line2 = words.slice(mid).join(' ');
                    }
                    const fontSize = concept.size > 65 ? 10 : 9;
                    
                    return (
                      <g key={concept.id} className="cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setSelectedConcept(isSelected ? null : concept); }}
                        onMouseEnter={() => setHoveredConcept(concept.label)}
                        onMouseLeave={() => setHoveredConcept(null)}
                        style={{ opacity: dimmed ? 0.25 : 1, transition: 'opacity 0.2s' }}>
                        
                        {(active || isRelated) && (
                          <circle cx={concept.x} cy={concept.y} r={concept.size / 2 + 4} fill="none" stroke={color.line} strokeWidth={3} strokeOpacity={0.7} />
                        )}
                        
                        <circle cx={concept.x} cy={concept.y} r={concept.size / 2} fill={color.bgSolid} stroke={color.border} strokeWidth={1.5}
                          style={{ filter: active ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' : 'none' }} />
                        
                        {line2 ? (
                          <>
                            <text x={concept.x} y={concept.y - 5} textAnchor="middle" dominantBaseline="middle" fill={color.text} fontSize={fontSize} fontWeight="600" className="pointer-events-none">
                              {line1}
                            </text>
                            <text x={concept.x} y={concept.y + 7} textAnchor="middle" dominantBaseline="middle" fill={color.text} fontSize={fontSize} fontWeight="600" className="pointer-events-none">
                              {line2}
                            </text>
                          </>
                        ) : (
                          <text x={concept.x} y={concept.y} textAnchor="middle" dominantBaseline="middle" fill={color.text} fontSize={fontSize} fontWeight="600" className="pointer-events-none">
                            {line1}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-20">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Clusters</p>
                <div className="space-y-2">
                  {groups.map((g) => (
                    <div key={g.id} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color.bgSolid, border: `2px solid ${g.color.border}` }} />
                      <span className="text-sm text-gray-700">{g.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">{g.concepts.length}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detail Panel */}
            {selectedConcept && (
              <div className="absolute bottom-4 right-4 z-40 w-80">
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b-2" style={{ backgroundColor: getConceptColor(selectedConcept).bgSolid, borderColor: getConceptColor(selectedConcept).border }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase mb-1" style={{ color: getConceptColor(selectedConcept).text }}>
                          {groups[selectedConcept.groupId]?.name}
                        </p>
                        <h3 className="text-lg font-bold text-gray-800">{selectedConcept.label}</h3>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedConcept(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 space-y-4 max-h-[280px] overflow-y-auto">
                    {getRelatedConnections(selectedConcept.label).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Link2 className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm font-semibold text-gray-700">Connections</span>
                        </div>
                        <div className="space-y-2">
                          {getRelatedConnections(selectedConcept.label).slice(0, 3).map((conn, i) => {
                            const other = conn.from === selectedConcept.label ? conn.to : conn.from;
                            const otherC = getConceptByLabel(other);
                            const otherCol = otherC ? groupColors[otherC.groupId % groupColors.length] : groupColors[0];
                            return (
                              <div key={i} className="p-2 rounded-lg" style={{ backgroundColor: otherCol.bg }}>
                                <div className="flex items-center gap-2">
                                  <ArrowRight className="w-3 h-3" style={{ color: otherCol.text }} />
                                  <span className="text-sm font-medium" style={{ color: otherCol.text }}>{other}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 pl-5">{conn.explanation}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {getRelatedNotes(selectedConcept.label).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-semibold text-gray-700">Notes</span>
                        </div>
                        {getRelatedNotes(selectedConcept.label).slice(0, 2).map((note, i) => (
                          <Link key={i} to="/notes">
                            <div className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 mb-2">
                              <p className="text-sm font-medium text-gray-700">{note.title}</p>
                              <p className="text-xs text-gray-500">{note.excerpt}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link to="/review" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          <RefreshCw className="w-3 h-3 mr-1" />Review
                        </Button>
                      </Link>
                      <Link to="/notes" className="flex-1">
                        <Button size="sm" className="w-full text-xs text-white" style={{ backgroundColor: getConceptColor(selectedConcept).line }}>
                          <PenLine className="w-3 h-3 mr-1" />Add Note
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ConceptMap;
