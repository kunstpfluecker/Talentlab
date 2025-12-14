/* eslint-disable @next/next/no-img-element */
import { useMemo } from "react";

export function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-white/10 p-4 shadow-lg backdrop-blur ${
        accent ? "bg-gradient-to-br from-[#e10600]/30 to-[#b00012]/20" : "bg-white/5"
      }`}
    >
      <p className="text-xs uppercase tracking-[0.14em] text-slate-200">{label}</p>
      <div className="mt-1 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

export function QuickAction({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start gap-1 rounded-xl border border-white/10 bg-white/5 p-3 text-left text-white transition hover:border-[#e10600]/60 hover:shadow-[0_12px_32px_rgba(225,6,0,0.25)]"
    >
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs text-slate-300">{desc}</span>
      <span className="text-[11px] uppercase tracking-[0.18em] text-[#ffb3b8] opacity-0 transition group-hover:opacity-100">
        Los geht’s →
      </span>
    </button>
  );
}

export function SortableTh({
  label,
  onClick,
  active,
  dir,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  dir?: "asc" | "desc";
}) {
  return (
    <th
      className={`px-3 py-2 text-left ${onClick ? "cursor-pointer select-none" : ""}`}
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1 text-white">
        {label}
        {onClick && (
          <span className="text-[11px] text-slate-300">
            {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
          </span>
        )}
      </span>
    </th>
  );
}

type MultiAddInputProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  selected: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
};

export function MultiAddInput({ label, placeholder, value, onChange, options, selected, onAdd, onRemove }: MultiAddInputProps) {
  const filtered = useMemo(() => {
    if (!value) return options.slice(0, 8);
    const q = value.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(q)).slice(0, 8);
  }, [options, value]);

  return (
    <div className="flex flex-col gap-1 text-sm text-slate-300">
      <span className="text-xs uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <div className="rounded-lg border border-white/10 bg-white/5 p-2">
        <div className="flex flex-wrap gap-2">
          {selected.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2 py-1 text-xs text-white"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="rounded-full border border-white/20 px-1 text-[10px] text-slate-200 hover:border-[#e10600]/60"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div className="relative mt-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAdd(value.trim());
              }
            }}
            placeholder={placeholder}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-[#e10600]/60"
          />
          {value && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-auto rounded-lg border border-white/15 bg-[#0c0c10]/95 shadow-lg">
              {filtered.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => {
                    onAdd(opt);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                >
                  {opt}
                </button>
              ))}
              {!filtered.length && <div className="px-3 py-2 text-xs text-slate-300">Keine Treffer</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
