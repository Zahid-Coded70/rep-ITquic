import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT Quiz",
  description: "Networking, Hardware, IP & Subnetting quiz",
};

// Set the theme synchronously before React hydrates, so light-mode users
// don't see a flash of the dark default. Runs once on first paint.
const themeBootstrap = `(function(){try{var t=localStorage.getItem('it-quiz-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
