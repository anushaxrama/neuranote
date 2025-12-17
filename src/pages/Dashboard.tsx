import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, FileText, Network, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

// Get notes from localStorage
const getStoredNotes = () => {
  const stored = localStorage.getItem("neuranoteNotes");
  return stored ? JSON.parse(stored) : [];
};

// Get concepts from localStorage
const getStoredConcepts = () => {
  const stored = localStorage.getItem("neuranoteConcepts");
  return stored ? JSON.parse(stored) : [];
};

const Dashboard = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<string[]>([]);

  useEffect(() => {
    setNotes(getStoredNotes());
    setConcepts(getStoredConcepts());
  }, []);

  const hasContent = notes.length > 0;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">What would help you right now?</p>

          {!hasContent ? (
            /* Empty State - First Time User */
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Start Your Learning Journey
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Create your first note to begin. Write about something you're learning, 
                and AI will help you extract key concepts and build your knowledge map.
              </p>
              <Link to="/notes">
                <Button variant="hero" size="lg" data-tutorial="create-first-note">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Note
                </Button>
              </Link>

              {/* Quick Start Cards */}
              <div className="grid gap-4 md:grid-cols-3 mt-12 text-left">
                <div className="p-6 bg-card rounded-3xl border border-border/50 shadow-soft">
                  <div className="w-10 h-10 rounded-full bg-lavender/20 flex items-center justify-center mb-4">
                    <FileText className="w-5 h-5 text-lavender" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Write Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture what you're learning in your own words
                  </p>
                </div>
                <div className="p-6 bg-card rounded-3xl border border-border/50 shadow-soft">
                  <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center mb-4">
                    <Network className="w-5 h-5 text-sage" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">See Connections</h3>
                  <p className="text-sm text-muted-foreground">
                    AI discovers how your ideas relate
                  </p>
                </div>
                <div className="p-6 bg-card rounded-3xl border border-border/50 shadow-soft">
                  <div className="w-10 h-10 rounded-full bg-blush/20 flex items-center justify-center mb-4">
                    <RefreshCw className="w-5 h-5 text-blush" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Remember More</h3>
                  <p className="text-sm text-muted-foreground">
                    Practice recall with personalized questions
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Needs Review */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-foreground">Needs Review Today</h2>
                  <Link to="/review">
                    <Button variant="ghost" size="sm">
                      Start Review →
                    </Button>
                  </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {concepts.slice(0, 3).map((concept: string) => (
                    <div
                      key={concept}
                      className="p-6 bg-card rounded-3xl border border-border/50 shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-accent/50 mb-4" />
                      <h3 className="font-medium text-foreground mb-1">{concept}</h3>
                      <p className="text-sm text-muted-foreground">Ready for a quick revisit</p>
                    </div>
                  ))}
                  {concepts.length === 0 && (
                    <div className="col-span-3 p-8 bg-muted/30 rounded-3xl border border-dashed border-border/50 text-center">
                      <p className="text-muted-foreground">
                        Concepts from your notes will appear here for review
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Notes */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-foreground">Recent Notes</h2>
                  <Link to="/notes">
                    <Button variant="ghost" size="sm">
                      View All →
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {notes.slice(0, 3).map((note: any) => (
                    <Link
                      key={note.id}
                      to="/notes"
                      className="flex items-center gap-4 p-4 bg-card/50 rounded-2xl border border-border/30 hover:bg-card transition-all duration-300"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary/50" />
                      <div className="flex-1">
                        <span className="text-foreground font-medium">{note.title}</span>
                        <p className="text-sm text-muted-foreground">{note.concepts?.length || 0} concepts</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Quick Actions */}
              <section>
                <h2 className="text-lg font-medium text-foreground mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                  <Link to="/notes">
                    <Button variant="soft">
                      <Plus className="w-4 h-4 mr-2" />
                      New Note
                    </Button>
                  </Link>
                  <Link to="/review">
                    <Button variant="soft">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Start Review
                    </Button>
                  </Link>
                  <Link to="/concept-map">
                    <Button variant="soft">
                      <Network className="w-4 h-4 mr-2" />
                      View Concept Map
                    </Button>
                  </Link>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
