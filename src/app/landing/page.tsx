import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Happy Outdoor — Design your balcony in 3D",
  description: "Plan small outdoor spaces. Place real products. Unlock shopping links.",
};

export default function LandingRoutePage() {
  return <LandingPage />;
}
