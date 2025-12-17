import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import ConceptMap from "./pages/ConceptMap";
import Review from "./pages/Review";
import Insights from "./pages/Insights";
import AppSettings from "./pages/AppSettings";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { Tutorial } from "./components/Tutorial";

const queryClient = new QueryClient();

const TutorialWrapper = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only show tutorial on app pages (not landing page "/")
    const isAppPage = location.pathname !== "/" && location.pathname !== "/about";
    const tutorialComplete = localStorage.getItem("neuranoteTutorialComplete");
    
    if (isAppPage && !tutorialComplete) {
      setShowTutorial(true);
    } else {
      setShowTutorial(false);
    }
  }, [location.pathname]);

  const completeTutorial = () => {
    setShowTutorial(false);
  };

  if (!showTutorial) return null;

  return <Tutorial onComplete={completeTutorial} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/concept-map" element={<ConceptMap />} />
          <Route path="/review" element={<Review />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<AppSettings />} />
          <Route path="/about" element={<About />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <TutorialWrapper />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
