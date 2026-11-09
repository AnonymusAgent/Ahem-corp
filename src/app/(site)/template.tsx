import type { ReactNode } from "react";
import { PageTransition } from "@/components/Motion";

export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
