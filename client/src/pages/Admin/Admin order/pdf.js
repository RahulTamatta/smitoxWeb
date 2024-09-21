import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import numberToWords from 'number-to-words'; // Import the package

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateInvoicePDF = (order, stream) => {
  const doc = new PDFDocument();
  
  // Error handling for PDF generation
  doc.on('error', (err) => {
    console.error('PDF generation error:', err);
    stream.end();
  });
  
  doc.pipe(stream);

  // Add company logo (ensure the path is correct)
  const logoPath = join(__dirname, '../../../assets/images/logo.png');
  doc.image(logoPath, 50, 50, { width: 65 });

  // Add company information
  doc.fontSize(12).text('Your Company Name', 200, 50);
  doc.fontSize(10).text('123 Business Road, Business City, 12345', 200, 65);
  doc.text('Phone: (123) 456-7890', 200, 80);

  // Add invoice details
  doc.fontSize(14).text('Invoice', 50, 130);
  doc.fontSize(10).text(`Invoice Number: ${order._id}`, 50, 150);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 165);

  // Add customer information
  doc.text(`Customer: ${order.buyer.name}`, 50, 195);
  doc.text(`Email: ${order.buyer.email}`, 50, 210);

  // Add table header
  doc.fontSize(10).fillColor('black').rect(50, 240, 500, 20).fill('#CCCCCC');
  doc.fillColor('black').text('Product', 60, 245);
  doc.text('Quantity', 200, 245);
  doc.text('Unit Price', 300, 245);
  doc.text('Total', 400, 245);

  // Add table rows
  let y = 270;
  order.products.forEach((product) => {
    doc.text(product.name, 60, y);
    doc.text(product.quantity.toString(), 200, y);
    doc.text(`₹${product.price.toFixed(2)}`, 300, y);
    doc.text(`₹${(product.price * product.quantity).toFixed(2)}`, 400, y);
    y += 20;
  });

  // Add total calculations
  const subtotal = order.products.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst + Number(order.deliveryCharges || 0) + Number(order.codCharges || 0) - Number(order.discount || 0);

  y += 20;
  doc.text('Subtotal:', 300, y);
  doc.text(`₹${subtotal.toFixed(2)}`, 400, y);
  y += 20;
  doc.text('GST (18%):', 300, y);
  doc.text(`₹${gst.toFixed(2)}`, 400, y);
  y += 20;
  doc.text('Delivery Charges:', 300, y);
  doc.text(`₹${Number(order.deliveryCharges || 0).toFixed(2)}`, 400, y);
  y += 20;
  doc.text('COD Charges:', 300, y);
  doc.text(`₹${Number(order.codCharges || 0).toFixed(2)}`, 400, y);
  y += 20;
  doc.text('Discount:', 300, y);
  doc.text(`₹${Number(order.discount || 0).toFixed(2)}`, 400, y);
  y += 20;
  doc.rect(300, y, 250, 20).fill('#CCCCCC');
  doc.fillColor('black').text('Total:', 310, y + 5);
  doc.text(`₹${total.toFixed(2)}`, 400, y + 5);

  // Additional information
  y += 40;
//   doc.fontSize(10).text(`Amount in Words: ${convertNumberToWords(total)}`, 50, y);

  y += 20;
  doc.text('For Your Company Name', 50, y);
  doc.text('Authorized Signature', 50, y + 20);

  doc.end();
};

// Convert number to words
const convertNumberToWords = (num) => {
  return numberToWords.toWords(num);
};

export default generateInvoicePDF;
