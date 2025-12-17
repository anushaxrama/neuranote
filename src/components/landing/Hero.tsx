import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Gradient blobs - Embla style */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blob-float"
        style={{
          left: '5%',
          top: '25%',
          background: 'radial-gradient(ellipse at center, hsl(350 85% 88% / 0.7), hsl(340 80% 92% / 0.4), transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div 
        className="absolute w-[450px] h-[450px] rounded-full blob-float-delayed"
        style={{
          right: '10%',
          top: '15%',
          background: 'radial-gradient(ellipse at center, hsl(30 95% 85% / 0.6), hsl(40 90% 88% / 0.4), transparent 70%)',
          filter: 'blur(35px)',
        }}
      />
      <div 
        className="absolute w-[350px] h-[350px] rounded-full blob-float-slow"
        style={{
          left: '45%',
          bottom: '5%',
          background: 'radial-gradient(ellipse at center, hsl(280 65% 88% / 0.5), hsl(300 55% 90% / 0.3), transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-xl font-semibold tracking-tight">NeuraNote</span>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#principles" className="hover:text-foreground transition-colors">Science</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="rounded-full px-5 border-foreground/20 hover:bg-foreground hover:text-background">
              Try it Free
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-20">
        {/* Tagline - serif italic */}
        <p 
          className="font-serif italic text-lg md:text-xl text-muted-foreground mb-6 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          Your Mind, in Perfect Flow.
        </p>

        {/* Main headline */}
        <h1 
          className="text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground leading-[1.1] mb-6 animate-fade-up tracking-tight"
          style={{ animationDelay: "0.2s" }}
        >
          Think Clearer,<br />
          Learn Deeper
        </h1>

        {/* Subtext */}
        <p 
          className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          Take control of your learning with our cognitive note-taking app. Capture ideas, 
          connect concepts visually, and build lasting understanding — at your own pace.
        </p>

        {/* CTA */}
        <div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          <Link to="/dashboard">
            <Button variant="hero" size="xl" className="group">
              Open NeuraNote
              <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <a href="#features">
            <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
              See how it works
            </Button>
          </a>
        </div>

        {/* Trust indicators */}
        <p 
          className="mt-12 text-sm text-muted-foreground/70 animate-fade-up"
          style={{ animationDelay: "0.5s" }}
        >
          Free to start • No pressure • Your pace, your way
        </p>

        {/* App Preview */}
        <div 
          className="mt-16 animate-fade-up relative max-w-3xl mx-auto"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="relative bg-card rounded-2xl border border-border shadow-2xl shadow-foreground/5 overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
                  neuranote.app
                </div>
              </div>
            </div>
            
            {/* App content preview */}
            <div className="p-6 bg-gradient-to-br from-background to-secondary/20">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Sidebar */}
                <div className="hidden md:block space-y-3">
                  <div className="h-8 w-32 bg-secondary rounded-lg" />
                  <div className="h-6 w-24 bg-secondary/60 rounded-lg" />
                  <div className="h-6 w-28 bg-secondary/60 rounded-lg" />
                  <div className="h-6 w-20 bg-secondary/60 rounded-lg" />
                </div>
                
                {/* Main content */}
                <div className="md:col-span-2 space-y-4">
                  {/* Concept block 1 */}
                  <div className="bg-card rounded-xl p-4 border border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-bold">C</div>
                      <div className="flex-1">
                        <div className="h-4 w-40 bg-foreground/10 rounded mb-2" />
                        <div className="h-3 w-full bg-muted rounded mb-1" />
                        <div className="h-3 w-3/4 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Concept block 2 */}
                  <div className="bg-card rounded-xl p-4 border border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">I</div>
                      <div className="flex-1">
                        <div className="h-4 w-36 bg-foreground/10 rounded mb-2" />
                        <div className="h-3 w-full bg-muted rounded mb-1" />
                        <div className="h-3 w-2/3 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Memory indicator */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <div className="w-2 h-2 rounded-full bg-muted" />
                    </div>
                    <span className="text-xs">Memory forming</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative gradient under preview */}
          <div 
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(280 60% 80% / 0.3), transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
        </div>
      </div>
    </section>
  );
};
