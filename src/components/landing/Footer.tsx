import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="py-16 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          {/* Logo / Brand */}
          <div>
            <Link to="/" className="inline-block">
              <span className="text-2xl font-semibold text-foreground tracking-tight">NeuraNote</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              A calmer way to capture ideas, connect concepts, and build lasting understanding.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
              <nav className="flex flex-col gap-3">
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#principles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Science
                </a>
                <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
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
              <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
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

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 NeuraNote. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground font-serif italic">
            Learning, gently.
          </p>
        </div>
      </div>
    </footer>
  );
};
