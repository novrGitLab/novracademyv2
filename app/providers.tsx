"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LoaderRoot } from "@/components/loader/LoaderRoot";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <LoaderRoot>{children}</LoaderRoot>
      </ThemeProvider>
    </SessionProvider>
  );
}
