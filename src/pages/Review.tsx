import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FileText, Network, RefreshCw, BarChart3, Settings, ArrowLeft, Eye, EyeOff } from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: FileText, label: "Notes", path: "/notes" },
  { icon: Network, label: "Concept Map", path: "/concept-map" },
  { icon: RefreshCw, label: "Review", path: "/review", active: true },
  { icon: BarChart3, label: "Insights", path: "/insights" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Review = () => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [confidence, setConfidence] = useState(50);

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
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === 1 ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>

          {/* Question Card */}
          <div className="p-8 bg-card rounded-3xl border border-border/50 shadow-soft mb-6">
            <p className="text-sm text-muted-foreground mb-4">Concept: Spaced Repetition</p>
            
            <h2 className="text-2xl font-medium text-foreground mb-8 leading-relaxed">
              How does spacing out your review sessions help with long-term retention?
            </h2>

            {/* Answer area */}
            <div className="min-h-[120px] p-6 bg-muted/30 rounded-2xl mb-6">
              {showAnswer ? (
                <p className="text-foreground leading-relaxed">
                  Spacing forces your brain to work harder to retrieve information each time, 
                  which strengthens the neural pathways. This is more effective than cramming 
                  because it builds stronger, more durable memories.
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  Take your time to think about this. There's no rush.
                </p>
              )}
            </div>

            <Button
              variant="soft"
              className="w-full"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              {showAnswer ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Answer
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Answer
                </>
              )}
            </Button>
          </div>

          {/* Confidence Slider */}
          {showAnswer && (
            <div className="p-6 bg-card/50 rounded-3xl border border-border/30 animate-fade-up">
              <p className="text-sm text-muted-foreground mb-4">How confident do you feel?</p>
              <input
                type="range"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-soft"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Still fuzzy</span>
                <span>Very clear</span>
              </div>
              
              <Button variant="hero" className="w-full mt-6">
                Continue
              </Button>
            </div>
          )}

          {/* Reassurance */}
          <p className="text-center text-sm text-muted-foreground/60 mt-8">
            It's okay to take breaks. Learning is a journey.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Review;
