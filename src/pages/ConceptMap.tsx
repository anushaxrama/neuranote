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
  labelBg: string;
}

// Clean, distinct color palette
const groupColors: GroupColor[] = [
  { 
    bg: 'rgba(191, 219, 254, 0.3)',
    bgSolid: '#dbeafe',
    border: '#3b82f6',
    text: '#1e40af',
    line: '#3b82f6',
    labelBg: '#dbeafe',
  },
  { 
    bg: 'rgba(187, 247, 208, 0.3)',
    bgSolid: '#dcfce7',
    border: '#22c55e',
    text: '#166534',
    line: '#22c55e',
    labelBg: '#dcfce7',
  },
  { 
    bg: 'rgba(254, 202, 202, 0.3)',
    bgSolid: '#fee2e2',
    border: '#ef4444',
    text: '#991b1b',
    line: '#ef4444',
    labelBg: '#fee2e2',
  },
  { 
    bg: 'rgba(221, 214, 254, 0.3)',
    bgSolid: '#ede9fe',
    border: '#8b5cf6',
    text: '#5b21b6',
    line: '#8b5cf6',
    labelBg: '#ede9fe',
  },
  { 
    bg: 'rgba(254, 215, 170, 0.3)',
    bgSolid: '#ffedd5',
    border: '#f97316',
    text: '#9a3412',
    line: '#f97316',
    labelBg: '#ffedd5',
  },
  { 
    bg: 'rgba(165, 243, 252, 0.3)',
    bgSolid: '#cffafe',
    border: '#06b6d4',
    text: '#155e75',
    line: '#06b6d4',
    labelBg: '#cffafe',
  },
];

// Semantic clustering
const conceptCategories: { name: string; keywords: string[] }[] = [
  { name: "Memory", keywords: ["memory", "storage", "retention", "recall", "recollection", "recognition", "familiarity", "remember", "duration"] },
  { name: "Encoding", keywords: ["encoding", "encode", "processing", "depth", "shallow", "deep", "semantic", "phonemic", "structural", "levels"] },
  { name: "Learning", keywords: ["study", "learning", "practice", "testing", "self-test", "flashcard", "session", "spaced", "spacing", "repetition", "active", "retrieval", "improved"] },
  { name: "Cognitive", keywords: ["understanding", "comprehension", "transform", "context", "meaning", "concept", "knowledge", "metacognition", "misconception"] },
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

// Calculate bubble size - bigger bubbles for longer labels
const calculateBubbleSize = (label: string, index: number): number => {
  const words = label.split(/[\s-]+/);
  const longestWord = Math.max(...words.map(w => w.length));
  
  // Size based on longest word to ensure it fits
  const baseSize = 50 + longestWord * 4;
  const variety = ((index * 7) % 4) * 5;
  
  return Math.max(55, Math.min(95, baseSize + variety));
};

// Force-directed layout
const forceDirectedLayout = (
  nodes: { id: string; size: number; groupId: number }[],
  groups: ConceptGroup[],
  width: number,
  height: number
): { positions: Map<string, { x: number; y: number }>; groupData: Map<number, { cx: number; cy: number; r: number }> } => {
  const positions = new Map<string, { x: number; y: number }>();
  const groupData = new Map<number, { cx: number; cy: number; r: number }>();
  
  const groupSizes = new Map<number, number>();
  groups.forEach(g => {
    const baseRadius = 90 + Math.sqrt(g.concepts.length) * 50;
    groupSizes.set(g.id, baseRadius);
  });
  
  const totalSize = Array.from(groupSizes.values()).reduce((a, b) => a + b, 0);
  let currentAngle = -Math.PI / 2;
  
  const groupCenters = new Map<number, { x: number; y: number }>();
  groups.forEach((g) => {
    const size = groupSizes.get(g.id) || 100;
    const angleSpan = (size / totalSize) * Math.PI * 2;
    const angle = currentAngle + angleSpan / 2;
    currentAngle += angleSpan;
    
    const distFromCenter = Math.min(width, height) * 0.26;
    groupCenters.set(g.id, {
      x: width / 2 + Math.cos(angle) * distFromCenter,
      y: height / 2 + Math.sin(angle) * distFromCenter,
    });
  });
  
  nodes.forEach((node, i) => {
    const center = groupCenters.get(node.groupId) || { x: width / 2, y: height / 2 };
    const angle = (i / nodes.length) * Math.PI * 2;
    const offset = 25 + Math.random() * 35;
    positions.set(node.id, {
      x: center.x + Math.cos(angle) * offset,
      y: center.y + Math.sin(angle) * offset,
    });
  });

  // Force simulation
  for (let iter = 0; iter < 100; iter++) {
    const forces = new Map<string, { fx: number; fy: number }>();
    nodes.forEach(n => forces.set(n.id, { fx: 0, fy: 0 }));

    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const posA = positions.get(a.id)!;
        const posB = positions.get(b.id)!;
        
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = (a.size + b.size) / 2 + 12;
        
        if (dist < minDist * 2) {
          const force = (minDist * 2 - dist) * 0.15;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          
          forces.get(a.id)!.fx -= fx;
          forces.get(a.id)!.fy -= fy;
          forces.get(b.id)!.fx += fx;
          forces.get(b.id)!.fy += fy;
        }
      }
    }

    // Attraction to group center
    nodes.forEach(node => {
      const pos = positions.get(node.id)!;
      const center = groupCenters.get(node.groupId)!;
      forces.get(node.id)!.fx += (center.x - pos.x) * 0.02;
      forces.get(node.id)!.fy += (center.y - pos.y) * 0.02;
    });

    // Apply forces
    nodes.forEach(node => {
      const pos = positions.get(node.id)!;
      const force = forces.get(node.id)!;
      const padding = node.size / 2 + 15;
      pos.x = Math.max(padding, Math.min(width - padding, pos.x + force.fx * 0.8));
      pos.y = Math.max(padding, Math.min(height - padding, pos.y + force.fy * 0.8));
    });
  }

  // Calculate group bounds
  groups.forEach(group => {
    const groupNodes = nodes.filter(n => n.groupId === group.id);
    if (groupNodes.length === 0) return;
    
    const xs = groupNodes.map(n => positions.get(n.id)!.x);
    const ys = groupNodes.map(n => positions.get(n.id)!.y);
    const sizes = groupNodes.map(n => n.size);
    
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    
    let maxDist = 0;
    groupNodes.forEach((n, i) => {
      const pos = positions.get(n.id)!;
      const dist = Math.sqrt((pos.x - cx) ** 2 + (pos.y - cy) ** 2) + sizes[i] / 2;
      maxDist = Math.max(maxDist, dist);
    });
    
    groupData.set(group.id, { cx, cy, r: maxDist + 40 });
  });

  return { positions, groupData };
};

const ConceptMap = () => {
  const [storedConcepts, setStoredConcepts] = useState<string[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [aiConnections, setAiConnections] = useState<Connection[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [zoom, setZoom] = useState(0.85);
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null);

  const canvasSize = { width: 1100, height: 900 };

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

    const { positions, groupData } = forceDirectedLayout(nodes, groups, canvasSize.width, canvasSize.height);

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
                  <PenLine className="w-4 h-4 mr-2" />
                  Create Your First Note
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
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Finding connections...
                </div>
              ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {aiConnections.length} connections
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
                  {/* Group circles */}
                  {groupsWithBounds.map((group) => {
                    if (!group.cx || !group.cy || !group.r) return null;
                return (
                      <g key={`group-${group.id}`}>
                        <circle cx={group.cx} cy={group.cy} r={group.r} fill={group.color.bg} stroke={group.color.border} strokeWidth={2} strokeOpacity={0.4} />
                      </g>
                );
              })}

                  {/* Connections */}
                {aiConnections.map((conn, i) => {
                    const from = getConceptByLabel(conn.from);
                    const to = getConceptByLabel(conn.to);
                  if (!from || !to) return null;
                    const hl = isHighlighted(conn);
                    const cross = from.groupId !== to.groupId;
                    return (
                      <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        stroke={hl ? "#4f46e5" : "#d1d5db"} strokeWidth={hl ? 2.5 : 1}
                        strokeOpacity={hl ? 1 : 0.5} strokeDasharray={cross && !hl ? "4 2" : "none"} />
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
                    
                    // Split long labels into two lines
                    const words = concept.label.split(/[\s-]+/);
                    let line1 = concept.label;
                    let line2 = '';
                    
                    if (concept.label.length > 10 && words.length >= 2) {
                      const mid = Math.ceil(words.length / 2);
                      line1 = words.slice(0, mid).join(' ');
                      line2 = words.slice(mid).join(' ');
                    }
                    
                    const fontSize = concept.size > 70 ? 10 : 9;
                  
                  return (
                      <g key={concept.id} className="cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setSelectedConcept(isSelected ? null : concept); }}
                        onMouseEnter={() => setHoveredConcept(concept.label)}
                        onMouseLeave={() => setHoveredConcept(null)}
                        style={{ opacity: dimmed ? 0.3 : 1, transition: 'opacity 0.2s' }}>
                        
                        {(active || isRelated) && (
                          <circle cx={concept.x} cy={concept.y} r={concept.size / 2 + 4} fill="none" stroke={color.line} strokeWidth={3} strokeOpacity={0.6} />
                        )}
                        
                        <circle cx={concept.x} cy={concept.y} r={concept.size / 2} fill={color.bgSolid} stroke={color.border} strokeWidth={2}
                          style={{ filter: active ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.15))' : 'none' }} />
                        
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

                  {/* Group labels - positioned outside */}
                  {groupsWithBounds.map((group) => {
                    if (!group.cx || !group.cy || !group.r) return null;
                return (
                      <g key={`label-${group.id}`} transform={`translate(${group.cx}, ${group.cy - group.r - 12})`}>
                        <rect x={-40} y={-11} width={80} height={22} rx={11} fill="white" stroke={group.color.border} strokeWidth={2} />
                        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle" fill={group.color.text} fontSize="10" fontWeight="700">
                          {group.name.toUpperCase()}
                        </text>
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
