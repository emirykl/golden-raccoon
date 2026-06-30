import type { Metadata } from "next";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";

export const metadata: Metadata = {
  title: "Gold Raccoon | AI Crypto Guardian",
  description: "Multi-agent crypto portfolio intelligence and user-authorized execution for GOAT Network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-[#050505] text-white">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
