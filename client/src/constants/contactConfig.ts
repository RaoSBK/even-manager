export interface ContactDetails {
  phone: {
    display: string;
    value: string; // tel: URL format
  };
  whatsapp: {
    display: string;
    link: string; // wa.me link format
  };
  email: {
    display: string;
    value: string; // mailto: URL format
  };
  address: {
    display: string;
    mapsLink: string;
  };
  socials: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
  faqs: {
    id: string;
    question: string;
    answer: string;
  }[];
}

export const contactConfig: ContactDetails = {
  phone: {
    display: '+91 98896 12904',
    value: 'tel:+919889612904'
  },
  whatsapp: {
    display: '+91 98896 12904',
    link: 'https://wa.me/919889612904?text=Hi%20GK%20Booking,%20I%20have%20an%20enquiry'
  },
  email: {
    display: 'gkbooking26@gmail.com',
    value: 'mailto:gkbooking26@gmail.com'
  },
  address: {
    display: 'GK Event Management, Plot No. 12, Golden Plaza, Jubilee Hills, Road No. 36, Hyderabad, Telangana, 500033',
    mapsLink: 'https://maps.google.com/?q=GK+Event+Management+Jubilee+Hills+Hyderabad'
  },
  socials: {
    instagram: 'https://www.instagram.com/gkbooking26?igsh=MWpqa3J5MXl1NTk3cA==',
    facebook: 'https://facebook.com/gkbooking',
    youtube: 'https://youtube.com/c/gkbooking'
  },
  faqs: [
    {
      id: 'faq-1',
      question: 'How can I book a function hall?',
      answer: 'Go to the "Function Halls" page using the navigation menu. Select your State, District, and Mandal to search for available halls. Click on the hall card to view its details, then click "Proceed to Booking" to select dates and confirm your reservation.'
    },
    {
      id: 'faq-2',
      question: 'How can I contact customer care?',
      answer: 'You can instantly dial customer care at +91 98896 12904, initiate a WhatsApp chat, send an email to gkbooking26@gmail.com, or submit a message using the Contact Form on this page.'
    },
    {
      id: 'faq-3',
      question: 'How can I check my booking?',
      answer: 'Click on the "My Bookings" link in the top right navigation bar (requires login). There, you will find a full, live listing of all your booked function halls, event schedules, and payments.'
    },
    {
      id: 'faq-4',
      question: 'How can I cancel or modify a booking?',
      answer: 'Standard bookings can be modified or cancelled up to 15 days before the event. To change dates or cancel, please contact customer support directly with your Booking Reference ID.'
    }
  ]
};
