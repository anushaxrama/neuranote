import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] scroll-smooth relative overflow-hidden">
      {/* Flowing gradient background - vibrant purple/lavender aesthetic */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Large top-left purple blob - more saturated */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '800px',
            height: '800px',
            left: '-10%',
            top: '-5%',
            background: 'radial-gradient(ellipse at center, hsl(270 75% 85% / 0.9), hsl(280 65% 88% / 0.6), transparent 70%)',
            filter: 'blur(50px)',
            animation: 'float 25s ease-in-out infinite',
          }}
        />
        
        {/* Top-right pink blob - more vibrant */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '600px',
            height: '600px',
            right: '-5%',
            top: '10%',
            background: 'radial-gradient(ellipse at center, hsl(340 80% 88% / 0.85), hsl(350 70% 90% / 0.5), transparent 70%)',
            filter: 'blur(45px)',
            animation: 'float 30s ease-in-out infinite',
            animationDelay: '-8s',
          }}
        />
        
        {/* Middle large purple blob - stronger presence */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '900px',
            height: '900px',
            left: '25%',
            top: '35%',
            background: 'radial-gradient(ellipse at center, hsl(265 70% 88% / 0.8), hsl(275 60% 90% / 0.5), transparent 65%)',
            filter: 'blur(60px)',
            animation: 'float 28s ease-in-out infinite',
            animationDelay: '-12s',
          }}
        />
        
        {/* Right side lavender blob - bolder */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '550px',
            height: '550px',
            right: '8%',
            top: '50%',
            background: 'radial-gradient(ellipse at center, hsl(280 70% 86% / 0.8), hsl(290 55% 90% / 0.45), transparent 70%)',
            filter: 'blur(45px)',
            animation: 'float 22s ease-in-out infinite',
            animationDelay: '-5s',
          }}
        />
        
        {/* Bottom-left violet blob - richer */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '700px',
            height: '700px',
            left: '0%',
            top: '65%',
            background: 'radial-gradient(ellipse at center, hsl(268 72% 86% / 0.85), hsl(278 60% 90% / 0.5), transparent 70%)',
            filter: 'blur(55px)',
            animation: 'float 26s ease-in-out infinite',
            animationDelay: '-15s',
          }}
        />
        
        {/* Bottom-right coral/pink accent blob - warmer pop */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '500px',
            height: '500px',
            right: '10%',
            top: '78%',
            background: 'radial-gradient(ellipse at center, hsl(15 85% 88% / 0.75), hsl(25 75% 92% / 0.4), transparent 70%)',
            filter: 'blur(45px)',
            animation: 'float 24s ease-in-out infinite',
            animationDelay: '-10s',
          }}
        />

        {/* Center accent glow - adds depth */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '1000px',
            height: '500px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(ellipse at center, hsl(270 55% 92% / 0.5), transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Page content */}
      <div className="relative z-10">
        <Hero />
        <HowItWorks />
        <CallToAction />
        <Footer />
      </div>

      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -15px) scale(1.02);
          }
          50% {
            transform: translate(-15px, 10px) scale(0.98);
          }
          75% {
            transform: translate(10px, 5px) scale(1.01);
          }
        }
      `}</style>
    </div>
  );
};

export default Index;
