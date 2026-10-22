export type VehicleCategory = 'all' | 'cars' | 'buses' | 'tempo';

export interface Vehicle {
  id: string;
  name: string;
  category: 'cars' | 'buses' | 'tempo';
  categoryLabel: string;
  subcategory: string;
  capacity: number;
  capacityLabel: string;
  isAc: boolean;
  acInfo: string;
  luggageCapacity: string;
  basePrice: number;
  priceDisplay: string;
  extraKmRate: string;
  image: string;
  facilities: string[];
  description: string;
  featuresDetailed: string[];
  popularBadge?: string;
}

export interface CategoryInfo {
  id: 'cars' | 'buses' | 'tempo';
  title: string;
  subtitle: string;
  description: string;
  subcategories: string[];
  image: string;
  icon: string;
  countText: string;
}

export const VEHICLE_CATEGORIES: CategoryInfo[] = [
  {
    id: 'cars',
    title: 'Cars & Sedans',
    subtitle: 'Sedan, SUV & Luxury Chauffeur',
    description: 'Chauffeured luxury and standard cars tailored for bridal entry, groom arrivals, VIP guests, and airport pickups.',
    subcategories: ['Sedan', 'SUV', 'Luxury car'],
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
    icon: '🚗',
    countText: '4 Vehicles Available'
  },
  {
    id: 'buses',
    title: 'Guest Buses & Coaches',
    subtitle: 'Standard Bus, AC Bus & Luxury Coach',
    description: 'Large-capacity modern buses for wedding attendees, family guest transfers, and baraat processions.',
    subcategories: ['Standard bus', 'AC bus', 'Luxury coach'],
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
    icon: '🚌',
    countText: '3 Coaches Available'
  },
  {
    id: 'tempo',
    title: 'Tempo Travellers',
    subtitle: 'Standard, AC & Premium Travellers',
    description: 'Comfortable 12 to 26 seater pushback tempo travellers with premium air conditioning and generous luggage storage.',
    subcategories: ['Standard tempo traveller', 'AC tempo traveller', 'Premium tempo traveller'],
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
    icon: '🚐',
    countText: '3 Travellers Available'
  }
];

export const FLEET_VEHICLES: Vehicle[] = [
  // 1. Cars
  {
    id: 'veh-mercedes-e',
    name: 'Mercedes-Benz E-Class Luxury Chauffeur',
    category: 'cars',
    categoryLabel: 'Luxury Car',
    subcategory: 'Luxury car',
    capacity: 4,
    capacityLabel: '4 Guests',
    isAc: true,
    acInfo: 'Dual-Zone Climate Control AC',
    luggageCapacity: '3 Large Bags',
    basePrice: 8500,
    priceDisplay: '₹8,500 / 8 hrs (80 km)',
    extraKmRate: '₹45 / km extra',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
    facilities: ['Uniformed Chauffeur', 'Bridal Ribbon Decor', 'Mineral Water & Mints', 'High-End Leather Seating'],
    description: 'Flagship luxury sedan ideal for bridal entry, groom arrival, or VIP executive transfers with experienced white-glove chauffeur.',
    featuresDetailed: [
      'Dual-zone automated climate control',
      'Panoramic glass sunroof with sunshade',
      'Complimentary wedding car ribbon decor on request',
      'Experienced uniformed chauffeur trained for wedding protocols',
      'Mineral water, facial tissues, and smartphone chargers provided',
      'Fully sanitized interior before dispatch'
    ],
    popularBadge: 'Bridal Choice'
  },
  {
    id: 'veh-innova-crysta',
    name: 'Toyota Innova Crysta ZX (7-Seater)',
    category: 'cars',
    categoryLabel: 'Premium SUV',
    subcategory: 'SUV',
    capacity: 7,
    capacityLabel: '7 Guests',
    isAc: true,
    acInfo: 'Triple-Row Automatic AC',
    luggageCapacity: '4 Suitcases + 3 Soft Bags',
    basePrice: 4200,
    priceDisplay: '₹4,200 / 8 hrs (80 km)',
    extraKmRate: '₹22 / km extra',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
    facilities: ['Captain Leather Seats', 'Rear AC Vents', 'USB Fast Chargers', 'Spacious Boot Space'],
    description: 'The benchmark for family travel and wedding party guest movements. Superb ride comfort and abundant luggage space.',
    featuresDetailed: [
      'Plush captain seats with individual armrests',
      'Independent roof-mounted AC vents for all 3 rows',
      'Spacious boot space for wedding gift boxes and luggage',
      'Fastag enabled for express toll plaza clearance',
      'Commercial permit valid across all state boundaries'
    ],
    popularBadge: 'Most Popular'
  },
  {
    id: 'veh-bmw-5',
    name: 'BMW 5 Series M-Sport Wedding Special',
    category: 'cars',
    categoryLabel: 'Luxury Car',
    subcategory: 'Luxury car',
    capacity: 4,
    capacityLabel: '4 Guests',
    isAc: true,
    acInfo: '4-Zone Automatic Climate AC',
    luggageCapacity: '2 Large Suitcases',
    basePrice: 11000,
    priceDisplay: '₹11,000 / 8 hrs (80 km)',
    extraKmRate: '₹55 / km extra',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
    facilities: ['Sunroof & Ambient Lighting', 'Red Carpet Entry Mats', 'Floral Garland Mounts', 'VIP Chauffeur'],
    description: 'Make a show-stopping grand entrance at your wedding reception with our premium BMW 5 Series bridal special.',
    featuresDetailed: [
      'Dramatic ambient interior illumination with custom wedding hues',
      'M-Sport suspension tuned for sublime road gliding',
      'Harman Kardon premium surround sound',
      'Specialist bridal chauffeur with ceremonial etiquette',
      'Pre-sanitized and polished exterior prior to arrival'
    ]
  },
  {
    id: 'veh-honda-city',
    name: 'Honda City V i-VTEC (Sedan)',
    category: 'cars',
    categoryLabel: 'Standard Sedan',
    subcategory: 'Sedan',
    capacity: 4,
    capacityLabel: '4 Guests',
    isAc: true,
    acInfo: 'Full Automatic Climate AC',
    luggageCapacity: '3 Medium Bags',
    basePrice: 2800,
    priceDisplay: '₹2,800 / 8 hrs (80 km)',
    extraKmRate: '₹16 / km extra',
    image: 'https://images.unsplash.com/photo-1590362891988-f77804702088?auto=format&fit=crop&q=80&w=800',
    facilities: ['Comfortable Legroom', 'Bluetooth Audio', 'Clean Chauffeur Service', 'Fastag Enabled'],
    description: 'Cost-effective, smooth sedan perfect for city transfers, pandit/priest pickup, and visiting relatives.',
    featuresDetailed: [
      'Generous rear legroom and supportive seating',
      'Efficient air conditioning suited for hot afternoons',
      'Clean, smoke-free interior with polite driver',
      'Perfect for quick guest pickups from railway station or airport'
    ]
  },

  // 2. Tempo Travellers
  {
    id: 'veh-force-urbania',
    name: 'Force Urbania Luxury Tempo (17-Seater)',
    category: 'tempo',
    categoryLabel: 'Premium Tempo Traveller',
    subcategory: 'Premium tempo traveller',
    capacity: 17,
    capacityLabel: '17 Guests',
    isAc: true,
    acInfo: 'Individual Roof AC Louvres',
    luggageCapacity: '15 Large Suitcases',
    basePrice: 7200,
    priceDisplay: '₹7,200 / 8 hrs (80 km)',
    extraKmRate: '₹28 / km extra',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
    facilities: ['Aircraft-style Pushback Seats', 'Individual USB Ports', 'Surround Sound & Mic', 'Panoramic Windows'],
    description: 'The next-generation luxury van with best-in-class NVH, individual recliners, and plush European-style interior.',
    featuresDetailed: [
      'European monocoque design for whisper-quiet travel',
      'Individual aircraft-style reading lights and AC louvres',
      'Dedicated luggage boot plus overhead baggage racks',
      'PA microphone system for announcements & tour coordination',
      'Wide central aisle for hassle-free boarding in wedding attire'
    ],
    popularBadge: 'Best for Groups'
  },
  {
    id: 'veh-force-traveller-20',
    name: 'Force Traveller Executive AC (20-Seater)',
    category: 'tempo',
    categoryLabel: 'AC Tempo Traveller',
    subcategory: 'AC tempo traveller',
    capacity: 20,
    capacityLabel: '20 Guests',
    isAc: true,
    acInfo: 'High-Capacity Dual AC',
    luggageCapacity: '15+ Bags + Top Carrier',
    basePrice: 6000,
    priceDisplay: '₹6,000 / 8 hrs (80 km)',
    extraKmRate: '₹25 / km extra',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800',
    facilities: ['Pushback Recliners 2x1', 'LED TV & Stereo System', 'First Aid Kit', 'Experienced Tour Captain'],
    description: 'Ideal choice for mid-sized groups, sangeet troupes, and wedding guests travelling between venue and hotel.',
    featuresDetailed: [
      '2x1 pushback seat configuration with plush cushioning',
      'Ceiling mounted LED screen with multimedia Bluetooth player',
      'Heavy-duty rooftop luggage carrier with waterproof tarpaulin',
      'Equipped with verified first aid and fire safety extinguisher',
      'Commercial all-India permit with seasoned highway driver'
    ]
  },
  {
    id: 'veh-tata-winger-12',
    name: 'Tata Winger Classic (12-Seater)',
    category: 'tempo',
    categoryLabel: 'Standard Tempo Traveller',
    subcategory: 'Standard tempo traveller',
    capacity: 12,
    capacityLabel: '12 Guests',
    isAc: true,
    acInfo: 'Standard Dual AC',
    luggageCapacity: '8-10 Bags',
    basePrice: 4800,
    priceDisplay: '₹4,800 / 8 hrs (80 km)',
    extraKmRate: '₹20 / km extra',
    image: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&q=80&w=800',
    facilities: ['Comfortable High-Back Seats', 'Easy Boarding Step', 'FM Radio & Aux', 'City-friendly Maneuver'],
    description: 'Affordable, practical compact tempo traveller for immediate family members and local event runs.',
    featuresDetailed: [
      'Compact footprint making it agile in narrow city venue lanes',
      'Individual high-back seats with safety lap belts',
      'Dual cooling blowers for front and rear cabin',
      'Punctual and helpful driver familiar with local event venues'
    ]
  },

  // 3. Guest Buses
  {
    id: 'veh-bharatbenz-coach-45',
    name: 'BharatBenz Luxury AC Coach (45-Seater)',
    category: 'buses',
    categoryLabel: 'Luxury Coach',
    subcategory: 'Luxury coach',
    capacity: 45,
    capacityLabel: '45 Guests',
    isAc: true,
    acInfo: 'Full-Cabin Heavy Duty Chilled AC',
    luggageCapacity: 'Large Underbelly Boot (40+ Bags)',
    basePrice: 14500,
    priceDisplay: '₹14,500 / 8 hrs (80 km)',
    extraKmRate: '₹48 / km extra',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
    facilities: ['Harita Reclining Seats', 'PA System & Microphone', 'Charging Sockets Every Row', 'Pneumatic Air Suspension'],
    description: 'Grand tourer coach for massive guest movements, marriage baraat transport, and intercity event logistics.',
    featuresDetailed: [
      'Full pneumatic air suspension providing effortless highway gliding',
      'Harita ergonomic recliners with foldaway footrests',
      'Massive lockable underfloor luggage compartments',
      'Dual wireless PA microphones for event coordinators',
      'High-capacity central air conditioning system with air purification',
      'Emergency exits and certified onboard safety gear'
    ],
    popularBadge: 'Grand Wedding Coach'
  },
  {
    id: 'veh-volvo-multiaxle-53',
    name: 'Volvo Multi-Axle Premium Bus (53-Seater)',
    category: 'buses',
    categoryLabel: 'AC Bus',
    subcategory: 'AC bus',
    capacity: 53,
    capacityLabel: '53 Guests',
    isAc: true,
    acInfo: 'Climate-Controlled Multi-Blower AC',
    luggageCapacity: '50+ Underfloor Luggage Bays',
    basePrice: 18500,
    priceDisplay: '₹18,500 / 8 hrs (80 km)',
    extraKmRate: '₹58 / km extra',
    image: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?auto=format&fit=crop&q=80&w=800',
    facilities: ['Ultra-Soft Semi-Sleeper Seats', 'Dual LCD Screens', 'Reading Lights', 'Electronically Controlled Air Suspension'],
    description: 'Top-tier premium transportation for destination weddings, ensuring guests arrive refreshed and on schedule.',
    featuresDetailed: [
      'Multi-axle chassis ensuring maximum stability and safety',
      'Semi-sleeper deep recliners with calf support',
      'Large panoramic tinted view windows with curtains',
      'Dual 32-inch entertainment screens with HDMI connectivity',
      'Two licensed drivers and cleaner for long-haul event transfers'
    ]
  },
  {
    id: 'veh-ashok-leyland-36',
    name: 'Ashok Leyland Starline Guest Bus (36-Seater)',
    category: 'buses',
    categoryLabel: 'Standard Bus',
    subcategory: 'Standard bus',
    capacity: 36,
    capacityLabel: '36 Guests',
    isAc: false,
    acInfo: 'Non-AC / Fresh Air Flow Ventilation',
    luggageCapacity: 'Overhead Racks & Rear Boot',
    basePrice: 9000,
    priceDisplay: '₹9,000 / 8 hrs (80 km)',
    extraKmRate: '₹32 / km extra',
    image: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&q=80&w=800',
    facilities: ['High Back Durable Seats', 'Emergency Exit', 'Music Player', 'Wide Aisle For Quick Boarding'],
    description: 'Economic large-group shuttle bus for local temple visits, nearby reception transfers, and event staff transit.',
    featuresDetailed: [
      'Reliable, spacious transportation for large guest groups on a budget',
      'Wide passenger aisle and wide entry door for speedy boarding',
      'High-back cushioned seating with wipe-clean upholstery',
      'Cost-effective option for short-distance wedding venue hops'
    ]
  }
];

export const EVENT_TYPES = [
  'Wedding & Reception',
  'Pre-Wedding / Sangeet / Mehendi',
  'Engagement & Saree Function',
  'Birthday & Family Gathering',
  'Corporate Event & Conference',
  'Airport & Hotel Transfers',
  'Other Special Celebration'
];

export const SAMPLE_VEHICLES = FLEET_VEHICLES;
