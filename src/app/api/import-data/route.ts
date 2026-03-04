import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Import Users
    await prisma.user.createMany({
      data: [
        {
          id: 'cmlk10hp50000t18o2awgqi8p',
          email: 'admin@happybalcony.com',
          name: 'Admin',
          passwordHash: '$2b$12$fTlioI5nXBf3lNeT1ncVS.0fCa7Q85tNh9UoVKebtWczLsROoc6Mu',
          role: 'ADMIN',
        },
        {
          id: 'cmlk1vg7f0002t1bozusp4icp',
          email: 'samteiko@gmail.com',
          name: 'Samuel Teiko',
          passwordHash: '$2b$12$2DVUFBTnTD2jxGLgs4/q5ebMkiArce986lsZlXJV6Te6KDs93pX9G',
          role: 'USER',
        },
        {
          id: 'cmll4boe3000436b6djzvoci8',
          email: 'jess@test.com',
          name: 'Jessiebelle Opoku',
          passwordHash: '$2b$12$QNnT/x7g/4YtFnIgyB.Y/u49wKWrNnhKw38ykuGYWhAnMT4mKjR8m',
          role: 'USER',
        },
        {
          id: 'cmlyh5mk8000036a6syetusrb',
          email: 'samrevpee@gmail.com',
          name: 'Jessiebelle Opoku',
          passwordHash: '$2b$12$ycrG.EDAhFF2IqgZ6NaSPe1tCZj5YTMLweyKDh419pEf9In10Y8Li',
          role: 'USER',
        },
      ],
      skipDuplicates: true,
    });

    // Import Categories
    await prisma.category.createMany({
      data: [
        { id: 'cmlk10hp90001t18oemuzlsuy', name: 'Lighting', slug: 'lighting', icon: 'lamp', sortOrder: 2 },
        { id: 'cmlk10hpa0002t18oz9z38dd3', name: 'Seating', slug: 'seating', icon: 'armchair', sortOrder: 2 },
        { id: 'cmlk10hpa0003t18obzsqcscw', name: 'Plants', slug: 'plants', icon: 'leaf', sortOrder: 3 },
        { id: 'cmlk10hpa0006t18oskswkbyu', name: 'Decor', slug: 'decor', icon: 'palette', sortOrder: 5 },
        { id: 'cmlk10hpa0004t18oau7fhb1c', name: 'Planters', slug: 'planters', icon: 'flower', sortOrder: 4 },
        { id: 'cmlk10hpa0005t18obychdoho', name: 'Tables', slug: 'tables', icon: 'table', sortOrder: 1 },
      ],
      skipDuplicates: true,
    });

    // Import Products
    await prisma.product.createMany({
      data: [
        { id: 'cmlk10hpy000it18oxhnpa05w', name: 'Floor Cushion', categoryId: 'cmlk10hpa0002t18oz9z38dd3', description: 'Waterproof floor cushion', price: 39.99, affiliateLink: null, imageUrl: '/products/floor-cushion.png', topViewImageUrl: '/products/floor-cushion.png', modelUrl: null, widthCm: 50, heightCm: 50 },
        { id: 'cmlk10hq2000wt18oic4lcqw5', name: 'Railing Planter', categoryId: 'cmlk10hpa0004t18oau7fhb1c', description: 'Balcony railing planter box', price: 34.99, affiliateLink: null, imageUrl: null, topViewImageUrl: null, modelUrl: null, widthCm: 60, heightCm: 20 },
        { id: 'cmlk10hpz000ot18oiqvncqlh', name: 'Herb Garden', categoryId: 'cmlk10hpa0003t18obzsqcscw', description: 'Mixed herb planter box', price: 29.99, affiliateLink: null, imageUrl: '/products/herb-garden.png', topViewImageUrl: '/products/herb-garden.png', modelUrl: null, widthCm: 60, heightCm: 25 },
        { id: 'cmlk10hpy000ft18o13c8a4n9', name: 'Bistro Chair', categoryId: 'cmlk10hpa0002t18oz9z38dd3', description: 'Classic folding bistro chair', price: 79.99, affiliateLink: '', imageUrl: '/products/bistro-chair.png', topViewImageUrl: '/products/bistro-chair.png', modelUrl: '/models/1770993131418-JUICE_oval_table_by_Miniforms.fbx_Scene.fbx', widthCm: 100, heightCm: 31 },
        { id: 'cmlk10hq40012t18o2yy228ha', name: 'Bistro Table', categoryId: 'cmlk10hpa0005t18obychdoho', description: 'Round folding bistro table', price: 99.99, affiliateLink: '', imageUrl: '', topViewImageUrl: '', modelUrl: '/models/1770993391656-JUICE_oval_table_by_Miniforms.fbx_Scene.fbx', widthCm: 60, heightCm: 60 },
        { id: 'cmlk10hpz000kt18oym28xrz6', name: 'Lavender', categoryId: 'cmlk10hpa0003t18obzsqcscw', description: 'Fragrant lavender plant', price: 12.99, affiliateLink: null, imageUrl: '/products/lavender.png', topViewImageUrl: '/products/lavender.png', modelUrl: null, widthCm: 35, heightCm: 35 },
        { id: 'cmlk10hpz000nt18ocnp902ly', name: 'Fern', categoryId: 'cmlk10hpa0003t18obzsqcscw', description: 'Hanging fern basket', price: 18.99, affiliateLink: '', imageUrl: '/products/fern.png', topViewImageUrl: '/products/fern.png', modelUrl: '', widthCm: 40, heightCm: 40 },
        { id: 'cmlk10hq40014t18osa274dxx', name: 'Side Table', categoryId: 'cmlk10hpa0005t18obychdoho', description: 'Small outdoor side table', price: 49.99, affiliateLink: null, imageUrl: null, topViewImageUrl: null, modelUrl: null, widthCm: 40, heightCm: 40 },
        { id: 'cmlk10hq3000yt18oyj364ozq', name: 'Outdoor Rug', categoryId: 'cmlk10hpa0004t18oau7fhb1c', description: 'Weather-resistant area rug', price: 89.99, affiliateLink: '', imageUrl: '', topViewImageUrl: '', modelUrl: null, widthCm: 150, heightCm: 100 },
        { id: 'cmlk10hpy000dt18oi4yfy2r0', name: 'Lounge Chair', categoryId: 'cmlk10hpa0002t18oz9z38dd3', description: 'Comfortable outdoor lounge chair', price: 199.99, affiliateLink: null, imageUrl: '/products/lounge-chair.png', topViewImageUrl: '/products/lounge-chair.png', modelUrl: null, widthCm: 70, heightCm: 85 },
        { id: 'cmlk10hpz000st18oairf2aol', name: 'Terracotta Pot', categoryId: 'cmlk10hpa0004t18oau7fhb1c', description: 'Classic terracotta planter', price: 22.99, affiliateLink: null, imageUrl: null, topViewImageUrl: null, modelUrl: null, widthCm: 35, heightCm: 35 },
        { id: 'cmlk10hq30010t18o9vh6svwd', name: 'Wind Chime', categoryId: 'cmlk10hpa0006t18oskswkbyu', description: 'Bamboo wind chime', price: 19.99, affiliateLink: null, imageUrl: null, topViewImageUrl: null, modelUrl: null, widthCm: 20, heightCm: 20 },
        { id: 'cmlk10hpy000et18ol97vrzas', name: 'Bench', categoryId: 'cmlk10hpa0002t18oz9z38dd3', description: 'Wooden garden bench', price: 149.99, affiliateLink: '', imageUrl: '/products/bench.png', topViewImageUrl: '/products/bench.png', modelUrl: '/models/1770986966844-Malu-fbx.fbx', widthCm: 201, heightCm: 129 },
        { id: 'cmlk10hpz000rt18orne6rzn6', name: 'Olive Tree', categoryId: 'cmlk10hpa0003t18obzsqcscw', description: 'Small potted olive tree', price: 49.99, affiliateLink: null, imageUrl: '/products/olive-tree.png', topViewImageUrl: '/products/olive-tree.png', modelUrl: null, widthCm: 50, heightCm: 50 },
        { id: 'cmlk10hpy000gt18oparg841n', name: 'Solar Lantern', categoryId: 'cmlk10hp90001t18oemuzlsuy', description: 'Solar-powered garden lantern', price: 34.99, affiliateLink: null, imageUrl: '/products/solar-lantern.png', topViewImageUrl: '/products/solar-lantern.png', modelUrl: null, widthCm: 25, heightCm: 25 },
        { id: 'cmlk10hpy000ht18oyo08u2t9', name: 'String Lights', categoryId: 'cmlk10hp90001t18oemuzlsuy', description: 'Warm white LED string lights', price: 24.99, affiliateLink: null, imageUrl: '/products/string-lights.png', topViewImageUrl: '/products/string-lights.png', modelUrl: null, widthCm: 30, heightCm: 30 },
        { id: 'cmlk10hpz000ut18o23la7r3v', name: 'Wall Sconce', categoryId: 'cmlk10hp90001t18oemuzlsuy', description: 'Outdoor wall-mounted light', price: 59.99, affiliateLink: null, imageUrl: '/products/wall-sconce.png', topViewImageUrl: '/products/wall-sconce.png', modelUrl: null, widthCm: 20, heightCm: 20 },
      ],
      skipDuplicates: true,
    });

    // Import Templates
    await prisma.template.createMany({
      data: [
        {
          id: 'cmlk10hqp0015t18ofzd7vldf',
          name: 'Cozy Bistro Balcony',
          description: 'A cozy balcony setup with bistro furniture, plants, and ambient lighting',
          balconyWidthCm: 300,
          balconyHeightCm: 200,
          layoutData: '[{"productId":"cmlk10hpy000ft18o13c8a4n9","x":80,"y":100,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hq40012t18o2yy228ha","x":150,"y":100,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hpy000ft18o13c8a4n9","x":220,"y":100,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hpz000kt18oym28xrz6","x":50,"y":30,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hpy000ht18oyo08u2t9","x":150,"y":20,"rotation":0,"scaleX":1,"scaleY":1}]',
          isPublished: true,
        },
        {
          id: 'cmlk10hqq0016t18oeokfmxvg',
          name: 'Garden Retreat',
          description: 'A plant-filled paradise with comfortable seating',
          balconyWidthCm: 400,
          balconyHeightCm: 250,
          layoutData: '[{"productId":"cmlk10hpy000dt18oi4yfy2r0","x":100,"y":130,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hq40014t18osa274dxx","x":200,"y":130,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hpz000rt18orne6rzn6","x":50,"y":40,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hpz000ot18oiqvncqlh","x":320,"y":30,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hpz000st18oairf2aol","x":350,"y":130,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hq3000yt18oyj364ozq","x":200,"y":80,"rotation":0,"scaleX":1,"scaleY":1}]',
          isPublished: true,
        },
        {
          id: 'cmlk10hqq0017t18oupgqamt3',
          name: 'Blank Small Balcony',
          description: 'Start fresh with a small 2m x 1.5m balcony',
          balconyWidthCm: 200,
          balconyHeightCm: 150,
          layoutData: '[]',
          isPublished: true,
        },
      ],
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      message: "All data imported successfully! You can now login with your existing accounts.",
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
