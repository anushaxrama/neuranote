import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, ChevronLeft, X, Sparkles, FileText, 
  Network, RefreshCw, BarChart3, Lightbulb, Rocket
} from "lucide-react";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to NeuraNote! 🎉",
    description: "Your AI-powered learning companion that helps you truly understand and remember what you learn. Let me show you around!",
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    tip: "This quick tour takes about 1 minute",
  },
  {
    id: 2,
    title: "Capture Your Thoughts",
    description: "Start by creating notes about what you're learning. Write in your own words — that's where real understanding begins.",
    icon: <FileText className="w-8 h-8 text-lavender" />,
    tip: "AI will automatically extract key concepts from your notes",
    highlight: "notes",
  },
  {
    id: 3,
    title: "See the Connections",
    description: "Watch your knowledge grow into a beautiful concept map. AI discovers how your ideas connect to each other.",
    icon: <Network className="w-8 h-8 text-sage" />,
    tip: "Click on any concept to explore its relationships",
    highlight: "concept-map",
  },
  {
    id: 4,
    title: "Review & Remember",
    description: "Practice active recall with AI-generated questions. Get gentle, personalized feedback on your explanations.",
    icon: <RefreshCw className="w-8 h-8 text-blush" />,
    tip: "Spaced repetition helps move knowledge to long-term memory",
    highlight: "review",
  },
  {
    id: 5,
    title: "Track Your Journey",
    description: "See your progress, reflect on your learning, and get AI-powered insights about your strengths and growth areas.",
    icon: <BarChart3 className="w-8 h-8 text-primary" />,
    tip: "Regular reflection deepens understanding",
    highlight: "insights",
  },
  {
    id: 6,
    title: "You're All Set!",
    description: "Start by creating your first note. Write about something you're curious about or learning right now.",
    icon: <Rocket className="w-8 h-8 text-primary" />,
    tip: "Remember: there's no wrong way to learn. Just start!",
  },
];

interface TutorialProps {
  onComplete: () => void;
  currentPage?: string;
}

export const Tutorial = ({ onComplete, currentPage }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("neuranoteTutorialComplete", "true");
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Tutorial Card */}
      <div className="relative w-full max-w-lg mx-4 animate-fade-up">
        <div className="bg-card rounded-3xl border border-border/50 shadow-elevated overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              {step.icon}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-semibold text-foreground text-center mb-4">
              {step.title}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-center leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Tip */}
            {step.tip && (
              <div className="flex items-start gap-2 p-4 bg-accent/30 rounded-2xl mb-6">
                <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{step.tip}</p>
              </div>
            )}

            {/* Step indicator */}
            <div className="flex justify-center gap-2 mb-6">
              {tutorialSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentStep 
                      ? "bg-primary w-6" 
                      : i < currentStep 
                        ? "bg-primary/50" 
                        : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={isFirstStep}
                className={isFirstStep ? "invisible" : ""}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <Button variant="hero" onClick={handleNext}>
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

          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Skip text */}
        <p className="text-center text-sm text-muted-foreground/60 mt-4">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> or click X to skip
        </p>
      </div>
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

// Tooltip hints for specific features
interface FeatureHintProps {
  children: React.ReactNode;
  hint: string;
  show?: boolean;
}

export const FeatureHint = ({ children, hint, show = true }: FeatureHintProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-50 animate-bounce">
        <div className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg">
          {hint}
          <button 
            onClick={() => setDismissed(true)}
            className="ml-2 hover:opacity-70"
          >
            ✕
          </button>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary" />
      </div>
    </div>
  );
};

