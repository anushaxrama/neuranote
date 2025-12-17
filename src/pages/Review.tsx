import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  FileText, RefreshCw, Sparkles, Loader2, MessageCircle, 
  ChevronRight, CheckCircle2, Lightbulb, Send, BookOpen,
  Eye, EyeOff
} from "lucide-react";
import { generateReviewQuestions, provideFeedback } from "@/lib/openai";
import { Sidebar } from "@/components/Sidebar";

interface ReviewQuestion {
  question: string;
  concept: string;
  hint: string;
}

interface FeedbackResult {
  feedback: string;
  understanding: "strong" | "developing" | "needs_work";
  suggestions: string[];
}

// Get concepts from localStorage
const getStoredConcepts = (): string[] => {
  const stored = localStorage.getItem("neuranoteConcepts");
  return stored ? JSON.parse(stored) : [];
};

const Review = () => {
  const [concepts, setConcepts] = useState<string[]>([]);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [confidence, setConfidence] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedbackResult, setFeedbackResult] = useState<FeedbackResult | null>(null);
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setConcepts(getStoredConcepts());
  }, []);

  const startSession = async () => {
    if (concepts.length === 0) return;
    
    setHasStarted(true);
    setIsLoading(true);
    try {
      const generatedQuestions = await generateReviewQuestions(concepts);
      setQuestions(generatedQuestions);
    } catch (error) {
      console.error("Error loading questions:", error);
      // Fallback to simple questions based on concepts
      setQuestions(concepts.slice(0, 3).map(concept => ({
        question: `How would you explain "${concept}" in your own words?`,
        concept,
        hint: `Think about the key aspects of ${concept} and how it connects to other ideas...`,
      })));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetFeedback = async () => {
    if (!userAnswer.trim()) return;
    
    setIsGettingFeedback(true);
    try {
      const currentQuestion = questions[currentIndex];
      const result = await provideFeedback(
        currentQuestion.question,
        userAnswer,
        currentQuestion.concept
      );
      setFeedbackResult(result);
    } catch (error) {
      console.error("Error getting feedback:", error);
      setFeedbackResult({
        feedback: "Great effort! Keep exploring this concept.",
        understanding: "developing",
        suggestions: ["Try connecting this to what you already know"],
      });
    } finally {
      setIsGettingFeedback(false);
    }
  };

  const handleNext = () => {
    setCompletedQuestions([...completedQuestions, currentIndex]);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setShowHint(false);
      setConfidence(50);
      setUserAnswer("");
      setFeedbackResult(null);
    } else {
      setSessionComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCompletedQuestions([]);
    setSessionComplete(false);
    setShowAnswer(false);
    setShowHint(false);
    setConfidence(50);
    setUserAnswer("");
    setFeedbackResult(null);
    setHasStarted(false);
    setQuestions([]);
  };

  const currentQuestion = questions[currentIndex];

  const getUnderstandingColor = (understanding: string) => {
    switch (understanding) {
      case "strong":
        return "bg-sage/20 text-sage border-sage/30";
      case "developing":
        return "bg-lavender/20 text-lavender border-lavender/30";
      case "needs_work":
        return "bg-blush/20 text-blush border-blush/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        {/* Empty State - No Concepts */}
        {concepts.length === 0 ? (
          <div className="max-w-lg text-center">
            <div className="w-20 h-20 rounded-full bg-blush/20 flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-10 h-10 text-blush" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">No concepts to review yet</h2>
            <p className="text-muted-foreground mb-6">
              Create some notes first! Once you have notes with concepts, you can practice 
              recalling them here with AI-generated questions.
            </p>
            <Link to="/notes">
              <Button variant="hero">
                <FileText className="w-4 h-4 mr-2" />
                Create Notes First
              </Button>
            </Link>

            <div className="mt-8 p-4 bg-accent/30 rounded-2xl">
              <p className="text-sm text-muted-foreground">
                <Lightbulb className="w-4 h-4 inline mr-1" />
                Tip: Active recall (testing yourself) is one of the most effective ways to learn!
              </p>
            </div>
          </div>
        ) : !hasStarted ? (
          /* Start Session Screen */
          <div className="max-w-lg text-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Ready to Review?</h2>
            <p className="text-muted-foreground mb-6">
              You have <span className="text-foreground font-medium">{concepts.length} concepts</span> to 
              practice. AI will generate personalized questions to help you recall and understand them better.
            </p>
            
            {/* Concept Preview */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {concepts.slice(0, 6).map((concept) => (
                <span key={concept} className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
                  {concept}
                </span>
              ))}
              {concepts.length > 6 && (
                <span className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-full">
                  +{concepts.length - 6} more
                </span>
              )}
            </div>

            <Button variant="hero" size="lg" onClick={startSession}>
              <Sparkles className="w-5 h-5 mr-2" />
              Start Review Session
            </Button>

            <div className="mt-8 p-4 bg-accent/30 rounded-2xl">
              <p className="text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Sessions typically take 5-10 minutes
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Generating personalized review questions...</p>
            <p className="text-sm text-muted-foreground/60 mt-2">AI is crafting questions just for you</p>
          </div>
        ) : sessionComplete ? (
          <div className="max-w-lg text-center">
            <div className="w-20 h-20 rounded-full bg-sage/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-sage" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Session Complete!</h2>
            <p className="text-muted-foreground mb-6">
              You reviewed {questions.length} concepts. Great work on your learning journey!
            </p>
            <div className="p-4 bg-accent/30 rounded-2xl mb-6">
              <p className="text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 inline mr-1" />
                Taking regular breaks between study sessions helps consolidate your learning.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="soft" onClick={handleRestart}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Start New Session
              </Button>
              <Link to="/insights">
                <Button variant="hero">
                  View Insights
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl w-full">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    completedQuestions.includes(i) 
                      ? "bg-sage" 
                      : i === currentIndex 
                        ? "bg-primary" 
                        : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Question Card */}
            <div className="p-8 bg-card rounded-3xl border border-border/50 shadow-soft mb-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Concept: {currentQuestion?.concept}
                </p>
                <span className="text-xs text-muted-foreground/60">
                  {currentIndex + 1} of {questions.length}
                </span>
              </div>
              
              <h2 className="text-2xl font-medium text-foreground mb-6 leading-relaxed">
                {currentQuestion?.question}
              </h2>

              {/* Hint */}
              {showHint && currentQuestion?.hint && (
                <div className="p-4 bg-accent/30 rounded-2xl mb-6 animate-fade-up">
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    {currentQuestion.hint}
                  </p>
                </div>
              )}

              {/* User Answer Input */}
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-2 block">
                  Your explanation:
                </label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Try explaining this in your own words..."
                  className="w-full h-32 p-4 bg-muted/30 rounded-2xl border-none resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              {/* AI Feedback */}
              {feedbackResult && (
                <div className={`p-4 rounded-2xl mb-4 border animate-fade-up ${getUnderstandingColor(feedbackResult.understanding)}`}>
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium mb-1">
                        {feedbackResult.understanding === "strong" && "Excellent understanding! 🎉"}
                        {feedbackResult.understanding === "developing" && "You're on the right track! 👍"}
                        {feedbackResult.understanding === "needs_work" && "Keep exploring! 💪"}
                      </p>
                      <p className="text-sm opacity-90">{feedbackResult.feedback}</p>
                      {feedbackResult.suggestions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-current/10">
                          <p className="text-xs opacity-70">Suggestions:</p>
                          <ul className="text-xs opacity-80 mt-1 space-y-1">
                            {feedbackResult.suggestions.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {!showHint && (
                  <Button variant="ghost" onClick={() => setShowHint(true)}>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Need a hint?
                  </Button>
                )}
                <Button
                  variant="soft"
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                  {showAnswer ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide Reference
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Show Reference
                    </>
                  )}
                </Button>
                {userAnswer.trim() && !feedbackResult && (
                  <Button
                    variant="hero"
                    onClick={handleGetFeedback}
                    disabled={isGettingFeedback}
                    className="ml-auto"
                  >
                    {isGettingFeedback ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Get AI Feedback
                  </Button>
                )}
              </div>

              {/* Reference Answer */}
              {showAnswer && (
                <div className="mt-4 p-4 bg-muted/30 rounded-2xl animate-fade-up">
                  <p className="text-sm text-muted-foreground mb-2">Think about:</p>
                  <p className="text-foreground leading-relaxed">
                    This concept involves important principles that connect to other areas of learning. 
                    Consider how {currentQuestion?.concept} relates to your own experience and other things you know.
                  </p>
                </div>
              )}
            </div>

            {/* Confidence Slider */}
            {(showAnswer || feedbackResult) && (
              <div className="p-6 bg-card/50 rounded-3xl border border-border/30 animate-fade-up">
                <p className="text-sm text-muted-foreground mb-4">How confident do you feel about this concept?</p>
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
                
                <Button variant="hero" className="w-full mt-6" onClick={handleNext}>
                  {currentIndex < questions.length - 1 ? "Continue" : "Complete Session"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Reassurance */}
            <p className="text-center text-sm text-muted-foreground/60 mt-8">
              It's okay to take breaks. Learning is a journey. ✨
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Review;
