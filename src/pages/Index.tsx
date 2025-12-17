import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CognitivePrinciples } from "@/components/landing/CognitivePrinciples";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <HowItWorks />
      <CognitivePrinciples />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
