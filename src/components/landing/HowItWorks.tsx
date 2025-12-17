import { ScrollReveal } from "@/hooks/useScrollReveal";

const features = [
  {
    title: "Concept Blocks",
    description: "Notes are organized into focused concept blocks — each representing a single idea. No more endless scrolling through walls of text.",
  },
  {
    title: "Visual Concept Maps",
    description: "See your knowledge as a network of connected ideas. Watch relationships form as your understanding grows.",
  },
  {
    title: "Spaced Review",
    description: "Smart scheduling surfaces concepts at optimal times. No enforced schedules — just gentle reminders when it matters.",
  },
  {
    title: "AI Reflection",
    description: "Gentle prompts encourage deeper thinking. Explain ideas in your own words, identify gaps, and build real understanding.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="features" className="py-32 px-6 relative overflow-hidden">

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-20">
            <p className="font-display-italic text-lg text-muted-foreground mb-4">
              Built for how you think
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-[1.1] tracking-tight mb-6">
              Designed to Help You<br />
              Do More <span className="font-display-italic">With Less</span> <span className="font-display-italic text-pink-500">Stress</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Built on cognitive science principles — spacing, retrieval, and metacognition — so you learn smarter, not harder.
            </p>
          </div>
        </ScrollReveal>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <ScrollReveal 
              key={feature.title} 
              delay={index * 150}
              direction={index % 2 === 0 ? 'left' : 'right'}
            >
              <div className="group p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/50 hover:bg-white hover:shadow-elevated transition-all duration-500">
                <h3 className="text-xl font-medium text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
