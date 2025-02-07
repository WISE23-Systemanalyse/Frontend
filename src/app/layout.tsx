import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { Toast } from "@/components/ui/toast";
import { NextAuthProvider }from "@/providers/auth";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: 'CinemaPlus',
  description: 'Dein modernes Kinoreservierungssystem',
  icons: {
    icon: '/icons8-film-100.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-red-300`}
      >
        <NextAuthProvider>
        <Navbar />
        {children}
        <Footer/>
        <Toast isVisible={false} message="test" />
        </NextAuthProvider>
      </body>
    </html>
  );
}
