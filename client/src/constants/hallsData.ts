export interface LocationStructure {
  states: {
    [stateName: string]: {
      districts: {
        [districtName: string]: string[]; // Array of mandals
      };
    };
  };
}

export const locationsData: LocationStructure = {
  states: {
    'Telangana': {
      districts: {
        'Mahabubnagar': ['Mahabubnagar', 'Jadcherla', 'Devarkadra', 'Nawabpet', 'Balanagar'],
        'Jadcherla': ['Jadcherla', 'Badepally'],
        'Nagarkurnool': ['Nagarkurnool', 'Bijinapally', 'Telkapally', 'Kalwakurthy'],
        'Wanaparthy': ['Wanaparthy', 'Gopalpeta', 'Pebbair', 'Kothakota'],
        'Gadwal': ['Gadwal', 'Maldakal', 'Dharur', 'Alampur'],
        'Narayanpet': ['Narayanpet', 'Damaragidda', 'Kosgi', 'Utkoor'],
        'Hyderabad': ['Ameerpet', 'Secunderabad', 'Khairatabad', 'Charminar'],
        'Rangareddy': ['Gachibowli', 'Madhapur', 'Kondapur', 'Sherilingampally']
      }
    },
    'Andhra Pradesh': {
      districts: {
        'Kurnool': ['Kurnool', 'Nandyal', 'Adoni'],
        'Anantapur': ['Anantapur', 'Guntakal', 'Dharmavaram'],
        'Chittoor': ['Chittoor', 'Tirupati', 'Madanapalle'],
        'Visakhapatnam': ['Visakhapatnam', 'Bheemunipatnam', 'Gajuwaka']
      }
    },
    'Karnataka': {
      districts: {
        'Bengaluru Urban': ['Bengaluru North', 'Bengaluru South', 'Bengaluru East'],
        'Mysuru': ['Mysuru', 'Nanjangud', 'T-Narasipura'],
        'Dharwad': ['Hubballi', 'Dharwad', 'Kundgol']
      }
    },
    'Tamil Nadu': {
      districts: {
        'Chennai': ['Chennai North', 'Chennai South', 'Chennai Central'],
        'Coimbatore': ['Coimbatore North', 'Coimbatore South', 'Pollachi'],
        'Madurai': ['Madurai North', 'Madurai South', 'Melur']
      }
    }
  }
};

export interface FunctionHall {
  id: string;
  name: string;
  image: string;
  images: string[];
  address: string;
  googleMapsLink: string;
  capacity: number;
  costPerDay: number;
  state: string;
  district: string;
  mandal: string;
  description: string;
  facilities: string[];
}

export const sampleHalls: FunctionHall[] = [
  {
    id: 'gk-grand-convention',
    name: 'GK Grand Convention Hall',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1505232458729-26417ff63c97?auto=format&fit=crop&q=80&w=1200'
    ],
    address: 'Near NH-44 Bypass Road, Jadcherla, Telangana 509301',
    googleMapsLink: 'https://maps.google.com/?q=GK+Grand+Convention+Hall+Jadcherla',
    capacity: 1500,
    costPerDay: 150000,
    state: 'Telangana',
    district: 'Mahabubnagar',
    mandal: 'Jadcherla',
    description: 'A luxurious convention center designed for grand wedding celebrations and premium events. Offers rich visual lighting, top-tier audio equipment, and spacious halls.',
    facilities: ['AC Hall', 'Valet Parking', 'Luxury Dressing Rooms', 'In-house Catering Option', 'Sound System', 'Wi-Fi']
  },
  {
    id: 'royal-palace-function',
    name: 'Royal Palace Function Hall',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=1200'
    ],
    address: 'Kollapur Road, Nagarkurnool, Telangana 509209',
    googleMapsLink: 'https://maps.google.com/?q=Royal+Palace+Function+Hall+Nagarkurnool',
    capacity: 2000,
    costPerDay: 200000,
    state: 'Telangana',
    district: 'Nagarkurnool',
    mandal: 'Nagarkurnool',
    description: 'An elegant palace-style function hall perfect for royalty-themed weddings and massive gatherings. Features a large outdoor lawn and grand columns.',
    facilities: ['Grand Outdoor Lawn', 'CCTV Security', 'Dining Area (1000 Capacity)', 'Backup Generator', 'AC Dressing Rooms']
  },
  {
    id: 'sri-lakshmi-function',
    name: 'Sri Lakshmi Function Hall',
    image: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1505232458729-26417ff63c97?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200'
    ],
    address: 'Station Road, Wanaparthy, Telangana 509103',
    googleMapsLink: 'https://maps.google.com/?q=Sri+Lakshmi+Function+Hall+Wanaparthy',
    capacity: 800,
    costPerDay: 80000,
    state: 'Telangana',
    district: 'Wanaparthy',
    mandal: 'Wanaparthy',
    description: 'A pocket-friendly venue for birthdays, engagements, and medium-sized family celebrations. Located conveniently close to the central train station.',
    facilities: ['Parking Lot', 'AC Main Stage', 'Standard Sound System', 'Kitchen Area', 'Green Room']
  },
  {
    id: 'golden-banquet-hall',
    name: 'Golden Banquet Hall',
    image: 'https://images.unsplash.com/photo-1505232458729-26417ff63c97?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1505232458729-26417ff63c97?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200'
    ],
    address: 'Raichur Road, Gadwal, Telangana 509125',
    googleMapsLink: 'https://maps.google.com/?q=Golden+Banquet+Hall+Gadwal',
    capacity: 500,
    costPerDay: 60000,
    state: 'Telangana',
    district: 'Gadwal',
    mandal: 'Gadwal',
    description: 'An indoor banquet hall crafted for premium corporate meetups, intimate gatherings, and sangeet celebrations. Offers fine ambient lighting.',
    facilities: ['Full AC Venue', 'Premium Ambient Lights', 'Projector & AV Screen', 'Valet Parking', 'Dining Hall']
  }
];
