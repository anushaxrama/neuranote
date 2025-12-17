import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FloatingBubbles } from "@/components/FloatingBubbles";
import { ArrowRight, Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-lavender" />
      
      {/* Floating bubbles */}
      <FloatingBubbles />
      
      {/* Soft gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, hsl(250 25% 97% / 0.5) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Subtle badge */}
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 shadow-soft mb-8 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Designed for how you think</span>
        </div>

        {/* Main headline */}
        <h1 
          className="text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground leading-tight mb-6 animate-fade-up"
          style={{ 
            animationDelay: "0.2s",
            letterSpacing: "-0.02em",
          }}
        >
          Notes designed for how
          <br />
          <span className="text-primary">your brain actually learns</span>
        </h1>

        {/* Subtext */}
        <p 
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          A calm space to capture ideas, connect concepts visually, 
          and build lasting understanding — at your own pace.
        </p>

        {/* CTAs */}
        <div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          <Link to="/dashboard">
            <Button variant="hero" size="xl">
              Open NeuraNote
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
              See how it works
            </Button>
          </a>
        </div>

        {/* Trust indicator */}
        <p 
          className="mt-12 text-sm text-muted-foreground/70 animate-fade-up"
          style={{ animationDelay: "0.5s" }}
        >
          Free to start • No pressure • Your pace, your way
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: "linear-gradient(to top, hsl(250 25% 97%), transparent)",
        }}
      />
    </section>
  );
};
