import { Link, useLocation } from "react-router-dom";
import { Home, FileText, Network, RefreshCw, BarChart3, Settings } from "lucide-react";

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
    <aside 
      data-tutorial="sidebar" 
      className="w-72 bg-white/60 backdrop-blur-xl border-r border-border/30 p-8 flex flex-col min-h-screen"
    >
      {/* Logo - Clickable to go back to landing page */}
      <Link 
        to="/" 
        className="flex items-center gap-3 mb-10 group cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center shadow-soft group-hover:shadow-md transition-shadow">
          <div className="w-4 h-4 rounded-full bg-white/80" />
        </div>
        <div>
          <span className="text-xl font-medium text-foreground tracking-tight block">NeuraNote</span>
          <span className="text-xs text-muted-foreground">← Back to home</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              data-tutorial={item.tutorialId}
              className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "bg-white shadow-soft text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/60"
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-br from-violet-100 to-pink-100"
                  : "bg-transparent group-hover:bg-muted/50"
              }`}>
                <item.icon className={`w-4 h-4 transition-colors ${
                  isActive ? "text-violet-600" : ""
                }`} />
              </div>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-8 border-t border-border/30">
        <p className="text-xs text-muted-foreground/60 px-2">
          AI-powered learning
        </p>
      </div>
    </aside>
  );
};
