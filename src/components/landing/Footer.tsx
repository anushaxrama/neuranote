import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollReveal";

export const Footer = () => {
  return (
    <footer className="py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-start justify-between gap-12">
            {/* Logo / Brand */}
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center shadow-soft">
                  <div className="w-4 h-4 rounded-full bg-white/80" />
                </div>
                <span className="text-2xl font-medium text-foreground tracking-tight">NeuraNote</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
                A calmer way to capture ideas, connect concepts, and build lasting understanding.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-4">Product</h4>
                <nav className="flex flex-col gap-3">
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </a>
                  <Link to="/science" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Science
                  </Link>
                  <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </nav>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-4">Company</h4>
                <nav className="flex flex-col gap-3">
                  <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </Link>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Careers
                  </a>
                </nav>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-4">Legal</h4>
                <nav className="flex flex-col gap-3">
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy
                  </a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom */}
        <ScrollReveal delay={200}>
          <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 NeuraNote. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground font-display-italic flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Learning, gently.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};
