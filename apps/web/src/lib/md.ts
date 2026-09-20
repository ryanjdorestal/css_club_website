/** Tiny markdown loader for content/*.md — frontmatter + ##-heading blocks.
    Our migrated copy only uses headings and paragraphs; no dependency needed. */

export type MdDoc = {
  meta: Record<string, string>;
  blocks: { type: "h2" | "p"; text: string }[];
};

export function parseMd(raw: string): MdDoc {
  const meta: Record<string, string> = {};
  let body = raw;
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fm) {
    body = raw.slice(fm[0].length);
    for (const line of fm[1].split("\n")) {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  const blocks: MdDoc["blocks"] = [];
  for (const chunk of body.split(/\n{2,}/)) {
    const t = chunk.trim();
    if (!t) continue;
    if (t.startsWith("## ")) blocks.push({ type: "h2", text: t.slice(3).trim() });
    else blocks.push({ type: "p", text: t.replace(/\n/g, " ") });
  }
  return { meta, blocks };
}
