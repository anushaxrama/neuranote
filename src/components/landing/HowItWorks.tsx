import { Layers, Network, RotateCcw, Sparkles } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Concept Blocks",
    description: "Notes are organized into focused concept blocks — each representing a single idea. No more endless scrolling through walls of text.",
  },
  {
    icon: Network,
    title: "Visual Concept Maps",
    description: "See your knowledge as a network of connected ideas. Watch relationships form as your understanding grows.",
  },
  {
    icon: RotateCcw,
    title: "Spaced Review",
    description: "Smart scheduling surfaces concepts at optimal times. No enforced schedules — just gentle reminders when it matters.",
  },
  {
    icon: Sparkles,
    title: "AI Reflection",
    description: "Gentle prompts encourage deeper thinking. Explain ideas in your own words, identify gaps, and build real understanding.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="features" className="py-32 px-6 bg-background relative overflow-hidden">
      {/* Gradient blobs */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full blob-float"
        style={{
          left: '-10%',
          top: '20%',
          background: 'radial-gradient(ellipse at center, hsl(350 85% 90% / 0.5), hsl(340 80% 94% / 0.3), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blob-float-delayed"
        style={{
          right: '-5%',
          bottom: '10%',
          background: 'radial-gradient(ellipse at center, hsl(30 95% 88% / 0.4), hsl(40 90% 92% / 0.3), transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6">
            Designed to Help You<br />
            Do More <span className="font-serif italic">With Less</span> <span className="font-serif italic text-rose-500">Stress</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Built on cognitive science principles — spacing, retrieval, and metacognition — so you learn smarter, not harder.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-3xl bg-card/50 border border-transparent hover:border-border hover:bg-card transition-all duration-500 hover:shadow-soft"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <feature.icon className="w-6 h-6 text-foreground/70" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
