import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider as Auth0UserProvider } from '@auth0/nextjs-auth0/client';
import { UserProvider } from './contexts/UserContext';
import 'leaflet/dist/leaflet.css';
// import '../styles/globals.css'; // your own styles

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareTrack",
  description: "Healthcare tracking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Auth0UserProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </Auth0UserProvider>
      </body>
    </html>
  );
}
