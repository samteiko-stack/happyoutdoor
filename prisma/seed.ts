import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@happybalcony.com" },
    update: {},
    create: {
      email: "admin@happybalcony.com",
      name: "Admin",
      passwordHash: hashSync("admin123", 12),
      role: "ADMIN",
    },
  });
  console.log("Admin user created:", admin.email);

  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "seating" }, update: {}, create: { name: "Seating", slug: "seating", icon: "armchair", sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: "lighting" }, update: {}, create: { name: "Lighting", slug: "lighting", icon: "lamp", sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: "plants" }, update: {}, create: { name: "Plants", slug: "plants", icon: "leaf", sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: "planters" }, update: {}, create: { name: "Planters", slug: "planters", icon: "flower", sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: "decor" }, update: {}, create: { name: "Decor", slug: "decor", icon: "palette", sortOrder: 5 } }),
    prisma.category.upsert({ where: { slug: "tables" }, update: {}, create: { name: "Tables", slug: "tables", icon: "table", sortOrder: 6 } }),
  ]);
  console.log("Categories created:", categories.map((c) => c.name).join(", "));

  const [seating, lighting, plants, planters, decor, tables] = categories;

  const products = await Promise.all([
    // Seating (4 products - all have images)
    prisma.product.create({
      data: {
        name: "Bistro Chair", categoryId: seating.id,
        description: "Classic folding bistro chair", price: 79.99,
        widthCm: 45, heightCm: 45,
        imageUrl: "/products/bistro-chair.png",
        topViewImageUrl: "/products/bistro-chair.png",
      },
    }),
    prisma.product.create({
      data: {
        name: "Lounge Chair", categoryId: seating.id,
        description: "Comfortable outdoor lounge chair", price: 199.99,
        widthCm: 70, heightCm: 85,
        imageUrl: "/products/lounge-chair.png",
        topViewImageUrl: "/products/lounge-chair.png",
      },
    }),
    prisma.product.create({
      data: {
        name: "Floor Cushion", categoryId: seating.id,
        description: "Waterproof floor cushion", price: 39.99,
        widthCm: 50, heightCm: 50,
        imageUrl: "/products/floor-cushion.png",
        topViewImageUrl: "/products/floor-cushion.png",
      },
    }),
    prisma.product.create({
      data: {
        name: "Bench", categoryId: seating.id,
        description: "Wooden garden bench", price: 149.99,
        widthCm: 120, heightCm: 45,
        imageUrl: "/products/bench.png",
        topViewImageUrl: "/products/bench.png",
      },
    }),
    // Lighting (3 products - all have images)
    prisma.product.create({
      data: {
        name: "String Lights", categoryId: lighting.id,
        description: "Warm white LED string lights", price: 24.99,
        widthCm: 30, heightCm: 30,
        imageUrl: "/products/string-lights.png",
        topViewImageUrl: "/products/string-lights.png",
      },
    }),
    prisma.product.create({
      data: {
        name: "Solar Lantern", categoryId: lighting.id,
        description: "Solar-powered garden lantern", price: 34.99,
        widthCm: 25, heightCm: 25,
        imageUrl: "/products/solar-lantern.png",
        topViewImageUrl: "/products/solar-lantern.png",
      },
    }),
    prisma.product.create({
      data: {
        name: "Wall Sconce", categoryId: lighting.id,
        description: "Outdoor wall-mounted light", price: 59.99,
        widthCm: 20, heightCm: 20,
        imageUrl: "/products/wall-sconce.png",
        topViewImageUrl: "/products/wall-sconce.png",
      },
    }),
    // Plants (4 products - all have images)
    prisma.product.create({
      data: {
        name: "Lavender", categoryId: plants.id,
        description: "Fragrant lavender plant", price: 12.99,
        widthCm: 35, heightCm: 35,
        imageUrl: "/products/lavender.png",
        topViewImageUrl: "/products/lavender.png",
      },
    }),
    prisma.product.create({
      data: {
        name: "Olive Tree", categoryId: plants.id,
        description: "Small potted olive tree", price: 49.99,
        widthCm: 50, heightCm: 50,
        imageUrl: "/products/olive-tree.png",
        topViewImageUrl: "/products/olive-tree.png",
      },
    }),
    prisma.product.create({
      data: {
        name: "Herb Garden", categoryId: plants.id,
        description: "Mixed herb planter box", price: 29.99,
        widthCm: 60, heightCm: 25,
        imageUrl: "/products/herb-garden.png",
        topViewImageUrl: "/products/herb-garden.png",
      },
    }),
    prisma.product.create({
      data: {
        name: "Fern", categoryId: plants.id,
        description: "Hanging fern basket", price: 18.99,
        widthCm: 40, heightCm: 40,
        imageUrl: "/products/fern.png",
        topViewImageUrl: "/products/fern.png",
      },
    }),
    // Planters (2 products - no images yet, will use fallback)
    prisma.product.create({
      data: {
        name: "Terracotta Pot", categoryId: planters.id,
        description: "Classic terracotta planter", price: 22.99,
        widthCm: 35, heightCm: 35,
      },
    }),
    prisma.product.create({
      data: {
        name: "Railing Planter", categoryId: planters.id,
        description: "Balcony railing planter box", price: 34.99,
        widthCm: 60, heightCm: 20,
      },
    }),
    // Decor (2 products - no images yet, will use fallback)
    prisma.product.create({
      data: {
        name: "Outdoor Rug", categoryId: decor.id,
        description: "Weather-resistant area rug", price: 89.99,
        widthCm: 150, heightCm: 100,
      },
    }),
    prisma.product.create({
      data: {
        name: "Wind Chime", categoryId: decor.id,
        description: "Bamboo wind chime", price: 19.99,
        widthCm: 20, heightCm: 20,
      },
    }),
    // Tables (2 products - no images yet, will use fallback)
    prisma.product.create({
      data: {
        name: "Bistro Table", categoryId: tables.id,
        description: "Round folding bistro table", price: 99.99,
        widthCm: 60, heightCm: 60,
      },
    }),
    prisma.product.create({
      data: {
        name: "Side Table", categoryId: tables.id,
        description: "Small outdoor side table", price: 49.99,
        widthCm: 40, heightCm: 40,
      },
    }),
  ]);
  console.log(`${products.length} products created (${products.filter(p => p.imageUrl).length} with lofi 3D images)`);

  await prisma.template.create({
    data: {
      name: "Cozy Bistro Balcony",
      description: "A cozy balcony setup with bistro furniture, plants, and ambient lighting",
      balconyWidthCm: 300, balconyHeightCm: 200, isPublished: true,
      layoutData: JSON.stringify([
        { productId: products[0].id, x: 80, y: 100, rotation: 0, scaleX: 1, scaleY: 1 },
        { productId: products[15].id, x: 150, y: 100, rotation: 0, scaleX: 1, scaleY: 1 },
        { productId: products[0].id, x: 220, y: 100, rotation: 0, scaleX: 1, scaleY: 1 },
        { productId: products[7].id, x: 50, y: 30, rotation: 0, scaleX: 1, scaleY: 1 },
        { productId: products[4].id, x: 150, y: 20, rotation: 0, scaleX: 1, scaleY: 1 },
      ]),
    },
  });

  await prisma.template.create({
    data: {
      name: "Garden Retreat",
      description: "A plant-filled paradise with comfortable seating",
      balconyWidthCm: 400, balconyHeightCm: 250, isPublished: true,
      layoutData: JSON.stringify([
        { productId: products[1].id, x: 100, y: 130, rotation: 0, scaleX: 1, scaleY: 1 },
        { productId: products[16].id, x: 200, y: 130, rotation: 0, scaleX: 1, scaleY: 1 },
        { productId: products[8].id, x: 50, y: 40, rotation: 0, scaleX: 1, scaleY: 1 },
        { productId: products[9].id, x: 320, y: 30, rotation: 0, scaleX: 1, scaleY: 1 },
        { productId: products[11].id, x: 350, y: 130, rotation: 0, scaleX: 1, scaleY: 1 },
        { productId: products[13].id, x: 200, y: 80, rotation: 0, scaleX: 1, scaleY: 1 },
      ]),
    },
  });

  await prisma.template.create({
    data: {
      name: "Blank Small Balcony",
      description: "Start fresh with a small 2m x 1.5m balcony",
      balconyWidthCm: 200, balconyHeightCm: 150, isPublished: true, layoutData: "[]",
    },
  });

  console.log("Templates created");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
