import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeGuard AI - AI-Powered Trading Intelligence with Blockchain-Verified Decisions",
  description: "Institutional AI Trading Assistant with multi-factor technical analysis, probabilistic signal generation, dedicated pre-trade risk engine, and Stellar Soroban immutable verification.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-[#080c14] text-slate-100 antialiased terminal-grid">
        {children}
      </body>
    </html>
  );
}
