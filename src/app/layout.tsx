import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OCR Duplo - Compare OCR Tradicional vs IA",
  description: "Aplicativo mobile para captura de fotos e processamento OCR duplo: Tesseract.js (OCR tradicional) vs IA Vision (OCR com inteligência artificial)",
  keywords: ["OCR", "Tesseract", "IA", "Vision", "Mobile", "Reconhecimento de texto"],
  authors: [{ name: "OCR Duplo" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "OCR Duplo - Compare OCR Tradicional vs IA",
    description: "Captura de fotos e processamento OCR duplo",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
