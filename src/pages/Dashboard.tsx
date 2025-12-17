import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FileText, Network, RefreshCw, BarChart3, Settings, ArrowLeft } from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Home", path: "/dashboard", active: true },
  { icon: FileText, label: "Notes", path: "/notes" },
  { icon: Network, label: "Concept Map", path: "/concept-map" },
  { icon: RefreshCw, label: "Review", path: "/review" },
  { icon: BarChart3, label: "Insights", path: "/insights" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card/50 border-r border-border/50 p-6">
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

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">What would help you right now?</p>

          {/* Needs Review */}
          <section className="mb-8">
            <h2 className="text-lg font-medium text-foreground mb-4">Needs Review Today</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {["Cognitive Load Theory", "Spaced Repetition", "Active Recall"].map((concept) => (
                <div
                  key={concept}
                  className="p-6 bg-card rounded-3xl border border-border/50 shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/50 mb-4" />
                  <h3 className="font-medium text-foreground mb-1">{concept}</h3>
                  <p className="text-sm text-muted-foreground">Ready for a quick revisit</p>
                </div>
              ))}
            </div>
          </section>

          {/* Memory Strength */}
          <section className="mb-8">
            <h2 className="text-lg font-medium text-foreground mb-4">Memory Strength Overview</h2>
            <div className="p-6 bg-card rounded-3xl border border-border/50 shadow-soft">
              <div className="flex items-center gap-8">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-muted" />
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "conic-gradient(hsl(var(--primary)) 0% 72%, transparent 72% 100%)",
                      mask: "radial-gradient(transparent 60%, black 60%)",
                    }}
                  />
                </div>
                <div>
                  <p className="text-foreground font-medium">Looking good!</p>
                  <p className="text-sm text-muted-foreground">Most concepts feel comfortable</p>
                </div>
              </div>
            </div>
          </section>

          {/* Recently Active */}
          <section>
            <h2 className="text-lg font-medium text-foreground mb-4">Recently Active Concepts</h2>
            <div className="space-y-3">
              {["Metacognition", "Chunking", "Interleaving"].map((concept) => (
                <div
                  key={concept}
                  className="flex items-center gap-4 p-4 bg-card/50 rounded-2xl border border-border/30 hover:bg-card transition-all duration-300 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary/50" />
                  <span className="text-foreground">{concept}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
