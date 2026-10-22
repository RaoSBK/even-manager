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
        'Mahabubnagar': ['Mahabubnagar', 'Jadcherla', 'Devarkadra', 'Nawabpet', 'Balanagar', 'Bhoothpur', 'Hanwada', 'Koilkonda'],
        'Nagarkurnool': ['Nagarkurnool', 'Bijinapally', 'Telkapally', 'Kalwakurthy', 'Kollapur', 'Achampet', 'Amrabad', 'Thimmajipet'],
        'Wanaparthy': ['Wanaparthy', 'Gopalpeta', 'Pebbair', 'Kothakota', 'Pangal', 'Revally', 'Amarchinta', 'Chinnambavi'],
        'Jogulamba Gadwal': ['Gadwal', 'Maldakal', 'Dharur', 'Alampur', 'Ieeja', 'Gattu', 'Manopad', 'Waddepally', 'Rajoli'],
        'Gadwal': ['Gadwal', 'Maldakal', 'Dharur', 'Alampur', 'Ieeja', 'Gattu', 'Manopad'],
        'Narayanpet': ['Narayanpet', 'Damaragidda', 'Kosgi', 'Utkoor', 'Makthal', 'Maddur', 'Krishna'],
        'Hyderabad': ['Khairatabad', 'Gachibowli', 'Ameerpet', 'Secunderabad', 'Charminar', 'Banjara Hills', 'Jubilee Hills', 'Begumpet', 'Himayatnagar', 'Musheerabad'],
        'Rangareddy': ['Gachibowli', 'Madhapur', 'Kondapur', 'Sherilingampally', 'Shamshabad', 'Rajendranagar', 'Ibrahimpatnam', 'Maheshwaram', 'Chevella', 'Shadnagar'],
        'Medchal-Malkajgiri': ['Malkajgiri', 'Medchal', 'Kukatpally', 'Quthbullapur', 'Alwal', 'Uppal', 'Ghatkesar', 'Kapra'],
        'Sangareddy': ['Sangareddy', 'Patancheru', 'Zaheerabad', 'Ameenpur', 'Ramachandrapuram'],
        'Nalgonda': ['Nalgonda', 'Miryalaguda', 'Devarakonda', 'Nakrekal', 'Huzurnagar'],
        'Khammam': ['Khammam Urban', 'Khammam Rural', 'Kothagudem', 'Sathupally', 'Madhira'],
        'Karimnagar': ['Karimnagar', 'Huzurabad', 'Choppadandi', 'Manakondur', 'Jammikunta'],
        'Warangal': ['Warangal', 'Hanamkonda', 'Kazipet', 'Narsampet', 'Parkal'],
        'Nizamabad': ['Nizamabad North', 'Nizamabad South', 'Armoor', 'Bodhan', 'Banswada']
      }
    },
    'Andhra Pradesh': {
      districts: {
        'Kurnool': ['Kurnool', 'Nandyal', 'Adoni', 'Yemmiganur', 'Dhone', 'Kodumur'],
        'Anantapur': ['Anantapur', 'Guntakal', 'Dharmavaram', 'Hindupur', 'Kadiri', 'Tadipatri'],
        'Chittoor': ['Chittoor', 'Tirupati', 'Madanapalle', 'Chandragiri', 'Palamaner', 'Nagari'],
        'Tirupati': ['Tirupati Urban', 'Tirupati Rural', 'Chandragiri', 'Srikalahasti', 'Venkatagiri'],
        'Visakhapatnam': ['Visakhapatnam', 'Bheemunipatnam', 'Gajuwaka', 'Anakapalle', 'Pendurthi'],
        'NTR / Vijayawada': ['Vijayawada Urban', 'Vijayawada Rural', 'Mylavaram', 'Tiruvuru', 'Jaggayyapeta'],
        'Guntur': ['Guntur', 'Tenali', 'Mangalagiri', 'Narasaraopet', 'Ponnur'],
        'Nellore': ['Nellore', 'Kavali', 'Gudur', 'Atmakur'],
        'YSR Kadapa': ['Kadapa', 'Proddatur', 'Pulivendula', 'Jammalamadugu']
      }
    },
    'Karnataka': {
      districts: {
        'Bengaluru Urban': ['Bengaluru North', 'Bengaluru South', 'Bengaluru East', 'Whitefield', 'Electronic City'],
        'Mysuru': ['Mysuru', 'Nanjangud', 'T-Narasipura', 'Hunsur'],
        'Dharwad': ['Hubballi', 'Dharwad', 'Kundgol', 'Navalgund']
      }
    },
    'Tamil Nadu': {
      districts: {
        'Chennai': ['Chennai North', 'Chennai South', 'Chennai Central', 'Adyar', 'T. Nagar', 'Anna Nagar'],
        'Coimbatore': ['Coimbatore North', 'Coimbatore South', 'Pollachi', 'Mettupalayam'],
        'Madurai': ['Madurai North', 'Madurai South', 'Melur', 'Thiruparankundram']
      }
    },
    'Maharashtra': {
      districts: {
        'Mumbai': ['South Mumbai', 'Bandra', 'Andheri', 'Borivali', 'Kurla'],
        'Pune': ['Shivajinagar', 'Kothrud', 'Hinjewadi', 'Viman Nagar', 'Hadapsar']
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

export const sampleHalls: FunctionHall[] = [];

export const ALL_STATES = Object.keys(locationsData.states);

export const getDistrictsForState = (stateName: string): string[] => {
  if (!stateName || !locationsData.states[stateName]) return [];
  return Object.keys(locationsData.states[stateName].districts);
};

export const getMandalsForDistrict = (stateName: string, districtName: string): string[] => {
  if (!stateName || !districtName || !locationsData.states[stateName]?.districts[districtName]) return [];
  return locationsData.states[stateName].districts[districtName] || [];
};

