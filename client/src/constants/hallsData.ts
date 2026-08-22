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
  address: string;
  googleMapsLink: string;
  capacity: number;
  costPerDay: number;
  state: string;
  district: string;
  mandal: string;
}

export const sampleHalls: FunctionHall[] = [
  {
    id: 'gk-grand-convention',
    name: 'GK Grand Convention Hall',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200',
    address: 'Near NH-44 Bypass Road, Jadcherla, Telangana 509301',
    googleMapsLink: 'https://maps.google.com/?q=GK+Grand+Convention+Hall+Jadcherla',
    capacity: 1500,
    costPerDay: 150000,
    state: 'Telangana',
    district: 'Mahabubnagar',
    mandal: 'Jadcherla'
  },
  {
    id: 'royal-palace-function',
    name: 'Royal Palace Function Hall',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200',
    address: 'Kollapur Road, Nagarkurnool, Telangana 509209',
    googleMapsLink: 'https://maps.google.com/?q=Royal+Palace+Function+Hall+Nagarkurnool',
    capacity: 2000,
    costPerDay: 200000,
    state: 'Telangana',
    district: 'Nagarkurnool',
    mandal: 'Nagarkurnool'
  },
  {
    id: 'sri-lakshmi-function',
    name: 'Sri Lakshmi Function Hall',
    image: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=1200',
    address: 'Station Road, Wanaparthy, Telangana 509103',
    googleMapsLink: 'https://maps.google.com/?q=Sri+Lakshmi+Function+Hall+Wanaparthy',
    capacity: 800,
    costPerDay: 80000,
    state: 'Telangana',
    district: 'Wanaparthy',
    mandal: 'Wanaparthy'
  },
  {
    id: 'golden-banquet-hall',
    name: 'Golden Banquet Hall',
    image: 'https://images.unsplash.com/photo-1505232458729-26417ff63c97?auto=format&fit=crop&q=80&w=1200',
    address: 'Raichur Road, Gadwal, Telangana 509125',
    googleMapsLink: 'https://maps.google.com/?q=Golden+Banquet+Hall+Gadwal',
    capacity: 500,
    costPerDay: 60000,
    state: 'Telangana',
    district: 'Gadwal',
    mandal: 'Gadwal'
  }
];
