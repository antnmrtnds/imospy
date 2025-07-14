import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans'
import { ClerkProvider } from '@clerk/nextjs'
import QueryProvider from '@/components/providers/QueryProvider'
import "./globals.css";

export const metadata: Metadata = {
  title: "imospy - Portuguese Real Estate Social Tracker",
  description: "Track key players in the Portuguese real estate market across Instagram, TikTok, and LinkedIn",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey="pk_test_dGhhbmtzLWZpc2gtODQuY2xlcmsuYWNjb3VudHMuZGV2JA">
      <html lang="en" className={GeistSans.className}>
        <body>
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
