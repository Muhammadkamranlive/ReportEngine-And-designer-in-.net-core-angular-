import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Autobanker Reports Manager",
  description: "Design PDF report templates visually and export them as JSON for any backend renderer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
