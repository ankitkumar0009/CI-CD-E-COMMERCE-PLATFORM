// ==============================================================================
// SHOPSPHERE - Enterprise Multi-Vendor Seed Data
// Includes 14 Mandatory Categories, Multi-Vendor Stores, Verified Sellers,
// Products, Orders, Commission Rules, and Notifications
// ==============================================================================

const bcrypt = require('bcryptjs');

const passwordHash = bcrypt.hashSync('Password@123', 10);
const adminHash = bcrypt.hashSync('Admin@123', 10);
const sellerHash = bcrypt.hashSync('Seller@123', 10);
const customerHash = bcrypt.hashSync('Customer@123', 10);

const CATEGORIES = [
  {
    id: 'cat-1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'High performance audio, cameras, smart wearables, and smart home appliances',
    icon: 'Tv',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'cat-2',
    name: 'Fashion & Clothing',
    slug: 'fashion-clothing',
    description: 'Trending ethnic wear, western apparel, formal attire, and everyday comfort',
    icon: 'Shirt',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80',
    displayOrder: 2,
    isActive: true
  },
  {
    id: 'cat-3',
    name: 'Mobile Phones',
    slug: 'mobile-phones',
    description: 'Latest 5G smartphones, foldable flagships, budget champions, and accessories',
    icon: 'Smartphone',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    displayOrder: 3,
    isActive: true
  },
  {
    id: 'cat-4',
    name: 'Laptops & Computers',
    slug: 'laptops-computers',
    description: 'Gaming rigs, ultrabooks, AI workstations, monitors, and mechanical keyboards',
    icon: 'Laptop',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
    displayOrder: 4,
    isActive: true
  },
  {
    id: 'cat-5',
    name: 'Shoes & Footwear',
    slug: 'shoes-footwear',
    description: 'Running sneakers, formal leather shoes, boots, and ergonomic sandals',
    icon: 'Footprints',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    displayOrder: 5,
    isActive: true
  },
  {
    id: 'cat-6',
    name: 'Grocery & Daily Essentials',
    slug: 'grocery-daily-essentials',
    description: 'Farm-fresh organic staples, cold-pressed oils, gourmet beverages, and snacks',
    icon: 'ShoppingBasket',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    displayOrder: 6,
    isActive: true
  },
  {
    id: 'cat-7',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Smart air fryers, induction cookware, aesthetic dinnerware, and organizers',
    icon: 'UtensilsCrossed',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    displayOrder: 7,
    isActive: true
  },
  {
    id: 'cat-8',
    name: 'Furniture',
    slug: 'furniture',
    description: 'Solid wood study tables, ergonomic executive chairs, sofas, and beds',
    icon: 'Armchair',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    displayOrder: 8,
    isActive: true
  },
  {
    id: 'cat-9',
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    description: 'Dermatologist tested skincare, perfumes, organic grooming, and wellness',
    icon: 'Sparkles',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    displayOrder: 9,
    isActive: true
  },
  {
    id: 'cat-10',
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Gym equipment, yoga mats, protein supplements, cycles, and athletic gear',
    icon: 'Dumbbell',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    displayOrder: 10,
    isActive: true
  },
  {
    id: 'cat-11',
    name: 'Books & Stationery',
    slug: 'books-stationery',
    description: 'Bestselling novels, engineering textbooks, fountain pens, and bullet journals',
    icon: 'BookOpen',
    imageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
    displayOrder: 11,
    isActive: true
  },
  {
    id: 'cat-12',
    name: 'Toys & Baby Products',
    slug: 'toys-baby-products',
    description: 'STEM building kits, non-toxic baby care, strollers, and educational games',
    icon: 'Baby',
    imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80',
    displayOrder: 12,
    isActive: true
  },
  {
    id: 'cat-13',
    name: 'Watches & Accessories',
    slug: 'watches-accessories',
    description: 'Swiss-movement luxury watches, smartbands, sunglasses, and leather belts',
    icon: 'Watch',
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
    displayOrder: 13,
    isActive: true
  },
  {
    id: 'cat-14',
    name: 'Automotive Accessories',
    slug: 'automotive-accessories',
    description: '4K dashcams, portable tire inflators, ceramic wax, and ergonomic car pillows',
    icon: 'Car',
    imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
    displayOrder: 14,
    isActive: true
  }
];

const USERS = [
  {
    id: 'usr-admin-1',
    email: 'admin@shopsphere.io',
    passwordHash: adminHash,
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+91 98765 00001',
    role: 'SUPER_ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    isEmailVerified: true,
    isActive: true
  },
  {
    id: 'usr-seller-1',
    email: 'seller@shopsphere.io',
    passwordHash: sellerHash,
    firstName: 'Apex',
    lastName: 'Merchant',
    phone: '+91 98765 00002',
    role: 'SELLER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    isEmailVerified: true,
    isActive: true
  },
  {
    id: 'usr-seller-2',
    email: 'seller2@shopsphere.io',
    passwordHash: sellerHash,
    firstName: 'Zenith',
    lastName: 'Retailer',
    phone: '+91 98765 00003',
    role: 'SELLER',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    isEmailVerified: true,
    isActive: true
  },
  {
    id: 'usr-customer-1',
    email: 'customer@shopsphere.io',
    passwordHash: customerHash,
    firstName: 'Rahul',
    lastName: 'Sharma',
    phone: '+91 98765 00004',
    role: 'CUSTOMER',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    isEmailVerified: true,
    isActive: true
  }
];

const SELLERS = [
  {
    id: 'sel-1',
    userId: 'usr-seller-1',
    panNumber: 'ABCDE1234F',
    gstin: '29ABCDE1234F1Z5',
    businessName: 'Apex Innovations Pvt Ltd',
    businessType: 'Private Limited',
    bankAccountNo: '98765432101234',
    bankIfsc: 'HDFC0000123',
    bankName: 'HDFC Bank, Koramangala Bangalore',
    kycStatus: 'APPROVED',
    kycRejectionReason: null,
    razorpayAccountId: 'acc_apex_001',
    commissionRate: 8.5
  },
  {
    id: 'sel-2',
    userId: 'usr-seller-2',
    panNumber: 'WXYZP9876K',
    gstin: '27WXYZP9876K1Z9',
    businessName: 'Zenith Global Merchants',
    businessType: 'Proprietorship',
    bankAccountNo: '11223344556677',
    bankIfsc: 'ICIC0000456',
    bankName: 'ICICI Bank, Bandra Mumbai',
    kycStatus: 'APPROVED',
    kycRejectionReason: null,
    razorpayAccountId: 'acc_zenith_002',
    commissionRate: 10.0
  }
];

const STORES = [
  {
    id: 'sto-1',
    sellerId: 'sel-1',
    name: 'Apex Electronics & Tech',
    slug: 'apex-electronics',
    description: 'Premier authorized distributor for audiophile headphones, smart devices, and next-gen gadgets.',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    supportEmail: 'support@apexelectronics.com',
    supportPhone: '+91 80 4455 6677',
    status: 'ACTIVE',
    rating: 4.9,
    reviewCount: 342
  },
  {
    id: 'sto-2',
    sellerId: 'sel-2',
    name: 'Zenith Lifestyle & Essentials',
    slug: 'zenith-lifestyle',
    description: 'Curated modern fashion, ergonomically crafted furniture, footwear, and daily essentials.',
    logoUrl: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    supportEmail: 'care@zenithlifestyle.in',
    supportPhone: '+91 22 8899 0011',
    status: 'ACTIVE',
    rating: 4.8,
    reviewCount: 289
  }
];

const CUSTOMERS = [
  {
    id: 'cus-1',
    userId: 'usr-customer-1',
    walletBalance: 1500.0,
    defaultAddressId: 'addr-1'
  }
];

const ADDRESSES = [
  {
    id: 'addr-1',
    customerId: 'cus-1',
    fullName: 'Rahul Sharma',
    phone: '+91 98765 00004',
    addressLine1: 'Flat 402, Prestige Tower, 12th Main',
    addressLine2: 'Indiranagar Phase 2',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    country: 'India',
    addressType: 'HOME',
    isDefault: true
  },
  {
    id: 'addr-2',
    customerId: 'cus-1',
    fullName: 'Rahul Sharma (Office)',
    phone: '+91 98765 00004',
    addressLine1: 'Level 5, WeWork Galaxy, 43 Residency Road',
    addressLine2: 'Shanthala Nagar, Ashok Nagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560025',
    country: 'India',
    addressType: 'WORK',
    isDefault: false
  }
];

const PRODUCTS = [
  // Category 1: Electronics
  {
    id: 'prod-elec-1',
    storeId: 'sto-1',
    categoryId: 'cat-1',
    name: 'AcousticPro ANC Wireless Headphones',
    slug: 'acousticpro-anc-wireless-headphones',
    description: 'Audiophile grade active noise cancellation with 45-hour continuous battery life, high-res 40mm beryllium drivers, multipoint bluetooth 5.3, and ultra-plush memory foam earcups.',
    price: 14999,
    comparePrice: 24999,
    costPrice: 9500,
    sku: 'EL-ANC-001',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      battery: '45 hours with ANC',
      connectivity: 'Bluetooth 5.3 + 3.5mm Aux',
      driver: '40mm Custom Beryllium',
      warranty: '2 Years Manufacturer Replacement'
    },
    tags: ['wireless', 'noise-cancelling', 'audiophile', 'bestseller'],
    status: 'ACTIVE',
    rating: 4.9,
    reviewCount: 128,
    isFeatured: true,
    inventory: 50
  },
  {
    id: 'prod-elec-2',
    storeId: 'sto-1',
    categoryId: 'cat-1',
    name: 'CinemaBeam 4K Laser Smart Projector',
    slug: 'cinemabeam-4k-laser-smart-projector',
    description: '3200 ANSI Lumens true 4K ultra-short throw projector with built-in Dolby Atmos 60W soundbar, HDR10+, and auto keystone correction.',
    price: 89999,
    comparePrice: 119999,
    costPrice: 62000,
    sku: 'EL-PRJ-002',
    images: [
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      resolution: '3840 x 2160 UHD',
      brightness: '3200 ANSI Lumens',
      audio: '60W Dolby Atmos Built-in'
    },
    tags: ['projector', '4k', 'home-theater'],
    status: 'ACTIVE',
    rating: 4.8,
    reviewCount: 45,
    isFeatured: true,
    inventory: 15
  },

  // Category 2: Fashion & Clothing
  {
    id: 'prod-fash-1',
    storeId: 'sto-2',
    categoryId: 'cat-2',
    name: 'Merino Wool Minimalist Tailored Blazer',
    slug: 'merino-wool-minimalist-blazer',
    description: 'Crafted from 100% Australian Merino Wool with breathable Bemberg silk lining. Designed for modern professionals seeking timeless elegance.',
    price: 6499,
    comparePrice: 9999,
    costPrice: 3200,
    sku: 'FA-BLZ-001',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      material: '100% Merino Wool',
      fit: 'Slim Modern Fit',
      care: 'Dry Clean Only'
    },
    tags: ['blazer', 'formal', 'wool', 'luxury'],
    status: 'ACTIVE',
    rating: 4.7,
    reviewCount: 76,
    isFeatured: true,
    inventory: 40
  },

  // Category 3: Mobile Phones
  {
    id: 'prod-mob-1',
    storeId: 'sto-1',
    categoryId: 'cat-3',
    name: 'Nova Pro 5G Titan Smartphone (16GB RAM + 512GB)',
    slug: 'nova-pro-5g-titan-smartphone',
    description: 'Powered by Snapdragon 8 Gen 3 with a 6.8-inch 120Hz LTPO AMOLED display, titanium chassis, and a revolutionary 200MP periscope zoom lens with OIS.',
    price: 74999,
    comparePrice: 89999,
    costPrice: 58000,
    sku: 'MB-NOV-512',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      display: '6.8" Quad HD+ LTPO 120Hz',
      processor: 'Snapdragon 8 Gen 3',
      camera: '200MP + 50MP Periscope + 50MP Ultra-wide',
      battery: '5400mAh with 100W SuperVOOC'
    },
    tags: ['flagship', '5g', 'smartphone', 'titanium'],
    status: 'ACTIVE',
    rating: 4.9,
    reviewCount: 215,
    isFeatured: true,
    inventory: 35
  },

  // Category 4: Laptops & Computers
  {
    id: 'prod-lap-1',
    storeId: 'sto-1',
    categoryId: 'cat-4',
    name: 'ZenithBook Pro AI Studio Laptop (32GB + 1TB SSD)',
    slug: 'zenithbook-pro-ai-studio-laptop',
    description: 'All-aluminum unibody creator laptop with Intel Core Ultra 9, NVIDIA RTX 4070 8GB GDDR6, and a color-calibrated 3.2K 165Hz OLED touchscreen.',
    price: 139999,
    comparePrice: 169999,
    costPrice: 110000,
    sku: 'LP-ZEN-001',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      cpu: 'Intel Core Ultra 9 185H',
      gpu: 'NVIDIA GeForce RTX 4070 8GB',
      ram: '32GB LPDDR5X 7467MHz',
      storage: '1TB PCIe Gen4 NVMe'
    },
    tags: ['laptop', 'ai', 'rtx4070', 'oled', 'creator'],
    status: 'ACTIVE',
    rating: 4.9,
    reviewCount: 92,
    isFeatured: true,
    inventory: 20
  },

  // Category 5: Shoes & Footwear
  {
    id: 'prod-shoe-1',
    storeId: 'sto-2',
    categoryId: 'cat-5',
    name: 'HyperStrider Pro Carbon Plated Running Shoes',
    slug: 'hyperstrider-pro-carbon-running-shoes',
    description: 'Engineered for marathon pacing with dual-density nitrogen infused foam and a full-length 3D curved carbon fiber propulsion plate.',
    price: 8999,
    comparePrice: 12999,
    costPrice: 4800,
    sku: 'SH-RUN-001',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      weight: '198 grams',
      drop: '8mm drop',
      plate: 'Full Carbon Fiber Spring'
    },
    tags: ['shoes', 'running', 'marathon', 'carbon'],
    status: 'ACTIVE',
    rating: 4.8,
    reviewCount: 164,
    isFeatured: true,
    inventory: 60
  },

  // Category 6: Grocery & Daily Essentials
  {
    id: 'prod-groc-1',
    storeId: 'sto-2',
    categoryId: 'cat-6',
    name: 'Cold-Pressed Raw Organic Extra Virgin Olive Oil (1L)',
    slug: 'cold-pressed-raw-organic-olive-oil',
    description: 'First cold pressed from sun-ripened Mediterranean olives within 4 hours of harvest. Unfiltered, rich in polyphenols and healthy fats.',
    price: 1299,
    comparePrice: 1799,
    costPrice: 750,
    sku: 'GR-OIL-001',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      volume: '1000 ml Glass Bottle',
      acidity: 'Less than 0.2%',
      certification: 'USDA & India Organic'
    },
    tags: ['grocery', 'organic', 'olive-oil', 'healthy'],
    status: 'ACTIVE',
    rating: 4.8,
    reviewCount: 310,
    isFeatured: false,
    inventory: 150
  },

  // Category 7: Home & Kitchen
  {
    id: 'prod-kit-1',
    storeId: 'sto-2',
    categoryId: 'cat-7',
    name: 'SmartAir 360 Dual-Zone Air Fryer & Oven (8.5L)',
    slug: 'smartair-360-dual-zone-air-fryer',
    description: 'Synchronized dual cooking baskets with smart probe temperature monitoring, 12 presets, 360 rapid air circulation, and non-stick ceramic coating.',
    price: 9499,
    comparePrice: 14999,
    costPrice: 5200,
    sku: 'HK-AF-001',
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      capacity: '8.5 Liters (Dual 4.25L Baskets)',
      power: '2200W High Efficiency',
      connectivity: 'Wi-Fi Smart App Enabled'
    },
    tags: ['kitchen', 'air-fryer', 'smart-home'],
    status: 'ACTIVE',
    rating: 4.9,
    reviewCount: 188,
    isFeatured: true,
    inventory: 40
  },

  // Category 8: Furniture
  {
    id: 'prod-furn-1',
    storeId: 'sto-2',
    categoryId: 'cat-8',
    name: 'ErgoMaster Pro Ergonomic Mesh Executive Chair',
    slug: 'ergomaster-pro-ergonomic-mesh-chair',
    description: 'Dynamic lumbar feedback support, 4D adjustable armrests, breathable German mesh, and aircraft-grade aluminum alloy wheelbase.',
    price: 18999,
    comparePrice: 28999,
    costPrice: 11000,
    sku: 'FN-CHR-001',
    images: [
      'https://images.unsplash.com/photo-1580481077195-c3a8a37f714c?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      material: 'K+R High Tensile Mesh',
      mechanism: 'Synchronous Multi-lock 135 Recline',
      warranty: '5 Years Structural Warranty'
    },
    tags: ['furniture', 'chair', 'ergonomic', 'wfh'],
    status: 'ACTIVE',
    rating: 4.9,
    reviewCount: 94,
    isFeatured: true,
    inventory: 25
  },

  // Category 9: Beauty & Personal Care
  {
    id: 'prod-beau-1',
    storeId: 'sto-2',
    categoryId: 'cat-9',
    name: 'GlowMatrix Peptide & Ceramide Barrier Recovery Serum',
    slug: 'glowmatrix-peptide-ceramide-recovery-serum',
    description: 'Multi-peptide cocktail with 5 essential ceramides and pure multi-molecular hyaluronic acid to restore the skin moisture barrier.',
    price: 1599,
    comparePrice: 2299,
    costPrice: 650,
    sku: 'BP-SER-001',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      size: '50ml Glass Dropper',
      skinType: 'All Skin Types including sensitive',
      crueltyFree: 'PETA Certified 100% Vegan'
    },
    tags: ['skincare', 'serum', 'peptides', 'glow'],
    status: 'ACTIVE',
    rating: 4.8,
    reviewCount: 142,
    isFeatured: false,
    inventory: 110
  },

  // Category 10: Sports & Fitness
  {
    id: 'prod-spt-1',
    storeId: 'sto-2',
    categoryId: 'cat-10',
    name: 'ApexPower Adjustable Smart Dumbbell Set (5kg - 32kg)',
    slug: 'apexpower-adjustable-smart-dumbbell-set',
    description: 'Rapid 1-second dial mechanism replacing 15 sets of dumbbells with laser-cut steel plates and knurled comfort grip handles.',
    price: 21999,
    comparePrice: 32000,
    costPrice: 13500,
    sku: 'SP-DMB-001',
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      weightRange: '5kg to 32kg per dumbbell',
      increments: '2kg precision increments',
      stand: 'Heavy Duty Floor Stand Included'
    },
    tags: ['fitness', 'gym', 'dumbbells', 'home-workout'],
    status: 'ACTIVE',
    rating: 4.9,
    reviewCount: 68,
    isFeatured: true,
    inventory: 18
  },

  // Category 11: Books & Stationery
  {
    id: 'prod-bk-1',
    storeId: 'sto-2',
    categoryId: 'cat-11',
    name: 'Designing Data-Intensive Applications (Hardcover Collector)',
    slug: 'designing-data-intensive-applications-hardcover',
    description: 'The definitive architectural guide by Martin Kleppmann on reliable, scalable, and maintainable systems for backend and cloud engineers.',
    price: 2499,
    comparePrice: 3499,
    costPrice: 1400,
    sku: 'BK-DDIA-001',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      format: 'Collector Hardcover Edition',
      pages: '616 pages',
      publisher: 'O’Reilly Media'
    },
    tags: ['books', 'engineering', 'architecture', 'distributed-systems'],
    status: 'ACTIVE',
    rating: 5.0,
    reviewCount: 512,
    isFeatured: false,
    inventory: 90
  },

  // Category 12: Toys & Baby Products
  {
    id: 'prod-toy-1',
    storeId: 'sto-2',
    categoryId: 'cat-12',
    name: 'RoboTech STEM Programmable Bionic Rover Kit',
    slug: 'robotech-stem-programmable-rover-kit',
    description: 'Modular robotics kit with ESP32 microcontroller, AI vision camera module, ultrasonic sensors, and block-based/Python coding support.',
    price: 4999,
    comparePrice: 7999,
    costPrice: 2600,
    sku: 'TY-ROB-001',
    images: [
      'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      age: '10+ Years',
      languages: 'Scratch 3.0 & MicroPython',
      connectivity: 'Wi-Fi & Bluetooth 5.0'
    },
    tags: ['toys', 'stem', 'robotics', 'coding'],
    status: 'ACTIVE',
    rating: 4.8,
    reviewCount: 84,
    isFeatured: false,
    inventory: 45
  },

  // Category 13: Watches & Accessories
  {
    id: 'prod-wat-1',
    storeId: 'sto-1',
    categoryId: 'cat-13',
    name: 'Chronos Sapphire Automatic Mechanical Watch',
    slug: 'chronos-sapphire-automatic-mechanical-watch',
    description: 'Japanese Miyota 9015 28,800 bph automatic movement, scratch-resistant double-domed sapphire crystal, and 316L solid surgical steel link bracelet.',
    price: 24999,
    comparePrice: 38999,
    costPrice: 14000,
    sku: 'WT-CHRN-001',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      movement: 'Miyota 9015 Automatic (42hr Power Reserve)',
      waterResistance: '100m / 10 ATM with Screw-down Crown',
      glass: 'Double Domed Anti-Reflective Sapphire'
    },
    tags: ['watches', 'luxury', 'mechanical', 'sapphire'],
    status: 'ACTIVE',
    rating: 4.9,
    reviewCount: 118,
    isFeatured: true,
    inventory: 30
  },

  // Category 14: Automotive Accessories
  {
    id: 'prod-auto-1',
    storeId: 'sto-1',
    categoryId: 'cat-14',
    name: 'DriveGuard 4K Dual HDR Dashcam with Starvis 2',
    slug: 'driveguard-4k-dual-hdr-dashcam',
    description: 'Front 4K + Rear 1080p recording with Sony Starvis 2 Night Vision sensor, 5GHz Wi-Fi instant video export, GPS logging, and 24/7 G-sensor parking monitoring.',
    price: 11499,
    comparePrice: 16999,
    costPrice: 6800,
    sku: 'AU-DSH-001',
    images: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      sensor: 'Sony Starvis 2 IMX678 (Front 4K)',
      features: 'Supercapacitor, Built-in GPS, Voice Control',
      storage: 'Supports up to 256GB MicroSD U3'
    },
    tags: ['automotive', 'dashcam', 'car', 'safety'],
    status: 'ACTIVE',
    rating: 4.8,
    reviewCount: 97,
    isFeatured: true,
    inventory: 40
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ord-1001',
    customerId: 'cus-1',
    orderNumber: 'SS-ORD-20261106-1001',
    subtotal: 14999,
    taxAmount: 2700,
    shippingFee: 0,
    discountAmount: 1000,
    totalAmount: 16699,
    currency: 'INR',
    shippingAddress: {
      fullName: 'Rahul Sharma',
      phone: '+91 98765 00004',
      addressLine1: 'Flat 402, Prestige Tower, 12th Main',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038'
    },
    orderStatus: 'CONFIRMED',
    paymentStatus: 'PAID',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    sellerOrders: [
      {
        id: 'so-1001',
        orderId: 'ord-1001',
        sellerId: 'sel-1',
        sellerSubtotal: 14999,
        commissionAmount: 1274.91, // 8.5%
        netPayout: 13724.09,
        status: 'PROCESSING',
        shippingCarrier: 'BlueDart Express',
        trackingNumber: 'BD982341109IN',
        items: [
          {
            id: 'item-101',
            productId: 'prod-elec-1',
            productName: 'AcousticPro ANC Wireless Headphones',
            price: 14999,
            quantity: 1,
            total: 14999
          }
        ]
      }
    ],
    payment: {
      id: 'pay-1001',
      orderId: 'ord-1001',
      razorpayOrderId: 'order_SShop_test_1001',
      razorpayPaymentId: 'pay_test_992147101',
      razorpaySignature: 'sig_mock_verified_hash_1001',
      amount: 16699,
      currency: 'INR',
      status: 'PAID',
      paymentMethod: 'UPI'
    }
  }
];

const NOTIFICATIONS = [
  {
    id: 'notif-1',
    recipientId: 'usr-admin-1',
    targetRole: 'SUPER_ADMIN',
    title: 'New Seller Onboarded',
    message: 'Apex Innovations Pvt Ltd has completed KYC verification and store launch.',
    type: 'SELLER_REGISTRATION',
    link: '/admin/sellers',
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif-2',
    recipientId: 'usr-seller-1',
    targetRole: 'SELLER',
    title: 'Order Confirmed (#SS-ORD-20261106-1001)',
    message: 'You have 1 pending order for AcousticPro ANC Headphones. Ready for dispatch.',
    type: 'ORDER_PLACED',
    link: '/seller/orders',
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif-3',
    recipientId: 'usr-customer-1',
    targetRole: 'CUSTOMER',
    title: 'Payment Successful',
    message: 'Payment of ₹16,699 for order SS-ORD-20261106-1001 was successful via UPI.',
    type: 'PAYMENT_SUCCESS',
    link: '/orders',
    isRead: false,
    createdAt: new Date().toISOString()
  }
];

module.exports = {
  CATEGORIES,
  USERS,
  SELLERS,
  STORES,
  CUSTOMERS,
  ADDRESSES,
  PRODUCTS,
  INITIAL_ORDERS,
  NOTIFICATIONS
};
