import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, FileText, Network, RefreshCw, BarChart3, Settings, 
  ArrowLeft, Plus, Sparkles, X, Save, Loader2, Lightbulb, BookOpen 
} from "lucide-react";
import { extractConcepts, summarizeNote, generateExplanationPrompt } from "@/lib/openai";

const sidebarItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: FileText, label: "Notes", path: "/notes", active: true },
  { icon: Network, label: "Concept Map", path: "/concept-map" },
  { icon: RefreshCw, label: "Review", path: "/review" },
  { icon: BarChart3, label: "Insights", path: "/insights" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface Note {
  id: string;
  title: string;
  content: string;
  concepts: string[];
  summary?: string;
  updated: string;
}

const initialNotes: Note[] = [
  { 
    id: "1",
    title: "Understanding Memory", 
    content: "Memory is the process by which we encode, store, and retrieve information. There are different types: short-term (working) memory and long-term memory. The hippocampus plays a crucial role in converting short-term memories into long-term ones. Repetition and emotional significance help strengthen memories.",
    concepts: ["Memory Encoding", "Working Memory", "Long-term Memory"], 
    updated: "Just now" 
  },
  { 
    id: "2",
    title: "Learning Techniques", 
    content: "Effective learning involves active recall, spaced repetition, and interleaving. Active recall means testing yourself rather than passive re-reading. Spaced repetition involves reviewing material at increasing intervals. Interleaving means mixing different topics or problem types during study.",
    concepts: ["Active Recall", "Spaced Repetition", "Interleaving", "Metacognition", "Elaboration"], 
    updated: "2 hours ago" 
  },
  { 
    id: "3",
    title: "Cognitive Psychology Basics", 
    content: "Cognitive psychology studies mental processes including perception, attention, language, memory, and thinking. Key concepts include cognitive load (the amount of mental effort used), chunking (grouping information), and schemas (mental frameworks for organizing information).",
    concepts: ["Cognitive Load", "Attention", "Perception", "Chunking", "Schemas", "Mental Models", "Problem Solving", "Decision Making"], 
    updated: "Yesterday" 
  },
];

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
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
    };

    setNotes([newNote, ...notes]);
    setIsCreating(false);
    setNewNoteTitle("");
    setNewNoteContent("");
    setExtractedConcepts([]);
    setSummary("");
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card/50 border-r border-border/50 p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-primary/60" />
          </div>
          <span className="text-lg font-medium text-foreground">NeuraNote</span>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                item.active
                  ? "bg-primary/10 text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Button>
          </Link>
        </div>
      </aside>

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
                <Button variant="hero" onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              </div>

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
                      <span>Updated {note.updated}</span>
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
          ) : (
            /* Note Editor */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-foreground">
                  {isCreating ? "Create New Note" : "Edit Note"}
                </h1>
                <Button variant="ghost" size="icon" onClick={closeEditor}>
                  <X className="w-5 h-5" />
                </Button>
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
                    placeholder="Start writing your thoughts..."
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
                        Use AI to extract concepts and create summaries from your notes
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
