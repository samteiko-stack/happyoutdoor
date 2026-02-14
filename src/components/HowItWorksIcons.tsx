"use client";

import { Search, DesignPencil, Link as LinkIcon } from "iconoir-react";

export function HowItWorksIcons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-accent/10 rounded flex items-center justify-center mx-auto mb-4">
          <Search width={28} height={28} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Browse &amp; Select</h3>
        <p className="text-gray-600">
          Choose from curated outdoor products organized by category - seating, lighting, plants, and more.
        </p>
      </div>
      <div className="text-center">
        <div className="w-16 h-16 bg-accent/10 rounded flex items-center justify-center mx-auto mb-4">
          <DesignPencil width={28} height={28} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Design Your Layout</h3>
        <p className="text-gray-600">
          Place products on a top-view canvas of your balcony. Move, rotate, and arrange until it&apos;s perfect.
        </p>
      </div>
      <div className="text-center">
        <div className="w-16 h-16 bg-accent/10 rounded flex items-center justify-center mx-auto mb-4">
          <LinkIcon width={28} height={28} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Get Product Links</h3>
        <p className="text-gray-600">
          Unlock direct links to purchase every product in your design. One click to your dream balcony.
        </p>
      </div>
    </div>
  );
}
