import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Fenmo Expense OS",
    template: "%s | Fenmo Expense OS",
  },
  description:
    "A premium fintech dashboard for tracking personal spending with clarity.",
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
    var savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  } catch (_) {
    document.documentElement.classList.add("dark");
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
      className="dark h-full antialiased"
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