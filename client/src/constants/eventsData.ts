export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  category: 'primary' | 'photography' | 'food';
  description?: string;
  iconName: string;
  perPlate?: boolean;
}

export interface EventTypeConfig {
  id: string;
  displayName: string;
  breadcrumb: string;
  eventType: string;
  badge: string;
  subtitle: string;
  primarySectionTitle: string;
  primarySectionSubtitle: string;
  primarySectionIcon: 'heart' | 'gift' | 'sparkles' | 'utensils' | 'award';
  photoSectionTitle: string;
  photoSectionSubtitle: string;
  defaultSelectedIds: string[];
  primaryServices: ServiceItem[];
  photoServices: ServiceItem[];
}

export const EVENT_CONFIGS: Record<string, EventTypeConfig> = {
  marriage: {
    id: 'marriage',
    displayName: 'Marriage Function Booking',
    breadcrumb: 'Marriage Function',
    eventType: 'Marriage Function',
    badge: 'Sacred Matrimony',
    subtitle: 'Select the services you need for your wedding celebration',
    primarySectionTitle: 'Wedding Ceremony Services',
    primarySectionSubtitle: 'Traditional wedding ceremony rituals & celebrations',
    primarySectionIcon: 'heart',
    photoSectionTitle: 'Wedding Photography & Media',
    photoSectionSubtitle: 'Capture sacred rituals, candid memories & celebrations forever',
    defaultSelectedIds: ['haldi', 'sangeet', 'wedding-shoot'],
    primaryServices: [
      { id: 'haldi', name: 'Haldi Ceremony', price: 10000, category: 'primary', iconName: 'haldi', description: 'Turmeric ritual decor & setup' },
      { id: 'sangeet', name: 'Sangeet Night', price: 15000, category: 'primary', iconName: 'sangeet', description: 'Musical night & sound setup' },
      { id: 'mehndi', name: 'Mehndi Ceremony', price: 12000, category: 'primary', iconName: 'mehndi', description: 'Henna ceremony decor & artist' },
      { id: 'baraat', name: 'Baraat Procession', price: 20000, category: 'primary', iconName: 'baraat', description: 'Grand procession & welcome' },
      { id: 'reception', name: 'Grand Reception', price: 25000, category: 'primary', iconName: 'reception', description: 'Grand reception stage & entry' },
      { id: 'mandap', name: 'Mandap & Stage Decor', price: 30000, category: 'primary', iconName: 'stage', description: 'Sacred wedding mandap & floral setup' }
    ],
    photoServices: [
      { id: 'pre-wedding', name: 'Pre Wedding Shoot', price: 30000, category: 'photography', iconName: 'camera', description: 'Couples cinematic pre-wedding shoot' },
      { id: 'wedding-shoot', name: 'Wedding Day Shoot', price: 50000, category: 'photography', iconName: 'couple', description: 'Full ceremony & candid photography' },
      { id: 'photography', name: 'Traditional Photography', price: 15000, category: 'photography', iconName: 'dslr', description: 'Classic stage & family photos' }
    ]
  },

  birthday: {
    id: 'birthday',
    displayName: 'Birthday Party Booking',
    breadcrumb: 'Birthday Party',
    eventType: 'Birthday Party',
    badge: 'Joyful Milestone',
    subtitle: 'Select the services you need for the ultimate birthday celebration',
    primarySectionTitle: 'Birthday Party Services',
    primarySectionSubtitle: 'Custom themes, stage decor & entertainment activities',
    primarySectionIcon: 'gift',
    photoSectionTitle: 'Birthday Photography & Media',
    photoSectionSubtitle: 'Capture candid birthday smiles and party celebration highlights',
    defaultSelectedIds: ['bday-theme', 'bday-stage', 'bday-photo'],
    primaryServices: [
      { id: 'bday-theme', name: 'Balloon & Theme Decor', price: 10000, category: 'primary', iconName: 'balloon', description: 'Theme balloons, arch & welcome board' },
      { id: 'bday-stage', name: 'Birthday Stage & Cutout', price: 15000, category: 'primary', iconName: 'stage', description: 'Custom themed 3D backdrop & cake table' },
      { id: 'bday-magic', name: 'Magic Show & Illusion', price: 8000, category: 'primary', iconName: 'magic', description: '45-min live interactive magic show' },
      { id: 'bday-music', name: 'DJ & Sound System', price: 12000, category: 'primary', iconName: 'music', description: 'High-energy DJ, lights & sound system' },
      { id: 'bday-mascot', name: 'Cartoon Mascot & Host', price: 6000, category: 'primary', iconName: 'mascot', description: 'Favorite cartoon costume character entry' },
      { id: 'bday-games', name: 'Kids Games & Host', price: 5000, category: 'primary', iconName: 'games', description: 'Party host, fun kids games & prizes' }
    ],
    photoServices: [
      { id: 'bday-photo', name: 'Birthday Photography', price: 12000, category: 'photography', iconName: 'camera', description: 'Candid party moments & cake cutting' },
      { id: 'bday-video', name: 'Video Highlights & Reel', price: 16000, category: 'photography', iconName: 'dslr', description: 'Cinematic birthday highlights & video' },
      { id: 'bday-booth', name: 'Photo Booth & Prints', price: 10000, category: 'photography', iconName: 'booth', description: 'Fun props & instant guest printouts' }
    ]
  },

  saree: {
    id: 'saree',
    displayName: 'Saree Function Booking',
    breadcrumb: 'Saree Function',
    eventType: 'Saree Function',
    badge: 'Traditional Milestone',
    subtitle: 'Select the services you need for the traditional saree ceremony',
    primarySectionTitle: 'Saree Ceremony Services',
    primarySectionSubtitle: 'Traditional decor, ritual arrangements & stage setups',
    primarySectionIcon: 'sparkles',
    photoSectionTitle: 'Saree Ceremony Photography',
    photoSectionSubtitle: 'Preserve the beauty and traditions of her special milestone',
    defaultSelectedIds: ['saree-stage', 'saree-pooja', 'saree-photo'],
    primaryServices: [
      { id: 'saree-stage', name: 'Traditional Stage Decor', price: 20000, category: 'primary', iconName: 'stage', description: 'Grand South Indian stage & backdrop' },
      { id: 'saree-mandap', name: 'Floral Arch & Entrance', price: 15000, category: 'primary', iconName: 'floral', description: 'Fresh jasmine & marigold floral decor' },
      { id: 'saree-pooja', name: 'Pooja & Ritual Setup', price: 10000, category: 'primary', iconName: 'pooja', description: 'Sacred items, brass lamps & priests seating' },
      { id: 'saree-snanam', name: 'Mangala Snanam Setup', price: 8000, category: 'primary', iconName: 'snanam', description: 'Traditional ceremonial bath arrangement' },
      { id: 'saree-sangeet', name: 'Traditional Music', price: 12000, category: 'primary', iconName: 'sangeet', description: 'Classical instrumental or celebratory music' },
      { id: 'saree-mehndi', name: 'Mehndi & Styling', price: 10000, category: 'primary', iconName: 'mehndi', description: 'Designer mehndi & ceremony makeover styling' }
    ],
    photoServices: [
      { id: 'saree-photo', name: 'Ceremony Photoshoot', price: 18000, category: 'photography', iconName: 'camera', description: 'Traditional saree portrait session' },
      { id: 'saree-video', name: 'Cinematic Highlights', price: 22000, category: 'photography', iconName: 'couple', description: 'Emotional family rituals & highlights' },
      { id: 'saree-family', name: 'Family & Group Portraits', price: 12000, category: 'photography', iconName: 'dslr', description: 'Stage portraits with relatives & guests' }
    ]
  },

  dawath: {
    id: 'dawath',
    displayName: 'Dawath Banquet Booking',
    breadcrumb: 'Dawath',
    eventType: 'Dawath / Banquet',
    badge: 'Royal Feast',
    subtitle: 'Select the services you need for a grand royal feast & banquet',
    primarySectionTitle: 'Dawath & Banquet Services',
    primarySectionSubtitle: 'Grand feast setups, royal dastarkhwan & hospitality',
    primarySectionIcon: 'utensils',
    photoSectionTitle: 'Dawath Photography & Coverage',
    photoSectionSubtitle: 'Capture family gatherings, feasts & celebration moments',
    defaultSelectedIds: ['dawath-seating', 'dawath-stage', 'dawath-photo'],
    primaryServices: [
      { id: 'dawath-seating', name: 'Royal Dastarkhwan', price: 18000, category: 'primary', iconName: 'seating', description: 'Traditional velvet bolster & carpet seating' },
      { id: 'dawath-stage', name: 'Banquet Stage & Lights', price: 20000, category: 'primary', iconName: 'stage', description: 'Luxury dais setup with chandeliers' },
      { id: 'dawath-floral', name: 'Grand Welcome Arch', price: 12000, category: 'primary', iconName: 'floral', description: 'Floral entrance & velvet aisle walkway' },
      { id: 'dawath-buffet', name: 'Live Buffet Counters', price: 15000, category: 'primary', iconName: 'buffet', description: 'Commercial warmers, chafers & service layout' },
      { id: 'dawath-music', name: 'Soft Music & Shehnai', price: 10000, category: 'primary', iconName: 'music', description: 'Traditional ambient music & audio setup' },
      { id: 'dawath-dessert', name: 'Paan & Dessert Stall', price: 8000, category: 'primary', iconName: 'dessert', description: 'Royal paan counter & mocktail station' }
    ],
    photoServices: [
      { id: 'dawath-photo', name: 'Banquet Photography', price: 15000, category: 'photography', iconName: 'camera', description: 'Feast, dining & guest greeting photography' },
      { id: 'dawath-candid', name: 'Candid Moments & Portraits', price: 16000, category: 'photography', iconName: 'dslr', description: 'Unposed family & elder guest portraits' },
      { id: 'dawath-video', name: 'Full Event Video Coverage', price: 20000, category: 'photography', iconName: 'couple', description: 'Comprehensive event coverage & reel' }
    ]
  },

  other: {
    id: 'other',
    displayName: 'Special Event Booking',
    breadcrumb: 'Other Events',
    eventType: 'Other Events Celebration',
    badge: 'Custom Celebration',
    subtitle: 'Select the services you need for your corporate, anniversary or custom celebration',
    primarySectionTitle: 'Event Celebration Services',
    primarySectionSubtitle: 'Custom stage, AV production & celebration arrangements',
    primarySectionIcon: 'sparkles',
    photoSectionTitle: 'Event Photography & Media',
    photoSectionSubtitle: 'Professional event coverage, media documentation & highlights',
    defaultSelectedIds: ['other-stage', 'other-sound', 'other-photo'],
    primaryServices: [
      { id: 'other-stage', name: 'Stage & Podium Setup', price: 18000, category: 'primary', iconName: 'stage', description: 'Professional event stage, podium & backdrop' },
      { id: 'other-sound', name: 'Audio System & Mics', price: 12000, category: 'primary', iconName: 'music', description: 'Crisp PA system, wireless mics & mixer' },
      { id: 'other-lighting', name: 'LED Wall & Stage Lights', price: 25000, category: 'primary', iconName: 'lighting', description: 'High-res LED display wall & intelligent lights' },
      { id: 'other-floral', name: 'Thematic & Floral Decor', price: 14000, category: 'primary', iconName: 'floral', description: 'Custom occasion branding & flower setup' },
      { id: 'other-host', name: 'Professional Emcee / Host', price: 10000, category: 'primary', iconName: 'mic', description: 'Engaging host to anchor the event' },
      { id: 'other-desk', name: 'Registration Desk', price: 6000, category: 'primary', iconName: 'desk', description: 'Guest check-in counter & badge desk' }
    ],
    photoServices: [
      { id: 'other-photo', name: 'Event Photography', price: 15000, category: 'photography', iconName: 'camera', description: 'Professional photography of stage & audience' },
      { id: 'other-video', name: 'Cinematic Highlights', price: 22000, category: 'photography', iconName: 'dslr', description: 'High-definition event recap video' },
      { id: 'other-drone', name: 'Aerial Drone Coverage', price: 15000, category: 'photography', iconName: 'drone', description: '4K outdoor and venue overview footage' }
    ]
  }
};

export const getEventConfig = (type?: string): EventTypeConfig => {
  if (!type) return EVENT_CONFIGS.marriage;
  const key = type.toLowerCase().trim();
  if (EVENT_CONFIGS[key]) {
    return EVENT_CONFIGS[key];
  }
  // Common aliases
  if (key.includes('wed') || key.includes('marr')) return EVENT_CONFIGS.marriage;
  if (key.includes('birth')) return EVENT_CONFIGS.birthday;
  if (key.includes('saree') || key.includes('half')) return EVENT_CONFIGS.saree;
  if (key.includes('dawa') || key.includes('banq') || key.includes('feast')) return EVENT_CONFIGS.dawath;
  if (key.includes('oth') || key.includes('corp') || key.includes('party')) return EVENT_CONFIGS.other;
  return EVENT_CONFIGS.marriage;
};
