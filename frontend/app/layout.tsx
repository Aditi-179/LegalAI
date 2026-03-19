import type { Metadata } from "next";
import "./globals.css";
import { RootFrame } from "@/components/root-frame";

export const metadata: Metadata = {
  title: "LegalAI Workspace",
  description: "LegalAI frontend for legal research, mapping, document explanation, and drafting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <RootFrame>{children}</RootFrame>
      </body>
    </html>
  );
}
