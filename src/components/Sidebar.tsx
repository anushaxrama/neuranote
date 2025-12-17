import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FileText, Network, RefreshCw, BarChart3, Settings, ArrowLeft } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard", tutorialId: "nav-home" },
  { icon: FileText, label: "Notes", path: "/notes", tutorialId: "nav-notes" },
  { icon: Network, label: "Concept Map", path: "/concept-map", tutorialId: "nav-concept-map" },
  { icon: RefreshCw, label: "Review", path: "/review", tutorialId: "nav-review" },
  { icon: BarChart3, label: "Insights", path: "/insights", tutorialId: "nav-insights" },
  { icon: Settings, label: "Settings", path: "/settings", tutorialId: "nav-settings" },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside data-tutorial="sidebar" className="w-64 bg-card/50 border-r border-border/50 p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-primary/60" />
        </div>
        <span className="text-lg font-medium text-foreground">NeuraNote</span>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              data-tutorial={item.tutorialId}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "bg-primary/10 text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-8">
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Button>
        </Link>
      </div>
    </aside>
  );
};

