import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FileText, Network, RefreshCw, BarChart3, Settings, ArrowLeft, Plus } from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: FileText, label: "Notes", path: "/notes", active: true },
  { icon: Network, label: "Concept Map", path: "/concept-map" },
  { icon: RefreshCw, label: "Review", path: "/review" },
  { icon: BarChart3, label: "Insights", path: "/insights" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Notes = () => {
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">Your Notes</h1>
              <p className="text-muted-foreground">Capture and organize your thoughts</p>
            </div>
            <Button variant="hero">
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>

          {/* Notes Grid */}
          <div className="space-y-4">
            {[
              { title: "Understanding Memory", concepts: 3, updated: "Just now" },
              { title: "Learning Techniques", concepts: 5, updated: "2 hours ago" },
              { title: "Cognitive Psychology Basics", concepts: 8, updated: "Yesterday" },
            ].map((note) => (
              <div
                key={note.title}
                className="p-6 bg-card rounded-3xl border border-border/50 shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer"
              >
                <h3 className="text-lg font-medium text-foreground mb-2">{note.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{note.concepts} concepts</span>
                  <span>•</span>
                  <span>Updated {note.updated}</span>
                </div>
              </div>
            ))}
          </div>

          {/* AI Suggestion */}
          <div className="mt-8 p-6 bg-accent/30 rounded-3xl border border-accent/50">
            <p className="text-sm text-muted-foreground">
              💡 Would you like to explain any of these concepts in your own words? 
              It can help strengthen your understanding.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notes;
