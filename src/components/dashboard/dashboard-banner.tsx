import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Files, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardBannerProps {
  greeting: string;
  name: string;
  hasDesigns?: boolean;
  variant?: "user" | "admin";
}

export function DashboardBanner({
  greeting,
  name,
  hasDesigns = false,
  variant = "user",
}: DashboardBannerProps) {
  const isAdmin = variant === "admin";

  return (
    <section className="relative motion-enter overflow-hidden rounded-xl">
      <div className="absolute inset-0">
        <Image
          src="/hero-bg.jpg"
          alt=""
          fill
          priority
          quality={85}
          className="object-cover object-center"
          sizes="(max-width: 1280px) 100vw, 1200px"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(105deg,rgba(40,44,30,0.88)_0%,rgba(40,44,30,0.55)_55%,rgba(40,44,30,0.35)_100%)]"
        />
      </div>

      <div className="relative flex min-h-[220px] flex-col justify-end gap-5 p-6 sm:min-h-[260px] sm:p-8 lg:p-10">
        <div className="max-w-xl">
          <p className="text-caption text-white/65">{greeting}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {name}
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/75 sm:text-base">
            {isAdmin
              ? "Catalog, templates, and users."
              : hasDesigns
                ? "Pick up a design or start another."
                : "Design your balcony. Place products. Unlock shopping links."}
          </p>
        </div>

        <div className="button-group">
          {isAdmin ? (
            <>
              <Button asChild variant="secondary" size="lg">
                <Link href="/admin/products">
                  <Plus width={16} height={16} />
                  Add product
                </Link>
              </Button>
              <Button asChild variant="on-primary" size="lg">
                <Link href="/admin/templates">
                  <Files width={16} height={16} />
                  Templates
                  <ArrowRight width={16} height={16} />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="secondary" size="lg">
                <Link href="/designer">
                  <Plus width={16} height={16} />
                  New design
                </Link>
              </Button>
              {hasDesigns && (
                <Button asChild variant="on-primary" size="lg">
                  <Link href="/designs">
                    My designs
                    <ArrowRight width={16} height={16} />
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
