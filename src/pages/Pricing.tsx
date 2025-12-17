import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Sparkles, Zap, Crown } from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollReveal";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with mindful learning",
    icon: Sparkles,
    color: "from-gray-100 to-gray-200",
    iconColor: "text-gray-600",
    buttonVariant: "outline" as const,
    features: [
      "Up to 50 notes",
      "Basic concept extraction",
      "Simple concept map",
      "Daily review reminders",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For serious learners who want AI-powered insights",
    icon: Zap,
    color: "from-violet-100 to-violet-200",
    iconColor: "text-violet-600",
    buttonVariant: "default" as const,
    popular: true,
    features: [
      "Unlimited notes",
      "Advanced AI concept extraction",
      "Interactive concept map",
      "Personalized review scheduling",
      "AI learning coach",
      "Progress analytics",
      "Priority support",
    ],
  },
  {
    name: "Team",
    price: "$19",
    period: "/user/month",
    description: "For teams and organizations learning together",
    icon: Crown,
    color: "from-amber-100 to-amber-200",
    iconColor: "text-amber-600",
    buttonVariant: "outline" as const,
    features: [
      "Everything in Pro",
      "Team workspaces",
      "Shared concept maps",
      "Collaborative notes",
      "Admin dashboard",
      "SSO integration",
      "Dedicated support",
    ],
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute rounded-full"
          style={{
            width: '700px',
            height: '700px',
            left: '-5%',
            top: '20%',
            background: 'radial-gradient(ellipse at center, hsl(270 70% 88% / 0.6), transparent 70%)',
            filter: 'blur(55px)',
          }}
        />
        <div 
          className="absolute rounded-full"
          style={{
            width: '600px',
            height: '600px',
            right: '-5%',
            top: '50%',
            background: 'radial-gradient(ellipse at center, hsl(340 70% 90% / 0.5), transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center shadow-md">
              <div className="w-4 h-4 rounded-full bg-white/90" />
            </div>
            <span className="text-xl font-medium tracking-tight">NeuraNote</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-medium text-foreground mb-6 tracking-tight">
                Simple, Transparent<br />
                <span className="font-display-italic text-violet-600">Pricing</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Start free and upgrade when you're ready. No hidden fees, no surprises.
              </p>
            </div>
          </ScrollReveal>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan, index) => (
              <ScrollReveal key={plan.name} delay={index * 100}>
                <div className={`relative p-8 bg-white/80 backdrop-blur-sm rounded-3xl border shadow-sm hover:shadow-lg transition-all duration-300 ${
                  plan.popular ? 'border-violet-200 ring-2 ring-violet-100' : 'border-white/50'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full text-white text-xs font-medium">
                      Most Popular
                    </div>
                  )}
                  
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                    <plan.icon className={`w-7 h-7 ${plan.iconColor}`} />
                  </div>
                  
                  <h3 className="text-xl font-medium text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-semibold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                  
                  <Link to="/dashboard">
                    <Button 
                      variant={plan.buttonVariant}
                      className={`w-full rounded-full mb-6 ${plan.popular ? 'btn-primary' : ''}`}
                    >
                      Get Started
                    </Button>
                  </Link>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* FAQ Teaser */}
          <ScrollReveal>
            <div className="text-center p-10 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50">
              <h3 className="text-xl font-medium text-foreground mb-3">Have questions?</h3>
              <p className="text-muted-foreground mb-6">
                We're here to help. Reach out anytime.
              </p>
              <Button variant="outline" className="rounded-full">
                Contact Support
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
};

export default Pricing;

