# NeuraNote

NeuraNote explores a study workflow built around understanding and revisiting ideas. Instead of ending at a saved note, the interface connects note-taking with concept extraction, a concept map, review questions, and learning reflections.

This is a learning-product concept implemented as a React application. Its visual language uses soft color, floating concept bubbles, and a calmer dashboard to make returning to study feel manageable.

## What to explore

- **Notes:** write material, extract concepts, and request a summary.
- **Concept map:** explore the ideas collected from notes.
- **Review:** work through recall questions and feedback.
- **Insights:** inspect learning progress and suggested focus areas.
- **Supporting pages:** onboarding guidance, settings, the learning approach, and pricing concepts.

These screens demonstrate the intended experience. They do not establish measured improvements in memory or learning outcomes.

## Run the interface locally

Use Node.js and npm:

```sh
git clone https://github.com/anushaxrama/neuranote.git
cd neuranote
npm install
npm run dev
```

Open the local URL printed by Vite.

```sh
npm run build
npm run lint
npm run preview
```

## AI integration and current limitation

`src/lib/openai.ts` contains requests for concept extraction, summaries, review questions, feedback, insights, and concept connections. The current implementation reads `VITE_OPENAI_API_KEY` and calls the provider from the browser.

Vite exposes `VITE_*` values to browser code. Do not put a real API secret into a publicly deployed build. The interface can be inspected without configuring a key, but AI actions require the integration. A hosted version needs a server-side endpoint, secret storage, and request limits before enabling these calls for visitors.

## Code guide

| Location | Responsibility |
| --- | --- |
| `src/pages/Notes.tsx` | Note editing and concept extraction flow |
| `src/pages/ConceptMap.tsx` | Concept visualization |
| `src/pages/Review.tsx` | Review experience |
| `src/pages/Insights.tsx` | Learning feedback screen |
| `src/lib/openai.ts` | Provider requests and response parsing |
| `src/components/` | Shared navigation, tutorial, and UI components |

Built with React, TypeScript, Vite, React Router, Tailwind CSS, and shadcn/ui components.
