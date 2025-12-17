export const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-background border-t border-border/50">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary/60" />
            </div>
            <span className="text-lg font-medium text-foreground">NeuraNote</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-8">
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              How it works
            </a>
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Principles
            </a>
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              About
            </a>
          </nav>

          {/* Tagline */}
          <p className="text-sm text-muted-foreground/60">
            Learning, gently.
          </p>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground/50">
            © 2024 NeuraNote. Designed for thinking humans.
          </p>
        </div>
      </div>
    </footer>
  );
};
