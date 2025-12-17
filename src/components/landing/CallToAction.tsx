import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CallToAction = () => {
  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden">
      {/* Soft gradient orb */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, hsl(240 45% 85% / 0.5), hsl(210 35% 92% / 0.3), transparent 70%)",
        }}
      />

      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* Gentle headline */}
        <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
          Ready when you are
        </h2>
        
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Start with a single thought. Build from there. There's no rush, 
          no pressure — just you and your ideas, growing together.
        </p>

        {/* CTA */}
        <Link to="/dashboard">
          <Button variant="hero" size="xl" className="group">
            Begin your journey
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>

        {/* Reassurance */}
        <p className="mt-8 text-sm text-muted-foreground/60">
          Free forever for personal use • No credit card needed
        </p>
      </div>
    </section>
  );
};
