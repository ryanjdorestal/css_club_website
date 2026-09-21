/** Client-side mirror of the Python KB matcher — used when the API is down
    (the widget answers from the bundled KB; the site never shows a dead chat). */
import knowledgeBase from "@data/kb.json";

type ChatAnswer = {
  answer: string;
  suggestions: string[];
  citations: { label: string; href: string }[];
  emote: string;
  source: "static-offline";
};

const STOP = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "do",
  "i",
  "how",
  "what",
  "when",
  "where",
  "who",
  "to",
  "of",
  "in",
  "on",
  "for",
  "and",
  "or",
  "it",
  "you",
  "we",
  "can",
]);

function stem(w: string): string {
  return w.replace(/(ing|ers|er|ies|s)$/i, "");
}

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem);
}

type Entry = (typeof knowledgeBase.entries)[number];

/** Keyword score: a phrase keyword found in the message = 3, a stemmed word match = 2, the current page listed = 1. */
type Query = { lower: string; words: Set<string>; page?: string };

function score(entry: Entry, q: Query): number {
  let total = 0;
  for (const kw of entry.keywords) {
    if (kw.includes(" ")) total += q.lower.includes(kw) ? 3 : 0;
    else total += q.words.has(stem(kw.toLowerCase())) ? 2 : 0;
  }
  if (q.page && entry.pages?.some((p: string) => q.page?.startsWith(p))) total += 1;
  return total;
}

export function matchKb(message: string, page?: string): ChatAnswer {
  const q: Query = { lower: message.toLowerCase(), words: new Set(tokens(message)), page };
  let best: Entry | null = null;
  let bestScore = 0;
  for (const entry of knowledgeBase.entries) {
    const s = score(entry, q);
    if (s > bestScore) [best, bestScore] = [entry, s];
  }
  if (!best || bestScore < 2) return { ...knowledgeBase.fallback, citations: [], source: "static-offline" } as ChatAnswer;
  return { answer: best.answer, suggestions: best.suggestions ?? [], citations: best.citations ?? [], emote: best.emote ?? "happy", source: "static-offline" };
}
