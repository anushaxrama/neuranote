import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ZoomIn, ZoomOut, Sparkles, Loader2, X, PenLine, Network, 
  BookOpen, RefreshCw, ArrowRight, Link2, Maximize2, Move
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

const groupColors: GroupColor[] = [
  { bg: 'rgba(219, 234, 254, 0.7)', bgSolid: '#dbeafe', border: '#3b82f6', text: '#1e40af', line: '#3b82f6' },
  { bg: 'rgba(220, 252, 231, 0.7)', bgSolid: '#dcfce7', border: '#22c55e', text: '#166534', line: '#22c55e' },
  { bg: 'rgba(254, 226, 226, 0.7)', bgSolid: '#fee2e2', border: '#ef4444', text: '#991b1b', line: '#ef4444' },
  { bg: 'rgba(237, 233, 254, 0.7)', bgSolid: '#ede9fe', border: '#8b5cf6', text: '#5b21b6', line: '#8b5cf6' },
  { bg: 'rgba(255, 237, 213, 0.7)', bgSolid: '#ffedd5', border: '#f97316', text: '#9a3412', line: '#f97316' },
  { bg: 'rgba(207, 250, 254, 0.7)', bgSolid: '#cffafe', border: '#06b6d4', text: '#155e75', line: '#06b6d4' },
];

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
      return category.keywords.some(kw => concept.toLowerCase().includes(kw));
    });
    if (matching.length > 0) {
      matching.forEach(c => assigned.add(c));
      groups.push({ id: groups.length, name: category.name, concepts: matching, color: groupColors[groups.length % groupColors.length] });
    }
  });
  
  const remaining = concepts.filter(c => !assigned.has(c));
  if (remaining.length > 0) {
    groups.push({ id: groups.length, name: "Other", concepts: remaining, color: groupColors[groups.length % groupColors.length] });
  }
  return groups;
};

const getStoredConcepts = (): string[] => {
  try { return JSON.parse(localStorage.getItem("neuranoteConcepts") || "[]"); } catch { return []; }
};

const getStoredNotes = (): any[] => {
  try { return JSON.parse(localStorage.getItem("neuranoteNotes") || "[]"); } catch { return []; }
};

const calculateBubbleSize = (label: string, index: number): number => {
  const words = label.split(/[\s-]+/);
  const longestWord = Math.max(...words.map(w => w.length));
  return Math.max(55, Math.min(90, 48 + longestWord * 3 + ((index * 7) % 4) * 4));
};

const gridLayout = (
  nodes: { id: string; size: number; groupId: number }[],
  groups: ConceptGroup[],
  width: number,
  height: number
) => {
  const positions = new Map<string, { x: number; y: number }>();
  const groupData = new Map<number, { cx: number; cy: number; r: number }>();
  
  const numGroups = groups.length;
  const cols = numGroups <= 2 ? numGroups : numGroups <= 4 ? 2 : 3;
  const rows = Math.ceil(numGroups / cols);
  const padding = 80;
  const cellWidth = (width - padding * 2) / cols;
  const cellHeight = (height - padding * 2) / rows;
  
  groups.forEach((group, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cx = padding + cellWidth * col + cellWidth / 2;
    const cy = padding + cellHeight * row + cellHeight / 2;
    const r = Math.min(cellWidth, cellHeight) / 2 - 40;
    
    groupData.set(group.id, { cx, cy, r });
    
    const groupNodes = nodes.filter(n => n.groupId === group.id);
    const numNodes = groupNodes.length;
    
    if (numNodes === 1) {
      positions.set(groupNodes[0].id, { x: cx, y: cy });
    } else {
      const layers: typeof groupNodes[] = [];
      const perLayer = Math.max(6, Math.ceil(numNodes / 2));
      for (let i = 0; i < numNodes; i += perLayer) layers.push(groupNodes.slice(i, i + perLayer));
      
      layers.forEach((layer, li) => {
        const lr = (li + 1) * (r / (layers.length + 0.5));
        layer.forEach((node, ni) => {
          const angle = (ni / layer.length) * Math.PI * 2 - Math.PI / 2;
          positions.set(node.id, { x: cx + Math.cos(angle) * lr, y: cy + Math.sin(angle) * lr });
        });
      });
    }
  });
  
  // Collision resolution
  for (let iter = 0; iter < 40; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const pa = positions.get(a.id)!, pb = positions.get(b.id)!;
        const dx = pb.x - pa.x, dy = pb.y - pa.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = (a.size + b.size) / 2 + 6;
        if (dist < minDist) {
          const f = (minDist - dist) / 2;
          pa.x -= (dx / dist) * f; pa.y -= (dy / dist) * f;
          pb.x += (dx / dist) * f; pb.y += (dy / dist) * f;
        }
      }
    }
    nodes.forEach(node => {
      const pos = positions.get(node.id)!;
      const g = groupData.get(node.groupId);
      if (!g) return;
      const dx = pos.x - g.cx, dy = pos.y - g.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const max = g.r - node.size / 2 - 5;
      if (dist > max && max > 0) {
        pos.x = g.cx + (dx / dist) * max;
        pos.y = g.cy + (dy / dist) * max;
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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const canvasSize = { width: 1400, height: 1000 };

  useEffect(() => {
    setStoredConcepts(getStoredConcepts());
    setNotes(getStoredNotes());
  }, []);

  const groups = useMemo(() => clusterConcepts(storedConcepts), [storedConcepts]);

  const { concepts, groupsWithBounds } = useMemo(() => {
    if (storedConcepts.length === 0) return { concepts: [], groupsWithBounds: [] };
    
    const counts: Record<string, number> = {};
    notes.forEach(n => (n.concepts || []).forEach((c: string) => { counts[c] = (counts[c] || 0) + 1; }));
    
    const nodes = storedConcepts.map((label, i) => ({
      id: label,
      size: calculateBubbleSize(label, i),
      groupId: Math.max(0, groups.findIndex(g => g.concepts.includes(label))),
    }));
    
    const { positions, groupData } = gridLayout(nodes, groups, canvasSize.width, canvasSize.height);
    
    return {
      concepts: nodes.map((n, i) => ({ id: i + 1, label: n.id, ...positions.get(n.id)!, size: n.size, groupId: n.groupId, noteCount: counts[n.id] || 1 })),
      groupsWithBounds: groups.map(g => ({ ...g, ...groupData.get(g.id) })),
    };
  }, [storedConcepts, notes, groups]);

  useEffect(() => { if (storedConcepts.length >= 2) loadConnections(); }, [storedConcepts]);

  const loadConnections = async () => {
    if (storedConcepts.length < 2) return;
    setIsLoadingConnections(true);
    try {
      const conns = await suggestConnections(storedConcepts);
      setAiConnections(conns.map((c, i) => ({ ...c, strength: 0.5 + 0.5 * (1 - i / conns.length) })));
    } catch (e) { console.error(e); }
    finally { setIsLoadingConnections(false); }
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  
  const handleMouseUp = () => setIsDragging(false);
  
  // Zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.3, Math.min(2, z + delta)));
  };
  
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const getConceptByLabel = useCallback((l: string) => concepts.find(c => c.label === l), [concepts]);
  const getRelatedConnections = useCallback((l: string) => aiConnections.filter(c => c.from === l || c.to === l), [aiConnections]);
  const getRelatedNotes = useCallback((l: string): NoteInfo[] => notes.filter(n => (n.concepts || []).includes(l)).map(n => ({ title: n.title, excerpt: (n.content?.substring(0, 80) || '') + '...' })), [notes]);
  const getColor = useCallback((c: Concept) => groupColors[c.groupId % groupColors.length], []);
  const isHl = useCallback((conn: Connection) => { const a = selectedConcept?.label || hoveredConcept; return a ? conn.from === a || conn.to === a : false; }, [selectedConcept, hoveredConcept]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
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
            <div className="absolute top-0 left-0 right-0 z-30 px-6 py-3 flex items-center justify-between bg-white/95 backdrop-blur border-b border-gray-200">
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Concept Map</h1>
                <p className="text-sm text-gray-500">{groups.length} clusters · {concepts.length} concepts</p>
              </div>
              <div className="flex items-center gap-2">
                {isLoadingConnections ? (
                  <span className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" />Finding...</span>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-gray-500"><Sparkles className="w-4 h-4 text-amber-500" />{aiConnections.length} connections</span>
                )}
                <div className="flex items-center gap-1 ml-3 bg-gray-100 rounded-lg p-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.max(0.3, z - 0.15))}><ZoomOut className="w-4 h-4" /></Button>
                  <span className="text-xs text-gray-600 w-12 text-center font-medium">{Math.round(zoom * 100)}%</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.min(2, z + 0.15))}><ZoomIn className="w-4 h-4" /></Button>
                </div>
                <Button variant="ghost" size="sm" className="h-8 px-2 gap-1" onClick={resetView}><Maximize2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={loadConnections} disabled={isLoadingConnections}>
                  <RefreshCw className={`w-4 h-4 ${isLoadingConnections ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Map Canvas */}
            <div 
              ref={containerRef}
              className={`absolute inset-0 pt-14 overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              {/* Grid background */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }} />
              
              <div 
                style={{ 
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  width: canvasSize.width,
                  height: canvasSize.height,
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  marginLeft: -canvasSize.width / 2,
                  marginTop: -canvasSize.height / 2 + 28,
                }}
              >
                <svg width={canvasSize.width} height={canvasSize.height}>
                  {/* Group circles */}
                  {groupsWithBounds.map((g) => g.cx && g.cy && g.r && (
                    <g key={`g-${g.id}`}>
                      <circle cx={g.cx} cy={g.cy} r={g.r} fill={g.color.bg} stroke={g.color.border} strokeWidth={2.5} />
                      <g transform={`translate(${g.cx}, ${g.cy - g.r - 18})`}>
                        <rect x={-50} y={-14} width={100} height={28} rx={14} fill="white" stroke={g.color.border} strokeWidth={2} />
                        <text x={0} y={1} textAnchor="middle" dominantBaseline="middle" fill={g.color.text} fontSize="12" fontWeight="700">{g.name.toUpperCase()}</text>
                      </g>
                      <circle cx={g.cx + 40} cy={g.cy - g.r - 18} r={12} fill={g.color.border} />
                      <text x={g.cx + 40} y={g.cy - g.r - 17} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="700">{g.concepts.length}</text>
                    </g>
                  ))}

                  {/* Connections */}
                  {aiConnections.map((conn, i) => {
                    const f = getConceptByLabel(conn.from), t = getConceptByLabel(conn.to);
                    if (!f || !t) return null;
                    const hl = isHl(conn);
                    if (f.groupId !== t.groupId) {
                      const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2 - 40;
                      return <path key={i} d={`M${f.x},${f.y} Q${mx},${my} ${t.x},${t.y}`} fill="none" stroke={hl ? "#4f46e5" : "#94a3b8"} strokeWidth={hl ? 2.5 : 1.5} strokeOpacity={hl ? 1 : 0.4} strokeDasharray={hl ? "none" : "6 3"} />;
                    }
                    return <line key={i} x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={hl ? "#4f46e5" : "#cbd5e1"} strokeWidth={hl ? 2 : 1} strokeOpacity={hl ? 1 : 0.5} />;
                  })}

                  {/* Concept bubbles */}
                  {concepts.map((c) => {
                    const sel = selectedConcept?.id === c.id;
                    const hov = hoveredConcept === c.label;
                    const rel = selectedConcept ? getRelatedConnections(selectedConcept.label).some(x => x.from === c.label || x.to === c.label) : false;
                    const col = getColor(c);
                    const act = sel || hov;
                    const dim = selectedConcept && !sel && !rel;
                    
                    const words = c.label.split(/[\s-]+/);
                    let l1 = c.label, l2 = '';
                    if (c.label.length > 10 && words.length >= 2) {
                      const m = Math.ceil(words.length / 2);
                      l1 = words.slice(0, m).join(' ');
                      l2 = words.slice(m).join(' ');
                    }
                    const fs = c.size > 65 ? 11 : 10;
                    
                    return (
                      <g key={c.id} className="cursor-pointer" style={{ opacity: dim ? 0.2 : 1, transition: 'opacity 0.15s' }}
                        onClick={(e) => { e.stopPropagation(); setSelectedConcept(sel ? null : c); }}
                        onMouseEnter={() => setHoveredConcept(c.label)}
                        onMouseLeave={() => setHoveredConcept(null)}>
                        {(act || rel) && <circle cx={c.x} cy={c.y} r={c.size / 2 + 5} fill="none" stroke={col.line} strokeWidth={3} strokeOpacity={0.7} />}
                        <circle cx={c.x} cy={c.y} r={c.size / 2} fill={col.bgSolid} stroke={col.border} strokeWidth={2} style={{ filter: act ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.2))' : 'none' }} />
                        {l2 ? (
                          <>
                            <text x={c.x} y={c.y - 6} textAnchor="middle" dominantBaseline="middle" fill={col.text} fontSize={fs} fontWeight="600" className="pointer-events-none">{l1}</text>
                            <text x={c.x} y={c.y + 8} textAnchor="middle" dominantBaseline="middle" fill={col.text} fontSize={fs} fontWeight="600" className="pointer-events-none">{l2}</text>
                          </>
                        ) : (
                          <text x={c.x} y={c.y} textAnchor="middle" dominantBaseline="middle" fill={col.text} fontSize={fs} fontWeight="600" className="pointer-events-none">{l1}</text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Controls hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-lg border border-gray-200 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Move className="w-3 h-3" /> Drag to pan</span>
                <span className="text-gray-300">|</span>
                <span>Scroll to zoom</span>
                <span className="text-gray-300">|</span>
                <span>Click bubbles to explore</span>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-16 left-4 z-20">
              <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Clusters</p>
                <div className="space-y-1.5">
                  {groups.map((g) => (
                    <div key={g.id} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color.bgSolid, border: `2px solid ${g.color.border}` }} />
                      <span className="text-xs text-gray-700">{g.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">{g.concepts.length}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detail Panel */}
            {selectedConcept && (
              <div className="absolute top-16 right-4 z-40 w-80">
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b-2" style={{ backgroundColor: getColor(selectedConcept).bgSolid, borderColor: getColor(selectedConcept).border }}>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase mb-1" style={{ color: getColor(selectedConcept).text }}>{groups[selectedConcept.groupId]?.name}</p>
                        <h3 className="text-lg font-bold text-gray-800">{selectedConcept.label}</h3>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedConcept(null)}><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                    {getRelatedConnections(selectedConcept.label).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2"><Link2 className="w-4 h-4 text-indigo-500" /><span className="text-sm font-semibold text-gray-700">Connections</span></div>
                        <div className="space-y-2">
                          {getRelatedConnections(selectedConcept.label).slice(0, 4).map((conn, i) => {
                            const other = conn.from === selectedConcept.label ? conn.to : conn.from;
                            const oc = getConceptByLabel(other);
                            const ocol = oc ? groupColors[oc.groupId % groupColors.length] : groupColors[0];
                            return (
                              <div key={i} className="p-2 rounded-lg" style={{ backgroundColor: ocol.bg }}>
                                <div className="flex items-center gap-2"><ArrowRight className="w-3 h-3" style={{ color: ocol.text }} /><span className="text-sm font-medium" style={{ color: ocol.text }}>{other}</span></div>
                                <p className="text-xs text-gray-500 mt-1 pl-5">{conn.explanation}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {getRelatedNotes(selectedConcept.label).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-emerald-500" /><span className="text-sm font-semibold text-gray-700">Notes</span></div>
                        {getRelatedNotes(selectedConcept.label).slice(0, 2).map((n, i) => (
                          <Link key={i} to="/notes"><div className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 mb-2"><p className="text-sm font-medium text-gray-700">{n.title}</p><p className="text-xs text-gray-500">{n.excerpt}</p></div></Link>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link to="/review" className="flex-1"><Button variant="outline" size="sm" className="w-full text-xs"><RefreshCw className="w-3 h-3 mr-1" />Review</Button></Link>
                      <Link to="/notes" className="flex-1"><Button size="sm" className="w-full text-xs text-white" style={{ backgroundColor: getColor(selectedConcept).line }}><PenLine className="w-3 h-3 mr-1" />Add Note</Button></Link>
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
