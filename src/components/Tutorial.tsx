import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, X, Sparkles, FileText, 
  Network, RefreshCw, BarChart3, Rocket, MousePointer2
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  targetPage?: string;
  position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "left" | "right";
  action?: string;
  highlightArea?: { top: string; left: string; width: string; height: string };
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to NeuraNote! 🎉",
    description: "Let me walk you through the app. I'll show you exactly where to click!",
    icon: <Sparkles className="w-6 h-6 text-primary" />,
    position: "center",
  },
  {
    id: 2,
    title: "This is your Sidebar",
    description: "Navigate between different sections of the app from here. Let's start with Notes!",
    icon: <MousePointer2 className="w-6 h-6 text-primary" />,
    position: "left",
    highlightArea: { top: "120px", left: "0", width: "256px", height: "280px" },
    action: "Look at the sidebar on the left",
  },
  {
    id: 3,
    title: "Click on Notes",
    description: "This is where you'll capture your thoughts and ideas. AI will help extract key concepts!",
    icon: <FileText className="w-6 h-6 text-lavender" />,
    targetPage: "/notes",
    position: "left",
    highlightArea: { top: "168px", left: "16px", width: "224px", height: "48px" },
    action: "Click 'Notes' in the sidebar",
  },
  {
    id: 4,
    title: "Create a New Note",
    description: "Click this button to start writing. Try writing about something you're learning!",
    icon: <FileText className="w-6 h-6 text-lavender" />,
    targetPage: "/notes",
    position: "top-right",
    highlightArea: { top: "32px", left: "calc(100% - 180px)", width: "150px", height: "50px" },
    action: "Click 'New Note' button",
  },
  {
    id: 5,
    title: "Concept Map",
    description: "Once you have notes with concepts, they'll appear here as connected bubbles!",
    icon: <Network className="w-6 h-6 text-sage" />,
    targetPage: "/concept-map",
    position: "left",
    highlightArea: { top: "216px", left: "16px", width: "224px", height: "48px" },
    action: "Click 'Concept Map' to see your ideas visualized",
  },
  {
    id: 6,
    title: "Review Sessions",
    description: "Practice active recall here! AI generates questions from your concepts.",
    icon: <RefreshCw className="w-6 h-6 text-blush" />,
    targetPage: "/review",
    position: "left",
    highlightArea: { top: "264px", left: "16px", width: "224px", height: "48px" },
    action: "Click 'Review' to practice recall",
  },
  {
    id: 7,
    title: "Track Your Progress",
    description: "See insights about your learning journey and reflect on your growth.",
    icon: <BarChart3 className="w-6 h-6 text-primary" />,
    targetPage: "/insights",
    position: "left",
    highlightArea: { top: "312px", left: "16px", width: "224px", height: "48px" },
    action: "Click 'Insights' for analytics",
  },
  {
    id: 8,
    title: "You're Ready! 🚀",
    description: "Start by creating your first note. Write about anything you're curious about!",
    icon: <Rocket className="w-6 h-6 text-primary" />,
    targetPage: "/notes",
    position: "center",
    action: "Let's create your first note!",
  },
];

interface TutorialProps {
  onComplete: () => void;
}

export const Tutorial = ({ onComplete }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
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

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  }, [isLastStep, currentStep]);

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("neuranoteTutorialComplete", "true");
    onComplete();
    navigate("/notes");
  };

  const handleSkip = () => {
    handleComplete();
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext]);

  if (!isVisible) return null;

  const getTooltipPosition = () => {
    switch (step.position) {
      case "center":
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case "left":
        return "top-1/2 left-[300px] -translate-y-1/2";
      case "right":
        return "top-1/2 right-[100px] -translate-y-1/2";
      case "top-left":
        return "top-[100px] left-[300px]";
      case "top-right":
        return "top-[100px] right-[100px]";
      case "bottom-left":
        return "bottom-[100px] left-[300px]";
      case "bottom-right":
        return "bottom-[100px] right-[100px]";
      default:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay with cutout */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm">
        {/* Spotlight cutout */}
        {step.highlightArea && (
          <div
            className="absolute rounded-2xl transition-all duration-500 ease-out"
            style={{
              top: step.highlightArea.top,
              left: step.highlightArea.left,
              width: step.highlightArea.width,
              height: step.highlightArea.height,
              boxShadow: `
                0 0 0 9999px rgba(0, 0, 0, 0.75),
                0 0 30px 10px hsl(var(--primary) / 0.3),
                inset 0 0 20px 5px hsl(var(--primary) / 0.1)
              `,
              border: "2px solid hsl(var(--primary) / 0.5)",
            }}
          />
        )}
      </div>

      {/* Pulsing arrow pointer */}
      {step.highlightArea && (
        <div
          className="absolute z-[101] animate-bounce"
          style={{
            top: `calc(${step.highlightArea.top} + ${step.highlightArea.height} / 2 - 20px)`,
            left: `calc(${step.highlightArea.left} + ${step.highlightArea.width} + 20px)`,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg animate-pulse">
              <MousePointer2 className="w-4 h-4 text-primary-foreground -rotate-45" />
            </div>
            <span className="text-sm font-medium text-primary bg-card/90 px-3 py-1 rounded-full shadow-lg">
              {step.action || "Click here"}
            </span>
          </div>
        </div>
      )}

      {/* Tutorial Card */}
      <div className={`absolute ${getTooltipPosition()} z-[102] w-full max-w-sm px-4`}>
        <div className="bg-card rounded-3xl border border-border shadow-elevated overflow-hidden animate-fade-up">
          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Header with icon */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                {step.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {step.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Step counter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1.5">
                {tutorialSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentStep 
                        ? "bg-primary w-6" 
                        : i < currentStep 
                          ? "bg-primary/50 w-1.5" 
                          : "bg-muted w-1.5"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {currentStep + 1} / {tutorialSteps.length}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tutorial
              </button>
              <Button variant="hero" size="sm" onClick={handleNext}>
                {isLastStep ? (
                  <>
                    Get Started
                    <Rocket className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-xs text-muted-foreground/60 mt-3">
          Press <kbd className="px-1.5 py-0.5 bg-card rounded text-xs border">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-card rounded text-xs border">→</kbd> to continue
        </p>
      </div>

      {/* Skip button (always visible) */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 z-[103] p-2 bg-card/80 backdrop-blur-sm rounded-full text-muted-foreground hover:text-foreground transition-colors border border-border/50"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
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
