import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";

const geistInter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Semillero Digital Dashboard",
  description: "Dashboard para estudiantes y profesores del Semillero Digital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistInter.className} antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
