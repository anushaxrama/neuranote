import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trash2, HelpCircle, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

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
    <div className="min-h-screen bg-[#FDFCFA] flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="gradient-blob gradient-blob-coral blob-float absolute"
            style={{ width: '400px', height: '400px', top: '-10%', right: '20%' }}
          />
          <div 
            className="gradient-blob gradient-blob-purple blob-float-delayed absolute"
            style={{ width: '300px', height: '300px', bottom: '20%', left: '10%' }}
          />
        </div>

        <div className="relative z-10 p-8 lg:p-12">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-10 animate-fade-up">
              <p className="font-display-italic text-lg text-muted-foreground mb-2">
                Personalize your experience
              </p>
              <h1 className="text-4xl font-medium text-foreground tracking-tight">Settings</h1>
            </div>

            <div className="space-y-8 stagger-children">
              {/* Tutorial & Help */}
              <section>
                <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-violet-500" />
                  Help & Tutorial
                </h2>
                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-foreground font-medium">App Tutorial</p>
                        <p className="text-sm text-muted-foreground">Learn how to use NeuraNote step by step</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="rounded-full"
                      onClick={restartTutorial}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restart Tutorial
                    </Button>
                  </div>
                </div>
              </section>

              {/* Preferences */}
              <section>
                <h2 className="text-lg font-medium text-foreground mb-4">Preferences</h2>
                <div className="space-y-3">
                  {settings.map((option) => (
                    <div
                      key={option.id}
                      className="glass rounded-2xl p-5 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-foreground font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <button
                        onClick={() => toggleSetting(option.id)}
                        className={`w-14 h-8 rounded-full transition-all duration-300 ${
                          option.enabled 
                            ? "bg-gradient-to-r from-violet-400 to-violet-500" 
                            : "bg-muted"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            option.enabled ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Learning Style */}
              <section>
                <h2 className="text-lg font-medium text-foreground mb-4">Learning Style</h2>
                <div className="glass rounded-3xl p-6">
                  <p className="text-muted-foreground mb-5 font-display-italic">
                    How do you prefer to learn? This helps us tailor your experience.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: "Visual", color: "bubble-pink" },
                      { name: "Reading", color: "bubble-blue" },
                      { name: "Hands-on", color: "bubble-green" },
                      { name: "Mixed", color: "bubble-purple" },
                    ].map((style, i) => (
                      <button
                        key={style.name}
                        className={`p-4 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.02] ${
                          i === 3 ? style.color + ' ring-2 ring-violet-300' : 'bg-white/50 border border-border/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Data Management */}
              <section>
                <h2 className="text-lg font-medium text-foreground mb-4">Data Management</h2>
                <div className="glass rounded-3xl p-6 border-2 border-red-100">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <p className="text-foreground font-medium">Clear All Data</p>
                        <p className="text-sm text-muted-foreground">Delete all notes, concepts, and reflections</p>
                      </div>
                    </div>
                    {!showClearConfirm ? (
                      <Button 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => setShowClearConfirm(true)}
                      >
                        Clear Data
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="rounded-full"
                          onClick={() => setShowClearConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
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

            {/* Footer */}
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground font-display-italic">
                <Sparkles className="w-4 h-4 inline mr-2 text-violet-400" />
                NeuraNote • AI-powered learning
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppSettings;
