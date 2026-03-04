PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO User VALUES('cmlk10hp50000t18o2awgqi8p','admin@happybalcony.com','Admin','$2b$12$fTlioI5nXBf3lNeT1ncVS.0fCa7Q85tNh9UoVKebtWczLsROoc6Mu','ADMIN',1770935065241,1770935065241);
INSERT INTO User VALUES('cmlk1vg7f0002t1bozusp4icp','samteiko@gmail.com','Samuel Teiko','$2b$12$2DVUFBTnTD2jxGLgs4/q5ebMkiArce986lsZlXJV6Te6KDs93pX9G','USER',1770936509643,1771204410765);
INSERT INTO User VALUES('cmll4boe3000436b6djzvoci8','jess@test.com','Jessiebelle Opoku','$2b$12$QNnT/x7g/4YtFnIgyB.Y/u49wKWrNnhKw38ykuGYWhAnMT4mKjR8m','USER',1771001092155,1771001092155);
INSERT INTO User VALUES('cmlyh5mk8000036a6syetusrb','samrevpee@gmail.com','Jessiebelle Opoku','$2b$12$ycrG.EDAhFF2IqgZ6NaSPe1tCZj5YTMLweyKDh419pEf9In10Y8Li','USER',1771808705144,1771808705144);
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO Category VALUES('cmlk10hp90001t18oemuzlsuy','Lighting','lighting','lamp',2,1770935065246);
INSERT INTO Category VALUES('cmlk10hpa0002t18oz9z38dd3','Seating','seating','armchair',2,1770935065246);
INSERT INTO Category VALUES('cmlk10hpa0003t18obzsqcscw','Plants','plants','leaf',3,1770935065246);
INSERT INTO Category VALUES('cmlk10hpa0006t18oskswkbyu','Decor','decor','palette',5,1770935065246);
INSERT INTO Category VALUES('cmlk10hpa0004t18oau7fhb1c','Planters','planters','flower',4,1770935065246);
INSERT INTO Category VALUES('cmlk10hpa0005t18obychdoho','Tables','tables','table',1,1770935065246);
CREATE TABLE IF NOT EXISTS "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "balconyWidthCm" INTEGER NOT NULL DEFAULT 300,
    "balconyHeightCm" INTEGER NOT NULL DEFAULT 200,
    "layoutData" TEXT NOT NULL DEFAULT '[]',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO Template VALUES('cmlk10hqp0015t18ofzd7vldf','Cozy Bistro Balcony','A cozy balcony setup with bistro furniture, plants, and ambient lighting',NULL,300,200,'[{"productId":"cmlk10hpy000ft18o13c8a4n9","x":80,"y":100,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hq40012t18o2yy228ha","x":150,"y":100,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hpy000ft18o13c8a4n9","x":220,"y":100,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hpz000kt18oym28xrz6","x":50,"y":30,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hpy000ht18oyo08u2t9","x":150,"y":20,"rotation":0,"scaleX":1,"scaleY":1}]',1,1770935065297,1770935065297);
INSERT INTO Template VALUES('cmlk10hqq0016t18oeokfmxvg','Garden Retreat','A plant-filled paradise with comfortable seating',NULL,400,250,'[{"productId":"cmlk10hpy000dt18oi4yfy2r0","x":100,"y":130,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hq40014t18osa274dxx","x":200,"y":130,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hpz000rt18orne6rzn6","x":50,"y":40,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hpz000ot18oiqvncqlh","x":320,"y":30,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hpz000st18oairf2aol","x":350,"y":130,"rotation":0,"scaleX":1,"scaleY":1},{"productId":"cmlk10hq3000yt18oyj364ozq","x":200,"y":80,"rotation":0,"scaleX":1,"scaleY":1}]',1,1770935065298,1770949251792);
INSERT INTO Template VALUES('cmlk10hqq0017t18oupgqamt3','Blank Small Balcony','Start fresh with a small 2m x 1.5m balcony',NULL,200,150,'[]',1,1770935065299,1770949039957);
INSERT INTO Template VALUES('cmlkggru7000036jswza1k6bg','Some added template','Description',NULL,300,200,'[]',1,1770961019119,1771838307921);
INSERT INTO Template VALUES('cmlkskf58000536jsz5ejkscc','Friday Template','asfasfa',NULL,300,200,'[]',1,1770981344684,1771838306919);
CREATE TABLE IF NOT EXISTS "Design" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Balcony Design',
    "templateId" TEXT,
    "balconyWidthCm" INTEGER NOT NULL DEFAULT 300,
    "balconyHeightCm" INTEGER NOT NULL DEFAULT 200,
    "layoutData" TEXT NOT NULL DEFAULT '[]',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Design_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Design_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO Design VALUES('cmlkf21cy0008t1bo1lwqtaoo','cmlk10hp50000t18o2awgqi8p','Garden Retreat - My Design',NULL,400,250,'[{"productId":"cmlk10hpy000dt18oi4yfy2r0","x":100,"y":130,"rotation":0,"scaleX":1,"scaleY":1,"id":"1d47d87f-a501-46a3-a61c-f17f8f5a7315"},{"productId":"cmlk10hq40014t18osa274dxx","x":200,"y":130,"rotation":0,"scaleX":1,"scaleY":1,"id":"f9ad3d01-4124-475e-a804-1e67b6012810"},{"productId":"cmlk10hpz000rt18orne6rzn6","x":50,"y":40,"rotation":0,"scaleX":1,"scaleY":1,"id":"2b4a8c9a-6cc0-4ded-8822-9d4e8f62155c"},{"productId":"cmlk10hpz000ot18oiqvncqlh","x":320,"y":30,"rotation":0,"scaleX":1,"scaleY":1,"id":"dc1f1316-a57e-4ed2-a7e8-ec33d5348e2f"},{"productId":"cmlk10hpz000st18oairf2aol","x":350,"y":130,"rotation":0,"scaleX":1,"scaleY":1,"id":"b88046d0-df12-415b-af0b-bfc8f2bf6510"},{"productId":"cmlk10hq3000yt18oyj364ozq","x":200,"y":80,"rotation":0,"scaleX":1,"scaleY":1,"id":"155c1a9e-0d83-4d84-ba96-71f6bf41c44f"}]',0,1770958652003,1770958652003);
INSERT INTO Design VALUES('cmlkfo3cy000at1bods4hqf98','cmlk1vg7f0002t1bozusp4icp','Blank Small Balcony - My Design',NULL,200,150,'[{"id":"c92ab2f3-25da-4ea0-9a1a-984863fd728b","productId":"cmlk10hq3000yt18oyj364ozq","x":136.43368945669522,"y":190.9526187265104,"rotation":0,"scaleX":1,"scaleY":1}]',1,1770959681026,1771704338495);
INSERT INTO Design VALUES('cmlkghp8d000236jsxbz81uyh','cmlk10hp50000t18o2awgqi8p','Some added template - My Design',NULL,600,400,'[{"id":"9261becb-8d71-43dd-9160-c0efd11387e7","productId":"cmlk10hpy000gt18oparg841n","x":614.5268638164175,"y":409.40267156536066,"rotation":0,"scaleX":1,"scaleY":1,"height":0},{"id":"ebbb5482-9f7f-46ec-bb1a-de0cd6bea157","productId":"cmlk10hpy000ht18oyo08u2t9","x":580.1060956426879,"y":420.12458926411097,"rotation":0,"scaleX":1,"scaleY":1},{"id":"c654f329-5d8c-4d74-a70f-9f615afad6f6","productId":"cmlk10hpz000ut18o23la7r3v","x":591.3975962420999,"y":393.7708343297914,"rotation":0,"scaleX":1,"scaleY":1},{"id":"f845e31d-2df8-4d44-91ed-345348e277c7","productId":"cmlk10hpz000ot18oiqvncqlh","x":278.71811264964697,"y":253.70215469373008,"rotation":0,"scaleX":1,"scaleY":1},{"id":"5c3698ae-2a61-48f4-9caf-272f037d7650","productId":"cmlk10hpz000kt18oym28xrz6","x":314.6897331579549,"y":476.71990630022003,"rotation":0,"scaleX":1,"scaleY":1},{"id":"892610c6-6fd8-4a52-a19a-529b51e385a4","productId":"cmlk10hpz000rt18orne6rzn6","x":593.8760813834386,"y":417.98500594010227,"rotation":0,"scaleX":1,"scaleY":1}]',0,1770961062397,1770961062397);
INSERT INTO Design VALUES('cmlkstdf5000736jsyyqojuzi','cmlk10hp50000t18o2awgqi8p','Friday Template - My Design',NULL,300,200,'[{"id":"9f396444-e73c-40b3-a968-23f8d52b9e69","productId":"cmlk10hpy000ft18o13c8a4n9","x":166.91682050308677,"y":191.1019050479157,"rotation":0,"scaleX":1,"scaleY":1}]',0,1770981762353,1770981762353);
INSERT INTO Design VALUES('cmlo8j92p000136hyjwa27g5c','cmlk1vg7f0002t1bozusp4icp','Friday Template - My Design',NULL,300,200,'[{"id":"9f397295-7059-4635-9bf7-77e5e1ac9b89","productId":"cmlk10hpy000et18ol97vrzas","x":277.61072891648655,"y":197.86420356565117,"rotation":0,"scaleX":1,"scaleY":1}]',0,1771189562545,1771189562545);
INSERT INTO Design VALUES('cmloh85u0000136s81vnj1fzw','cmlk1vg7f0002t1bozusp4icp','Monday Night',NULL,300,200,'[{"id":"8853615a-7167-4b57-a3d9-dee48f2fc2d1","productId":"cmlk10hpy000ft18o13c8a4n9","x":312.1709122224279,"y":175.65179520214437,"rotation":0,"scaleX":1,"scaleY":1}]',0,1771204161672,1771204172665);
INSERT INTO Design VALUES('cmlohwz87000336s8ndv6i47z','cmlk10hp50000t18o2awgqi8p','Friday Template - My Design',NULL,300,200,'[{"id":"81f02891-f907-45cc-943b-e6876c71e16a","productId":"cmlk10hpy000et18ol97vrzas","x":273.7690976847539,"y":195.04852788177698,"rotation":0,"scaleX":1,"scaleY":1}]',0,1771205319511,1771205319511);
INSERT INTO Design VALUES('cmlyh82vq000236a6nq2rvkhp','cmlyh5mk8000036a6syetusrb','Somebodys crazy',NULL,600,350,'[{"id":"d61fb781-5c0d-447d-8f65-0aa036c23d85","productId":"cmlk10hq40012t18o2yy228ha","x":166.36291797239727,"y":308.3679736481718,"rotation":0,"scaleX":1,"scaleY":1},{"id":"96d51ada-7fe0-4489-aa09-3e8026721db9","productId":"cmlk10hq40014t18osa274dxx","x":338.5671203125886,"y":357.2358330728622,"rotation":0,"scaleX":1,"scaleY":1},{"id":"cc218569-0d4f-40fb-81e4-b4effe9f2026","productId":"cmlk10hpy000it18oxhnpa05w","x":456.44671213707903,"y":447.1689980867728,"rotation":0,"scaleX":1,"scaleY":1},{"id":"f67cf688-2adf-414b-8e5e-d50e14171ff0","productId":"cmlk10hpy000et18ol97vrzas","x":988.4527481910125,"y":307.3843838208585,"rotation":0,"scaleX":1,"scaleY":1},{"id":"afecd335-81d7-4302-a0d2-21f61ef05baa","productId":"cmlk10hpy000gt18oparg841n","x":68.80808842682642,"y":88.07598884652074,"rotation":0,"scaleX":1,"scaleY":1,"height":182.75032298840785}]',1,1771808819606,1771808956102);
CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripeSessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "categoryId" TEXT,
    "description" TEXT,
    "price" REAL NOT NULL DEFAULT 0,
    "affiliateLink" TEXT,
    "imageUrl" TEXT,
    "topViewImageUrl" TEXT,
    "modelUrl" TEXT,
    "widthCm" INTEGER NOT NULL DEFAULT 50,
    "heightCm" INTEGER NOT NULL DEFAULT 50,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO Product VALUES('cmlk10hpy000it18oxhnpa05w','Floor Cushion','cmlk10hpa0002t18oz9z38dd3','Waterproof floor cushion',39.990000000000001989,NULL,'/products/floor-cushion.png','/products/floor-cushion.png',NULL,50,50,1770935065271,1770935065271);
INSERT INTO Product VALUES('cmlk10hq2000wt18oic4lcqw5','Railing Planter','cmlk10hpa0004t18oau7fhb1c','Balcony railing planter box',34.990000000000001101,NULL,NULL,NULL,NULL,60,20,1770935065274,1770935065274);
INSERT INTO Product VALUES('cmlk10hpz000ot18oiqvncqlh','Herb Garden','cmlk10hpa0003t18obzsqcscw','Mixed herb planter box',29.98999999999999666,NULL,'/products/herb-garden.png','/products/herb-garden.png',NULL,60,25,1770935065271,1770935065271);
INSERT INTO Product VALUES('cmlk10hpy000ft18o13c8a4n9','Bistro Chair','cmlk10hpa0002t18oz9z38dd3','Classic folding bistro chair',79.98999999999999666,'','/products/bistro-chair.png','/products/bistro-chair.png','/models/1770993131418-JUICE_oval_table_by_Miniforms.fbx_Scene.fbx',100,31,1770935065271,1771205191923);
INSERT INTO Product VALUES('cmlk10hq40012t18o2yy228ha','Bistro Table','cmlk10hpa0005t18obychdoho','Round folding bistro table',99.989999999999987778,'','','','/models/1770993391656-JUICE_oval_table_by_Miniforms.fbx_Scene.fbx',60,60,1770935065276,1770993395113);
INSERT INTO Product VALUES('cmlk10hpz000kt18oym28xrz6','Lavender','cmlk10hpa0003t18obzsqcscw','Fragrant lavender plant',12.989999999999999324,NULL,'/products/lavender.png','/products/lavender.png',NULL,35,35,1770935065271,1770935065271);
INSERT INTO Product VALUES('cmlk10hpz000nt18ocnp902ly','Fern','cmlk10hpa0003t18obzsqcscw','Hanging fern basket',18.989999999999998436,'','/products/fern.png','/products/fern.png','',40,40,1770935065271,1771032264788);
INSERT INTO Product VALUES('cmlk10hq40014t18osa274dxx','Side Table','cmlk10hpa0005t18obychdoho','Small outdoor side table',49.990000000000005542,NULL,NULL,NULL,NULL,40,40,1770935065277,1770935065277);
INSERT INTO Product VALUES('cmlk10hq3000yt18oyj364ozq','Outdoor Rug','cmlk10hpa0004t18oau7fhb1c','Weather-resistant area rug',89.989999999999987778,'','','',NULL,150,100,1770935065275,1770949332770);
INSERT INTO Product VALUES('cmlk10hpy000dt18oi4yfy2r0','Lounge Chair','cmlk10hpa0002t18oz9z38dd3','Comfortable outdoor lounge chair',199.99000000000000554,NULL,'/products/lounge-chair.png','/products/lounge-chair.png',NULL,70,85,1770935065271,1770935065271);
INSERT INTO Product VALUES('cmlk10hpz000st18oairf2aol','Terracotta Pot','cmlk10hpa0004t18oau7fhb1c','Classic terracotta planter',22.989999999999999324,NULL,NULL,NULL,NULL,35,35,1770935065271,1770935065271);
INSERT INTO Product VALUES('cmlk10hq30010t18o9vh6svwd','Wind Chime','cmlk10hpa0006t18oskswkbyu','Bamboo wind chime',19.989999999999998436,NULL,NULL,NULL,NULL,20,20,1770935065276,1770935065276);
INSERT INTO Product VALUES('cmlk10hpy000et18ol97vrzas','Bench','cmlk10hpa0002t18oz9z38dd3','Wooden garden bench',149.99000000000000554,'','/products/bench.png','/products/bench.png','/models/1770986966844-Malu-fbx.fbx',201,129,1770935065271,1771204260594);
INSERT INTO Product VALUES('cmlk10hpz000rt18orne6rzn6','Olive Tree','cmlk10hpa0003t18obzsqcscw','Small potted olive tree',49.990000000000005542,NULL,'/products/olive-tree.png','/products/olive-tree.png',NULL,50,50,1770935065271,1770935065271);
INSERT INTO Product VALUES('cmlk10hpy000gt18oparg841n','Solar Lantern','cmlk10hp90001t18oemuzlsuy','Solar-powered garden lantern',34.990000000000001101,NULL,'/products/solar-lantern.png','/products/solar-lantern.png',NULL,25,25,1770935065271,1770935065271);
INSERT INTO Product VALUES('cmlk10hpy000ht18oyo08u2t9','String Lights','cmlk10hp90001t18oemuzlsuy','Warm white LED string lights',24.98999999999999666,NULL,'/products/string-lights.png','/products/string-lights.png',NULL,30,30,1770935065271,1770935065271);
INSERT INTO Product VALUES('cmlk10hpz000ut18o23la7r3v','Wall Sconce','cmlk10hp90001t18oemuzlsuy','Outdoor wall-mounted light',59.990000000000005542,NULL,'/products/wall-sconce.png','/products/wall-sconce.png',NULL,20,20,1770935065271,1770935065271);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
COMMIT;
