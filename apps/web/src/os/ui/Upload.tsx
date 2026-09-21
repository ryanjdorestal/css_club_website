/** Image upload field → /api/os/uploads (≤ 2 MB jpg/png/webp, resized to
    1600 px server-side). Shows the stored path and a thumbnail. Used by the
    Posts (cover) and Events (flyer) editors. */
import { useState } from "react";
import { osFetch } from "../session";

export function Upload({ label, value, onChange }: { label: string; value: string; onChange: (path: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="grid md:grid-cols-[170px_1fr] gap-1 md:gap-5 items-start px-4 py-3 border border-line border-b-0">
      <span className="mono-label text-muted pt-2">{label}</span>
      <div className="flex items-center gap-4 flex-wrap">
        {value && <img src={value} alt="" className="h-14 w-auto border border-line" />}
        <label className="t-micro raise border border-line px-3 py-1.5 cursor-pointer hover:border-teal text-muted hover:text-ink">
          {busy ? "uploading…" : value ? "replace" : "choose file"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy(true);
              setErr(null);
              const form = new FormData();
              form.append("file", f);
              const r = await osFetch<{ path: string }>("/api/os/uploads", { form });
              if (r.ok) onChange(r.data.path);
              else setErr(r.error ?? "upload failed");
              setBusy(false);
            }}
          />
        </label>
        {value && (
          <button type="button" onClick={() => onChange("")} className="t-micro text-muted hover:text-ink cursor-pointer">
            remove
          </button>
        )}
        {value && <span className="font-mono text-[11px] text-muted truncate max-w-[280px]">{value}</span>}
        {err && <span className="t-micro text-(--color-red-hi)">{err}</span>}
      </div>
    </div>
  );
}
