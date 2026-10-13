import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: "Chrono",
  description: "Calendário pessoal de eventos e tarefas.",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
