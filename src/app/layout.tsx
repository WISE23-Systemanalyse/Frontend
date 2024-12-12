import { ClerkProvider } from "@clerk/nextjs";
import { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

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
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {/* Zeige den Inhalt der Homepage nur, wenn der Benutzer eingeloggt ist */}
          
            <Navbar />
            {children} {/* Hauptinhalt wird nur hier angezeigt, wenn eingeloggt */}
            <Footer />
          

          {/* Zeige das Sign-In Fenster, wenn der Benutzer ausgeloggt ist
          <SignedOut>
            <div className="flex justify-center items-center h-screen w-screen">
              <SignIn />
            </div>
          </SignedOut> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
