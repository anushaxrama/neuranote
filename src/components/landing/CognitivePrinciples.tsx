import { useState } from "react";
import { Clock, RotateCcw, Layers, Eye } from "lucide-react";

const principles = [
  {
    id: "spacing",
    icon: Clock,
    title: "Spacing",
    shortDesc: "Time between reviews",
    fullDesc: "Your brain consolidates memories during rest. Spacing reviews over time — not cramming — creates stronger, longer-lasting neural pathways.",
    color: "hsl(240 45% 75%)",
    bgColor: "hsl(240 45% 95%)",
  },
  {
    id: "retrieval",
    icon: RotateCcw,
    title: "Retrieval",
    shortDesc: "Active recall practice",
    fullDesc: "Each time you actively recall information rather than passively re-read it, you strengthen the memory trace and make future retrieval easier.",
    color: "hsl(210 50% 60%)",
    bgColor: "hsl(210 50% 93%)",
  },
  {
    id: "chunking",
    icon: Layers,
    title: "Chunking",
    shortDesc: "Organized information",
    fullDesc: "Breaking complex information into smaller, meaningful units reduces cognitive load and helps your brain form organized mental models.",
    color: "hsl(150 40% 50%)",
    bgColor: "hsl(150 40% 92%)",
  },
  {
    id: "metacognition",
    icon: Eye,
    title: "Metacognition",
    shortDesc: "Thinking about thinking",
    fullDesc: "Understanding how well you know something — and where you're uncertain — guides more effective learning and builds intellectual confidence.",
    color: "hsl(350 45% 65%)",
    bgColor: "hsl(350 45% 94%)",
  },
];

export const CognitivePrinciples = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section id="principles" className="py-24 px-6 bg-gradient-mist relative">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Grounded in cognitive science
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            These aren't productivity hacks — they're how your brain naturally learns best.
          </p>
        </div>

        {/* Principles grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {principles.map((principle) => {
            const isExpanded = expandedId === principle.id;
            
            return (
              <div
                key={principle.id}
                className="relative group cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : principle.id)}
              >
                <div
                  className={`
                    relative p-6 rounded-2xl border border-border/50 
                    transition-all duration-500 ease-soft
                    ${isExpanded 
                      ? "bg-card shadow-float scale-[1.02]" 
                      : "bg-card/50 shadow-soft hover:shadow-float hover:bg-card"
                    }
                  `}
                >
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-500"
                      style={{ 
                        backgroundColor: principle.bgColor,
                        transform: isExpanded ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      <principle.icon 
                        className="w-5 h-5"
                        style={{ color: principle.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-foreground">
                        {principle.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {principle.shortDesc}
                      </p>
                    </div>
                  </div>

                  {/* Expandable content */}
                  <div
                    className={`
                      overflow-hidden transition-all duration-500 ease-soft
                      ${isExpanded ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"}
                    `}
                  >
                    <p className="text-muted-foreground leading-relaxed pl-16">
                      {principle.fullDesc}
                    </p>
                  </div>

                  {/* Expand indicator */}
                  <div 
                    className={`
                      absolute bottom-3 right-4 text-xs text-muted-foreground/50
                      transition-opacity duration-300
                      ${isExpanded ? "opacity-0" : "opacity-100 group-hover:opacity-70"}
                    `}
                  >
                    tap to learn more
                  </div>

                  {/* Subtle glow on expand */}
                  {isExpanded && (
                    <div 
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 20% 20%, ${principle.bgColor}, transparent 70%)`,
                        opacity: 0.5,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom encouragement */}
        <p className="text-center text-muted-foreground/70 mt-12 text-sm">
          You don't need to remember these — NeuraNote applies them for you.
        </p>
      </div>
    </section>
  );
};
