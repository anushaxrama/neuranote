import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, FileText, Network, RefreshCw, BarChart3 } from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollReveal";

// Slideshow screens representing different parts of the platform
const slides = [
  {
    title: "Notes",
    subtitle: "Capture your thoughts",
    icon: FileText,
    color: "from-pink-50 to-rose-50",
    iconBg: "from-pink-100 to-pink-200",
    iconColor: "text-pink-600",
    content: (
      <div className="space-y-2.5">
        <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center text-pink-600 text-xs font-bold shadow-sm">P</div>
          <div className="flex-1">
            <div className="h-2.5 w-28 bg-gradient-to-r from-gray-200 to-gray-100 rounded mb-1.5" />
            <div className="h-2 w-full bg-gray-100 rounded" />
          </div>
          <span className="px-2 py-0.5 text-[9px] bg-pink-50 text-pink-600 rounded-full font-medium">3 concepts</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center text-violet-600 text-xs font-bold shadow-sm">M</div>
          <div className="flex-1">
            <div className="h-2.5 w-24 bg-gradient-to-r from-gray-200 to-gray-100 rounded mb-1.5" />
            <div className="h-2 w-3/4 bg-gray-100 rounded" />
          </div>
          <span className="px-2 py-0.5 text-[9px] bg-violet-50 text-violet-600 rounded-full font-medium">5 concepts</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-600 text-xs font-bold shadow-sm">C</div>
          <div className="flex-1">
            <div className="h-2.5 w-32 bg-gradient-to-r from-gray-200 to-gray-100 rounded mb-1.5" />
            <div className="h-2 w-2/3 bg-gray-100 rounded" />
          </div>
          <span className="px-2 py-0.5 text-[9px] bg-emerald-50 text-emerald-600 rounded-full font-medium">2 concepts</span>
        </div>
      </div>
    ),
  },
  {
    title: "Concept Map",
    subtitle: "Visualize connections",
    icon: Network,
    color: "from-emerald-50 to-teal-50",
    iconBg: "from-emerald-100 to-emerald-200",
    iconColor: "text-emerald-600",
    content: (
      <div className="relative h-36">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path d="M 50% 50% Q 35% 30% 28% 18%" fill="none" stroke="hsl(260 50% 80%)" strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round" />
          <path d="M 50% 50% Q 65% 30% 72% 22%" fill="none" stroke="hsl(160 50% 75%)" strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round" />
          <path d="M 50% 50% Q 40% 70% 32% 78%" fill="none" stroke="hsl(40 60% 80%)" strokeWidth="2" strokeOpacity="0.5" strokeLinecap="round" />
          <path d="M 50% 50% Q 60% 70% 68% 82%" fill="none" stroke="hsl(190 50% 75%)" strokeWidth="2" strokeOpacity="0.5" strokeLinecap="round" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-semibold text-violet-700 z-10">Core</div>
        <div className="absolute top-1 left-1/4 w-11 h-11 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 border-2 border-white shadow-md flex items-center justify-center text-[8px] font-medium text-pink-700">Idea A</div>
        <div className="absolute top-3 right-1/5 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 border-2 border-white shadow-md flex items-center justify-center text-[8px] font-medium text-emerald-700">Idea B</div>
        <div className="absolute bottom-2 left-1/4 w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-white shadow-md flex items-center justify-center text-[7px] font-medium text-amber-700">C</div>
        <div className="absolute bottom-0 right-1/4 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 border-2 border-white shadow-md flex items-center justify-center text-[7px] font-medium text-cyan-700">D</div>
      </div>
    ),
  },
  {
    title: "Review",
    subtitle: "Strengthen memory",
    icon: RefreshCw,
    color: "from-violet-50 to-purple-50",
    iconBg: "from-violet-100 to-violet-200",
    iconColor: "text-violet-600",
    content: (
      <div className="space-y-3">
        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-[9px] bg-violet-100 text-violet-700 rounded-full font-medium">Photosynthesis</span>
          </div>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">How would you explain this concept?</p>
          <div className="h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-100" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
          <div className="px-4 h-8 bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-[10px] font-medium shadow-sm">Get Feedback</div>
        </div>
      </div>
    ),
  },
  {
    title: "Insights",
    subtitle: "Track progress",
    icon: BarChart3,
    color: "from-amber-50 to-orange-50",
    iconBg: "from-amber-100 to-amber-200",
    iconColor: "text-amber-600",
    content: (
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm text-center">
            <div className="text-xl font-semibold text-gray-800">12</div>
            <div className="text-[9px] text-gray-500 font-medium">Concepts</div>
          </div>
          <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm text-center">
            <div className="text-xl font-semibold text-gray-800">5</div>
            <div className="text-[9px] text-gray-500 font-medium">Notes</div>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-semibold text-emerald-700">AI Coach</span>
          </div>
          <p className="text-[10px] text-emerald-600 leading-relaxed">Great progress! Keep exploring connections.</p>
        </div>
      </div>
    ),
  },
];

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSlideChange = (index: number) => {
    if (index === currentSlide) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const slide = slides[currentSlide];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-6">
        <div className="w-full flex items-center">
          {/* Logo - at far left */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center shadow-md">
              <div className="w-4 h-4 rounded-full bg-white/90" />
            </div>
            <span className="text-xl font-medium tracking-tight">NeuraNote</span>
          </Link>
          
          {/* Center nav links - absolutely centered */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <Link to="/science" className="hover:text-foreground transition-colors">Science</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>
          
          {/* Spacer to push CTA to right */}
          <div className="flex-1"></div>
          
          {/* Right side CTA */}
          <div>
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="rounded-full px-5 border-foreground/20 hover:bg-foreground hover:text-background">
              Try it Free
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
          {/* Left - Text */}
          <div className="flex-1 text-center lg:text-left lg:max-w-xl">
            <ScrollReveal delay={100}>
              <p className="font-display-italic text-lg md:text-xl text-muted-foreground mb-6">
          Your Mind, in Perfect Flow.
        </p>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium text-foreground leading-[1.1] mb-6 tracking-tight">
          Think Clearer,<br />
                <span className="font-display-italic">Learn Deeper</span>
        </h1>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed">
          Take control of your learning with our cognitive note-taking app. Capture ideas, 
          connect concepts visually, and build lasting understanding — at your own pace.
        </p>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
          <Link to="/dashboard">
                  <Button className="btn-primary text-base group">
                    <Sparkles className="w-4 h-4 mr-2" />
              Open NeuraNote
              <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <a href="#features">
                  <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground rounded-full">
              See how it works
            </Button>
          </a>
        </div>
            </ScrollReveal>

            <ScrollReveal delay={500}>
              <p className="mt-10 text-sm text-muted-foreground/70">
          Free to start • No pressure • Your pace, your way
        </p>
            </ScrollReveal>
          </div>

          {/* Right - 3D Laptop Preview */}
          <ScrollReveal delay={300} direction="right">
            <div 
              className="relative flex-1 flex justify-center lg:justify-end"
              style={{ perspective: '1200px' }}
            >
              {/* 3D Laptop Container */}
              <div 
                className="relative transition-transform duration-700"
                style={{ 
                  width: '480px',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Screen */}
                <div 
                  className="relative"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(-5deg)',
                    transformOrigin: 'bottom center',
                  }}
                >
                  {/* Screen Bezel */}
                  <div 
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #3a3a3a 0%, #1a1a1a 50%, #2a2a2a 100%)',
                      padding: '12px 12px 16px 12px',
                      boxShadow: '0 -2px 20px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.1)',
                    }}
                  >
                    {/* Camera */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-700 border border-gray-600">
                      <div className="absolute inset-0.5 rounded-full bg-gray-900" />
                    </div>
                    
                    {/* Screen Display */}
                    <div 
                      className="relative rounded-lg overflow-hidden bg-[#FDFCFA]"
                      style={{ 
                        aspectRatio: '16/10',
                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
                      }}
                    >
                      {/* Screen glare */}
                      <div 
                        className="absolute inset-0 z-20 pointer-events-none opacity-30"
                        style={{
                          background: 'linear-gradient(115deg, rgba(255,255,255,0.2) 0%, transparent 40%, transparent 100%)',
                        }}
                      />
                      
                      {/* App Chrome */}
                      <div className="relative z-10 flex items-center gap-1.5 px-3 py-2 bg-white border-b border-gray-100">
              <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 flex justify-center">
                          <div className="px-4 py-1 rounded-md bg-gray-100 text-[10px] text-gray-500 font-medium">
                  neuranote.app
                </div>
              </div>
            </div>
            
                      {/* App Content */}
                      <div className="relative z-10 flex bg-[#FDFCFA]" style={{ height: 'calc(100% - 32px)' }}>
                        {/* Mini Sidebar */}
                        <div className="w-14 bg-white/90 border-r border-gray-100 p-2 space-y-1.5">
                          {slides.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => handleSlideChange(i)}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                                i === currentSlide 
                                  ? `bg-gradient-to-br ${s.iconBg} ${s.iconColor} shadow-md scale-105` 
                                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                              }`}
                            >
                              <s.icon className="w-4 h-4" />
                            </button>
                          ))}
                </div>
                
                        {/* Main Content */}
                        <div className="flex-1 relative overflow-hidden">
                          <div 
                            className={`absolute inset-0 p-4 bg-gradient-to-br ${slide.color} transition-all duration-500 ease-out ${
                              isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${slide.iconBg} flex items-center justify-center shadow-sm`}>
                                <slide.icon className={`w-3 h-3 ${slide.iconColor}`} />
                              </div>
                              <span className="text-sm font-semibold text-gray-800">{slide.title}</span>
                              <span className="text-[10px] text-gray-500">• {slide.subtitle}</span>
                            </div>
                            <div className={`transition-all duration-500 delay-100 ${
                              isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                            }`}>
                              {slide.content}
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                  
                {/* Keyboard Base - comes toward viewer */}
                <div 
                  className="relative"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(70deg)',
                    transformOrigin: 'top center',
                    marginTop: '-2px',
                  }}
                >
                  <div 
                    className="rounded-b-xl pt-1"
                    style={{
                      background: 'linear-gradient(180deg, #c8c8c8 0%, #e0e0e0 10%, #d5d5d5 90%, #b8b8b8 100%)',
                      boxShadow: '0 15px 30px -5px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.8)',
                      height: '140px',
                    }}
                  >
                    {/* Keyboard recess */}
                    <div 
                      className="mx-3 mt-2 rounded-md p-2"
                      style={{
                        background: 'linear-gradient(180deg, #1f1f1f 0%, #2a2a2a 100%)',
                        height: '70px',
                      }}
                    >
                      {/* Keyboard rows */}
                      <div className="space-y-1">
                        {[14, 13, 12, 10].map((keys, row) => (
                          <div key={row} className="flex gap-0.5 justify-center">
                            {[...Array(keys)].map((_, j) => (
                              <div 
                                key={j} 
                                className={`${row === 3 && j === 5 ? 'w-10' : 'w-3'} h-2.5 rounded-sm`}
                                style={{
                                  background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)',
                                }}
                              />
                            ))}
                      </div>
                        ))}
                    </div>
                  </div>
                  
                    {/* Trackpad */}
                    <div 
                      className="mx-auto mt-3 rounded-lg"
                      style={{
                        width: '100px',
                        height: '55px',
                        background: 'linear-gradient(180deg, #d8d8d8 0%, #c8c8c8 100%)',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1), inset 0 -1px 0 rgba(255,255,255,0.5)',
                      }}
                    />
                  </div>
                </div>

                {/* Shadow */}
                <div 
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    bottom: '-20px',
                    width: '90%',
                    height: '20px',
                    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, transparent 70%)',
                    filter: 'blur(10px)',
                  }}
                />
              </div>

              {/* Slide indicators */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleSlideChange(i)}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      i === currentSlide 
                        ? 'w-8 bg-gradient-to-r from-violet-500 to-pink-500' 
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </ScrollReveal>
            </div>
          </div>
          
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">Scroll to explore</span>
        <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5">
          <div className="w-1 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
        </div>
      </div>
    </section>
  );
};
