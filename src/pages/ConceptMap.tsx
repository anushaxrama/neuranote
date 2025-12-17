import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ZoomIn, ZoomOut, Sparkles, Loader2, X, PenLine, Network, 
  BookOpen, RefreshCw, ArrowRight, Link2, Maximize2, Move, ArrowLeft
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
  noteId: string;
}

interface Connection {
  from: string;
  to: string;
  explanation: string;
  noteId?: string;
}

interface NoteGroup {
  id: number;
  noteId: string;
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
  { bg: 'rgba(254, 205, 211, 0.7)', bgSolid: '#fecdd3', border: '#f43f5e', text: '#9f1239', line: '#f43f5e' },
  { bg: 'rgba(254, 249, 195, 0.7)', bgSolid: '#fef9c3', border: '#eab308', text: '#854d0e', line: '#eab308' },
];

interface StoredNote {
  id: string;
  title: string;
  content: string;
  concepts?: string[];
  createdAt: string;
}

const getStoredNotes = (): StoredNote[] => {
  try { return JSON.parse(localStorage.getItem("neuranoteNotes") || "[]"); } catch { return []; }
};

const groupByNote = (notes: StoredNote[]): NoteGroup[] => {
  const groups: NoteGroup[] = [];
  notes.forEach((note, idx) => {
    const concepts = note.concepts || [];
    if (concepts.length === 0) return;
    groups.push({
      id: groups.length,
      noteId: note.id,
      name: note.title || `Note ${idx + 1}`,
      concepts: concepts,
      color: groupColors[groups.length % groupColors.length],
    });
  });
  return groups;
};

const calculateBubbleSize = (label: string, index: number, expanded: boolean): number => {
  const words = label.split(/[\s-]+/);
  const longestWord = Math.max(...words.map(w => w.length));
  const base = expanded ? 70 + longestWord * 4 : 48 + longestWord * 3;
  const variety = ((index * 7) % 4) * 4;
  return Math.max(expanded ? 70 : 55, Math.min(expanded ? 120 : 90, base + variety));
};

// Layout for overview (all groups)
const overviewLayout = (
  nodes: { id: string; size: number; groupId: number }[],
  groups: NoteGroup[],
  width: number,
  height: number
) => {
  const positions = new Map<string, { x: number; y: number }>();
  const groupData = new Map<number, { cx: number; cy: number; r: number }>();
  
  const numGroups = groups.length;
  if (numGroups === 0) return { positions, groupData };
  
  const cols = numGroups === 1 ? 1 : numGroups <= 4 ? 2 : 3;
  const rows = Math.ceil(numGroups / cols);
  const padding = 100;
  const cellWidth = (width - padding * 2) / cols;
  const cellHeight = (height - padding * 2) / rows;
  
  groups.forEach((group, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cx = padding + cellWidth * col + cellWidth / 2;
    const cy = padding + cellHeight * row + cellHeight / 2;
    const baseRadius = Math.min(cellWidth, cellHeight) / 2 - 50;
    const r = Math.max(80, Math.min(baseRadius, 60 + Math.sqrt(group.concepts.length) * 30));
    
    groupData.set(group.id, { cx, cy, r });
    
    const groupNodes = nodes.filter(n => n.groupId === group.id);
    const numNodes = groupNodes.length;
    
    if (numNodes === 1) {
      positions.set(groupNodes[0].id, { x: cx, y: cy });
    } else if (numNodes <= 6) {
      groupNodes.forEach((node, ni) => {
        const angle = (ni / numNodes) * Math.PI * 2 - Math.PI / 2;
        positions.set(node.id, { x: cx + Math.cos(angle) * r * 0.6, y: cy + Math.sin(angle) * r * 0.6 });
      });
    } else {
      const inner = groupNodes.slice(0, Math.ceil(numNodes / 2));
      const outer = groupNodes.slice(Math.ceil(numNodes / 2));
      inner.forEach((node, ni) => {
        const angle = (ni / inner.length) * Math.PI * 2 - Math.PI / 2;
        positions.set(node.id, { x: cx + Math.cos(angle) * r * 0.4, y: cy + Math.sin(angle) * r * 0.4 });
      });
      outer.forEach((node, ni) => {
        const angle = (ni / outer.length) * Math.PI * 2 - Math.PI / 2 + Math.PI / outer.length;
        positions.set(node.id, { x: cx + Math.cos(angle) * r * 0.75, y: cy + Math.sin(angle) * r * 0.75 });
      });
    }
  });
  
  // Collision resolution
  for (let iter = 0; iter < 40; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const pa = positions.get(a.id), pb = positions.get(b.id);
        if (!pa || !pb) continue;
        const dx = pb.x - pa.x, dy = pb.y - pa.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = (a.size + b.size) / 2 + 8;
        if (dist < minDist) {
          const f = (minDist - dist) / 2;
          pa.x -= (dx / dist) * f; pa.y -= (dy / dist) * f;
          pb.x += (dx / dist) * f; pb.y += (dy / dist) * f;
        }
      }
    }
    nodes.forEach(node => {
      const pos = positions.get(node.id);
      const g = groupData.get(node.groupId);
      if (!pos || !g) return;
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

// Layout for expanded single group view
const expandedLayout = (
  nodes: { id: string; size: number }[],
  width: number,
  height: number
) => {
  const positions = new Map<string, { x: number; y: number }>();
  const cx = width / 2;
  const cy = height / 2;
  const numNodes = nodes.length;
  
  if (numNodes === 0) return positions;
  
  if (numNodes === 1) {
    positions.set(nodes[0].id, { x: cx, y: cy });
  } else if (numNodes <= 8) {
    // Single circle
    const radius = Math.min(width, height) * 0.3;
    nodes.forEach((node, i) => {
      const angle = (i / numNodes) * Math.PI * 2 - Math.PI / 2;
      positions.set(node.id, { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
    });
  } else {
    // Multiple rings
    const innerCount = Math.ceil(numNodes * 0.4);
    const inner = nodes.slice(0, innerCount);
    const outer = nodes.slice(innerCount);
    
    const innerRadius = Math.min(width, height) * 0.18;
    const outerRadius = Math.min(width, height) * 0.35;
    
    inner.forEach((node, i) => {
      const angle = (i / inner.length) * Math.PI * 2 - Math.PI / 2;
      positions.set(node.id, { x: cx + Math.cos(angle) * innerRadius, y: cy + Math.sin(angle) * innerRadius });
    });
    outer.forEach((node, i) => {
      const angle = (i / outer.length) * Math.PI * 2 - Math.PI / 2;
      positions.set(node.id, { x: cx + Math.cos(angle) * outerRadius, y: cy + Math.sin(angle) * outerRadius });
    });
  }
  
  // Collision resolution
  for (let iter = 0; iter < 50; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const pa = positions.get(a.id)!, pb = positions.get(b.id)!;
        const dx = pb.x - pa.x, dy = pb.y - pa.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = (a.size + b.size) / 2 + 15;
        if (dist < minDist) {
          const f = (minDist - dist) / 2;
          pa.x -= (dx / dist) * f; pa.y -= (dy / dist) * f;
          pb.x += (dx / dist) * f; pb.y += (dy / dist) * f;
        }
      }
    }
  }
  
  return positions;
};

const ConceptMap = () => {
  const [notes, setNotes] = useState<StoredNote[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<NoteGroup | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const canvasSize = { width: 1200, height: 900 };

  useEffect(() => {
    setNotes(getStoredNotes());
  }, []);

  const groups = useMemo(() => groupByNote(notes), [notes]);

  // Overview layout (all groups)
  const { overviewConcepts, groupsWithBounds } = useMemo(() => {
    if (groups.length === 0) return { overviewConcepts: [], groupsWithBounds: [] };
    
    const conceptToNote = new Map<string, { noteId: string; groupId: number }>();
    groups.forEach(g => g.concepts.forEach(c => conceptToNote.set(c, { noteId: g.noteId, groupId: g.id })));
    
    const allConcepts = Array.from(conceptToNote.keys());
    const nodes = allConcepts.map((label, i) => ({
      id: label,
      size: calculateBubbleSize(label, i, false),
      groupId: conceptToNote.get(label)!.groupId,
    }));
    
    const { positions, groupData } = overviewLayout(nodes, groups, canvasSize.width, canvasSize.height);
    
    return {
      overviewConcepts: nodes.map((n, i) => ({
        id: i + 1,
        label: n.id,
        x: positions.get(n.id)?.x || 0,
        y: positions.get(n.id)?.y || 0,
        size: n.size,
        groupId: n.groupId,
        noteId: conceptToNote.get(n.id)!.noteId,
      })),
      groupsWithBounds: groups.map(g => ({ ...g, ...groupData.get(g.id) })),
    };
  }, [groups]);

  // Expanded single group layout
  const expandedConcepts = useMemo(() => {
    if (!expandedGroup) return [];
    
    const nodes = expandedGroup.concepts.map((label, i) => ({
      id: label,
      size: calculateBubbleSize(label, i, true),
    }));
    
    const positions = expandedLayout(nodes, canvasSize.width, canvasSize.height);
    
    return nodes.map((n, i) => ({
      id: i + 1,
      label: n.id,
      x: positions.get(n.id)?.x || canvasSize.width / 2,
      y: positions.get(n.id)?.y || canvasSize.height / 2,
      size: n.size,
      groupId: expandedGroup.id,
      noteId: expandedGroup.noteId,
    }));
  }, [expandedGroup]);

  // Current concepts based on view mode
  const concepts = expandedGroup ? expandedConcepts : overviewConcepts;

  useEffect(() => { loadAllConnections(); }, [groups]);

  const loadAllConnections = async () => {
    if (groups.length === 0) return;
    setIsLoadingConnections(true);
    const allConnections: Connection[] = [];
    
    try {
      for (const group of groups) {
        if (group.concepts.length >= 2) {
          try {
            const noteConnections = await suggestConnections(group.concepts);
            noteConnections.forEach(conn => allConnections.push({ ...conn, noteId: group.noteId }));
          } catch (e) { console.error(e); }
        }
      }
      setConnections(allConnections);
    } catch (e) { console.error(e); }
    finally { setIsLoadingConnections(false); }
  };

  // Get connections for current view
  const currentConnections = useMemo(() => {
    if (expandedGroup) {
      return connections.filter(c => c.noteId === expandedGroup.noteId);
    }
    return connections;
  }, [connections, expandedGroup]);

  const handleGroupClick = (group: NoteGroup) => {
    setExpandedGroup(group);
    setSelectedConcept(null);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleBackClick = () => {
    setExpandedGroup(null);
    setSelectedConcept(null);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.4, Math.min(2, z + (e.deltaY > 0 ? -0.1 : 0.1))));
  };
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const getConceptByLabel = useCallback((l: string) => concepts.find(c => c.label === l), [concepts]);
  const getRelatedConnections = useCallback((label: string) => 
    currentConnections.filter(c => c.from === label || c.to === label), [currentConnections]);
  const getColor = useCallback((groupId: number) => groupColors[groupId % groupColors.length], []);
  
  const isHighlighted = useCallback((conn: Connection) => {
    const active = selectedConcept?.label || hoveredConcept;
    return active ? conn.from === active || conn.to === active : false;
  }, [selectedConcept, hoveredConcept]);

  const totalConcepts = overviewConcepts.length;
  const currentColor = expandedGroup?.color || groupColors[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        {totalConcepts === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                <Network className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Your Concept Map</h2>
              <p className="text-gray-500 mb-6">Create notes and extract concepts to see them organized by note.</p>
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
            <div 
              className="absolute top-0 left-0 right-0 z-30 px-6 py-3 flex items-center justify-between backdrop-blur border-b transition-colors duration-300"
              style={{ 
                backgroundColor: expandedGroup ? `${currentColor.bgSolid}ee` : 'rgba(255,255,255,0.95)',
                borderColor: expandedGroup ? currentColor.border : '#e5e7eb',
              }}
            >
              <div className="flex items-center gap-3">
                {expandedGroup && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 gap-1 hover:bg-white/50"
                    onClick={handleBackClick}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                )}
                <div>
                  <h1 className="text-lg font-semibold" style={{ color: expandedGroup ? currentColor.text : '#1f2937' }}>
                    {expandedGroup ? expandedGroup.name : 'Concept Map'}
              </h1>
                  <p className="text-sm" style={{ color: expandedGroup ? currentColor.text : '#6b7280', opacity: 0.8 }}>
                    {expandedGroup 
                      ? `${expandedGroup.concepts.length} concepts · ${currentConnections.length} connections`
                      : `${groups.length} notes · ${totalConcepts} concepts`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isLoadingConnections ? (
                  <span className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" />Finding...</span>
                ) : (
                  <span className="flex items-center gap-2 text-sm" style={{ color: expandedGroup ? currentColor.text : '#6b7280' }}>
                    <Sparkles className="w-4 h-4 text-amber-500" />{currentConnections.length} connections
                  </span>
                )}
                <div className="flex items-center gap-1 ml-3 bg-white/80 rounded-lg p-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}><ZoomOut className="w-4 h-4" /></Button>
                  <span className="text-xs text-gray-600 w-12 text-center font-medium">{Math.round(zoom * 100)}%</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.min(2, z + 0.15))}><ZoomIn className="w-4 h-4" /></Button>
                </div>
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={resetView}><Maximize2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={loadAllConnections} disabled={isLoadingConnections}>
                <RefreshCw className={`w-4 h-4 ${isLoadingConnections ? 'animate-spin' : ''}`} />
              </Button>
              </div>
            </div>

            {/* Canvas */}
            <div 
              ref={containerRef}
              className={`absolute inset-0 pt-14 overflow-hidden transition-colors duration-300 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ backgroundColor: expandedGroup ? `${currentColor.bg}` : 'transparent' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `radial-gradient(circle, ${expandedGroup ? currentColor.border : '#94a3b8'} 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }} />
              
              <div style={{ 
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                width: canvasSize.width,
                height: canvasSize.height,
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: -canvasSize.width / 2,
                marginTop: -canvasSize.height / 2 + 28,
              }}>
                <svg width={canvasSize.width} height={canvasSize.height}>
                  
                  {/* Overview: Note clusters (clickable) */}
                  {!expandedGroup && groupsWithBounds.map((g) => g.cx && g.cy && g.r && (
                    <g key={`g-${g.id}`} className="cursor-pointer" onClick={() => handleGroupClick(g)}>
                      {/* Clickable background */}
                      <circle 
                        cx={g.cx} cy={g.cy} r={g.r} 
                        fill={g.color.bg} 
                        stroke={g.color.border} 
                        strokeWidth={3}
                        className="transition-all duration-200 hover:opacity-80"
                      />
                      {/* Hover overlay */}
                      <circle 
                        cx={g.cx} cy={g.cy} r={g.r} 
                        fill="transparent"
                        className="hover:fill-white/20 transition-all duration-200"
                      />
                      {/* Label */}
                      <g transform={`translate(${g.cx}, ${g.cy - g.r - 20})`}>
                        <rect x={-70} y={-16} width={140} height={32} rx={16} fill="white" stroke={g.color.border} strokeWidth={2} />
                        <text x={0} y={0} textAnchor="middle" dominantBaseline="middle" fill={g.color.text} fontSize="12" fontWeight="700">
                          {g.name.length > 16 ? g.name.substring(0, 14) + '...' : g.name}
                        </text>
                      </g>
                      {/* Count badge */}
                      <circle cx={g.cx + 55} cy={g.cy - g.r - 20} r={14} fill={g.color.border} />
                      <text x={g.cx + 55} y={g.cy - g.r - 19} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="11" fontWeight="700">
                        {g.concepts.length}
                      </text>
                      {/* Click hint */}
                      <text x={g.cx} y={g.cy + g.r + 20} textAnchor="middle" fill={g.color.text} fontSize="10" opacity={0.6}>
                        Click to expand
                      </text>
                    </g>
                  ))}


                  {/* Connections */}
                  {currentConnections.map((conn, i) => {
                    const f = getConceptByLabel(conn.from);
                    const t = getConceptByLabel(conn.to);
                    if (!f || !t) return null;
                    
                    const hl = isHighlighted(conn);
                    const col = expandedGroup ? currentColor : getColor(f.groupId);
                  
                  return (
                      <g key={i}>
                        {/* Glow effect for better visibility */}
                        {expandedGroup && (
                          <line x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                            stroke={col.border}
                            strokeWidth={hl ? 8 : 6}
                            strokeOpacity={0.15}
                        strokeLinecap="round"
                          />
                        )}
                        <line x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                          stroke={hl ? col.line : col.border}
                          strokeWidth={hl ? 4 : expandedGroup ? 3 : 2}
                          strokeOpacity={hl ? 1 : expandedGroup ? 0.7 : 0.4}
                          strokeLinecap="round"
                        />
                      </g>
                    );
                  })}

                  {/* Concept bubbles */}
                  {concepts.map((c) => {
                    const sel = selectedConcept?.id === c.id;
                    const hov = hoveredConcept === c.label;
                    const rel = selectedConcept ? getRelatedConnections(selectedConcept.label).some(x => x.from === c.label || x.to === c.label) : false;
                    const col = expandedGroup ? currentColor : getColor(c.groupId);
                    const act = sel || hov;
                    const dim = selectedConcept && !sel && !rel;
                    
                    const words = c.label.split(/[\s-]+/);
                    let l1 = c.label, l2 = '';
                    const maxLen = expandedGroup ? 14 : 11;
                    if (c.label.length > maxLen && words.length >= 2) {
                      const m = Math.ceil(words.length / 2);
                      l1 = words.slice(0, m).join(' ');
                      l2 = words.slice(m).join(' ');
                    }
                    const fs = expandedGroup ? (c.size > 90 ? 13 : 12) : (c.size > 65 ? 11 : 10);
                    
                    return (
                      <g key={c.id} className="cursor-pointer" style={{ opacity: dim ? 0.2 : 1, transition: 'opacity 0.15s' }}
                        onClick={(e) => { e.stopPropagation(); setSelectedConcept(sel ? null : c); }}
                        onMouseEnter={() => setHoveredConcept(c.label)}
                        onMouseLeave={() => setHoveredConcept(null)}>
                        
                        {(act || rel) && <circle cx={c.x} cy={c.y} r={c.size / 2 + 6} fill="none" stroke={col.line} strokeWidth={3} strokeOpacity={0.8} />}
                        
                        <circle cx={c.x} cy={c.y} r={c.size / 2} fill={col.bgSolid} stroke={col.border} strokeWidth={2.5}
                          style={{ filter: act ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                        
                        {l2 ? (
                          <>
                            <text x={c.x} y={c.y - 7} textAnchor="middle" dominantBaseline="middle" fill={col.text} fontSize={fs} fontWeight="600" className="pointer-events-none">{l1}</text>
                            <text x={c.x} y={c.y + 9} textAnchor="middle" dominantBaseline="middle" fill={col.text} fontSize={fs} fontWeight="600" className="pointer-events-none">{l2}</text>
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

            {/* Expanded view title card */}
            {expandedGroup && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
                <div 
                  className="px-8 py-4 rounded-2xl shadow-xl border-2 text-center"
                    style={{
                    backgroundColor: 'white',
                    borderColor: currentColor.border,
                  }}
                >
                  <h2 
                    className="text-3xl font-bold mb-1"
                    style={{ color: currentColor.text }}
                  >
                    {expandedGroup.name}
                  </h2>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: currentColor.border }}
                  >
                    {expandedGroup.concepts.length} concepts · {currentConnections.length} connections
                  </p>
                      </div>
                    </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-lg border border-gray-200 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Move className="w-3 h-3" /> Drag</span>
                <span className="text-gray-300">|</span>
                <span>Scroll to zoom</span>
                {!expandedGroup && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-blue-600 font-medium">Click a note circle to expand</span>
                  </>
                    )}
                  </div>
            </div>

            {/* Legend - only in overview */}
            {!expandedGroup && (
              <div className="absolute bottom-16 left-4 z-20">
                <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 p-3 max-w-[220px]">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Notes</p>
                  <div className="space-y-1.5">
                    {groups.map((g) => (
                      <button 
                        key={g.id} 
                        className="flex items-center gap-2 w-full text-left hover:bg-gray-50 rounded p-1 -m-1 transition-colors"
                        onClick={() => handleGroupClick(g)}
                      >
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: g.color.bgSolid, border: `2px solid ${g.color.border}` }} />
                        <span className="text-xs text-gray-700 truncate flex-1">{g.name}</span>
                        <span className="text-xs text-gray-400">{g.concepts.length}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Detail Panel */}
            {selectedConcept && (
              <div className="absolute top-16 right-4 z-40 w-80">
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b-2" style={{ backgroundColor: getColor(selectedConcept.groupId).bgSolid, borderColor: getColor(selectedConcept.groupId).border }}>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase mb-1" style={{ color: getColor(selectedConcept.groupId).text }}>
                          {groups.find(g => g.noteId === selectedConcept.noteId)?.name}
                        </p>
                        <h3 className="text-lg font-bold text-gray-800">{selectedConcept.label}</h3>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedConcept(null)}><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                    {getRelatedConnections(selectedConcept.label).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Link2 className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm font-semibold text-gray-700">Connections</span>
                        </div>
                        <div className="space-y-2">
                          {getRelatedConnections(selectedConcept.label).map((conn, i) => {
                            const other = conn.from === selectedConcept.label ? conn.to : conn.from;
                            const col = getColor(selectedConcept.groupId);
                            return (
                              <div key={i} className="p-2.5 rounded-lg" style={{ backgroundColor: col.bg }}>
                                <div className="flex items-center gap-2">
                                  <ArrowRight className="w-3 h-3" style={{ color: col.text }} />
                                  <span className="text-sm font-semibold" style={{ color: col.text }}>{other}</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 pl-5">{conn.explanation}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-semibold text-gray-700">Source</span>
                      </div>
                      <Link to="/notes">
                        <div className="p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <p className="text-sm font-medium text-gray-700">{groups.find(g => g.noteId === selectedConcept.noteId)?.name}</p>
                          <p className="text-xs text-gray-500">View note →</p>
                              </div>
                            </Link>
                      </div>

                    <div className="flex gap-2">
                      <Link to="/review" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs"><RefreshCw className="w-3 h-3 mr-1" />Review</Button>
                      </Link>
                      <Link to="/notes" className="flex-1">
                        <Button size="sm" className="w-full text-xs text-white" style={{ backgroundColor: getColor(selectedConcept.groupId).line }}>
                          <PenLine className="w-3 h-3 mr-1" />Edit Note
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
