import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {/* Visual panel */}
      <aside className="relative hidden min-h-screen overflow-hidden lg:flex lg:flex-col lg:justify-between">
        <Image
          src="/hero-bg.jpg"
          alt=""
          fill
          priority
          quality={90}
          sizes="50vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(40,44,30,0.45)_0%,rgba(40,44,30,0.15)_45%,rgba(40,44,30,0.72)_100%)]"
        />

        <div className="relative z-10 p-10 xl:p-12">
          <Link href="/login" className="inline-flex w-fit">
            <Logo variant="light" size="auth" />
          </Link>
        </div>

        <div className="relative z-10 max-w-lg p-10 xl:p-12">
          <p className="text-3xl font-bold leading-snug tracking-tight text-white xl:text-[2.5rem] xl:leading-tight">
            Turning small outdoor spaces into joyful places.
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen flex-col bg-card">
        <div className="flex justify-center px-6 pt-10 lg:hidden">
          <Link href="/login">
            <Logo variant="dark" size="authCompact" />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
          <div className="auth-enter w-full max-w-[420px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
