import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AeroPlus · Understand Your Air & Plan Your Day",
  description:
    "AI-powered atmospheric conversational assistant, verified real-time CPCB air quality observations, and clean air solutions.",
  keywords: [
    "AQI",
    "Air Quality",
    "Delhi Air Quality",
    "PM2.5",
    "CPCB",
    "GRAP",
    "Pollution Forecast",
    "AeroPlus"
  ],
  authors: [{ name: "AeroPlus Intelligence" }],
  openGraph: {
    title: "AeroPlus · Understand Your Air & Plan Your Day",
    description:
      "AI-powered atmospheric conversational assistant, verified real-time CPCB air quality observations, and clean air solutions.",
    type: "website"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
