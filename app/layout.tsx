import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fenmo Expense OS",
    template: "%s | Fenmo Expense OS",
  },
  description: "A premium fintech dashboard for tracking personal spending with clarity.",
  applicationName: "Fenmo Expense OS",
  appleWebApp: {
    title: "Fenmo",
    capable: true,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/icon",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efedf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0714" },
  ],
  colorScheme: "dark light",
};

const themeScript = `
  try {
    var savedTheme = localStorage.getItem('theme');
    document.documentElement.classList.toggle('dark', savedTheme !== 'light');
  } catch (_) {
    document.documentElement.classList.add('dark');
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
