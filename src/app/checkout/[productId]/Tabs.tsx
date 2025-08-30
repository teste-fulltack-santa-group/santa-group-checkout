"use client";

import { useState } from "react";

type Tab = { id: string; label: string; content: React.ReactNode };

export default function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <div>
      <div className="flex gap-2 mb-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition
             ${active === t.id ? "bg-white/20 text-white" : "bg-white/5 hover:bg-white/10 text-slate-300"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>{tabs.find(t => t.id === active)?.content}</div>
    </div>
  );
}
