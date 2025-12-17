import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CallToAction = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Vibrant gradient background - Embla style */}
      <div className="relative h-[500px] md:h-[600px]">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, hsl(320 75% 75%) 0%, hsl(35 95% 65%) 40%, hsl(280 65% 60%) 100%)',
          }}
        />
        
        {/* Overlay pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, hsl(350 80% 60% / 0.4) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, hsl(40 90% 70% / 0.3) 0%, transparent 40%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex items-end pb-16 md:pb-24">
          <div className="max-w-6xl mx-auto px-6 w-full">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight mb-4">
                  Ready to transform<br />
                  <span className="font-serif italic">your workflow?</span>
                </h2>
                <p className="text-white/80 max-w-md">
                  Join thousands of professionals who have already discovered a calmer, 
                  more focused way to work.
                </p>
              </div>
              
              <Link to="/dashboard">
                <Button 
                  variant="outline" 
                  size="xl" 
                  className="bg-white text-foreground border-white hover:bg-white/90 hover:text-foreground group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Person silhouette / decorative element */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 md:h-80"
          style={{
            background: 'linear-gradient(to top, hsl(280 50% 30% / 0.3), transparent)',
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          }}
        />
      </div>
    </section>
  );
};
