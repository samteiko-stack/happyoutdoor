import Image from "next/image";

export default function ComingSoonPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <Image
        src="/hero-bg.jpg"
        alt="Beautiful balcony with mountain view"
        fill
        className="object-cover object-center"
        priority
        quality={90}
      />

      {/* Gradient overlay — lighter on the right, heavier on the left */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between px-10 md:px-20 py-12">
        {/* Logo */}
        <div>
          <span className="text-white/90 text-lg font-semibold tracking-wide">
            Happy Outdoors
          </span>
        </div>

        {/* Main text */}
        <div className="max-w-xl">
          <p className="text-white/60 text-sm font-medium uppercase tracking-[0.2em] mb-6">
            Coming Soon
          </p>
          <h1 className="text-white text-4xl md:text-6xl font-bold leading-[1.1] mb-8">
            Turning small outdoor spaces into joyful places
          </h1>
          <div className="w-12 h-0.5 bg-white/40" />
        </div>

        {/* Footer */}
        <div>
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Happy Outdoors
          </p>
        </div>
      </div>
    </div>
  );
}
