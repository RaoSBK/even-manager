import { jsPDF } from 'jspdf';
import { contactConfig } from '../constants/contactConfig';

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
  eventType?: string;
  guestsCount?: number;
  eventSession?: string;
  foodItems?: Array<{ id: string; name: string; price: number }>;
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
  doc.text('GK BOOKING', 15, 18);

  doc.setFont('Helvetica', 'oblique');
  doc.setFontSize(10);
  doc.text('Making Memories, Celebrating Moments', 15, 24);

  // Invoice Label right side
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('BOOKING INVOICE', 140, 18);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Reference ID: #${booking.bookingId}`, 140, 24);
  doc.text(`Issued Date: ${booking.bookingDate}`, 140, 29);

  let y = 50;

  // Customer Details Block
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('CUSTOMER INFORMATION', 15, y);
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

  if (booking.eventSession) {
    y += 6;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('Helvetica', 'normal');
    doc.text('Event Session:', 20, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(booking.eventSession, 55, y);
  }

  if (booking.eventType) {
    y += 6;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('Helvetica', 'normal');
    doc.text('Event Type:', 20, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(booking.eventType, 55, y);
  }

  if (booking.guestsCount) {
    y += 6;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('Helvetica', 'normal');
    doc.text('Total Guests:', 20, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${booking.guestsCount} Guests`, 55, y);
  }

  y += 16;

  // Pricing Block
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PAYMENT DETAILS', 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 8;
  const hasFood = booking.foodItems && booking.foodItems.length > 0;
  const foodItems = booking.foodItems || [];
  const foodTotal = foodItems.reduce((s, item) => s + item.price, 0);

  // Dynamic height calculation
  const baseHeight = 20;
  const foodHeight = hasFood ? (foodItems.length * 6 + 8) : 0;
  const rectHeight = baseHeight + foodHeight;

  // Box Container for charges
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(15, y, 180, rectHeight, 'F');
  
  let drawY = y + 6;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Base Rental Charge:', 20, drawY);
  doc.setFont('Helvetica', 'bold');
  doc.text(`INR ${booking.costPerDay.toLocaleString('en-IN')}.00`, 140, drawY);

  if (hasFood) {
    foodItems.forEach((item) => {
      drawY += 6;
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`Food: ${item.name}:`, 20, drawY);
      doc.setFont('Helvetica', 'bold');
      doc.text(`INR ${item.price.toLocaleString('en-IN')}.00`, 140, drawY);
    });

    drawY += 6;
    doc.setFont('Helvetica', 'normal');
    doc.text('Food Selection Subtotal:', 20, drawY);
    doc.setFont('Helvetica', 'bold');
    doc.text(`INR ${foodTotal.toLocaleString('en-IN')}.00`, 140, drawY);
  }

  drawY += 6;
  doc.setFont('Helvetica', 'normal');
  doc.text('Taxes & GST (Inclusive):', 20, drawY);
  doc.setFont('Helvetica', 'bold');
  doc.text('INR 0.00', 140, drawY);

  drawY += 3;
  doc.line(15, drawY, 195, drawY);

  drawY += 5;
  doc.setFont('Helvetica', 'bold');
  doc.text('Total Contract Value:', 20, drawY);
  doc.text(`INR ${booking.totalAmount.toLocaleString('en-IN')}.00`, 140, drawY);

  y += (rectHeight + 12);

  // Terms and Footer
  doc.line(15, y, 195, y);
  doc.setTextColor(115, 115, 115);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Important Notice: Online booking cancellation must be made at least 15 days before the event.', 15, y + 5);
  doc.text(`For assistance, contact Customer Care at ${contactConfig.phone.display} or email ${contactConfig.email.display}.`, 15, y + 9);

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Thank you for booking with GK BOOKING!', 105, y + 16, { align: 'center' });

  // Save the PDF
  doc.save(`GK-Booking-${booking.bookingId}.pdf`);
}

export function generatePaymentReceiptPDF(paymentData: any) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Primary Colors
  const primaryColor = [26, 54, 93];
  const secondaryColor = [197, 160, 89];
  const textColor = [55, 65, 81];

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 35, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('GK BOOKING RECEIPT', 15, 18);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Receipt Reference: ${paymentData.id || paymentData.paymentNumber || 'PAY-001'}`, 140, 18);
  doc.text(`Payment Date: ${paymentData.paymentDate || paymentData.paidAt || new Date().toISOString().split('T')[0]}`, 140, 24);

  let y = 50;
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PAYMENT SUMMARY', 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 10;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  
  doc.text('Amount Paid:', 20, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(`INR ${Number(paymentData.amount || 0).toLocaleString('en-IN')}.00`, 75, y);

  y += 8;
  doc.setFont('Helvetica', 'normal');
  doc.text('Payment Method:', 20, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(String(paymentData.paymentMethod || 'ONLINE'), 75, y);

  y += 8;
  doc.setFont('Helvetica', 'normal');
  doc.text('Payment Status:', 20, y);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(34, 197, 94); // Green
  doc.text(String(paymentData.status || 'SUCCESS'), 75, y);

  if (paymentData.transactionReference || paymentData.razorpayPaymentId) {
    y += 8;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('Helvetica', 'normal');
    doc.text('Transaction Ref ID:', 20, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(String(paymentData.transactionReference || paymentData.razorpayPaymentId), 75, y);
  }

  y += 20;
  doc.setDrawColor(220, 220, 220);
  doc.line(15, y, 195, y);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Thank you for your payment to GK BOOKING!', 105, y + 10, { align: 'center' });

  doc.save(`Receipt-${paymentData.id || 'GK'}.pdf`);
}

