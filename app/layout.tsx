import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT Quiz",
  description: "Networking, Hardware, IP & Subnetting quiz",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
