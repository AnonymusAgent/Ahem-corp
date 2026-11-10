"use client";

import { useMemo, useState } from "react";
import type { PublicProject } from "@/lib/data";
import { ProjectCard } from "./cards";

type Group = { label: string; match: (category: string) => boolean };

/** Brief-specified categories, matched against the CMS categories; extra categories get their own chip. */
const GROUPS: Group[] = [
  { label: "Infrastructure", match: (c) => /infrastructure/i.test(c) },
  { label: "Roads & Highways", match: (c) => /road|highway/i.test(c) },
  { label: "Bridges", match: (c) => /bridge/i.test(c) },
  { label: "Commercial", match: (c) => /commercial/i.test(c) },
  { label: "Industrial", match: (c) => /industrial/i.test(c) },
  { label: "Residential", match: (c) => /residential/i.test(c) },
];

/**
 * Featured portfolio with category filter chips.
 * Chip order: All Projects → brief categories → any remaining CMS categories.
 * Chips with zero projects are hidden.
 */
export function FeaturedWork({ projects }: { projects: PublicProject[] }) {
  const [active, setActive] = useState("all");

  const chips = useMemo(() => {
    const used = new Set<string>();
    const brief = GROUPS.filter((g) => {
      const hit = projects.some((p) => g.match(p.category));
      if (hit) used.add(g.label);
      return hit;
    }).map((g) => ({ id: g.label, label: g.label, match: g.match }));
    const extra = [...new Set(projects.map((p) => p.category))]
      .filter((c) => !GROUPS.some((g) => g.match(c)))
      .map((c) => ({ id: c, label: c, match: (x: string) => x === c }));
    return [
      { id: "all", label: "All Projects", match: () => true },
      ...brief,
      ...extra,
    ];
  }, [projects]);

  const visible = useMemo(() => {
    const chip = chips.find((c) => c.id === active) ?? chips[0]!;
    const list = projects.filter((p) => chip.match(p.category));
    // Featured first, capped at 6 so the grid stays complete (1 large + 2, then a row of 3).
    const ordered = [...list.filter((p) => p.featured), ...list.filter((p) => !p.featured)];
    return ordered.slice(0, 6);
  }, [projects, chips, active]);

  return (
    <div>
      <div role="group" aria-label="Filter projects by category" className="mt-10 flex flex-wrap gap-2.5">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            aria-pressed={active === chip.id}
            onClick={() => setActive(chip.id)}
            className={`min-h-11 rounded-full border px-5 text-sm font-semibold transition duration-300 ${
              active === chip.id
                ? "border-navy bg-navy text-white shadow-[0_12px_28px_-16px_rgba(20,43,64,0.9)]"
                : "border-line bg-white text-charcoal/75 hover:border-navy/40 hover:text-navy"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <div key={`${active}-${p.id}`} className={`rise h-full ${i === 0 ? "sm:col-span-2 lg:row-span-2" : ""}`} style={{ animationDelay: `${i * 60}ms` }}>
              <ProjectCard p={p} tall={i === 0} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-navy/20 bg-white px-6 py-12 text-center text-charcoal/70">
          No published projects in this category yet.
        </p>
      )}
    </div>
  );
}
