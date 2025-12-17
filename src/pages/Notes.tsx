import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, Sparkles, X, Save, Loader2, Lightbulb, BookOpen,
  PenLine
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
  const stored = localStorage.getItem("neuranoteNotes");
  return stored ? JSON.parse(stored) : [];
};

const saveNotes = (notes: Note[]) => {
  localStorage.setItem("neuranoteNotes", JSON.stringify(notes));
  // Also save all concepts for other pages
  const allConcepts = notes.flatMap(n => n.concepts);
  const uniqueConcepts = [...new Set(allConcepts)];
  localStorage.setItem("neuranoteConcepts", JSON.stringify(uniqueConcepts));
};

const Notes = () => {
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
    } catch (error) {
      console.error("Error extracting concepts:", error);
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

  const handleSaveNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle,
      content: newNoteContent,
      concepts: extractedConcepts,
      summary: summary || undefined,
      updated: "Just now",
      createdAt: Date.now(),
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    
    setIsCreating(false);
    setNewNoteTitle("");
    setNewNoteContent("");
    setExtractedConcepts([]);
    setSummary("");
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
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

                  {/* AI Suggestion */}
                  <div className="mt-8 p-6 bg-accent/30 rounded-3xl border border-accent/50">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        <span className="text-foreground font-medium">AI Tip:</span> When you create a note, 
                        I can automatically extract key concepts and create a summary to help you learn better!
                      </p>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            /* Note Editor */
            <div className="space-y-6">
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Editor */}
                <div className="lg:col-span-2 space-y-4">
                  <input
                    type="text"
                    placeholder="Note title..."
                    value={selectedNote?.title || newNoteTitle}
                    onChange={(e) => isCreating ? setNewNoteTitle(e.target.value) : null}
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
                    onChange={(e) => isCreating ? setNewNoteContent(e.target.value) : null}
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
                        disabled={!newNoteTitle.trim() || !newNoteContent.trim()}
                        className="ml-auto"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Note
                      </Button>
                    )}
                  </div>
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
                        Key Concepts
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
                        Click a concept to get an explanation prompt
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
