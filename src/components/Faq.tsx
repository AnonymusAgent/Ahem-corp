"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FaqItem = { question: string; answer: string };

/** Accessible accordion for FAQ content. One panel open at a time; keyboard and screen-reader friendly. */
export function FaqAccordion({ items, idPrefix = "faq" }: { items: FaqItem[]; idPrefix?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
      {items.map((item, i) => {
        const isOpen = open === i;
        const buttonId = `${idPrefix}-button-${i}`;
        const panelId = `${idPrefix}-panel-${i}`;
        return (
          <li key={item.question}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className={`font-display text-base font-semibold sm:text-lg ${isOpen ? "text-navy" : "text-charcoal"}`}>
                  {item.question}
                </span>
                <span
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition duration-300 ${isOpen ? "border-gold bg-gold text-navy" : "border-line text-navy"}`}
                  aria-hidden
                >
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="px-6 pb-6 text-[0.98rem] leading-relaxed text-charcoal/75"
            >
              {item.answer}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
