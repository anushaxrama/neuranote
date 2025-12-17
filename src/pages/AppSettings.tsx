import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FileText, Network, RefreshCw, BarChart3, Settings, ArrowLeft, RotateCcw, Trash2, HelpCircle } from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: FileText, label: "Notes", path: "/notes" },
  { icon: Network, label: "Concept Map", path: "/concept-map" },
  { icon: RefreshCw, label: "Review", path: "/review" },
  { icon: BarChart3, label: "Insights", path: "/insights" },
  { icon: Settings, label: "Settings", path: "/settings", active: true },
];

const settingsOptions = [
  { 
    id: "reduce-prompts",
    label: "Reduce AI prompts", 
    description: "Show fewer suggestions while you work",
    enabled: false 
  },
  { 
    id: "focus-mode",
    label: "Focus mode", 
    description: "Minimize distractions during note-taking",
    enabled: true 
  },
  { 
    id: "motion",
    label: "Motion intensity", 
    description: "Adjust animation speeds throughout the app",
    enabled: true 
  },
  { 
    id: "contrast",
    label: "High contrast", 
    description: "Increase visibility for better readability",
    enabled: false 
  },
];

const AppSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(settingsOptions);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const restartTutorial = () => {
    localStorage.removeItem("neuranoteTutorialComplete");
    navigate("/dashboard");
    window.location.reload();
  };

  const clearAllData = () => {
    localStorage.removeItem("neuranoteNotes");
    localStorage.removeItem("neuranoteConcepts");
    localStorage.removeItem("neuranoteReflections");
    localStorage.removeItem("neuranoteTutorialComplete");
    setShowClearConfirm(false);
    navigate("/dashboard");
    window.location.reload();
  };

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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground mb-8">Personalize your experience</p>

          {/* Tutorial & Help */}
          <section className="mb-8">
            <h2 className="text-lg font-medium text-foreground mb-4">Help & Tutorial</h2>
            <div className="p-5 bg-card rounded-2xl border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">App Tutorial</p>
                    <p className="text-sm text-muted-foreground">Learn how to use NeuraNote step by step</p>
                  </div>
                </div>
                <Button variant="soft" onClick={restartTutorial}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart Tutorial
                </Button>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="mb-8">
            <h2 className="text-lg font-medium text-foreground mb-4">Preferences</h2>
            <div className="space-y-4">
              {settings.map((option) => (
                <div
                  key={option.id}
                  className="p-5 bg-card rounded-2xl border border-border/50 flex items-center justify-between"
                >
                  <div>
                    <p className="text-foreground font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <button
                    onClick={() => toggleSetting(option.id)}
                    className={`w-12 h-7 rounded-full transition-all duration-300 ${
                      option.enabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-card shadow-sm transition-transform duration-300 ${
                        option.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Learning Style */}
          <section className="mb-8">
            <h2 className="text-lg font-medium text-foreground mb-4">Learning Style</h2>
            <div className="p-6 bg-card rounded-3xl border border-border/50 shadow-soft">
              <p className="text-muted-foreground mb-4">
                How do you prefer to learn? This helps us tailor your experience.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["Visual", "Reading", "Hands-on", "Mixed"].map((style) => (
                  <button
                    key={style}
                    className="p-4 rounded-2xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-primary/30 transition-all duration-300"
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Data Management */}
          <section>
            <h2 className="text-lg font-medium text-foreground mb-4">Data Management</h2>
            <div className="p-5 bg-card rounded-2xl border border-destructive/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Clear All Data</p>
                    <p className="text-sm text-muted-foreground">Delete all notes, concepts, and reflections</p>
                  </div>
                </div>
                {!showClearConfirm ? (
                  <Button 
                    variant="ghost" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setShowClearConfirm(true)}
                  >
                    Clear Data
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowClearConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={clearAllData}
                    >
                      Confirm Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AppSettings;
