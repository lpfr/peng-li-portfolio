import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peng Li — Portfolio interactif",
  description: "Un portfolio expérimental autour du geste, de l’image IA et de la reconstruction."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
