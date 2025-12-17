import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, X, Sparkles, FileText, 
  Network, RefreshCw, BarChart3, Rocket, ArrowRight
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetPage?: string;
  position: "center" | "bottom-right" | "bottom-left";
  highlightSelector?: string;
  action?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to NeuraNote! 🎉",
    description: "I'll walk you through the app. Watch for the highlighted areas!",
    icon: <Sparkles className="w-5 h-5 text-primary" />,
    position: "center",
    targetPage: "/dashboard",
  },
  {
    id: 2,
    title: "Your Navigation",
    description: "Use the sidebar to move between sections. Each icon takes you to a different feature.",
    icon: <ArrowRight className="w-5 h-5 text-primary" />,
    position: "bottom-right",
    targetPage: "/dashboard",
    highlightSelector: "sidebar",
    action: "← Look at the sidebar",
  },
  {
    id: 3,
    title: "Notes - Start Here",
    description: "Click 'Notes' in the sidebar to capture your thoughts. This is where learning begins!",
    icon: <FileText className="w-5 h-5 text-lavender" />,
    position: "bottom-right",
    targetPage: "/dashboard",
    highlightSelector: "notes-link",
    action: "← Click 'Notes' to continue",
  },
  {
    id: 4,
    title: "Create Your First Note",
    description: "Click the 'New Note' button to start writing. AI will help extract key concepts!",
    icon: <FileText className="w-5 h-5 text-lavender" />,
    position: "bottom-left",
    targetPage: "/notes",
    highlightSelector: "new-note-btn",
    action: "↑ Click 'New Note'",
  },
  {
    id: 5,
    title: "Concept Map",
    description: "Your concepts appear here as connected bubbles. AI discovers relationships between ideas!",
    icon: <Network className="w-5 h-5 text-sage" />,
    position: "bottom-right",
    targetPage: "/concept-map",
    action: "Explore your knowledge visually",
  },
  {
    id: 6,
    title: "Review & Practice",
    description: "Test yourself with AI-generated questions. Active recall strengthens memory!",
    icon: <RefreshCw className="w-5 h-5 text-blush" />,
    position: "bottom-right",
    targetPage: "/review",
    action: "Practice makes progress",
  },
  {
    id: 7,
    title: "Track Progress",
    description: "See insights about your learning journey and reflect on your growth.",
    icon: <BarChart3 className="w-5 h-5 text-primary" />,
    position: "bottom-right",
    targetPage: "/insights",
    action: "Monitor your progress",
  },
  {
    id: 8,
    title: "You're Ready! 🚀",
    description: "Start by creating your first note about something you're learning!",
    icon: <Rocket className="w-5 h-5 text-primary" />,
    position: "center",
    targetPage: "/notes",
  },
];

interface TutorialProps {
  onComplete: () => void;
}

export const Tutorial = ({ onComplete }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  // Navigate to the correct page for the current step
  useEffect(() => {
    if (step.targetPage && location.pathname !== step.targetPage) {
      navigate(step.targetPage);
    }
  }, [currentStep, step.targetPage, location.pathname, navigate]);

  // Add highlight classes to elements
  useEffect(() => {
    // Remove previous highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight', 'tutorial-pulse');
    });

    // Add new highlight based on selector
    if (step.highlightSelector) {
      setTimeout(() => {
        let element: Element | null = null;
        
        if (step.highlightSelector === "sidebar") {
          element = document.querySelector('aside');
        } else if (step.highlightSelector === "notes-link") {
          element = document.querySelector('a[href="/notes"]');
        } else if (step.highlightSelector === "new-note-btn") {
          element = document.querySelector('button:has(.lucide-plus)') || 
                   document.querySelector('[class*="hero"]');
        }

        if (element) {
          element.classList.add('tutorial-highlight', 'tutorial-pulse');
        }
      }, 100);
    }

    return () => {
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight', 'tutorial-pulse');
      });
    };
  }, [currentStep, step.highlightSelector, location.pathname]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  }, [isLastStep, currentStep]);

  const handleComplete = () => {
    localStorage.setItem("neuranoteTutorialComplete", "true");
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight', 'tutorial-pulse');
    });
    onComplete();
    navigate("/notes");
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleComplete();
      } else if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext]);

  const getTooltipPosition = () => {
    switch (step.position) {
      case "center":
        return "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case "bottom-right":
        return "fixed bottom-6 right-6";
      case "bottom-left":
        return "fixed bottom-6 left-72";
      default:
        return "fixed bottom-6 right-6";
    }
  };

  return (
    <>
      {/* CSS for highlights */}
      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 50 !important;
          box-shadow: 0 0 0 4px hsl(var(--primary) / 0.4), 0 0 20px 8px hsl(var(--primary) / 0.2) !important;
          border-radius: 16px;
        }
        .tutorial-pulse {
          animation: tutorial-pulse 2s ease-in-out infinite;
        }
        @keyframes tutorial-pulse {
          0%, 100% { box-shadow: 0 0 0 4px hsl(var(--primary) / 0.4), 0 0 20px 8px hsl(var(--primary) / 0.2); }
          50% { box-shadow: 0 0 0 6px hsl(var(--primary) / 0.6), 0 0 30px 12px hsl(var(--primary) / 0.3); }
        }
      `}</style>

      {/* Tutorial Card - floating, doesn't block UI */}
      <div className={`${getTooltipPosition()} z-[100] w-full max-w-sm px-4 pointer-events-auto`}>
        <div className="bg-card rounded-2xl border border-primary/30 shadow-xl overflow-hidden animate-fade-up">
          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Header with icon */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-foreground mb-1">
                  {step.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Action hint */}
            {step.action && (
              <div className="mb-4 p-2 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-primary text-center">
                  {step.action}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {currentStep + 1} of {tutorialSteps.length}
                </span>
                <div className="flex gap-1">
                  {tutorialSteps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all ${
                        i === currentStep 
                          ? "bg-primary w-4" 
                          : i < currentStep 
                            ? "bg-primary/50 w-1" 
                            : "bg-muted w-1"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleComplete}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                >
                  Skip
                </button>
                <Button variant="hero" size="sm" onClick={handleNext}>
                  {isLastStep ? "Start" : "Next"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-xs text-muted-foreground/50 mt-2">
          Press Enter or → to continue • Esc to skip
        </p>
      </div>
    </>
  );
};

// Hook to check if tutorial should be shown
export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tutorialComplete = localStorage.getItem("neuranoteTutorialComplete");
    setShowTutorial(!tutorialComplete);
    setIsLoading(false);
  }, []);

  const resetTutorial = () => {
    localStorage.removeItem("neuranoteTutorialComplete");
    setShowTutorial(true);
  };

  const completeTutorial = () => {
    setShowTutorial(false);
  };

  return { showTutorial, isLoading, resetTutorial, completeTutorial };
};
