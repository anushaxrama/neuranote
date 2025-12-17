import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Plus, Sparkles, X, Save, Loader2, Lightbulb, BookOpen,
  PenLine, CheckCircle2, Network
} from "lucide-react";
import { extractConcepts, summarizeNote, generateExplanationPrompt } from "@/lib/openai";
import { Sidebar } from "@/components/Sidebar";

interface Note {
  id: string;
  title: string;
  content: string;
  concepts: string[];
  summary?: string;
  updated: string;
  createdAt: number;
}

// LocalStorage helpers
const getStoredNotes = (): Note[] => {
  try {
    const stored = localStorage.getItem("neuranoteNotes");
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Error loading notes:", e);
    return [];
  }
};

const saveNotesToStorage = (notes: Note[]) => {
  try {
    localStorage.setItem("neuranoteNotes", JSON.stringify(notes));
    // Also save all concepts for other pages
    const allConcepts = notes.flatMap(n => n.concepts);
    const uniqueConcepts = [...new Set(allConcepts)];
    localStorage.setItem("neuranoteConcepts", JSON.stringify(uniqueConcepts));
    console.log("Saved notes to localStorage:", notes.length, "notes,", uniqueConcepts.length, "concepts");
  } catch (e) {
    console.error("Error saving notes:", e);
  }
};

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [extractedConcepts, setExtractedConcepts] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    setNotes(getStoredNotes());
  }, []);

  const handleExtractConcepts = async () => {
    const content = selectedNote?.content || newNoteContent;
    if (!content.trim()) return;
    
    setIsExtracting(true);
    try {
      const concepts = await extractConcepts(content);
      setExtractedConcepts(concepts);
      return concepts;
    } catch (error) {
      console.error("Error extracting concepts:", error);
      return [];
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSummarize = async () => {
    const content = selectedNote?.content || newNoteContent;
    if (!content.trim()) return;
    
    setIsSummarizing(true);
    try {
      const result = await summarizeNote(content);
      setSummary(result);
    } catch (error) {
      console.error("Error summarizing:", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGetExplanationPrompt = async (concept: string) => {
    setIsLoadingPrompt(true);
    try {
      const prompt = await generateExplanationPrompt(concept);
      setAiPrompt(prompt);
    } catch (error) {
      console.error("Error getting prompt:", error);
    } finally {
      setIsLoadingPrompt(false);
    }
  };

  const handleSaveNote = async () => {
    console.log("Save button clicked!");
    console.log("Title:", newNoteTitle);
    console.log("Content length:", newNoteContent.length);
    
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      console.log("Title or content is empty, not saving");
      setSaveError("Please add a title and content");
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    // Try to extract concepts, but don't block save if it fails
    let conceptsToSave = [...extractedConcepts];
    
    if (conceptsToSave.length === 0) {
      console.log("No concepts yet, trying to extract...");
      try {
        const extracted = await extractConcepts(newNoteContent);
        if (extracted && extracted.length > 0) {
          conceptsToSave = extracted;
          setExtractedConcepts(extracted);
          console.log("Extracted concepts:", extracted);
        }
      } catch (error) {
        console.error("Error auto-extracting concepts (continuing anyway):", error);
        // Continue without concepts - still save the note
      }
    }

    console.log("Creating note with concepts:", conceptsToSave);

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      concepts: conceptsToSave,
      summary: summary || undefined,
      updated: "Just now",
      createdAt: Date.now(),
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    
    console.log("Note saved successfully!");
    
    setIsSaving(false);
    setShowSaveSuccess(true);

    // Hide success message and reset form after delay
    setTimeout(() => {
      setShowSaveSuccess(false);
      setIsCreating(false);
      setNewNoteTitle("");
      setNewNoteContent("");
      setExtractedConcepts([]);
      setSummary("");
      setAiPrompt("");
    }, 2500);
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setSelectedNote(null);
  };

  const closeEditor = () => {
    setSelectedNote(null);
    setIsCreating(false);
    setNewNoteTitle("");
    setNewNoteContent("");
    setExtractedConcepts([]);
    setSummary("");
    setAiPrompt("");
    setShowSaveSuccess(false);
    setSaveError(null);
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {!selectedNote && !isCreating ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-semibold text-foreground mb-2">Your Notes</h1>
                  <p className="text-muted-foreground">Capture and organize your thoughts</p>
                </div>
                <Button 
                  variant="hero" 
                  onClick={() => setIsCreating(true)}
                  data-tutorial="new-note"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              </div>

              {notes.length === 0 ? (
                /* Empty State */
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-lavender/20 flex items-center justify-center mx-auto mb-6">
                    <PenLine className="w-10 h-10 text-lavender" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">
                    No notes yet
                  </h2>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                    Start by writing about something you're learning. 
                    AI will help you extract key concepts automatically.
                  </p>
                  <Button 
                    variant="hero" 
                    onClick={() => setIsCreating(true)}
                    data-tutorial="new-note-empty"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Note
                  </Button>

                  {/* Writing prompts */}
                  <div className="mt-12 p-6 bg-accent/30 rounded-3xl border border-accent/50 text-left max-w-md mx-auto">
                    <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      Not sure what to write about?
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Something interesting you learned today</li>
                      <li>• A concept you're trying to understand</li>
                      <li>• Notes from a book, video, or class</li>
                      <li>• An idea you want to explore further</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <>
                  {/* Notes Grid */}
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => {
                          setSelectedNote(note);
                          setExtractedConcepts(note.concepts);
                          setSummary(note.summary || "");
                        }}
                        className="p-6 bg-card rounded-3xl border border-border/50 shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer group"
                      >
                        <h3 className="text-lg font-medium text-foreground mb-2">{note.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{note.content}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {note.concepts.length} concepts
                          </span>
                          <span>•</span>
                          <span>{formatTimeAgo(note.createdAt)}</span>
                        </div>
                        {note.concepts.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {note.concepts.slice(0, 4).map((concept) => (
                              <span key={concept} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                {concept}
                              </span>
                            ))}
                            {note.concepts.length > 4 && (
                              <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                                +{note.concepts.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* View Concept Map CTA */}
                  <div className="mt-8 p-6 bg-sage/10 rounded-3xl border border-sage/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <Network className="w-5 h-5 text-sage mt-0.5" />
                        <div>
                          <p className="text-foreground font-medium">
                            You have {notes.reduce((acc, n) => acc + n.concepts.length, 0)} concepts from {notes.length} notes
                          </p>
                          <p className="text-sm text-muted-foreground">
                            See how they connect in your Concept Map!
                          </p>
                        </div>
                      </div>
                      <Button variant="soft" onClick={() => navigate("/concept-map")}>
                        <Network className="w-4 h-4 mr-2" />
                        View Map
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            /* Note Editor */
            <div className="space-y-6">
              {/* Success Message */}
              {showSaveSuccess && (
                <div className="fixed top-4 right-4 z-50 animate-fade-up">
                  <div className="bg-sage text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Note Saved!</p>
                      <p className="text-sm opacity-90">
                        {extractedConcepts.length > 0 
                          ? `${extractedConcepts.length} concepts added to your map`
                          : "Your note has been saved"
                        }
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white hover:bg-white/20 ml-2"
                      onClick={() => navigate("/concept-map")}
                    >
                      View Map →
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-foreground">
                  {isCreating ? "Create New Note" : selectedNote?.title}
                </h1>
                <div className="flex items-center gap-2">
                  {selectedNote && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteNote(selectedNote.id)}
                    >
                      Delete
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={closeEditor}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {saveError && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
                  <p className="text-sm text-destructive">{saveError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Editor */}
                <div className="lg:col-span-2 space-y-4">
                  <input
                    type="text"
                    placeholder="Note title..."
                    value={selectedNote?.title || newNoteTitle}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewNoteTitle(e.target.value);
                        setSaveError(null);
                      }
                    }}
                    className="w-full px-4 py-3 bg-card rounded-2xl border border-border/50 text-foreground text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    readOnly={!!selectedNote}
                  />
                  <textarea
                    placeholder="Start writing your thoughts...

Try writing about:
• A concept you're trying to understand
• Something interesting you learned
• Notes from a book, video, or lecture"
                    value={selectedNote?.content || newNoteContent}
                    onChange={(e) => {
                      if (isCreating) {
                        setNewNoteContent(e.target.value);
                        setSaveError(null);
                      }
                    }}
                    className="w-full h-64 px-4 py-3 bg-card rounded-2xl border border-border/50 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    readOnly={!!selectedNote}
                  />

                  {/* AI Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="soft" 
                      onClick={handleExtractConcepts}
                      disabled={isExtracting || !(selectedNote?.content || newNoteContent)}
                      data-tutorial="extract-concepts"
                    >
                      {isExtracting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Extract Concepts
                    </Button>
                    <Button 
                      variant="soft" 
                      onClick={handleSummarize}
                      disabled={isSummarizing || !(selectedNote?.content || newNoteContent)}
                    >
                      {isSummarizing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <BookOpen className="w-4 h-4 mr-2" />
                      )}
                      Summarize
                    </Button>
                    {isCreating && (
                      <Button 
                        variant="hero" 
                        onClick={handleSaveNote}
                        disabled={isSaving}
                        className="ml-auto"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Note
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Hint about auto-extraction */}
                  {isCreating && extractedConcepts.length === 0 && newNoteContent.length > 50 && (
                    <div className="p-3 bg-accent/30 rounded-xl">
                      <p className="text-sm text-muted-foreground">
                        <Lightbulb className="w-4 h-4 inline mr-1 text-primary" />
                        Tip: Click "Extract Concepts" to see key ideas, or just save and we'll try to extract them automatically!
                      </p>
                    </div>
                  )}
                </div>

                {/* AI Panel */}
                <div className="space-y-4">
                  {/* Summary */}
                  {summary && (
                    <div className="p-4 bg-card rounded-2xl border border-border/50">
                      <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        AI Summary
                      </h3>
                      <p className="text-sm text-muted-foreground">{summary}</p>
                    </div>
                  )}

                  {/* Extracted Concepts */}
                  {extractedConcepts.length > 0 && (
                    <div className="p-4 bg-card rounded-2xl border border-border/50">
                      <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Key Concepts ({extractedConcepts.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {extractedConcepts.map((concept) => (
                          <button
                            key={concept}
                            onClick={() => handleGetExplanationPrompt(concept)}
                            className="px-3 py-1.5 text-sm bg-primary/10 text-foreground rounded-full hover:bg-primary/20 transition-colors"
                          >
                            {concept}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        These will appear in your Concept Map when you save!
                      </p>
                    </div>
                  )}

                  {/* AI Explanation Prompt */}
                  {(aiPrompt || isLoadingPrompt) && (
                    <div className="p-4 bg-accent/30 rounded-2xl border border-accent/50">
                      <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-primary" />
                        Try explaining...
                      </h3>
                      {isLoadingPrompt ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Generating prompt...</span>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">{aiPrompt}</p>
                      )}
                    </div>
                  )}

                  {/* Empty State */}
                  {!summary && extractedConcepts.length === 0 && !aiPrompt && (
                    <div className="p-6 bg-muted/30 rounded-2xl border border-dashed border-border/50 text-center">
                      <Sparkles className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Write some content, then use AI to extract concepts and create summaries
                      </p>
                    </div>
                  )}

                  {/* Concept Map hint */}
                  {isCreating && extractedConcepts.length > 0 && (
                    <div className="p-4 bg-sage/10 rounded-2xl border border-sage/30">
                      <div className="flex items-start gap-2">
                        <Network className="w-4 h-4 text-sage mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Ready for your Concept Map!</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Save this note to see these {extractedConcepts.length} concepts visualized with AI-discovered connections.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notes;
