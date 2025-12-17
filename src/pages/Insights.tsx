import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, FileText, Network, RefreshCw, BarChart3, Settings, 
  ArrowLeft, TrendingUp, AlertCircle, Sparkles, Loader2, 
  Send, Heart, Brain, Target, PenLine
} from "lucide-react";
import { generateInsights } from "@/lib/openai";

const sidebarItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: FileText, label: "Notes", path: "/notes" },
  { icon: Network, label: "Concept Map", path: "/concept-map" },
  { icon: RefreshCw, label: "Review", path: "/review" },
  { icon: BarChart3, label: "Insights", path: "/insights", active: true },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface ConceptProgress {
  name: string;
  strength: number;
  lastReviewed: string;
}

interface AIInsights {
  summary: string;
  strengths: string[];
  focusAreas: string[];
  encouragement: string;
}

// Get data from localStorage
const getStoredConcepts = (): string[] => {
  const stored = localStorage.getItem("neuranoteConcepts");
  return stored ? JSON.parse(stored) : [];
};

const getStoredReflections = (): string[] => {
  const stored = localStorage.getItem("neuranoteReflections");
  return stored ? JSON.parse(stored) : [];
};

const saveReflections = (reflections: string[]) => {
  localStorage.setItem("neuranoteReflections", JSON.stringify(reflections));
};

const getStoredNotes = () => {
  const stored = localStorage.getItem("neuranoteNotes");
  return stored ? JSON.parse(stored) : [];
};

const Insights = () => {
  const [concepts, setConcepts] = useState<string[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [reflection, setReflection] = useState("");
  const [savedReflections, setSavedReflections] = useState<string[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isSavingReflection, setIsSavingReflection] = useState(false);

  useEffect(() => {
    setConcepts(getStoredConcepts());
    setNotes(getStoredNotes());
    setSavedReflections(getStoredReflections());
  }, []);

  useEffect(() => {
    if (concepts.length > 0) {
      loadInsights();
    }
  }, [concepts.length]);

  const loadInsights = async () => {
    setIsLoadingInsights(true);
    try {
      // Create concept progress from stored concepts
      const conceptProgress: ConceptProgress[] = concepts.map((name, i) => ({
        name,
        strength: Math.floor(50 + Math.random() * 50), // Simulated strength
        lastReviewed: i < 2 ? "Today" : i < 4 ? "Yesterday" : "This week",
      }));
      
      const insights = await generateInsights(conceptProgress, savedReflections);
      setAiInsights(insights);
    } catch (error) {
      console.error("Error loading insights:", error);
      setAiInsights({
        summary: "You're making steady progress on your learning journey! Keep up the great work.",
        strengths: ["Consistent note-taking", "Curious mindset", "Building connections"],
        focusAreas: ["Continue exploring new concepts"],
        encouragement: "Every concept you master builds a stronger foundation. Keep going!",
      });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleSaveReflection = async () => {
    if (!reflection.trim()) return;
    
    setIsSavingReflection(true);
    const updatedReflections = [...savedReflections, reflection];
    setSavedReflections(updatedReflections);
    saveReflections(updatedReflections);
    setReflection("");
    
    // Regenerate insights with new reflection
    if (concepts.length > 0) {
      try {
        const conceptProgress: ConceptProgress[] = concepts.map((name, i) => ({
          name,
          strength: Math.floor(50 + Math.random() * 50),
          lastReviewed: i < 2 ? "Today" : i < 4 ? "Yesterday" : "This week",
        }));
        const insights = await generateInsights(conceptProgress, updatedReflections);
        setAiInsights(insights);
      } catch (error) {
        console.error("Error updating insights:", error);
      }
    }
    setIsSavingReflection(false);
  };

  const hasContent = concepts.length > 0 || notes.length > 0;

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
          <h1 className="text-3xl font-semibold text-foreground mb-2">Insights & Reflection</h1>
          <p className="text-muted-foreground mb-8">Understanding your learning journey</p>

          {!hasContent ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                No insights yet
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                Create some notes and extract concepts to start seeing insights about your learning journey.
              </p>
              <Link to="/notes">
                <Button variant="hero">
                  <PenLine className="w-4 h-4 mr-2" />
                  Start Taking Notes
                </Button>
              </Link>

              {/* Reflection Section for Empty State */}
              <div className="mt-12 max-w-md mx-auto">
                <div className="p-5 bg-card rounded-3xl border border-border/50 shadow-soft text-left">
                  <h3 className="text-sm font-medium text-foreground mb-4">Start Your Reflection Practice</h3>
                  <p className="text-foreground italic text-sm mb-4">
                    "What are you curious to learn about?"
                  </p>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    className="w-full p-4 bg-muted/30 rounded-2xl border-none resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground text-sm"
                    rows={3}
                    placeholder="Write about what interests you..."
                  />
                  <Button 
                    variant="soft" 
                    className="w-full mt-3"
                    onClick={handleSaveReflection}
                    disabled={!reflection.trim() || isSavingReflection}
                  >
                    {isSavingReflection ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Save Reflection
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Concept Progress */}
              <div className="lg:col-span-2 space-y-6">
                {/* AI Insights Card */}
                <section className="p-6 bg-gradient-to-br from-primary/10 to-lavender/10 rounded-3xl border border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-medium text-foreground">AI Learning Coach</h2>
                  </div>
                  
                  {isLoadingInsights ? (
                    <div className="flex items-center gap-3 py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-muted-foreground">Analyzing your learning patterns...</span>
                    </div>
                  ) : aiInsights ? (
                    <div className="space-y-4">
                      <p className="text-foreground">{aiInsights.summary}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-3 bg-sage/10 rounded-2xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-sage" />
                            <span className="text-sm font-medium text-foreground">Strengths</span>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {aiInsights.strengths.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-3 bg-lavender/10 rounded-2xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-lavender" />
                            <span className="text-sm font-medium text-foreground">Focus Areas</span>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {aiInsights.focusAreas.map((f, i) => (
                              <li key={i}>• {f}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blush/10 rounded-2xl flex items-start gap-2">
                        <Heart className="w-4 h-4 text-blush mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-foreground italic">{aiInsights.encouragement}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Add more notes to get personalized insights!</p>
                  )}
                </section>

                {/* Concepts Overview */}
                {concepts.length > 0 && (
                  <>
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-sage" />
                        <h2 className="text-lg font-medium text-foreground">Your Concepts</h2>
                      </div>
                      <div className="space-y-3">
                        {concepts.slice(0, 5).map((concept, i) => (
                          <div
                            key={concept}
                            className="p-4 bg-sage/10 rounded-2xl border border-sage/20 flex items-center justify-between"
                          >
                            <div>
                              <span className="text-foreground font-medium">{concept}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-sage/20 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-sage rounded-full transition-all duration-500"
                                  style={{ width: `${50 + i * 10}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        {concepts.length > 5 && (
                          <p className="text-sm text-muted-foreground text-center">
                            +{concepts.length - 5} more concepts
                          </p>
                        )}
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-blush" />
                        <h2 className="text-lg font-medium text-foreground">Ready for Review</h2>
                      </div>
                      <div className="p-4 bg-blush/10 rounded-2xl border border-blush/20 flex items-center justify-between">
                        <div>
                          <span className="text-foreground font-medium">{concepts.length} concepts available</span>
                          <p className="text-sm text-muted-foreground">Practice makes progress!</p>
                        </div>
                        <Link to="/review">
                          <Button variant="ghost" size="sm" className="text-blush hover:text-blush">
                            Start Review →
                          </Button>
                        </Link>
                      </div>
                    </section>
                  </>
                )}
              </div>

              {/* Right Column - Reflection */}
              <div className="space-y-6">
                {/* Stats */}
                <section className="p-5 bg-card rounded-3xl border border-border/50 shadow-soft">
                  <h3 className="text-sm font-medium text-foreground mb-4">Your Progress</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-semibold text-primary">{concepts.length}</div>
                      <div className="text-xs text-muted-foreground">Concepts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-semibold text-sage">{notes.length}</div>
                      <div className="text-xs text-muted-foreground">Notes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-semibold text-lavender">{savedReflections.length}</div>
                      <div className="text-xs text-muted-foreground">Reflections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-semibold text-blush">1</div>
                      <div className="text-xs text-muted-foreground">Day streak</div>
                    </div>
                  </div>
                </section>

                {/* Weekly Reflection */}
                <section className="p-5 bg-card rounded-3xl border border-border/50 shadow-soft">
                  <h3 className="text-sm font-medium text-foreground mb-4">Weekly Reflection</h3>
                  <p className="text-foreground italic text-sm mb-4">
                    "What connections did you notice between concepts this week?"
                  </p>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    className="w-full p-4 bg-muted/30 rounded-2xl border-none resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground text-sm"
                    rows={4}
                    placeholder="Take a moment to reflect on your learning journey..."
                  />
                  <Button 
                    variant="soft" 
                    className="w-full mt-3"
                    onClick={handleSaveReflection}
                    disabled={!reflection.trim() || isSavingReflection}
                  >
                    {isSavingReflection ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Save & Update Insights
                  </Button>
                </section>

                {/* Past Reflections */}
                {savedReflections.length > 0 && (
                  <section className="p-5 bg-card/50 rounded-3xl border border-border/30">
                    <h3 className="text-sm font-medium text-foreground mb-3">Past Reflections</h3>
                    <div className="space-y-3">
                      {savedReflections.slice(-3).map((r, i) => (
                        <div key={i} className="p-3 bg-muted/30 rounded-xl">
                          <p className="text-sm text-muted-foreground line-clamp-3">{r}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Motivation */}
                <div className="p-4 bg-accent/30 rounded-2xl border border-accent/50">
                  <p className="text-sm text-muted-foreground text-center">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    "Learning is not about being perfect. It's about being curious."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Insights;
