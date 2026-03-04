import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/sonner";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Happy Balcony - Design Your Dream Outdoor Space",
  description: "Design beautiful balcony layouts with curated products. Place, arrange, and create your perfect outdoor retreat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <SessionProvider>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'white',
                color: '#3d3529',
                border: '2px solid #8fa64a',
                padding: '16px',
                fontSize: '15px',
                fontWeight: '500',
              },
              className: 'toast-custom',
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
