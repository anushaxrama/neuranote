import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const AppContent = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tutorialComplete = localStorage.getItem("neuranoteTutorialComplete");
    // Only show tutorial on dashboard or app pages, not landing
    const isAppPage = window.location.pathname !== "/";
    setShowTutorial(!tutorialComplete && isAppPage);
    setIsLoading(false);
  }, []);

  // Check when navigating to dashboard
  useEffect(() => {
    const handleNavigation = () => {
      const tutorialComplete = localStorage.getItem("neuranoteTutorialComplete");
      const isAppPage = window.location.pathname !== "/";
      if (!tutorialComplete && isAppPage && !showTutorial) {
        setShowTutorial(true);
      }
    };

    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, [showTutorial]);

  const completeTutorial = () => {
    setShowTutorial(false);
  };

  return (
    <>
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
      {showTutorial && !isLoading && <Tutorial onComplete={completeTutorial} />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
