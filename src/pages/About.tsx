import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { FloatingBubbles } from "@/components/FloatingBubbles";

const About = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-lavender opacity-30" />
      <FloatingBubbles />
      
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <Link to="/">
          <Button variant="ghost" className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Button>
        </Link>
      </nav>

      {/* Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-semibold text-foreground mb-6">About NeuraNote</h1>
        
        <div className="prose prose-lg">
          <p className="text-muted-foreground leading-relaxed mb-6">
            NeuraNote was born from a simple observation: traditional note-taking apps 
            treat our thoughts like files to be stored, not ideas to be understood.
          </p>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            We believe learning should feel calm, not chaotic. That's why we designed 
            NeuraNote around the way your brain actually works — using principles from 
            cognitive science like spaced repetition, active recall, and concept mapping.
          </p>

          <h2 className="text-2xl font-medium text-foreground mt-12 mb-4">Our Philosophy</h2>
          
          <div className="space-y-6">
            <div className="p-6 bg-card rounded-3xl border border-border/50 shadow-soft">
              <h3 className="text-lg font-medium text-foreground mb-2">No pressure, no streaks</h3>
              <p className="text-muted-foreground">
                We won't gamify your learning with artificial urgency. Your pace is the right pace.
              </p>
            </div>
            
            <div className="p-6 bg-card rounded-3xl border border-border/50 shadow-soft">
              <h3 className="text-lg font-medium text-foreground mb-2">Understanding over memorization</h3>
              <p className="text-muted-foreground">
                We encourage you to explain concepts in your own words, building deep comprehension.
              </p>
            </div>
            
            <div className="p-6 bg-card rounded-3xl border border-border/50 shadow-soft">
              <h3 className="text-lg font-medium text-foreground mb-2">Gentle guidance</h3>
              <p className="text-muted-foreground">
                Our AI suggestions are optional whispers, not demanding notifications.
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-accent/30 rounded-3xl text-center">
            <Heart className="w-6 h-6 text-blush mx-auto mb-3" />
            <p className="text-muted-foreground">
              Made with care for thinking humans everywhere.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
