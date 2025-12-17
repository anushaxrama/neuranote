import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollReveal";

const benefits = [
  "Free to start",
  "No credit card required",
  "Cancel anytime",
];

export const CallToAction = () => {
  return (
    <section className="relative py-32 px-6 overflow-hidden">

      <div className="max-w-4xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center">
            {/* Heading */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-tight mb-6 tracking-tight">
              Ready to transform<br />
              <span className="font-display-italic text-violet-600">your learning?</span>
            </h2>

            {/* Subtext */}
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of learners who have already discovered a calmer, 
              more focused way to build knowledge that lasts.
            </p>

            {/* CTA Button */}
            <Link to="/dashboard">
              <Button className="btn-primary text-base px-8 py-6 group">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            {/* Benefits */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
