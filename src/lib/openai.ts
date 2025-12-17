// OpenAI API integration for NeuraNote AI features

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

async function callOpenAI(messages: Message[], temperature = 0.7): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API error");
  }

  const data: OpenAIResponse = await response.json();
  return data.choices[0]?.message?.content || "";
}

// Extract key concepts from note content
export async function extractConcepts(noteContent: string): Promise<string[]> {
  const messages: Message[] = [
    {
      role: "system",
      content: `You are a learning assistant that helps identify key concepts from notes. 
Extract the main concepts, terms, and ideas from the given text. 
Return them as a JSON array of strings. Only return the JSON array, nothing else.
Example: ["concept1", "concept2", "concept3"]`,
    },
    {
      role: "user",
      content: noteContent,
    },
  ];

  const response = await callOpenAI(messages, 0.3);
  try {
    return JSON.parse(response);
  } catch {
    // If parsing fails, try to extract from the response
    const match = response.match(/\[.*\]/s);
    if (match) {
      return JSON.parse(match[0]);
    }
    return [];
  }
}

// Generate a summary of the note
export async function summarizeNote(noteContent: string): Promise<string> {
  const messages: Message[] = [
    {
      role: "system",
      content: `You are a learning assistant. Create a concise, helpful summary of the given note content.
Focus on the main ideas and how they connect. Keep it under 100 words.
Be encouraging and supportive in tone.`,
    },
    {
      role: "user",
      content: noteContent,
    },
  ];

  return callOpenAI(messages, 0.5);
}

// Generate review questions based on concepts
export async function generateReviewQuestions(
  concepts: string[],
  previousQuestions: string[] = []
): Promise<{ question: string; concept: string; hint: string }[]> {
  const messages: Message[] = [
    {
      role: "system",
      content: `You are a gentle learning assistant creating review questions for spaced repetition.
Generate thoughtful questions that help learners actively recall and understand concepts.
Questions should be open-ended and encourage reflection, not just memorization.
Avoid questions that are already in the previous questions list.

Return a JSON array with objects containing:
- question: the review question
- concept: which concept it relates to
- hint: a gentle hint if the learner gets stuck

Example: [{"question": "How would you explain X to a friend?", "concept": "X", "hint": "Think about..."}]
Only return the JSON array.`,
    },
    {
      role: "user",
      content: `Generate 3 review questions for these concepts: ${concepts.join(", ")}
      
Previous questions to avoid: ${previousQuestions.join(", ") || "none"}`,
    },
  ];

  const response = await callOpenAI(messages, 0.7);
  try {
    return JSON.parse(response);
  } catch {
    const match = response.match(/\[.*\]/s);
    if (match) {
      return JSON.parse(match[0]);
    }
    return [];
  }
}

// Provide feedback on user's answer/explanation
export async function provideFeedback(
  question: string,
  userAnswer: string,
  concept: string
): Promise<{ feedback: string; understanding: "strong" | "developing" | "needs_work"; suggestions: string[] }> {
  const messages: Message[] = [
    {
      role: "system",
      content: `You are a supportive learning coach providing feedback on a student's explanation.
Be encouraging and constructive. Focus on what they got right first, then gently suggest improvements.
Never be harsh or discouraging - learning is a journey!

Return a JSON object with:
- feedback: a warm, encouraging response (2-3 sentences)
- understanding: "strong", "developing", or "needs_work"
- suggestions: array of 1-2 gentle suggestions for deeper understanding

Only return the JSON object.`,
    },
    {
      role: "user",
      content: `Question about "${concept}": ${question}

Student's answer: ${userAnswer}`,
    },
  ];

  const response = await callOpenAI(messages, 0.6);
  try {
    return JSON.parse(response);
  } catch {
    const match = response.match(/\{.*\}/s);
    if (match) {
      return JSON.parse(match[0]);
    }
    return {
      feedback: "Thank you for sharing your thoughts! Keep exploring this concept.",
      understanding: "developing",
      suggestions: ["Try connecting this to other concepts you know"],
    };
  }
}

// Generate personalized learning insights
export async function generateInsights(
  concepts: { name: string; strength: number; lastReviewed: string }[],
  reflections: string[] = []
): Promise<{ summary: string; strengths: string[]; focusAreas: string[]; encouragement: string }> {
  const messages: Message[] = [
    {
      role: "system",
      content: `You are a supportive learning coach analyzing a student's learning journey.
Provide warm, personalized insights about their progress.
Be encouraging and focus on growth mindset.

Return a JSON object with:
- summary: a brief, encouraging overview of their learning (2-3 sentences)
- strengths: array of 2-3 areas where they're doing well
- focusAreas: array of 1-2 concepts that might need more attention (framed positively)
- encouragement: a motivating message for their journey

Only return the JSON object.`,
    },
    {
      role: "user",
      content: `Student's concept progress:
${concepts.map((c) => `- ${c.name}: strength ${c.strength}/100, last reviewed ${c.lastReviewed}`).join("\n")}

Recent reflections: ${reflections.join(" | ") || "No reflections yet"}`,
    },
  ];

  const response = await callOpenAI(messages, 0.7);
  try {
    return JSON.parse(response);
  } catch {
    const match = response.match(/\{.*\}/s);
    if (match) {
      return JSON.parse(match[0]);
    }
    return {
      summary: "You're making great progress on your learning journey!",
      strengths: ["Consistent effort", "Curious mindset"],
      focusAreas: ["Keep exploring new connections"],
      encouragement: "Every step forward is progress. Keep going!",
    };
  }
}

// Suggest connections between concepts
export async function suggestConnections(
  concepts: string[]
): Promise<{ from: string; to: string; explanation: string }[]> {
  const messages: Message[] = [
    {
      role: "system",
      content: `You are a learning assistant helping students see connections between concepts.
Identify meaningful relationships between the given concepts.
Explain each connection in a simple, insightful way.

Return a JSON array with objects containing:
- from: first concept
- to: second concept  
- explanation: how they connect (1 sentence)

Only return the JSON array.`,
    },
    {
      role: "user",
      content: `Find connections between these concepts: ${concepts.join(", ")}`,
    },
  ];

  const response = await callOpenAI(messages, 0.6);
  try {
    return JSON.parse(response);
  } catch {
    const match = response.match(/\[.*\]/s);
    if (match) {
      return JSON.parse(match[0]);
    }
    return [];
  }
}

// Generate explanation prompt for a concept
export async function generateExplanationPrompt(concept: string): Promise<string> {
  const messages: Message[] = [
    {
      role: "system",
      content: `You are a learning assistant helping students practice explaining concepts.
Generate a friendly, thought-provoking prompt that encourages the student to explain the concept in their own words.
The prompt should be open-ended and encourage deep thinking.
Keep it to 1-2 sentences.`,
    },
    {
      role: "user",
      content: `Create an explanation prompt for the concept: ${concept}`,
    },
  ];

  return callOpenAI(messages, 0.8);
}

