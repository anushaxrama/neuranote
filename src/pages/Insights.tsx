import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, AlertCircle, Sparkles, Loader2, 
  Send, Heart, Brain, Target, PenLine, BarChart3
} from "lucide-react";
import { generateInsights } from "@/lib/openai";
import { Sidebar } from "@/components/Sidebar";

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
      const conceptProgress: ConceptProgress[] = concepts.map((name, i) => ({
        name,
        strength: Math.floor(50 + Math.random() * 50),
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
    <div className="min-h-screen bg-[#FDFCFA] flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="gradient-blob gradient-blob-pink blob-float absolute"
            style={{ width: '450px', height: '450px', top: '0%', right: '5%' }}
          />
          <div 
            className="gradient-blob gradient-blob-purple blob-float-delayed absolute"
            style={{ width: '350px', height: '350px', bottom: '20%', left: '10%' }}
          />
          <div 
            className="gradient-blob gradient-blob-mint blob-float-slow absolute"
            style={{ width: '300px', height: '300px', top: '50%', right: '30%' }}
          />
        </div>

        <div className="relative z-10 p-8 lg:p-12">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-10 animate-fade-up">
              <p className="font-display-italic text-lg text-muted-foreground mb-2">
                Your learning journey
              </p>
              <h1 className="text-4xl font-medium text-foreground tracking-tight">
                Insights
              </h1>
            </div>

            {!hasContent ? (
              /* Empty State */
              <div className="text-center py-20 animate-fade-up">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center mx-auto mb-8">
                  <BarChart3 className="w-12 h-12 text-violet-600" />
                </div>
                <p className="font-display-italic text-lg text-muted-foreground mb-3">
                  Discover patterns
                </p>
                <h2 className="text-3xl font-medium text-foreground mb-4">
                  No Insights<br />
                  <span className="font-display-italic">Yet</span>
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                  Create some notes and extract concepts to start seeing insights about your learning journey.
                </p>
                <Link to="/notes">
                  <Button className="btn-primary">
                    <PenLine className="w-4 h-4 mr-2" />
                    Start Taking Notes
                  </Button>
                </Link>

                {/* Reflection Section for Empty State */}
                <div className="mt-14 max-w-md mx-auto">
                  <div className="glass rounded-3xl p-8 text-left">
                    <h3 className="text-sm font-medium text-foreground mb-4">Start Your Reflection Practice</h3>
                    <p className="text-foreground font-display-italic text-sm mb-4">
                      "What are you curious to learn about?"
                    </p>
                    <textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      className="w-full p-4 bg-white/50 rounded-2xl border border-border/50 resize-none focus:outline-none focus:ring-2 focus:ring-violet-200 text-foreground text-sm leading-relaxed"
                      rows={3}
                      placeholder="Write about what interests you..."
                    />
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 rounded-full"
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger-children">
                {/* Left Column - Concept Progress */}
                <div className="lg:col-span-2 space-y-8">
                  {/* AI Insights Card */}
                  <section className="glass rounded-3xl p-8 shadow-elevated">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-medium text-foreground">AI Learning Coach</h2>
                        <p className="text-sm text-muted-foreground">Personalized insights</p>
                      </div>
                    </div>
                    
                    {isLoadingInsights ? (
                      <div className="flex items-center gap-3 py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                        <span className="text-muted-foreground">Analyzing your learning patterns...</span>
                      </div>
                    ) : aiInsights ? (
                      <div className="space-y-6">
                        <p className="text-foreground leading-relaxed">{aiInsights.summary}</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                            <div className="flex items-center gap-2 mb-3">
                              <Target className="w-5 h-5 text-emerald-600" />
                              <span className="font-medium text-foreground">Strengths</span>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-2">
                              {aiInsights.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-emerald-500">•</span>
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-5 bg-violet-50/80 rounded-2xl border border-violet-200">
                            <div className="flex items-center gap-2 mb-3">
                              <Brain className="w-5 h-5 text-violet-600" />
                              <span className="font-medium text-foreground">Focus Areas</span>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-2">
                              {aiInsights.focusAreas.map((f, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-violet-500">•</span>
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="p-5 bg-pink-50/80 rounded-2xl border border-pink-200 flex items-start gap-3">
                          <Heart className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                          <p className="text-foreground font-display-italic">{aiInsights.encouragement}</p>
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
                        <div className="flex items-center gap-3 mb-6">
                          <TrendingUp className="w-5 h-5 text-emerald-500" />
                          <h2 className="text-xl font-medium text-foreground">Your Concepts</h2>
                        </div>
                        <div className="space-y-3">
                          {concepts.slice(0, 5).map((concept, i) => (
                            <div
                              key={concept}
                              className="glass rounded-2xl p-5 flex items-center justify-between"
                            >
                              <span className={`px-4 py-1.5 text-sm font-medium rounded-full
                                ${i % 4 === 0 ? 'bubble-blue' : ''}
                                ${i % 4 === 1 ? 'bubble-green' : ''}
                                ${i % 4 === 2 ? 'bubble-pink' : ''}
                                ${i % 4 === 3 ? 'bubble-purple' : ''}
                              `}>
                                {concept}
                              </span>
                              <div className="flex items-center gap-3">
                                <div className="w-32 h-2.5 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${50 + i * 10}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground w-10">{50 + i * 10}%</span>
                              </div>
                            </div>
                          ))}
                          {concepts.length > 5 && (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              +{concepts.length - 5} more concepts
                            </p>
                          )}
                        </div>
                      </section>

                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <AlertCircle className="w-5 h-5 text-pink-500" />
                          <h2 className="text-xl font-medium text-foreground">Ready for Review</h2>
                        </div>
                        <div className="glass rounded-2xl p-6 flex items-center justify-between border-2 border-pink-100">
                          <div>
                            <span className="text-lg font-medium text-foreground">{concepts.length} concepts available</span>
                            <p className="text-sm text-muted-foreground mt-1">Practice makes progress!</p>
                          </div>
                          <Link to="/review">
                            <Button className="btn-primary">
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
                  <section className="glass rounded-3xl p-6 shadow-soft">
                    <h3 className="font-display-italic text-muted-foreground mb-6">Your Progress</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-medium text-foreground">{concepts.length}</div>
                        <div className="text-sm text-muted-foreground mt-1">Concepts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-medium text-foreground">{notes.length}</div>
                        <div className="text-sm text-muted-foreground mt-1">Notes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-medium text-foreground">{savedReflections.length}</div>
                        <div className="text-sm text-muted-foreground mt-1">Reflections</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-medium text-foreground">1</div>
                        <div className="text-sm text-muted-foreground mt-1">Day streak</div>
                      </div>
                    </div>
                  </section>

                  {/* Weekly Reflection */}
                  <section className="glass rounded-3xl p-6 shadow-soft">
                    <h3 className="font-medium text-foreground mb-4">Weekly Reflection</h3>
                    <p className="text-foreground font-display-italic text-sm mb-4">
                      "What connections did you notice between concepts this week?"
                    </p>
                    <textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      className="w-full p-4 bg-white/50 rounded-2xl border border-border/50 resize-none focus:outline-none focus:ring-2 focus:ring-violet-200 text-foreground text-sm leading-relaxed"
                      rows={4}
                      placeholder="Take a moment to reflect..."
                    />
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 rounded-full"
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
                    <section className="glass rounded-3xl p-6">
                      <h3 className="font-medium text-foreground mb-4">Past Reflections</h3>
                      <div className="space-y-3">
                        {savedReflections.slice(-3).map((r, i) => (
                          <div key={i} className="p-4 bg-white/50 rounded-xl border border-border/30">
                            <p className="text-sm text-muted-foreground line-clamp-3">{r}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Motivation */}
                  <div className="glass rounded-2xl p-5 text-center">
                    <p className="text-sm text-muted-foreground font-display-italic">
                      <Sparkles className="w-4 h-4 inline mr-2 text-violet-400" />
                      "Learning is not about being perfect. It's about being curious."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Insights;
