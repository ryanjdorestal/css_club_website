/** The browser-side Tier-1 inbox (written by postWithFallback when the API is
    down). The server-side twin lives at .cache/inbox/*.jsonl; Supabase replaces
    both once configured. */
export type InboxItem = { path: string; payload: Record<string, string>; ts: string };

export function readInbox(): InboxItem[] {
  try {
    return JSON.parse(localStorage.getItem("jjcss-inbox") ?? "[]");
  } catch {
    return [];
  }
}

export function removeInboxItem(index: number): InboxItem[] {
  const items = readInbox();
  items.splice(index, 1);
  localStorage.setItem("jjcss-inbox", JSON.stringify(items));
  return items;
}
