import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Sparkles, RefreshCw, Network, BookOpen, Lightbulb } from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollReveal";

const principles = [
  {
    icon: Brain,
    title: "Active Recall",
    description: "Testing yourself on material is more effective than passive re-reading. NeuraNote's review system prompts you to explain concepts in your own words, strengthening memory traces.",
    color: "from-violet-100 to-violet-200",
    iconColor: "text-violet-600",
  },
  {
    icon: RefreshCw,
    title: "Spaced Repetition",
    description: "Reviewing information at increasing intervals optimizes long-term retention. Our AI schedules reviews based on how well you know each concept.",
    color: "from-pink-100 to-pink-200",
    iconColor: "text-pink-600",
  },
  {
    icon: Network,
    title: "Elaborative Encoding",
    description: "Connecting new information to existing knowledge creates stronger memories. The concept map helps you visualize and build these connections.",
    color: "from-emerald-100 to-emerald-200",
    iconColor: "text-emerald-600",
  },
  {
    icon: Lightbulb,
    title: "Metacognition",
    description: "Thinking about your own thinking improves learning. Reflection prompts help you identify gaps in understanding and track your progress.",
    color: "from-amber-100 to-amber-200",
    iconColor: "text-amber-600",
  },
];

const Science = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute rounded-full"
          style={{
            width: '600px',
            height: '600px',
            left: '-10%',
            top: '10%',
            background: 'radial-gradient(ellipse at center, hsl(270 70% 88% / 0.7), transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
        <div 
          className="absolute rounded-full"
          style={{
            width: '500px',
            height: '500px',
            right: '5%',
            top: '40%',
            background: 'radial-gradient(ellipse at center, hsl(340 70% 90% / 0.6), transparent 70%)',
            filter: 'blur(45px)',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center shadow-md">
              <div className="w-4 h-4 rounded-full bg-white/90" />
            </div>
            <span className="text-xl font-medium tracking-tight">NeuraNote</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 mb-6">
                <Brain className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium text-violet-700">Evidence-Based Learning</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-medium text-foreground mb-6 tracking-tight">
                The Science Behind<br />
                <span className="font-display-italic text-violet-600">NeuraNote</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                NeuraNote is built on decades of cognitive science research. Every feature is designed 
                to work with your brain, not against it.
              </p>
            </div>
          </ScrollReveal>

          {/* Principles Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {principles.map((principle, index) => (
              <ScrollReveal key={principle.title} delay={index * 100}>
                <div className="p-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${principle.color} flex items-center justify-center mb-6`}>
                    <principle.icon className={`w-7 h-7 ${principle.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-medium text-foreground mb-3">{principle.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{principle.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Research Section */}
          <ScrollReveal>
            <div className="p-10 bg-gradient-to-br from-violet-50 to-pink-50 rounded-3xl border border-violet-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <BookOpen className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-2">Backed by Research</h3>
                  <p className="text-muted-foreground">
                    Our approach is informed by research from leading cognitive scientists including 
                    Dr. Robert Bjork (desirable difficulties), Dr. Henry Roediger (testing effect), 
                    and Dr. Barbara Oakley (learning how to learn).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-6 border-t border-violet-200">
                <Sparkles className="w-5 h-5 text-violet-500" />
                <p className="text-sm text-violet-700 font-medium">
                  AI-enhanced to personalize these principles to your unique learning patterns
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal>
            <div className="text-center mt-16">
              <Link to="/dashboard">
                <Button className="btn-primary text-base">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Learning Smarter
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
};

export default Science;

