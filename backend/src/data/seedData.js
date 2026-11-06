const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);

const defaultUsers = [
  {
    _id: 'usr_admin_001',
    name: 'DevOps Administrator',
    email: 'admin@ecommerce.io',
    password: bcrypt.hashSync('Admin@123', salt),
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date('2026-01-15T08:00:00Z')
  },
  {
    _id: 'usr_demo_002',
    name: 'Jane CloudEngineer',
    email: 'user@ecommerce.io',
    password: bcrypt.hashSync('User@123', salt),
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date('2026-02-01T10:30:00Z')
  }
];

const sampleProducts = [
  {
    _id: 'prod_001',
    name: 'MacBook Pro M3 Max - Space Black',
    slug: 'macbook-pro-m3-max',
    category: 'Laptops & Computers',
    price: 3499.00,
    originalPrice: 3899.00,
    stock: 24,
    rating: 4.9,
    numReviews: 128,
    isFeatured: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Engineered for extreme workflows. Powered by the groundbreaking M3 Max chip with 16-core CPU, 40-core GPU, up to 128GB unified memory, and Liquid Retina XDR display.',
    specs: {
      'Processor': 'Apple M3 Max (16-core CPU)',
      'Memory': '64GB Unified Memory',
      'Storage': '2TB Ultra-fast NVMe SSD',
      'Display': '16.2-inch Liquid Retina XDR (3456x2234)',
      'Battery Life': 'Up to 22 hours',
      'Weight': '2.16 kg'
    },
    reviews: [
      {
        id: 'rev_001',
        user: 'Alex Rivera',
        rating: 5,
        comment: 'Handles local Kubernetes clusters, Docker builds, and 4K rendering simultaneously without breaking a sweat.',
        date: '2026-02-14'
      },
      {
        id: 'rev_002',
        user: 'Elena Rostova',
        rating: 5,
        comment: 'Best laptop for cloud architects and ML engineers. Space black finish looks stunning.',
        date: '2026-02-28'
      }
    ]
  },
  {
    _id: 'prod_002',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling',
    slug: 'sony-wh-1000xm5',
    category: 'Audio & Headphones',
    price: 398.00,
    originalPrice: 449.00,
    stock: 45,
    rating: 4.8,
    numReviews: 245,
    isFeatured: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Industry-leading noise cancellation optimized by two processors and 8 microphones. Exceptional sound quality with newly developed 30mm driver unit and crystal clear hands-free calls.',
    specs: {
      'Noise Cancelling': 'Auto NC Optimizer + Dual V1/QN1 Processors',
      'Battery Life': '30 hours with ANC on, 40 hours ANC off',
      'Connectivity': 'Bluetooth 5.2, Multipoint connection, LDAC',
      'Weight': '250g',
      'Charging': '3 min charge gives 3 hours playback'
    },
    reviews: [
      {
        id: 'rev_003',
        user: 'Michael Chen',
        rating: 5,
        comment: 'Silent bliss while coding in noisy co-working spaces.',
        date: '2026-01-20'
      }
    ]
  },
  {
    _id: 'prod_003',
    name: 'Apple Watch Ultra 2 Titanium GPS + Cellular',
    slug: 'apple-watch-ultra-2',
    category: 'Smart Devices & Wearables',
    price: 799.00,
    originalPrice: 849.00,
    stock: 18,
    rating: 4.9,
    numReviews: 96,
    isFeatured: true,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'The ultimate sports and adventure watch. 49mm corrosion-resistant aerospace-grade titanium case, precision dual-frequency GPS, and up to 3000 nits display brightness.',
    specs: {
      'Case Material': 'Titanium 49mm',
      'Display': 'Always-On Retina display, 3000 nits',
      'Water Resistance': '100m, EN13319 certified dive computer',
      'Battery': '36 hours normal, up to 72 hours low power mode',
      'Connectivity': 'LTE, Wi-Fi, Bluetooth 5.3, Ultra Wideband gen 2'
    },
    reviews: [
      {
        id: 'rev_004',
        user: 'Sarah Jenkins',
        rating: 5,
        comment: 'Rugged, reliable, and battery lasts through long trail runs and weekend trips.',
        date: '2026-03-02'
      }
    ]
  },
  {
    _id: 'prod_004',
    name: 'Sony Alpha a7 IV Full-Frame Mirrorless Camera',
    slug: 'sony-alpha-a7-iv',
    category: 'Cameras & Video',
    price: 2498.00,
    originalPrice: 2699.00,
    stock: 12,
    rating: 4.8,
    numReviews: 82,
    isFeatured: false,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80'
    ],
    description: '33MP full-frame Exmor R back-illuminated CMOS sensor with BIONZ XR processing. 4K 60p 10-bit 4:2:2 recording, cutting-edge real-time tracking autofocus.',
    specs: {
      'Sensor': '33MP Full-Frame Exmor R CMOS',
      'Video': '4K 60p 10-bit 4:2:2, S-Cinetone, S-Log3',
      'Autofocus': '759 phase-detection points, Human/Animal/Bird Eye AF',
      'Stabilization': '5-axis in-body optical image stabilization',
      'Media Slots': 'Dual CFexpress Type A / SD UHS-II'
    },
    reviews: []
  },
  {
    _id: 'prod_005',
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    slug: 'keychron-q1-pro',
    category: 'Gaming & Peripherals',
    price: 199.00,
    originalPrice: 229.00,
    stock: 50,
    rating: 4.7,
    numReviews: 174,
    isFeatured: false,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Full aluminum CNC machined 75% mechanical keyboard with Bluetooth 5.1 and Type-C wired connectivity. Double-gasket design with hot-swappable switches and QMK/VIA support.',
    specs: {
      'Layout': '75% with Rotary Encoder Knob',
      'Case': 'Full CNC Machined 6063 Aluminum',
      'Switches': 'K Pro Red Mechanical Switches (Pre-lubed)',
      'Connectivity': 'Bluetooth 5.1 & Type-C Braided Cable',
      'Backlight': 'South-facing RGB Backlight with 22 lighting modes'
    },
    reviews: [
      {
        id: 'rev_005',
        user: 'David Kim',
        rating: 5,
        comment: 'Typing sound profile is pure perfection right out of the box.',
        date: '2026-02-18'
      }
    ]
  },
  {
    _id: 'prod_006',
    name: 'Dell UltraSharp 32 4K USB-C Hub Monitor (U3223QE)',
    slug: 'dell-ultrasharp-32-4k-u3223qe',
    category: 'Laptops & Computers',
    price: 829.00,
    originalPrice: 949.00,
    stock: 31,
    rating: 4.8,
    numReviews: 110,
    isFeatured: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'IPS Black technology with 2000:1 contrast ratio, 98% DCI-P3 color gamut, and 90W USB-C Power Delivery. Built-in RJ45 Ethernet and KVM switch for dual workstation productivity.',
    specs: {
      'Panel Size': '31.5-inch 4K UHD (3840 x 2160)',
      'Contrast Ratio': '2000:1 (IPS Black)',
      'Color Gamut': '100% sRGB, 98% DCI-P3, HDR 400',
      'Ports': 'USB-C with 90W PD, DisplayPort 1.4, HDMI 2.0, RJ45 Ethernet, 5x USB-A 10Gbps'
    },
    reviews: []
  },
  {
    _id: 'prod_007',
    name: 'Bose QuietComfort Ultra Earbuds',
    slug: 'bose-quietcomfort-ultra-earbuds',
    category: 'Audio & Headphones',
    price: 279.00,
    originalPrice: 299.00,
    stock: 60,
    rating: 4.6,
    numReviews: 142,
    isFeatured: false,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Breakthrough spatialized audio for more immersive listening. World-class noise cancellation custom-calibrated to the unique shape of your ears with CustomTune technology.',
    specs: {
      'Audio': 'Bose Immersive Audio Spatial Experience',
      'Noise Cancelling': 'CustomTune auto-adapting ANC',
      'Battery': '6 hours listening (up to 24 hours with wireless case)',
      'Resistance': 'IPX4 sweat and weather resistant'
    },
    reviews: []
  },
  {
    _id: 'prod_008',
    name: 'Logitech MX Master 3S Wireless Performance Mouse',
    slug: 'logitech-mx-master-3s',
    category: 'Gaming & Peripherals',
    price: 99.00,
    originalPrice: 119.00,
    stock: 85,
    rating: 4.9,
    numReviews: 310,
    isFeatured: false,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'An icon remastered. 8K DPI any-surface tracking including glass, Quiet Clicks with 90% less noise, and MagSpeed electromagnetic scrolling up to 1,000 lines per second.',
    specs: {
      'Sensor': 'Darkfield 8000 DPI high precision sensor',
      'Scroll Wheel': 'MagSpeed Smartshift electromagnetic wheel',
      'Connectivity': 'Bluetooth Low Energy & Logi Bolt USB Receiver',
      'Battery': 'Up to 70 days on a single full charge'
    },
    reviews: []
  },
  {
    _id: 'prod_009',
    name: 'Philips Hue Smart Home Ambient Lighting Starter Kit',
    slug: 'philips-hue-smart-lighting-kit',
    category: 'Smart Home',
    price: 189.00,
    originalPrice: 219.00,
    stock: 40,
    rating: 4.7,
    numReviews: 95,
    isFeatured: false,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Transform your home office or workspace with 16 million colors and shades of warm-to-cool white light. Includes Hue Bridge and 3 White & Color Ambiance A19 smart bulbs.',
    specs: {
      'Compatibility': 'Apple HomeKit, Google Assistant, Amazon Alexa, Zigbee',
      'Brightness': '1100 lumens per bulb (75W equivalent)',
      'Color Range': '16 Million Colors + 2000K-6500K White Spectrum'
    },
    reviews: []
  },
  {
    _id: 'prod_010',
    name: 'ASUS ROG Swift OLED 27-inch 240Hz Gaming Monitor',
    slug: 'asus-rog-swift-oled-27',
    category: 'Gaming & Peripherals',
    price: 899.00,
    originalPrice: 999.00,
    stock: 15,
    rating: 4.9,
    numReviews: 68,
    isFeatured: true,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1000&q=80'
    ],
    description: '27-inch 1440p OLED panel with blazing 240Hz refresh rate and near-instantaneous 0.03ms response time. Custom heatsink and intelligent voltage optimization for burn-in protection.',
    specs: {
      'Resolution': '2560 x 1440 QHD OLED',
      'Refresh Rate': '240Hz with 0.03ms response time (GTG)',
      'Color': '99% DCI-P3, Delta E < 2',
      'G-Sync': 'NVIDIA G-SYNC Compatible & AMD FreeSync Premium'
    },
    reviews: []
  }
];

const sampleOrders = [
  {
    _id: 'ord_1001',
    orderNumber: 'ORD-2026-9041',
    user: 'usr_demo_002',
    userEmail: 'user@ecommerce.io',
    userName: 'Jane CloudEngineer',
    items: [
      {
        product: 'prod_002',
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling',
        price: 398.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'
      },
      {
        product: 'prod_008',
        name: 'Logitech MX Master 3S Wireless Performance Mouse',
        price: 99.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    shippingAddress: {
      street: '456 Kubernetes Blvd, Suite 800',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States'
    },
    paymentMethod: 'Credit Card (Stripe via AWS Secrets Manager)',
    paymentStatus: 'Paid',
    subtotal: 497.00,
    tax: 39.76,
    shippingFee: 0.00,
    total: 536.76,
    status: 'Delivered',
    trackingNumber: 'TRK-US-AWS-882194',
    timeline: [
      { title: 'Order Placed', timestamp: '2026-03-01T10:15:00Z', completed: true },
      { title: 'Payment Confirmed', timestamp: '2026-03-01T10:16:00Z', completed: true },
      { title: 'Processed in Fulfillment Center', timestamp: '2026-03-01T14:30:00Z', completed: true },
      { title: 'Shipped with FedEx Express', timestamp: '2026-03-02T08:00:00Z', completed: true },
      { title: 'Delivered', timestamp: '2026-03-03T16:22:00Z', completed: true }
    ],
    createdAt: new Date('2026-03-01T10:15:00Z')
  },
  {
    _id: 'ord_1002',
    orderNumber: 'ORD-2026-9082',
    user: 'usr_demo_002',
    userEmail: 'user@ecommerce.io',
    userName: 'Jane CloudEngineer',
    items: [
      {
        product: 'prod_001',
        name: 'MacBook Pro M3 Max - Space Black',
        price: 3499.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    shippingAddress: {
      street: '456 Kubernetes Blvd, Suite 800',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States'
    },
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    subtotal: 3499.00,
    tax: 279.92,
    shippingFee: 0.00,
    total: 3778.92,
    status: 'Processing',
    trackingNumber: 'TRK-US-AWS-902311',
    timeline: [
      { title: 'Order Placed', timestamp: '2026-03-05T09:40:00Z', completed: true },
      { title: 'Payment Confirmed', timestamp: '2026-03-05T09:41:00Z', completed: true },
      { title: 'Processing in Fulfillment Center', timestamp: '2026-03-05T11:00:00Z', completed: true },
      { title: 'Shipped', timestamp: null, completed: false },
      { title: 'Delivered', timestamp: null, completed: false }
    ],
    createdAt: new Date('2026-03-05T09:40:00Z')
  }
];

module.exports = {
  defaultUsers,
  sampleProducts,
  sampleOrders
};
