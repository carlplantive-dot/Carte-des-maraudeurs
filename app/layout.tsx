import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import InstallPrompt from "@/components/InstallPrompt";

export const metadata: Metadata = {
  title: "Maraude Paris – La carte des maraudes solidaires",
  description:
    "La carte des maraudes solidaires à Paris : Emmaüs Solidarité, La Chorba, Aurore, Samu Social, Les Enfants du Canal.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Maraude Paris",
  },
  formatDetection: { telephone: false },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className="h-full flex flex-col">
        {children}
        <ServiceWorkerRegistration />
        <InstallPrompt />
      </body>
    </html>
  );
}
