import { useState, useEffect, useMemo } from "react";
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
  x: number;
  y: number;
  radius: number;
  color: GroupColor;
}

interface GroupColor {
  bg: string;
  bgSolid: string;
  border: string;
  text: string;
  textDark: string;
  line: string;
}

// Distinct, soft pastel colors for group zones - like the reference image
const groupColors: GroupColor[] = [
  { 
    bg: 'rgba(251, 207, 232, 0.5)', // pink
    bgSolid: '#fce7f3',
    border: '#f9a8d4',
    text: '#be185d',
    textDark: '#9d174d',
    line: '#ec4899',
  },
  { 
    bg: 'rgba(209, 250, 229, 0.5)', // green
    bgSolid: '#d1fae5',
    border: '#6ee7b7',
    text: '#047857',
    textDark: '#065f46',
    line: '#10b981',
  },
  { 
    bg: 'rgba(221, 214, 254, 0.5)', // violet
    bgSolid: '#ede9fe',
    border: '#a78bfa',
    text: '#6d28d9',
    textDark: '#5b21b6',
    line: '#8b5cf6',
  },
  { 
    bg: 'rgba(254, 243, 199, 0.5)', // amber
    bgSolid: '#fef3c7',
    border: '#fcd34d',
    text: '#b45309',
    textDark: '#92400e',
    line: '#f59e0b',
  },
  { 
    bg: 'rgba(207, 250, 254, 0.5)', // cyan
    bgSolid: '#cffafe',
    border: '#67e8f9',
    text: '#0e7490',
    textDark: '#155e75',
    line: '#06b6d4',
  },
  { 
    bg: 'rgba(254, 215, 170, 0.5)', // orange
    bgSolid: '#fed7aa',
    border: '#fdba74',
    text: '#c2410c',
    textDark: '#9a3412',
    line: '#f97316',
  },
  { 
    bg: 'rgba(191, 219, 254, 0.5)', // blue
    bgSolid: '#dbeafe',
    border: '#93c5fd',
    text: '#1d4ed8',
    textDark: '#1e40af',
    line: '#3b82f6',
  },
  { 
    bg: 'rgba(233, 213, 255, 0.5)', // purple
    bgSolid: '#f3e8ff',
    border: '#d8b4fe',
    text: '#7e22ce',
    textDark: '#6b21a8',
    line: '#a855f7',
  },
];

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

// Group concepts by which note they came from (concepts from same note are grouped)
const groupConceptsByNote = (conceptLabels: string[], notes: any[]): ConceptGroup[] => {
  const groups: ConceptGroup[] = [];
  const assigned = new Set<string>();
  
  // First, group by note origin
  notes.forEach((note, noteIdx) => {
    const noteConcepts = (note.concepts || []).filter((c: string) => 
      conceptLabels.includes(c) && !assigned.has(c)
    );
    
    if (noteConcepts.length === 0) return;
    
    noteConcepts.forEach((c: string) => assigned.add(c));
    
    const groupId = groups.length;
    const color = groupColors[groupId % groupColors.length];
    
    // Position groups in a circular layout around center
    const totalGroups = Math.max(notes.filter(n => (n.concepts || []).length > 0).length, 1);
    const angle = (groupId / totalGroups) * 2 * Math.PI - Math.PI / 2;
    const radius = totalGroups > 1 ? 30 : 0;
    
    groups.push({
      id: groupId,
      name: note.title || `Topic ${groupId + 1}`,
      concepts: noteConcepts,
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
      radius: Math.max(15, 10 + noteConcepts.length * 4),
      color,
    });
  });
  
  // Add any unassigned concepts to an "Other" group
  const unassigned = conceptLabels.filter(c => !assigned.has(c));
  if (unassigned.length > 0) {
    const groupId = groups.length;
    const color = groupColors[groupId % groupColors.length];
    const angle = (groupId / (groups.length + 1)) * 2 * Math.PI - Math.PI / 2;
    
    groups.push({
      id: groupId,
      name: "Other Concepts",
      concepts: unassigned,
      x: 50 + Math.cos(angle) * 30,
      y: 50 + Math.sin(angle) * 30,
      radius: Math.max(15, 10 + unassigned.length * 4),
      color,
    });
  }
  
  return groups;
};

// Position concepts within their group zones
const positionConceptsInGroups = (groups: ConceptGroup[], notes: any[]): Concept[] => {
  const concepts: Concept[] = [];
  
  // Count occurrences for sizing
  const conceptCounts: Record<string, number> = {};
  notes.forEach(note => {
    (note.concepts || []).forEach((c: string) => {
      conceptCounts[c] = (conceptCounts[c] || 0) + 1;
    });
  });
  
  groups.forEach(group => {
    const numConcepts = group.concepts.length;
    
    group.concepts.forEach((label, idx) => {
      // Position concepts in a circular pattern within the group
      const angle = (idx / numConcepts) * 2 * Math.PI - Math.PI / 2;
      const conceptRadius = numConcepts > 1 ? group.radius * 0.5 : 0;
      
      const x = group.x + Math.cos(angle) * conceptRadius;
      const y = group.y + Math.sin(angle) * conceptRadius;
      
      // Size based on frequency
      const count = conceptCounts[label] || 1;
      const size = Math.min(70, 40 + count * 6);
      
      concepts.push({
        id: concepts.length + 1,
        label,
        x: Math.max(8, Math.min(92, x)),
        y: Math.max(8, Math.min(92, y)),
        size,
        groupId: group.id,
        noteCount: count,
      });
    });
  });
  
  return concepts;
};

const ConceptMap = () => {
  const [storedConcepts, setStoredConcepts] = useState<string[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ConceptGroup | null>(null);
  const [aiConnections, setAiConnections] = useState<Connection[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [hoveredConnection, setHoveredConnection] = useState<Connection | null>(null);

  useEffect(() => {
    setStoredConcepts(getStoredConcepts());
    setNotes(getStoredNotes());
  }, []);

  // Group concepts by note
  const groups = useMemo(() => 
    groupConceptsByNote(storedConcepts, notes), 
    [storedConcepts, notes]
  );

  const concepts = useMemo(() => 
    positionConceptsInGroups(groups, notes), 
    [groups, notes]
  );

  useEffect(() => {
    if (storedConcepts.length >= 2) {
      loadConnections();
    }
  }, [storedConcepts]);

  const loadConnections = async () => {
    if (storedConcepts.length < 2) return;
    
    setIsLoadingConnections(true);
    try {
      const connections = await suggestConnections(storedConcepts);
      const enhancedConnections = connections.map((conn, i) => ({
        ...conn,
        strength: 0.5 + (0.5 * (1 - i / connections.length))
      }));
      setAiConnections(enhancedConnections);
    } catch (error) {
      console.error("Error loading connections:", error);
      const fallbackConnections: Connection[] = [];
      for (let i = 0; i < Math.min(storedConcepts.length - 1, 6); i++) {
        fallbackConnections.push({
          from: storedConcepts[i],
          to: storedConcepts[(i + 1) % storedConcepts.length],
          explanation: `These concepts share underlying principles.`,
          strength: 0.7,
        });
      }
      setAiConnections(fallbackConnections);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  const getConceptPosition = (label: string) => {
    const concept = concepts.find(c => c.label === label);
    return concept ? { x: concept.x, y: concept.y } : null;
  };

  const getRelatedConnections = (conceptLabel: string) => {
    return aiConnections.filter(
      conn => conn.from === conceptLabel || conn.to === conceptLabel
    );
  };

  const getRelatedNotes = (conceptLabel: string): NoteInfo[] => {
    return notes
      .filter(note => (note.concepts || []).includes(conceptLabel))
      .map(note => ({
        title: note.title,
        excerpt: note.content?.substring(0, 100) + '...' || '',
      }));
  };

  const getGroupForConcept = (label: string) => {
    const concept = concepts.find(c => c.label === label);
    return concept ? concept.groupId : 0;
  };

  const getConceptColor = (concept: Concept) => {
    return groupColors[concept.groupId % groupColors.length];
  };

  // Get main topic from notes
  const mainTopic = useMemo(() => {
    if (notes.length === 0) return "Your Knowledge";
    // Find most common words or use first note title
    return "Your Learning Topics";
  }, [notes]);

  return (
    <div className="min-h-screen bg-[#FDFCFA] flex">
      <Sidebar />

      <main className="flex-1 relative overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, hsl(0 0% 98%), hsl(0 0% 96%))',
            }}
          />
        </div>

        {storedConcepts.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center z-10 p-8">
            <div className="text-center max-w-lg animate-fade-up">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mx-auto mb-8 shadow-soft">
                <Network className="w-12 h-12 text-emerald-600" />
              </div>
              <p className="font-display-italic text-lg text-muted-foreground mb-3">
                Your knowledge universe
              </p>
              <h2 className="text-3xl font-medium text-foreground mb-4">
                Your Concept Map<br />
                <span className="font-display-italic">Awaits</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Create notes and extract concepts to see them beautifully visualized here. 
                AI will discover the hidden connections between your ideas.
              </p>
              <Link to="/notes">
                <Button className="btn-primary">
                  <PenLine className="w-4 h-4 mr-2" />
                  Create Your First Note
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Main Topic Title - like in reference image */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center animate-fade-up">
              <h1 className="text-2xl font-semibold text-gray-700 tracking-wide uppercase">
                {mainTopic}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {groups.length} topic{groups.length !== 1 ? 's' : ''} • {concepts.length} concepts
              </p>
            </div>

            {/* Controls */}
            <div className="absolute top-6 right-6 z-20 flex gap-2">
              {isLoadingConnections ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full text-sm shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  <span className="text-muted-foreground">Finding connections...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full text-sm shadow-sm">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span className="text-muted-foreground">
                    {aiConnections.length} connections
                  </span>
                </div>
              )}
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-white/80 backdrop-blur border-0 shadow-sm"
                onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-white/80 backdrop-blur border-0 shadow-sm"
                onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-white/80 backdrop-blur border-0 shadow-sm"
                onClick={loadConnections}
                disabled={isLoadingConnections}
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingConnections ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Concept Map Canvas */}
            <div 
              className="absolute inset-0 pt-20"
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.3s ease-out',
              }}
            >
              {/* Group Zones - large colored circles */}
              {groups.map((group) => {
                const isSelected = selectedGroup?.id === group.id;
                
                return (
                  <div
                    key={`group-${group.id}`}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                    style={{
                      left: `${group.x}%`,
                      top: `${group.y}%`,
                      zIndex: isSelected ? 5 : 1,
                    }}
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        setSelectedGroup(isSelected ? null : group);
                        setSelectedConcept(null);
                      }
                    }}
                  >
                    {/* Group background circle */}
                    <div
                      className={`rounded-full transition-all duration-500 cursor-pointer
                        ${isSelected ? 'ring-4 ring-white shadow-xl' : 'hover:shadow-lg'}
                      `}
                      style={{
                        width: `${group.radius * 6}px`,
                        height: `${group.radius * 6}px`,
                        background: group.color.bg,
                        border: `2px solid ${group.color.border}`,
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      }}
                    />
                    
                    {/* Group label */}
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none"
                      style={{ 
                        top: `${group.radius * 3 + 10}px`,
                        color: group.color.textDark,
                      }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                        {group.name}
                      </p>
                      <p className="text-[10px] opacity-70">
                        {group.concepts.length} concept{group.concepts.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Connection Lines between concepts */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>
                <defs>
                  <filter id="line-glow">
                    <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="rgba(139, 92, 246, 0.4)" />
                  </filter>
                </defs>
                
                {/* Inter-group connections */}
                {aiConnections.map((conn, i) => {
                  const from = getConceptPosition(conn.from);
                  const to = getConceptPosition(conn.to);
                  if (!from || !to) return null;
                  
                  const fromGroup = getGroupForConcept(conn.from);
                  const toGroup = getGroupForConcept(conn.to);
                  
                  const isHighlighted = 
                    selectedConcept?.label === conn.from || 
                    selectedConcept?.label === conn.to ||
                    hoveredConnection === conn;
                  
                  // Curved path
                  const midX = (from.x + to.x) / 2;
                  const midY = (from.y + to.y) / 2;
                  const dx = to.x - from.x;
                  const dy = to.y - from.y;
                  const curve = fromGroup !== toGroup ? 0.25 : 0.1;
                  const ctrlX = midX - dy * curve;
                  const ctrlY = midY + dx * curve;
                  
                  // Use group color for same-group, purple for cross-group
                  const lineColor = fromGroup === toGroup 
                    ? groupColors[fromGroup % groupColors.length].line
                    : '#8b5cf6';
                  
                  return (
                    <g key={`conn-${i}`}>
                      <path
                        d={`M ${from.x}% ${from.y}% Q ${ctrlX}% ${ctrlY}% ${to.x}% ${to.y}%`}
                        fill="none"
                        stroke={lineColor}
                        strokeWidth={isHighlighted ? 3 : 1.5}
                        strokeOpacity={isHighlighted ? 0.9 : 0.4}
                        strokeLinecap="round"
                        strokeDasharray={fromGroup !== toGroup ? "5 3" : "none"}
                        filter={isHighlighted ? "url(#line-glow)" : "none"}
                        className="transition-all duration-300"
                      />
                      {isHighlighted && (
                        <circle
                          cx={`${ctrlX}%`}
                          cy={`${ctrlY}%`}
                          r="4"
                          fill={lineColor}
                          className="animate-pulse"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Concept Bubbles - smaller circles inside groups */}
              {concepts.map((concept) => {
                const isSelected = selectedConcept?.id === concept.id;
                const hasConnection = selectedConcept 
                  ? getRelatedConnections(selectedConcept.label).some(
                      c => c.from === concept.label || c.to === concept.label
                    )
                  : false;
                const color = getConceptColor(concept);
                
                return (
                  <div
                    key={concept.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out
                      ${isSelected ? 'z-30 scale-110' : hasConnection ? 'z-20 scale-105' : 'z-10 hover:scale-110 hover:z-20'}
                    `}
                    style={{
                      left: `${concept.x}%`,
                      top: `${concept.y}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedConcept(isSelected ? null : concept);
                      setSelectedGroup(null);
                    }}
                  >
                    {/* Concept bubble */}
                    <div
                      className={`rounded-full flex items-center justify-center cursor-pointer transition-all duration-300
                        ${isSelected ? 'ring-4 ring-white shadow-xl' : 'shadow-md hover:shadow-lg'}
                        ${hasConnection ? 'ring-2 ring-white/80' : ''}
                      `}
                      style={{
                        width: concept.size,
                        height: concept.size,
                        background: color.bgSolid,
                        border: `2px solid ${color.border}`,
                      }}
                    >
                      <div className="text-center px-2">
                        <span 
                          className="font-medium leading-tight block"
                          style={{ 
                            color: color.textDark,
                            fontSize: concept.size > 50 ? '11px' : '9px',
                          }}
                        >
                          {concept.label}
                        </span>
                      </div>
                    </div>
                    
                    {/* Pulse effect for selected */}
                    {isSelected && (
                      <div 
                        className="absolute inset-0 rounded-full animate-ping opacity-30"
                        style={{ 
                          width: concept.size, 
                          height: concept.size,
                          border: `2px solid ${color.border}`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Concept Detail Panel */}
            {selectedConcept && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 animate-fade-up">
                <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  {/* Header */}
                  <div 
                    className="p-5 border-b"
                    style={{ 
                      backgroundColor: getConceptColor(selectedConcept).bgSolid,
                      borderColor: getConceptColor(selectedConcept).border,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p 
                          className="text-xs font-semibold uppercase tracking-wider mb-1"
                          style={{ color: getConceptColor(selectedConcept).text }}
                        >
                          {groups[selectedConcept.groupId]?.name || 'Concept'}
                        </p>
                        <h3 
                          className="text-xl font-semibold"
                          style={{ color: getConceptColor(selectedConcept).textDark }}
                        >
                          {selectedConcept.label}
                        </h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full -mt-1 -mr-1 hover:bg-white/50"
                        onClick={() => setSelectedConcept(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 space-y-4 max-h-[280px] overflow-y-auto">
                    {/* Connections */}
                    {getRelatedConnections(selectedConcept.label).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Link2 className="w-4 h-4 text-violet-500" />
                          <h4 className="text-sm font-medium text-gray-700">
                            Connected to ({getRelatedConnections(selectedConcept.label).length})
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {getRelatedConnections(selectedConcept.label).slice(0, 4).map((conn, i) => {
                            const otherConcept = conn.from === selectedConcept.label ? conn.to : conn.from;
                            const otherGroupId = getGroupForConcept(otherConcept);
                            const otherColor = groupColors[otherGroupId % groupColors.length];
                            return (
                              <div 
                                key={i}
                                className="p-3 rounded-xl transition-colors cursor-pointer"
                                style={{ backgroundColor: `${otherColor.bg}` }}
                                onMouseEnter={() => setHoveredConnection(conn)}
                                onMouseLeave={() => setHoveredConnection(null)}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <ArrowRight className="w-3 h-3" style={{ color: otherColor.text }} />
                                  <span 
                                    className="text-sm font-medium"
                                    style={{ color: otherColor.textDark }}
                                  >
                                    {otherConcept}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 pl-5">{conn.explanation}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Related Notes */}
                    {getRelatedNotes(selectedConcept.label).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-emerald-500" />
                          <h4 className="text-sm font-medium text-gray-700">
                            From Notes
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {getRelatedNotes(selectedConcept.label).slice(0, 2).map((note, i) => (
                            <Link key={i} to="/notes">
                              <div className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <p className="text-sm font-medium text-gray-700 mb-1">{note.title}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">{note.excerpt}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link to="/review" className="flex-1">
                        <Button variant="outline" className="w-full rounded-xl text-sm" size="sm">
                          <RefreshCw className="w-3 h-3 mr-2" />
                          Review
                        </Button>
                      </Link>
                      <Link to="/notes" className="flex-1">
                        <Button 
                          className="w-full rounded-xl text-sm text-white" 
                          size="sm"
                          style={{ backgroundColor: getConceptColor(selectedConcept).line }}
                        >
                          <PenLine className="w-3 h-3 mr-2" />
                          Add Note
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            {!selectedConcept && groups.length > 0 && (
              <div className="absolute bottom-6 left-6 z-20">
                <div className="bg-white/90 backdrop-blur rounded-xl shadow-sm p-4 max-w-[200px]">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Topics</h4>
                  <div className="space-y-2">
                    {groups.slice(0, 6).map((group) => (
                      <button
                        key={group.id}
                        onClick={() => setSelectedGroup(selectedGroup?.id === group.id ? null : group)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors text-left
                          ${selectedGroup?.id === group.id ? 'bg-gray-100' : 'hover:bg-gray-50'}
                        `}
                      >
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: group.color.border }}
                        />
                        <span className="text-xs text-gray-600 truncate">
                          {group.name}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-auto">
                          {group.concepts.length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Help text */}
            {!selectedConcept && (
              <div className="absolute bottom-6 right-6 z-20">
                <p className="text-xs text-gray-400 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm">
                  Click concepts to explore • Scroll to zoom
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ConceptMap;
