import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PNG Metadata Viewer",
  description: "View and export metadata from PNG files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
