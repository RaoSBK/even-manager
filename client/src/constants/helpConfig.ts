export interface HelpFAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const helpCategories = [
  'General',
  'Account & Login',
  'Event Booking',
  'Function Hall Booking',
  'Payments & Pricing',
  'My Bookings',
  'Cancellation & Refund',
  'Contact & Support'
];

export const helpFAQs: HelpFAQ[] = [
  // General
  {
    id: 'gen-1',
    category: 'General',
<<<<<<< HEAD
    question: 'What is GK Booking?',
    answer: 'GK Booking is a premium event planning and venue booking platform. We specialize in managing and organizing marriage celebrations, birthday functions, sarees, dawaths, and general events.'
=======
    question: 'What is GK BOOKING?',
    answer: 'GK BOOKING is a premium event planning and venue booking platform. We specialize in managing and organizing marriage celebrations, birthday functions, sarees, dawaths, and general events.'
>>>>>>> fa8656813720633b236edc0d179e86f2eb7f79b7
  },
  {
    id: 'gen-2',
    category: 'General',
    question: 'What services are available?',
    answer: 'We provide function hall rentals, event stage decoration, professional photography packages, and veg/non-veg catering services for events.'
  },
  {
    id: 'gen-3',
    category: 'General',
    question: 'How do I use the website?',
    answer: 'Browse available function halls, search locations using our dropdowns, select package items, calculate dynamic prices, and place bookings online after logging in.'
  },
  // Account & Login
  {
    id: 'acc-1',
    category: 'Account & Login',
    question: 'How do I create an account?',
    answer: 'Click "Login / Signup" in the navigation bar, select "Sign Up", enter your name, email, mobile, and password. Confirm using the demo verification code 123456.'
  },
  {
    id: 'acc-2',
    category: 'Account & Login',
    question: 'How do I verify my mobile number?',
    answer: 'A verification prompt will ask for a 6-digit OTP during signup. Type the demo verification code "123456" to instantly verify your profile.'
  },
  {
    id: 'acc-3',
    category: 'Account & Login',
    question: 'I forgot my password. What should I do?',
    answer: 'On the login page, click "Forgot Password?", enter your email or mobile, and you will be routed to a password reset flow.'
  },
  {
    id: 'acc-4',
    category: 'Account & Login',
    question: 'How can I update my account information?',
    answer: 'Go to your Customer Dashboard, click on "My Profile" from the sidebar menu, and edit your profile parameters (name, avatar, address).'
  },
  // Event Booking
  {
    id: 'evt-1',
    category: 'Event Booking',
    question: 'How can I book an event?',
    answer: 'Hover over the "Services" menu or select marriage, birthday, or other functions from the homepage. Choose package services, plates count, view the total estimate, and book.'
  },
  {
    id: 'evt-2',
    category: 'Event Booking',
    question: 'Which event types are available?',
    answer: 'We cater for Marriage Functions, Birthday Parties, Saree Functions, Dawaths, and other customized celebrations.'
  },
  {
    id: 'evt-3',
    category: 'Event Booking',
    question: 'How is the event booking amount calculated?',
    answer: 'The sum of all selected items (e.g. Sangeet, Pre-wedding photography) is combined with the catering price multiplied by total guest plates, plus 5% GST.'
  },
  {
    id: 'evt-4',
    category: 'Event Booking',
    question: 'How far in advance should I book an event?',
    answer: 'Events must be booked at least 40 days in advance. Dates within 40 days are blocked from online checkout.'
  },
  {
    id: 'evt-5',
    category: 'Event Booking',
    question: 'Where can I find my event booking details?',
    answer: 'Navigate to "My Bookings" in your dashboard center to view active contract summaries, paid fees, and booking details.'
  },
  // Function Hall Booking
  {
    id: 'hal-1',
    category: 'Function Hall Booking',
    question: 'How can I book a function hall?',
    answer: 'Select "Function Halls" from navigation. Input the state, district, and mandal. Select a hall, click "View Details", enter your event date, and place a booking request.'
  },
  {
    id: 'hal-2',
    category: 'Function Hall Booking',
    question: 'How do I select a state, district and mandal?',
    answer: 'Choose a State (e.g., Telangana) to enable the District dropdown. Selecting a District will filter and activate valid Mandals.'
  },
  {
    id: 'hal-3',
    category: 'Function Hall Booking',
    question: 'How can I view hall details?',
    answer: 'Click the "View Details & Book" button on the hall card to view capacity, address, state/district/mandal specifications, and Google Maps location.'
  },
  {
    id: 'hal-4',
    category: 'Function Hall Booking',
    question: 'What is the minimum advance booking period?',
    answer: 'Function halls must be booked at least 30 days before the event. Checkout is disabled if the event falls within 30 days.'
  },
  {
    id: 'hal-5',
    category: 'Function Hall Booking',
    question: 'Where can I find my hall booking?',
    answer: 'Confirmations are permanently saved in our SQLite DB. You can view all your orders on the dashboard "My Bookings" page.'
  },
  {
    id: 'hal-6',
    category: 'Function Hall Booking',
    question: 'Can I download my hall booking PDF?',
    answer: 'Yes! After booking, a success modal offers a download option, and you can also trigger downloaded colored invoice PDFs directly from "My Bookings".'
  },
  // My Bookings
  {
    id: 'myb-1',
    category: 'My Bookings',
    question: 'Where can I view my bookings?',
    answer: 'Navigate to the top right header menu and click "My Bookings" or access it directly inside your user dashboard portal.'
  },
  {
    id: 'myb-2',
    category: 'My Bookings',
    question: 'How can I download my booking PDF?',
    answer: 'Open the "My Bookings" page and click "Download Receipt PDF" on the bottom right of the corresponding booking card.'
  },
  {
    id: 'myb-3',
    category: 'My Bookings',
    question: 'How can I check my booking status?',
    answer: 'Status indicators (e.g. Confirmed, Pending, Partially Paid) are updated in real time and displayed on your booking details cards.'
  },
  {
    id: 'myb-4',
    category: 'My Bookings',
    question: 'What should I do if my booking details are incorrect?',
    answer: 'Please contact customer support immediately with your Booking ID to request updates or manual corrections.'
  },
  // Cancellation & Refund
  {
    id: 'can-1',
    category: 'Cancellation & Refund',
    question: 'Can I cancel my booking?',
    answer: 'Yes, cancellations are permitted. For standard function halls and marriage events, requests should be made at least 15 days before the event.'
  },
  {
    id: 'can-2',
    category: 'Cancellation & Refund',
    question: 'How do I request a cancellation?',
    answer: 'We do not support self-cancellation online yet. Please dial customer care or send an email with your Booking ID to request cancellation.'
  },
  {
    id: 'can-3',
    category: 'Cancellation & Refund',
    question: 'How does the refund process work?',
    answer: 'Once approved, refunds are processed back to your original payment channel. Please connect with customer care to verify the refund timeline.'
  },
  {
    id: 'can-4',
    category: 'Cancellation & Refund',
    question: 'What should I do if I have a problem with my booking?',
    answer: 'If you encounter any booking errors, contact customer support or file an query ticket via the Support Request form.'
  }
];
