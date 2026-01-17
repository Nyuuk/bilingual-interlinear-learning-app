import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BILA - Bilingual Interlinear Learning App",
  description: "Learn languages with interlinear gloss",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
