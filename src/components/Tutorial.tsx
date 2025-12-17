import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, X, Sparkles, FileText, 
  Network, RefreshCw, BarChart3, Rocket
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetPage: string;
  elementSelector: string | null;
  arrowDirection: "left" | "right" | "up" | "down" | "none";
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to NeuraNote! 🎉",
    description: "Let me show you around! I'll highlight each feature step by step.",
    icon: <Sparkles className="w-5 h-5 text-primary" />,
    targetPage: "/dashboard",
    elementSelector: null,
    arrowDirection: "none",
  },
  {
    id: 2,
    title: "This is your Sidebar",
    description: "Navigate between different sections of the app using these menu items.",
    icon: <Sparkles className="w-5 h-5 text-primary" />,
    targetPage: "/dashboard",
    elementSelector: "[data-tutorial='sidebar']",
    arrowDirection: "left",
  },
  {
    id: 3,
    title: "📝 Notes",
    description: "Start here! Write notes about what you're learning. AI will extract key concepts automatically.",
    icon: <FileText className="w-5 h-5 text-lavender" />,
    targetPage: "/dashboard",
    elementSelector: "[data-tutorial='nav-notes']",
    arrowDirection: "left",
  },
  {
    id: 4,
    title: "Create a New Note",
    description: "Click this button to write your first note. Try writing about something you're curious about!",
    icon: <FileText className="w-5 h-5 text-lavender" />,
    targetPage: "/notes",
    elementSelector: "[data-tutorial='new-note']",
    arrowDirection: "down",
  },
  {
    id: 5,
    title: "🗺️ Concept Map",
    description: "See your concepts as connected bubbles! AI discovers relationships between your ideas.",
    icon: <Network className="w-5 h-5 text-sage" />,
    targetPage: "/notes",
    elementSelector: "[data-tutorial='nav-concept-map']",
    arrowDirection: "left",
  },
  {
    id: 6,
    title: "🔄 Review",
    description: "Practice active recall with AI-generated questions. Get feedback on your explanations!",
    icon: <RefreshCw className="w-5 h-5 text-blush" />,
    targetPage: "/notes",
    elementSelector: "[data-tutorial='nav-review']",
    arrowDirection: "left",
  },
  {
    id: 7,
    title: "📊 Insights",
    description: "Track your learning progress and reflect on your journey.",
    icon: <BarChart3 className="w-5 h-5 text-primary" />,
    targetPage: "/notes",
    elementSelector: "[data-tutorial='nav-insights']",
    arrowDirection: "left",
  },
  {
    id: 8,
    title: "You're all set! 🚀",
    description: "Start by creating your first note. Write about anything you want to learn!",
    icon: <Rocket className="w-5 h-5 text-primary" />,
    targetPage: "/notes",
    elementSelector: null,
    arrowDirection: "none",
  },
];

interface TutorialProps {
  onComplete: () => void;
}

export const Tutorial = ({ onComplete }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const [isPositioned, setIsPositioned] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  // Navigate to the correct page
  useEffect(() => {
    if (step.targetPage && location.pathname !== step.targetPage) {
      navigate(step.targetPage);
    }
  }, [currentStep, step.targetPage, location.pathname, navigate]);

  // Position tooltip relative to highlighted element
  useEffect(() => {
    setIsPositioned(false);
    
    const positionTooltip = () => {
      if (!step.elementSelector) {
        // Center the tooltip if no element to highlight
        setTooltipPosition({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 175,
        });
        setElementRect(null);
        setIsPositioned(true);
        return;
      }

      const element = document.querySelector(step.elementSelector);
      if (!element) {
        // Retry after a short delay if element not found
        setTimeout(positionTooltip, 200);
        return;
      }

      const rect = element.getBoundingClientRect();
      setElementRect(rect);

      const tooltipWidth = 350;
      const tooltipHeight = 200;
      const padding = 20;

      let top = 0;
      let left = 0;

      switch (step.arrowDirection) {
        case "left":
          // Tooltip on the right of element
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + padding;
          break;
        case "right":
          // Tooltip on the left of element
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - padding;
          break;
        case "up":
          // Tooltip below element
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "down":
          // Tooltip above element
          top = rect.top - tooltipHeight - padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        default:
          top = window.innerHeight / 2 - 100;
          left = window.innerWidth / 2 - 175;
      }

      // Keep tooltip in viewport
      top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20));
      left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));

      setTooltipPosition({ top, left });
      setIsPositioned(true);
    };

    // Wait for page to render
    const timer = setTimeout(positionTooltip, 300);
    return () => clearTimeout(timer);
  }, [currentStep, step.elementSelector, step.arrowDirection, location.pathname]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  }, [isLastStep, currentStep]);

  const handleComplete = () => {
    localStorage.setItem("neuranoteTutorialComplete", "true");
    onComplete();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleComplete();
      } else if (e.key === "Enter" || e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" && currentStep > 0) {
        e.preventDefault();
        setCurrentStep(currentStep - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, currentStep]);

  // Arrow SVG component
  const Arrow = () => {
    if (!elementRect || step.arrowDirection === "none") return null;

    const arrowSize = 60;
    let arrowStyle: React.CSSProperties = {
      position: "fixed",
      zIndex: 9998,
      pointerEvents: "none",
    };

    // Calculate arrow position based on direction
    switch (step.arrowDirection) {
      case "left":
        arrowStyle = {
          ...arrowStyle,
          top: elementRect.top + elementRect.height / 2 - arrowSize / 2,
          left: elementRect.right + 5,
        };
        return (
          <div style={arrowStyle} className="animate-bounce-horizontal">
            <svg width={arrowSize} height={arrowSize} viewBox="0 0 60 60">
              <path
                d="M5 30 L45 30 M35 20 L45 30 L35 40"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case "right":
        arrowStyle = {
          ...arrowStyle,
          top: elementRect.top + elementRect.height / 2 - arrowSize / 2,
          left: elementRect.left - arrowSize - 5,
        };
        return (
          <div style={arrowStyle} className="animate-bounce-horizontal">
            <svg width={arrowSize} height={arrowSize} viewBox="0 0 60 60">
              <path
                d="M55 30 L15 30 M25 20 L15 30 L25 40"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case "down":
        arrowStyle = {
          ...arrowStyle,
          top: elementRect.top - arrowSize - 5,
          left: elementRect.left + elementRect.width / 2 - arrowSize / 2,
        };
        return (
          <div style={arrowStyle} className="animate-bounce">
            <svg width={arrowSize} height={arrowSize} viewBox="0 0 60 60">
              <path
                d="M30 5 L30 45 M20 35 L30 45 L40 35"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case "up":
        arrowStyle = {
          ...arrowStyle,
          top: elementRect.bottom + 5,
          left: elementRect.left + elementRect.width / 2 - arrowSize / 2,
        };
        return (
          <div style={arrowStyle} className="animate-bounce">
            <svg width={arrowSize} height={arrowSize} viewBox="0 0 60 60">
              <path
                d="M30 55 L30 15 M20 25 L30 15 L40 25"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
    }
    return null;
  };

  if (!isPositioned) return null;

  return (
    <>
      {/* Styles */}
      <style>{`
        @keyframes bounce-horizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(10px); }
        }
        .animate-bounce-horizontal {
          animation: bounce-horizontal 1s ease-in-out infinite;
        }
        [data-tutorial-highlight="true"] {
          position: relative;
          z-index: 9997 !important;
          outline: 3px solid hsl(var(--primary)) !important;
          outline-offset: 4px !important;
          border-radius: 12px;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 30px 10px hsl(var(--primary) / 0.4) !important;
        }
      `}</style>

      {/* Backdrop */}
      {step.elementSelector && elementRect && (
        <div 
          className="fixed inset-0 z-[9996] pointer-events-none"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          {/* Cutout for highlighted element */}
          <div
            className="absolute bg-transparent"
            style={{
              top: elementRect.top - 8,
              left: elementRect.left - 8,
              width: elementRect.width + 16,
              height: elementRect.height + 16,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
              borderRadius: "16px",
            }}
          />
        </div>
      )}

      {/* Highlight ring around element */}
      {elementRect && (
        <div
          className="fixed z-[9997] pointer-events-none rounded-2xl animate-pulse"
          style={{
            top: elementRect.top - 6,
            left: elementRect.left - 6,
            width: elementRect.width + 12,
            height: elementRect.height + 12,
            border: "3px solid hsl(var(--primary))",
            boxShadow: "0 0 20px 5px hsl(var(--primary) / 0.5)",
          }}
        />
      )}

      {/* Arrow pointing to element */}
      <Arrow />

      {/* Tutorial Card */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] w-[350px] pointer-events-auto"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <div className="bg-card rounded-2xl border-2 border-primary/50 shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1.5 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                {step.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground mb-1">
                  {step.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              <button
                onClick={handleComplete}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button variant="hero" size="sm" onClick={handleNext}>
                  {isLastStep ? "Get Started!" : "Next"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
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
