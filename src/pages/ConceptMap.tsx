import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FileText, Network, RefreshCw, BarChart3, Settings, ArrowLeft, ZoomIn, ZoomOut } from "lucide-react";
import { FloatingBubbles } from "@/components/FloatingBubbles";

const sidebarItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: FileText, label: "Notes", path: "/notes" },
  { icon: Network, label: "Concept Map", path: "/concept-map", active: true },
  { icon: RefreshCw, label: "Review", path: "/review" },
  { icon: BarChart3, label: "Insights", path: "/insights" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const concepts = [
  { id: 1, label: "Memory", x: 50, y: 40, size: 100, opacity: 0.9 },
  { id: 2, label: "Spacing", x: 30, y: 25, size: 70, opacity: 0.7 },
  { id: 3, label: "Retrieval", x: 70, y: 30, size: 80, opacity: 0.8 },
  { id: 4, label: "Chunking", x: 25, y: 55, size: 60, opacity: 0.6 },
  { id: 5, label: "Learning", x: 65, y: 60, size: 75, opacity: 0.75 },
  { id: 6, label: "Metacognition", x: 45, y: 70, size: 65, opacity: 0.65 },
];

const ConceptMap = () => {
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
          <Button variant="soft" size="icon" className="rounded-xl">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="soft" size="icon" className="rounded-xl">
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Concept Bubbles */}
        <div className="absolute inset-0">
          {concepts.map((concept) => (
            <div
              key={concept.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 hover:scale-110"
              style={{
                left: `${concept.x}%`,
                top: `${concept.y}%`,
              }}
            >
              <div
                className="rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center shadow-glow hover:shadow-elevated transition-all duration-300"
                style={{
                  width: concept.size,
                  height: concept.size,
                  opacity: concept.opacity,
                }}
              >
                <span className="text-foreground font-medium text-sm">{concept.label}</span>
              </div>
            </div>
          ))}

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line x1="50%" y1="40%" x2="30%" y2="25%" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" />
            <line x1="50%" y1="40%" x2="70%" y2="30%" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" />
            <line x1="50%" y1="40%" x2="25%" y2="55%" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" />
            <line x1="50%" y1="40%" x2="65%" y2="60%" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" />
            <line x1="50%" y1="40%" x2="45%" y2="70%" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" />
          </svg>
        </div>

        {/* Help text */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <p className="text-sm text-muted-foreground/60 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full">
            Click on a concept to explore • Drag to rearrange
          </p>
        </div>
      </main>
    </div>
  );
};

export default ConceptMap;
