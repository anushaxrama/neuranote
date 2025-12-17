import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, FileText, Network, RefreshCw, ArrowRight } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

// Get data from localStorage
const getStoredNotes = () => {
  try {
    const stored = localStorage.getItem("neuranoteNotes");
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const getStoredConcepts = () => {
  try {
    const stored = localStorage.getItem("neuranoteConcepts");
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
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
    <div className="min-h-screen bg-[#FDFCFA] flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Gradient Blobs Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="gradient-blob gradient-blob-pink blob-float absolute"
            style={{ width: '500px', height: '500px', top: '-10%', right: '10%' }}
          />
          <div 
            className="gradient-blob gradient-blob-coral blob-float-delayed absolute"
            style={{ width: '400px', height: '400px', bottom: '10%', left: '5%' }}
          />
          <div 
            className="gradient-blob gradient-blob-purple blob-float-slow absolute"
            style={{ width: '350px', height: '350px', top: '40%', right: '-5%' }}
          />
        </div>

        <div className="relative z-10 p-8 lg:p-12">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-12 animate-fade-up">
              <p className="font-display-italic text-lg text-muted-foreground mb-2">
                Your Learning Space
              </p>
              <h1 className="text-4xl lg:text-5xl font-medium text-foreground tracking-tight">
                Welcome back
              </h1>
            </div>

            {!hasContent ? (
              /* Empty State - Beautiful First Time Experience */
              <div className="stagger-children">
                {/* Hero Card */}
                <div className="relative mb-8">
                  <div className="glass rounded-[2rem] p-10 lg:p-14 shadow-elevated">
                    <div className="max-w-2xl">
                      <p className="font-display-italic text-xl text-muted-foreground mb-4">
                        Your mind, organized
                      </p>
                      <h2 className="text-3xl lg:text-4xl font-medium text-foreground mb-6 leading-tight">
                        Capture Ideas,<br />
                        <span className="font-display-italic">Discover Connections</span>
                      </h2>
                      <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        Write notes about what you're learning. AI will extract key concepts 
                        and show you how your ideas connect.
                      </p>
                      <Link to="/notes">
                        <Button className="btn-primary text-base">
                          <Plus className="w-5 h-5 mr-2" />
                          Create Your First Note
            </Button>
          </Link>
        </div>
                  </div>
                </div>

                {/* Feature Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="card-modern p-8 hover:scale-[1.02] transition-transform duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center mb-6">
                      <FileText className="w-7 h-7 text-pink-600" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Write Notes</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Capture your thoughts in your own words
                    </p>
                  </div>
                  
                  <div className="card-modern p-8 hover:scale-[1.02] transition-transform duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mb-6">
                      <Network className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">See Connections</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      AI discovers how your ideas relate
                    </p>
            </div>
                  
                  <div className="card-modern p-8 hover:scale-[1.02] transition-transform duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center mb-6">
                      <RefreshCw className="w-7 h-7 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Remember More</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Practice recall with personalized questions
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Dashboard with Content */
              <div className="space-y-10 stagger-children">
                {/* Stats Overview */}
                <div className="glass rounded-[2rem] p-8 shadow-soft">
                  <div className="flex items-center justify-between flex-wrap gap-6">
                    <div>
                      <p className="font-display-italic text-muted-foreground mb-1">Your Progress</p>
                      <div className="flex items-baseline gap-6">
                        <div>
                          <span className="text-4xl font-medium text-foreground">{notes.length}</span>
                          <span className="text-muted-foreground ml-2">notes</span>
                </div>
                <div>
                          <span className="text-4xl font-medium text-foreground">{concepts.length}</span>
                          <span className="text-muted-foreground ml-2">concepts</span>
                        </div>
                      </div>
                    </div>
                    <Link to="/concept-map">
                      <Button className="btn-primary">
                        <Network className="w-4 h-4 mr-2" />
                        View Concept Map
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Review Section */}
                {concepts.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="font-display-italic text-muted-foreground mb-1">Ready for Review</p>
                        <h2 className="text-2xl font-medium text-foreground">Strengthen Your Memory</h2>
                      </div>
                      <Link to="/review">
                        <Button variant="ghost" className="group">
                          Start Review
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
              </div>
                    <div className="flex flex-wrap gap-3">
                      {concepts.slice(0, 8).map((concept, i) => (
                        <span 
                          key={concept} 
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 cursor-default
                            ${i % 4 === 0 ? 'bubble-blue' : ''}
                            ${i % 4 === 1 ? 'bubble-green' : ''}
                            ${i % 4 === 2 ? 'bubble-pink' : ''}
                            ${i % 4 === 3 ? 'bubble-purple' : ''}
                          `}
                        >
                          {concept}
                        </span>
                      ))}
                      {concepts.length > 8 && (
                        <span className="px-4 py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                          +{concepts.length - 8} more
                        </span>
                      )}
            </div>
          </section>
                )}

                {/* Recent Notes */}
          <section>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="font-display-italic text-muted-foreground mb-1">Your Notes</p>
                      <h2 className="text-2xl font-medium text-foreground">Recently Captured</h2>
                    </div>
                    <Link to="/notes">
                      <Button variant="ghost" className="group">
                        View All
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {notes.slice(0, 3).map((note: any, i: number) => (
                      <Link key={note.id} to="/notes">
                        <div className={`card-modern p-6 hover:scale-[1.02] transition-all duration-300
                          ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
                          <h3 className="font-medium text-foreground mb-2 line-clamp-1">{note.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{note.content}</p>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {note.concepts?.length || 0} concepts
                            </span>
                          </div>
                </div>
                      </Link>
              ))}
            </div>
          </section>

                {/* Quick Actions */}
                <section className="flex flex-wrap gap-4">
                  <Link to="/notes">
                    <Button className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      New Note
                    </Button>
                  </Link>
                  <Link to="/review">
                    <Button variant="outline" className="rounded-full px-6">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Practice Recall
                    </Button>
                  </Link>
                  <Link to="/insights">
                    <Button variant="outline" className="rounded-full px-6">
                      <Sparkles className="w-4 h-4 mr-2" />
                      View Insights
                    </Button>
                  </Link>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
