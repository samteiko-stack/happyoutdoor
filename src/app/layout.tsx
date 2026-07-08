import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { Toaster } from "@/components/ui/sonner";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Happy Outdoors",
  description: "Turning small outdoor spaces into joyful places",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <SupabaseProvider>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--card)',
                color: 'var(--foreground)',
                border: '2px solid var(--highlight)',
                padding: '16px',
                fontSize: '15px',
                fontWeight: '500',
              },
              className: 'toast-custom',
            }}
          />
        </SupabaseProvider>
      </body>
    </html>
  );
}
