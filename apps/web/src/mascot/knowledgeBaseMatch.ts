/** Client-side mirror of the Python KB matcher — used when the API is down
    (the widget answers from the bundled KB; the site never shows a dead chat). */
import kb from "@data/kb.json";

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

export function matchKb(message: string, page?: string): ChatAnswer {
  const msgTokens = new Set(tokens(message));
  const msgLower = message.toLowerCase();
  let best: (typeof kb.entries)[number] | null = null;
  let bestScore = 0;
  for (const entry of kb.entries) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (kw.includes(" ")) {
        if (msgLower.includes(kw)) score += 3;
      } else {
        const kwStem = stem(kw.toLowerCase());
        if (msgTokens.has(kwStem)) score += 2;
      }
    }
    if (page && entry.pages?.some((p: string) => page.startsWith(p))) score += 1;
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  if (!best || bestScore < 2) {
    return { ...kb.fallback, citations: [], source: "static-offline" } as ChatAnswer;
  }
  return {
    answer: best.answer,
    suggestions: best.suggestions ?? [],
    citations: best.citations ?? [],
    emote: best.emote ?? "happy",
    source: "static-offline",
  };
}
