"use client";

import { usePathname } from "next/navigation";

import { AppShell } from "@/components/app-shell";

const workspaceRoutes = ["/chat", "/mapping", "/upload", "/draft", "/history"];

export function RootFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkspaceRoute = workspaceRoutes.some((route) => pathname.startsWith(route));

  if (!isWorkspaceRoute) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
