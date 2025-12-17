import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, FileText, Network, RefreshCw, BarChart3, Settings, 
  ArrowLeft, ZoomIn, ZoomOut, Sparkles, Loader2, X 
} from "lucide-react";
import { FloatingBubbles } from "@/components/FloatingBubbles";
import { suggestConnections } from "@/lib/openai";

const sidebarItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: FileText, label: "Notes", path: "/notes" },
  { icon: Network, label: "Concept Map", path: "/concept-map", active: true },
  { icon: RefreshCw, label: "Review", path: "/review" },
  { icon: BarChart3, label: "Insights", path: "/insights" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface Concept {
  id: number;
  label: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

interface Connection {
  from: string;
  to: string;
  explanation: string;
}

const initialConcepts: Concept[] = [
  { id: 1, label: "Memory", x: 50, y: 40, size: 100, opacity: 0.9 },
  { id: 2, label: "Spacing", x: 30, y: 25, size: 70, opacity: 0.7 },
  { id: 3, label: "Retrieval", x: 70, y: 30, size: 80, opacity: 0.8 },
  { id: 4, label: "Chunking", x: 25, y: 55, size: 60, opacity: 0.6 },
  { id: 5, label: "Learning", x: 65, y: 60, size: 75, opacity: 0.75 },
  { id: 6, label: "Metacognition", x: 45, y: 70, size: 65, opacity: 0.65 },
];

const ConceptMap = () => {
  const [concepts] = useState<Concept[]>(initialConcepts);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [aiConnections, setAiConnections] = useState<Connection[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [hoveredConnection, setHoveredConnection] = useState<Connection | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setIsLoadingConnections(true);
    try {
      const conceptLabels = initialConcepts.map(c => c.label);
      const connections = await suggestConnections(conceptLabels);
      setAiConnections(connections);
    } catch (error) {
      console.error("Error loading connections:", error);
      // Fallback connections
      setAiConnections([
        { from: "Memory", to: "Spacing", explanation: "Spaced practice strengthens long-term memory formation" },
        { from: "Memory", to: "Retrieval", explanation: "Active retrieval reinforces memory pathways" },
        { from: "Memory", to: "Chunking", explanation: "Chunking helps manage working memory capacity" },
        { from: "Learning", to: "Metacognition", explanation: "Self-awareness improves learning strategies" },
        { from: "Spacing", to: "Learning", explanation: "Distributed practice optimizes learning efficiency" },
      ]);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  const getConceptPosition = (label: string) => {
    const concept = concepts.find(c => c.label === label);
    return concept ? { x: concept.x, y: concept.y } : null;
  };

  const handleConceptClick = (concept: Concept) => {
    setSelectedConcept(selectedConcept?.id === concept.id ? null : concept);
  };

  const getRelatedConnections = (conceptLabel: string) => {
    return aiConnections.filter(
      conn => conn.from === conceptLabel || conn.to === conceptLabel
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card/50 border-r border-border/50 p-6 z-20">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-primary/60" />
          </div>
          <span className="text-lg font-medium text-foreground">NeuraNote</span>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                item.active
                  ? "bg-primary/10 text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content - Full Canvas */}
      <main className="flex-1 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-lavender opacity-50" />
        <FloatingBubbles />
        
        {/* Zoom controls */}
        <div className="absolute top-6 right-6 z-20 flex gap-2">
          <Button 
            variant="soft" 
            size="icon" 
            className="rounded-xl"
            onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button 
            variant="soft" 
            size="icon" 
            className="rounded-xl"
            onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>

        {/* AI Status */}
        <div className="absolute top-6 left-6 z-20">
          {isLoadingConnections ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-card/80 backdrop-blur-sm rounded-full text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              AI discovering connections...
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-card/80 backdrop-blur-sm rounded-full text-sm text-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              {aiConnections.length} AI-discovered connections
            </div>
          )}
        </div>

        {/* Concept Bubbles */}
        <div 
          className="absolute inset-0 transition-transform duration-300"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {aiConnections.map((conn, i) => {
              const from = getConceptPosition(conn.from);
              const to = getConceptPosition(conn.to);
              if (!from || !to) return null;
              
              const isHighlighted = 
                selectedConcept?.label === conn.from || 
                selectedConcept?.label === conn.to ||
                hoveredConnection === conn;
              
              return (
                <line
                  key={i}
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke={isHighlighted ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.2)"}
                  strokeWidth={isHighlighted ? 2 : 1}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {concepts.map((concept) => {
            const isSelected = selectedConcept?.id === concept.id;
            const hasConnection = selectedConcept 
              ? getRelatedConnections(selectedConcept.label).some(
                  c => c.from === concept.label || c.to === concept.label
                )
              : false;
            
            return (
              <div
                key={concept.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 
                  ${isSelected ? 'scale-125 z-10' : hasConnection ? 'scale-110' : 'hover:scale-110'}`}
                style={{
                  left: `${concept.x}%`,
                  top: `${concept.y}%`,
                }}
                onClick={() => handleConceptClick(concept)}
              >
                <div
                  className={`rounded-full backdrop-blur-sm border flex items-center justify-center transition-all duration-300
                    ${isSelected 
                      ? 'bg-primary/40 border-primary shadow-glow' 
                      : hasConnection
                        ? 'bg-primary/30 border-primary/50 shadow-elevated'
                        : 'bg-primary/20 border-primary/30 shadow-glow hover:shadow-elevated'
                    }`}
                  style={{
                    width: concept.size,
                    height: concept.size,
                    opacity: isSelected || hasConnection ? 1 : concept.opacity,
                  }}
                >
                  <span className={`font-medium text-sm ${isSelected ? 'text-foreground' : 'text-foreground'}`}>
                    {concept.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Concept Panel */}
        {selectedConcept && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
            <div className="bg-card/95 backdrop-blur-md rounded-2xl border border-border/50 shadow-elevated p-5 animate-fade-up">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {selectedConcept.label}
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setSelectedConcept(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                AI-discovered connections for this concept:
              </p>
              
              <div className="space-y-2">
                {getRelatedConnections(selectedConcept.label).map((conn, i) => {
                  const otherConcept = conn.from === selectedConcept.label ? conn.to : conn.from;
                  return (
                    <div 
                      key={i}
                      className="p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                      onMouseEnter={() => setHoveredConnection(conn)}
                      onMouseLeave={() => setHoveredConnection(null)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-primary">{otherConcept}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{conn.explanation}</p>
                    </div>
                  );
                })}
                
                {getRelatedConnections(selectedConcept.label).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No connections discovered yet
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Help text */}
        {!selectedConcept && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <p className="text-sm text-muted-foreground/60 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full">
              Click on a concept to explore AI-discovered connections
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ConceptMap;
