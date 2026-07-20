import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  variable: "--font-landing-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${instrumentSerif.variable} landing-root`}>{children}</div>;
}
