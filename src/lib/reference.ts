import { randomInt } from "node:crypto";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** Unique, human-quotable reference, e.g. AHM-TI-260115-7K3QX. */
export function makeReference(code: string): string {
  const d = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  let suffix = "";
  for (let i = 0; i < 5; i++) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `AHM-${code}-${d}-${suffix}`;
}
