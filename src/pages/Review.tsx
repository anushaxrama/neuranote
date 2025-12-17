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

  const getUnderstandingStyle = (understanding: string) => {
    switch (understanding) {
      case "strong":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "developing":
        return "bg-violet-50 border-violet-200 text-violet-800";
      case "needs_work":
        return "bg-amber-50 border-amber-200 text-amber-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFA] flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="gradient-blob gradient-blob-purple blob-float absolute"
            style={{ width: '450px', height: '450px', top: '-10%', left: '10%' }}
          />
          <div 
            className="gradient-blob gradient-blob-mint blob-float-delayed absolute"
            style={{ width: '400px', height: '400px', bottom: '5%', right: '10%' }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
          {/* Empty State - No Concepts */}
          {concepts.length === 0 ? (
            <div className="max-w-lg text-center animate-fade-up">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center mx-auto mb-8">
                <RefreshCw className="w-12 h-12 text-pink-600" />
              </div>
              <p className="font-display-italic text-lg text-muted-foreground mb-3">
                Nothing to review yet
              </p>
              <h2 className="text-3xl font-medium text-foreground mb-4">
                Create Some<br />
                <span className="font-display-italic">Notes First</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Once you have notes with concepts, you can practice 
                recalling them here with AI-generated questions.
              </p>
              <Link to="/notes">
                <Button className="btn-primary">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Notes First
                </Button>
              </Link>

              <div className="mt-10 glass rounded-3xl p-6">
                <p className="text-sm text-muted-foreground">
                  <Lightbulb className="w-4 h-4 inline mr-2 text-amber-500" />
                  Active recall (testing yourself) is one of the most effective ways to learn!
                </p>
              </div>
            </div>
          ) : !hasStarted ? (
            /* Start Session Screen */
            <div className="max-w-lg text-center animate-fade-up">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-12 h-12 text-violet-600" />
              </div>
              <p className="font-display-italic text-lg text-muted-foreground mb-3">
                Test your knowledge
              </p>
              <h2 className="text-3xl font-medium text-foreground mb-4">
                Ready to<br />
                <span className="font-display-italic">Review?</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                You have <span className="text-foreground font-medium">{concepts.length} concepts</span> to 
                practice. AI will generate personalized questions to strengthen your understanding.
              </p>
              
              {/* Concept Preview */}
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {concepts.slice(0, 6).map((concept, i) => (
                  <span 
                    key={concept} 
                    className={`px-4 py-2 text-sm font-medium rounded-full
                      ${i % 4 === 0 ? 'bubble-blue' : ''}
                      ${i % 4 === 1 ? 'bubble-green' : ''}
                      ${i % 4 === 2 ? 'bubble-pink' : ''}
                      ${i % 4 === 3 ? 'bubble-purple' : ''}
                    `}
            >
                    {concept}
                  </span>
                ))}
                {concepts.length > 6 && (
                  <span className="px-4 py-2 text-sm font-medium bg-muted text-muted-foreground rounded-full">
                    +{concepts.length - 6} more
                  </span>
                )}
              </div>

              <Button className="btn-primary text-base" onClick={startSession}>
                <Sparkles className="w-5 h-5 mr-2" />
                Start Review Session
              </Button>

              <div className="mt-10 glass rounded-3xl p-6">
                <p className="text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4 inline mr-2 text-violet-500" />
                  Sessions typically take 5-10 minutes
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="text-center animate-fade-up">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
              </div>
              <p className="font-display-italic text-lg text-foreground mb-2">Preparing your session...</p>
              <p className="text-sm text-muted-foreground">AI is crafting personalized questions</p>
            </div>
          ) : sessionComplete ? (
            <div className="max-w-lg text-center animate-fade-up">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <p className="font-display-italic text-lg text-muted-foreground mb-3">
                Well done!
              </p>
              <h2 className="text-3xl font-medium text-foreground mb-4">
                Session<br />
                <span className="font-display-italic">Complete</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                You reviewed {questions.length} concepts. Great work on your learning journey!
              </p>
              <div className="glass rounded-3xl p-6 mb-8">
                <p className="text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 inline mr-2 text-violet-500" />
                  Taking regular breaks between study sessions helps consolidate your learning.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" className="rounded-full px-6" onClick={handleRestart}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Session
                </Button>
                <Link to="/insights">
                  <Button className="btn-primary">
                    View Insights
                    <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
            </div>
          ) : (
            <div className="max-w-2xl w-full animate-fade-up">
          {/* Progress indicator */}
              <div className="flex items-center justify-center gap-2 mb-10">
                {questions.map((_, i) => (
              <div
                key={i}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      completedQuestions.includes(i) 
                        ? "w-8 bg-emerald-400" 
                        : i === currentIndex 
                          ? "w-8 bg-violet-500" 
                          : "w-2 bg-muted"
                    }`}
              />
            ))}
          </div>

          {/* Question Card */}
              <div className="glass rounded-3xl p-10 shadow-elevated mb-6">
                <div className="flex items-center justify-between mb-6">
                  <span className={`px-4 py-1.5 text-sm font-medium rounded-full bubble-purple`}>
                    {currentQuestion?.concept}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {currentIndex + 1} of {questions.length}
                  </span>
                </div>
            
                <h2 className="text-2xl lg:text-3xl font-medium text-foreground mb-8 leading-relaxed">
                  {currentQuestion?.question}
            </h2>

                {/* Hint */}
                {showHint && currentQuestion?.hint && (
                  <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl mb-6 animate-fade-up">
                    <p className="text-sm text-amber-800 flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      {currentQuestion.hint}
                    </p>
                  </div>
                )}

                {/* User Answer Input */}
                <div className="mb-6">
                  <label className="text-sm text-muted-foreground mb-3 block font-display-italic">
                    Your explanation:
                  </label>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Try explaining this in your own words..."
                    className="w-full h-36 p-5 bg-white/70 rounded-2xl border border-border/50 resize-none focus:outline-none focus:ring-2 focus:ring-violet-200 text-foreground leading-relaxed"
                  />
                </div>

                {/* AI Feedback */}
                {feedbackResult && (
                  <div className={`p-5 rounded-2xl mb-6 border-2 animate-fade-up ${getUnderstandingStyle(feedbackResult.understanding)}`}>
                    <div className="flex items-start gap-4">
                      <MessageCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-2">
                          {feedbackResult.understanding === "strong" && "Excellent understanding! 🎉"}
                          {feedbackResult.understanding === "developing" && "You're on the right track! 👍"}
                          {feedbackResult.understanding === "needs_work" && "Keep exploring! 💪"}
                        </p>
                        <p className="text-sm opacity-90 leading-relaxed">{feedbackResult.feedback}</p>
                        {feedbackResult.suggestions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-current/10">
                            <p className="text-xs opacity-70 font-medium">Suggestions:</p>
                            <ul className="text-sm opacity-80 mt-2 space-y-1.5">
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
                    <Button variant="ghost" className="rounded-full" onClick={() => setShowHint(true)}>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Need a hint?
                    </Button>
                  )}
            <Button
                    variant="outline"
                    className="rounded-full"
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
                      className="btn-primary ml-auto"
                      onClick={handleGetFeedback}
                      disabled={isGettingFeedback}
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
                  <div className="mt-6 p-5 bg-white/50 rounded-2xl border border-border/50 animate-fade-up">
                    <p className="text-sm text-muted-foreground mb-2 font-display-italic">Think about:</p>
                    <p className="text-foreground leading-relaxed">
                      This concept involves important principles that connect to other areas of learning. 
                      Consider how {currentQuestion?.concept} relates to your own experience and other things you know.
                    </p>
                  </div>
                )}
          </div>

          {/* Confidence Slider */}
              {(showAnswer || feedbackResult) && (
                <div className="glass rounded-3xl p-8 animate-fade-up">
                  <p className="text-sm text-muted-foreground mb-5 font-display-italic">
                    How confident do you feel about this concept?
                  </p>
              <input
                type="range"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:shadow-elevated"
              />
                  <div className="flex justify-between text-xs text-muted-foreground mt-3">
                <span>Still fuzzy</span>
                <span>Very clear</span>
              </div>
              
                  <Button className="btn-primary w-full mt-8" onClick={handleNext}>
                    {currentIndex < questions.length - 1 ? "Continue" : "Complete Session"}
                    <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

              {/* Encouragement */}
              <p className="text-center text-sm text-muted-foreground mt-10 font-display-italic">
                It's okay to take breaks. Learning is a journey. ✨
          </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Review;
