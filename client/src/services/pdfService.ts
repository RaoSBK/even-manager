import { jsPDF } from 'jspdf';

export interface HallBookingPDFData {
  bookingId: string;
  customerName: string;
  email: string;
  mobile: string;
  state: string;
  district: string;
  mandal: string;
  hallName: string;
  hallAddress: string;
  eventDate: string;
  bookingDate: string;
  costPerDay: number;
  totalAmount: number;
  status: string;
}

export function generateHallBookingPDF(booking: HallBookingPDFData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Colors
  const primaryColor = [26, 54, 93]; // Deep Navy Blue (#1a365d)
  const secondaryColor = [197, 160, 89]; // Antique Gold (#c5a059)
  const textColor = [55, 65, 81]; // Charcoal Gray (#374151)
  const lightBg = [249, 250, 251]; // Cool gray background (#f9fafb)
  const borderLight = [229, 231, 235]; // Light border (#e5e7eb)

  // Header Banner Background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 38, 'F');

  // Brand Accent Line
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 38, 210, 2, 'F');

  // Title Text inside Banner
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('GK EVENT MANAGEMENT', 15, 18);

  doc.setFont('Helvetica', 'oblique');
  doc.setFontSize(10);
  doc.text('Making Memories, Celebrating Moments', 15, 24);

  // Invoice Label right side
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('BOOKING RECEIPT', 195, 18, { align: 'right' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Status: CONFIRMED', 195, 24, { align: 'right' });

  // Body content starting at Y = 50
  let y = 50;

  // Booking details card header
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(15, y, 180, 24, 2, 2, 'FD');

  // Card Content
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Booking Reference ID:', 20, y + 8);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(booking.bookingId, 20, y + 16);

  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Booking Date:', 120, y + 8);
  doc.setFont('Helvetica', 'bold');
  doc.text(booking.bookingDate, 120, y + 16);

  y += 34;

  // Customer Details Block
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('CUSTOMER INFORMATION', 15, y);
  
  // Underline
  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.line(15, y + 2, 195, y + 2);
  
  y += 8;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  
  doc.text('Full Name:', 20, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(booking.customerName, 55, y);
  
  y += 6;
  doc.setFont('Helvetica', 'normal');
  doc.text('Email Address:', 20, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(booking.email, 55, y);
  
  y += 6;
  doc.setFont('Helvetica', 'normal');
  doc.text('Mobile Number:', 20, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(booking.mobile, 55, y);

  y += 14;

  // Hall details Block
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('VENUE & EVENT DETAILS', 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 8;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  doc.setFont('Helvetica', 'normal');
  doc.text('Function Hall:', 20, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(booking.hallName, 55, y);

  y += 6;
  doc.setFont('Helvetica', 'normal');
  doc.text('Address:', 20, y);
  doc.setFont('Helvetica', 'bold');
  
  const addressText = doc.splitTextToSize(booking.hallAddress, 135);
  doc.text(addressText, 55, y);
  y += (addressText.length * 5);

  doc.setFont('Helvetica', 'normal');
  doc.text('Location:', 20, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(`${booking.mandal} Mandal, ${booking.district} District, ${booking.state}`, 55, y);

  y += 8;
  doc.setFont('Helvetica', 'normal');
  doc.text('Event Date:', 20, y);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(booking.eventDate, 55, y);

  y += 16;

  // Pricing Block
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PAYMENT SUMMARY', 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 8;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  
  doc.text('Hall Rental Cost (per day):', 20, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(`INR ${booking.costPerDay.toLocaleString('en-IN')}.00`, 140, y);

  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.line(15, y + 4, 195, y + 4);

  y += 10;
  
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.text('Total Amount (Paid):', 20, y);
  doc.setFontSize(12);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`INR ${booking.totalAmount.toLocaleString('en-IN')}.00`, 140, y);

  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.line(15, y + 4, 195, y + 4);

  // Terms and conditions / Footer
  y = 250;
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.line(15, y, 195, y);

  doc.setTextColor(115, 115, 115);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Important Notice: Online booking cancellation must be made at least 15 days before the event.', 15, y + 5);
  doc.text('For assistance, contact Customer Care at +91 12345 67890 or email support@gkevents.com.', 15, y + 9);

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Thank you for booking with GK Event Management!', 105, y + 16, { align: 'center' });

  // Save the PDF
  doc.save(`GK-Booking-${booking.bookingId}.pdf`);
}
