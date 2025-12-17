import { Lightbulb, GitBranch, Brain } from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    title: "Capture ideas gently",
    description: "Write without pressure. Your thoughts flow naturally into organized concept blocks that adapt to how you think.",
    color: "hsl(350 30% 85%)",
    iconColor: "hsl(350 40% 60%)",
  },
  {
    icon: GitBranch,
    title: "Connect concepts visually",
    description: "Watch your knowledge form organic connections. Ideas float and link together, revealing patterns you didn't see before.",
    color: "hsl(210 35% 88%)",
    iconColor: "hsl(210 50% 55%)",
  },
  {
    icon: Brain,
    title: "Remember with confidence",
    description: "Gentle review sessions help cement understanding. No stress, no scores — just quiet confidence in what you know.",
    color: "hsl(150 25% 88%)",
    iconColor: "hsl(150 40% 45%)",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 px-6 bg-background relative">
      {/* Subtle top gradient */}
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(to right, transparent, hsl(250 20% 88%), transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Learning that feels natural
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three simple principles, working together quietly in the background.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-3xl bg-card border border-border/50 shadow-soft card-pillowy"
              style={{
                animationDelay: `${index * 0.15}s`,
              }}
            >
              {/* Icon container */}
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundColor: feature.color }}
              >
                <feature.icon 
                  className="w-7 h-7"
                  style={{ color: feature.iconColor }}
                />
              </div>

              {/* Content */}
              <h3 className="text-xl font-medium text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Subtle hover glow */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${feature.color}40, transparent 70%)`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
