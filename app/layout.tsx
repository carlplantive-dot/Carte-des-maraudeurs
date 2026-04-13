import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Carte des Maraudeurs – Paris",
  description:
    "Retrouvez les maraudes solidaires à Paris : Emmaüs Solidarité, La Chorba, Aurore, Samu Social, Les Enfants du Canal.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="h-full flex flex-col">{children}</body>
    </html>
  );
}
