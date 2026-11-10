"use client";

import { useState } from "react";

const LAYERS = [
  { title: "Tender & planning", text: "Estimation, bid preparation, baseline programme, procurement plan and mobilisation — the commitments everything else is measured against." },
  { title: "Foundations & civil works", text: "Survey, earthworks, piling, substructure and buried utilities, verified by field and laboratory testing." },
  { title: "Structure", text: "Reinforced concrete and steel frames built to engineered temporary-works designs and inspection hold points." },
  { title: "MEP & envelope", text: "Façade, roofing and coordinated electrical, mechanical, plumbing and HVAC installation." },
  { title: "Finishes & handover", text: "Finishing trades, testing and commissioning, snagging, as-built records and a complete handover dossier." },
];

/**
 * Interactive exploded building: five stacked plates in CSS 3D.
 * Selecting a stage (hover, focus or tap) lifts its layer. Pure CSS transforms — no WebGL.
 */
export function BuildStack() {
  const [active, setActive] = useState(2);
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-center sm:h-[440px]" style={{ perspective: 1400 }} aria-hidden>
        <div className="relative h-52 w-52 sm:h-60 sm:w-60" style={{ transformStyle: "preserve-3d", transform: "rotateX(60deg) rotateZ(-42deg) translateZ(-70px)" }}>
          {LAYERS.map((layer, i) => {
            const on = i === active;
            const inset = i * 5;
            return (
              <button
                key={layer.title}
                type="button"
                tabIndex={-1}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`absolute rounded-md border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${on ? "border-gold bg-gold/25 shadow-[0_0_60px_rgba(232,154,56,0.45)]" : "border-navy-300/50 bg-navy-600/35"}`}
                style={{
                  inset,
                  transform: `translateZ(${i * 44 + (on ? 26 : 0) + (i > active ? 14 : 0)}px)`,
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
            );
          })}
        </div>
      </div>

      <ol className="space-y-2">
        {LAYERS.map((layer, i) => {
          const on = i === active;
          return (
            <li key={layer.title}>
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setActive(i)}
                onFocus={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={`w-full rounded-2xl border px-5 py-4 text-left transition duration-500 sm:px-6 ${on ? "border-gold/60 bg-white/[0.07]" : "border-white/10 hover:border-white/25"}`}
              >
                <span className="flex items-center gap-4">
                  <span className={`font-display text-sm font-bold ${on ? "text-gold" : "text-white/40"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={`font-display text-lg font-semibold ${on ? "text-white" : "text-white/75"}`}>{layer.title}</span>
                </span>
                <span className={`grid transition-all duration-500 ${on ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <span className="overflow-hidden pl-9 text-sm leading-relaxed text-white/70">{layer.text}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
