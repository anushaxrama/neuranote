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
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      setSaveError("Please add a title and content");
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    let conceptsToSave = [...extractedConcepts];
    
    if (conceptsToSave.length === 0) {
      try {
        const extracted = await extractConcepts(newNoteContent);
        if (extracted && extracted.length > 0) {
          conceptsToSave = extracted;
          setExtractedConcepts(extracted);
        }
      } catch (error) {
        console.error("Error auto-extracting concepts:", error);
      }
    }

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
    
    setIsSaving(false);
    setShowSaveSuccess(true);

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
    <div className="min-h-screen bg-[#FDFCFA] flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="gradient-blob gradient-blob-coral blob-float absolute"
            style={{ width: '400px', height: '400px', top: '-5%', right: '20%' }}
          />
          <div 
            className="gradient-blob gradient-blob-purple blob-float-delayed absolute"
            style={{ width: '350px', height: '350px', bottom: '10%', left: '5%' }}
          />
        </div>

        <div className="relative z-10 p-8 lg:p-12">
          <div className="max-w-4xl mx-auto">
            {!selectedNote && !isCreating ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-10 animate-fade-up">
            <div>
                    <p className="font-display-italic text-lg text-muted-foreground mb-2">
                      Your thoughts, captured
                    </p>
                    <h1 className="text-4xl font-medium text-foreground tracking-tight">Notes</h1>
            </div>
                  <Button 
                    className="btn-primary"
                    onClick={() => setIsCreating(true)}
                    data-tutorial="new-note"
                  >
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>

                {notes.length === 0 ? (
                  /* Empty State */
                  <div className="text-center py-20 animate-fade-up">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center mx-auto mb-8">
                      <PenLine className="w-12 h-12 text-pink-600" />
                    </div>
                    <p className="font-display-italic text-lg text-muted-foreground mb-3">
                      Begin your journey
                    </p>
                    <h2 className="text-3xl font-medium text-foreground mb-4">
                      Write Your First<br />
                      <span className="font-display-italic">Note</span>
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                      Start by writing about something you're learning. 
                      AI will help you extract key concepts automatically.
                    </p>
                    <Button 
                      className="btn-primary"
                      onClick={() => setIsCreating(true)}
                      data-tutorial="new-note-empty"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Note
                    </Button>

                    {/* Writing prompts */}
                    <div className="mt-14 glass rounded-3xl p-8 text-left max-w-md mx-auto">
                      <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Not sure what to write about?
                      </h3>
                      <ul className="text-sm text-muted-foreground space-y-3">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          Something interesting you learned today
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          A concept you're trying to understand
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          Notes from a book, video, or class
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          An idea you want to explore further
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="stagger-children">
          {/* Notes Grid */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {notes.map((note, i) => (
                        <div
                          key={note.id}
                          onClick={() => {
                            setSelectedNote(note);
                            setExtractedConcepts(note.concepts);
                            setSummary(note.summary || "");
                          }}
                          className={`card-modern p-6 cursor-pointer hover:scale-[1.02] transition-all duration-300
                            ${i === 0 ? 'md:col-span-2' : ''}`}
              >
                <h3 className="text-lg font-medium text-foreground mb-2">{note.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{note.content}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" />
                              {note.concepts.length} concepts
                            </span>
                            <span className="text-muted-foreground/40">•</span>
                            <span>{formatTimeAgo(note.createdAt)}</span>
                          </div>
                          {note.concepts.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {note.concepts.slice(0, 4).map((concept, j) => (
                                <span 
                                  key={concept} 
                                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all
                                    ${j % 4 === 0 ? 'bubble-blue' : ''}
                                    ${j % 4 === 1 ? 'bubble-green' : ''}
                                    ${j % 4 === 2 ? 'bubble-pink' : ''}
                                    ${j % 4 === 3 ? 'bubble-purple' : ''}
                                  `}
                                >
                                  {concept}
                                </span>
                              ))}
                              {note.concepts.length > 4 && (
                                <span className="px-3 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                                  +{note.concepts.length - 4} more
                                </span>
                              )}
                </div>
                          )}
              </div>
            ))}
          </div>

                    {/* View Concept Map CTA */}
                    <div className="mt-8 glass rounded-3xl p-6">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                            <Network className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {notes.reduce((acc, n) => acc + n.concepts.length, 0)} concepts from {notes.length} notes
                            </p>
                            <p className="text-sm text-muted-foreground">
                              See how they connect in your Concept Map!
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="rounded-full px-6"
                          onClick={() => navigate("/concept-map")}
                        >
                          <Network className="w-4 h-4 mr-2" />
                          View Map
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Note Editor */
              <div className="space-y-6 animate-fade-up">
                {/* Success Message */}
                {showSaveSuccess && (
                  <div className="fixed top-6 right-6 z-50 animate-fade-up">
                    <div className="glass rounded-2xl shadow-elevated p-5 flex items-center gap-4 border border-emerald-200 bg-emerald-50/80">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Note Saved!</p>
                        <p className="text-sm text-muted-foreground">
                          {extractedConcepts.length > 0 
                            ? `${extractedConcepts.length} concepts added`
                            : "Your note has been saved"
                          }
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2 rounded-full"
                        onClick={() => navigate("/concept-map")}
                      >
                        View Map →
                      </Button>
                    </div>
                  </div>
                )}

                {/* Editor Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display-italic text-muted-foreground mb-1">
                      {isCreating ? 'New note' : 'Viewing note'}
                    </p>
                    <h1 className="text-2xl font-medium text-foreground">
                      {isCreating ? "Create Note" : selectedNote?.title}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedNote && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => handleDeleteNote(selectedNote.id)}
                      >
                        Delete
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full"
                      onClick={closeEditor}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Error Message */}
                {saveError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-sm text-red-600">{saveError}</p>
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
                      className="w-full px-5 py-4 glass rounded-2xl text-foreground text-xl font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-200"
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
                      className="w-full h-72 px-5 py-4 glass rounded-2xl text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-violet-200 leading-relaxed"
                      readOnly={!!selectedNote}
                    />

                    {/* AI Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="outline" 
                        className="rounded-full"
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
                        variant="outline" 
                        className="rounded-full"
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
                          className="btn-primary ml-auto"
                          onClick={handleSaveNote}
                          disabled={isSaving}
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

                    {/* Hint */}
                    {isCreating && extractedConcepts.length === 0 && newNoteContent.length > 50 && (
                      <div className="glass rounded-2xl p-4">
                        <p className="text-sm text-muted-foreground">
                          <Lightbulb className="w-4 h-4 inline mr-2 text-amber-500" />
                          Tip: Click "Extract Concepts" to see key ideas, or just save and we'll extract them automatically!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* AI Panel */}
                  <div className="space-y-4">
                    {/* Summary */}
                    {summary && (
                      <div className="glass rounded-2xl p-5">
                        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-violet-500" />
                          AI Summary
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
                      </div>
                    )}

                    {/* Extracted Concepts */}
                    {extractedConcepts.length > 0 && (
                      <div className="glass rounded-2xl p-5">
                        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-violet-500" />
                          Key Concepts ({extractedConcepts.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {extractedConcepts.map((concept, i) => (
                            <button
                              key={concept}
                              onClick={() => handleGetExplanationPrompt(concept)}
                              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all hover:scale-105
                                ${i % 4 === 0 ? 'bubble-blue' : ''}
                                ${i % 4 === 1 ? 'bubble-green' : ''}
                                ${i % 4 === 2 ? 'bubble-pink' : ''}
                                ${i % 4 === 3 ? 'bubble-purple' : ''}
                              `}
                            >
                              {concept}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                          These will appear in your Concept Map when you save!
                        </p>
                      </div>
                    )}

                    {/* AI Explanation Prompt */}
                    {(aiPrompt || isLoadingPrompt) && (
                      <div className="glass rounded-2xl p-5 border-2 border-violet-100">
                        <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          Try explaining...
                        </h3>
                        {isLoadingPrompt ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Generating prompt...</span>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground font-display-italic">{aiPrompt}</p>
                        )}
                      </div>
                    )}

                    {/* Empty State */}
                    {!summary && extractedConcepts.length === 0 && !aiPrompt && (
                      <div className="glass rounded-2xl p-6 text-center border-2 border-dashed border-muted">
                        <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
                          Write content, then use AI to extract concepts and create summaries
                        </p>
                      </div>
                    )}

                    {/* Ready hint */}
                    {isCreating && extractedConcepts.length > 0 && (
                      <div className="glass rounded-2xl p-5 border-2 border-emerald-100 bg-emerald-50/50">
                        <div className="flex items-start gap-3">
                          <Network className="w-5 h-5 text-emerald-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Ready for your Concept Map!</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Save this note to see these {extractedConcepts.length} concepts visualized.
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
        </div>
      </main>
    </div>
  );
};

export default Notes;
