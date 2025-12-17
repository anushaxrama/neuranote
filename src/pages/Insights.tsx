import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FileText, Network, RefreshCw, BarChart3, Settings, ArrowLeft, TrendingUp, AlertCircle } from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: FileText, label: "Notes", path: "/notes" },
  { icon: Network, label: "Concept Map", path: "/concept-map" },
  { icon: RefreshCw, label: "Review", path: "/review" },
  { icon: BarChart3, label: "Insights", path: "/insights", active: true },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Insights = () => {
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Insights & Reflection</h1>
          <p className="text-muted-foreground mb-8">Understanding your learning journey</p>

          {/* Improving Concepts */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-sage" />
              <h2 className="text-lg font-medium text-foreground">Concepts Improving</h2>
            </div>
            <div className="space-y-3">
              {["Active Recall", "Spaced Repetition", "Interleaving"].map((concept) => (
                <div
                  key={concept}
                  className="p-4 bg-sage/10 rounded-2xl border border-sage/20 flex items-center justify-between"
                >
                  <span className="text-foreground">{concept}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-sage" />
                    ))}
                    <div className="w-2 h-2 rounded-full bg-sage/30" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Needs Clarity */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-blush" />
              <h2 className="text-lg font-medium text-foreground">May Need Clarity</h2>
            </div>
            <div className="space-y-3">
              {["Metacognition", "Cognitive Load"].map((concept) => (
                <div
                  key={concept}
                  className="p-4 bg-blush/10 rounded-2xl border border-blush/20 flex items-center justify-between"
                >
                  <span className="text-foreground">{concept}</span>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    Review now
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              These concepts might still feel fuzzy. A quick review could help solidify them.
            </p>
          </section>

          {/* Weekly Reflection */}
          <section>
            <h2 className="text-lg font-medium text-foreground mb-4">Weekly Reflection</h2>
            <div className="p-6 bg-card rounded-3xl border border-border/50 shadow-soft">
              <p className="text-muted-foreground mb-4">
                This week, you've engaged with 12 concepts and reviewed 8 of them. 
                You seem comfortable with recall techniques, but cognitive load theory 
                might benefit from more exploration.
              </p>
              <p className="text-foreground italic">
                "What connections did you notice between concepts this week?"
              </p>
              <textarea
                className="w-full mt-4 p-4 bg-muted/30 rounded-2xl border-none resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                rows={3}
                placeholder="Take a moment to reflect..."
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Insights;
