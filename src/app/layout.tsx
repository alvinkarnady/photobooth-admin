import type { Metadata } from "next";
import { Outfit, Libre_Caslon_Text, Manrope } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const libreCaslonText = Libre_Caslon_Text({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-caslon-text",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mémoire | Memories, Inked in Time",
  description: "A highly curated, tactile photobooth experience designed for elegant gatherings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${libreCaslonText.variable} ${manrope.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        {children}
      </body>
    </html>
  );
}
