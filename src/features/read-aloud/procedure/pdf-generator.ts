/**
 * PDF Generation Procedure
 * Pure business logic for creating beautiful PDFs from practice texts
 * No side effects - just transforms data into PDF format
 */

import type { jsPDF } from 'jspdf';

export interface PdfTextData {
  title: string;
  topic: string;
  content: string;
  createdAt: Date;
}

export interface PdfColors {
  violet: { r: number; g: number; b: number };
  violetLight: { r: number; g: number; b: number };
  yellow: { r: number; g: number; b: number };
  yellowLight: { r: number; g: number; b: number };
  stone: { r: number; g: number; b: number };
  stoneLight: { r: number; g: number; b: number };
  stoneDark: { r: number; g: number; b: number };
}

export const PDF_COLORS: PdfColors = {
  violet: { r: 139, g: 92, b: 246 },      // #8B5CF6
  violetLight: { r: 196, g: 181, b: 253 }, // #C4B5FD
  yellow: { r: 250, g: 204, b: 21 },      // #FACC15
  yellowLight: { r: 254, g: 249, b: 195 }, // #FEF9C3
  stone: { r: 120, g: 113, b: 108 },      // #78716C
  stoneLight: { r: 231, g: 229, b: 228 }, // #E7E5E4
  stoneDark: { r: 44, g: 39, b: 56 },     // #2C2738
};

export const PDF_LAYOUT = {
  margin: 25,
  contentPadding: 15,
  headerHeight: 60,
  footerHeight: 25,
  lineHeight: 1.8,
  paragraphSpacing: 8,
  chunkSpacing: 12,
};

/**
 * Split content into readable chunks (Notion-style)
 * Separates by double line breaks and ensures proper spacing
 */
export function splitContentIntoChunks(content: string): string[] {
  // Split by double line breaks (paragraphs)
  const chunks = content
    .split(/\n\n+/)
    .map(chunk => chunk.trim())
    .filter(chunk => chunk.length > 0);
  
  return chunks;
}

/**
 * Calculate available content height per page
 */
export function getContentHeight(pageHeight: number): number {
  return pageHeight - PDF_LAYOUT.headerHeight - PDF_LAYOUT.footerHeight - (PDF_LAYOUT.margin * 2);
}

/**
 * Format date for PDF display
 */
export function formatPdfDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Generate clean filename from title
 */
export function generatePdfFilename(title: string): string {
  return `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
}

/**
 * Draw decorative header on PDF page
 */
export function drawPdfHeader(
  doc: jsPDF,
  pageWidth: number,
  title: string,
  topics: string[],
  date: Date
): number {
  const colors = PDF_COLORS;
  const margin = PDF_LAYOUT.margin;
  let yPosition = 0;

  // Decorative top bar (violet gradient effect)
  doc.setFillColor(colors.violet.r, colors.violet.g, colors.violet.b);
  doc.rect(0, 0, pageWidth, 8, 'F');
  
  doc.setFillColor(colors.violetLight.r, colors.violetLight.g, colors.violetLight.b);
  doc.rect(0, 8, pageWidth, 2, 'F');

  yPosition = margin;

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.stoneDark.r, colors.stoneDark.g, colors.stoneDark.b);
  const titleLines = doc.splitTextToSize(title, pageWidth - (margin * 2));
  doc.text(titleLines, margin, yPosition);
  yPosition += (titleLines.length * 8) + 6;

  // Topics badges
  let xOffset = margin;
  topics.forEach((topic, index) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const topicWidth = doc.getTextWidth(topic.toUpperCase());
    const badgeWidth = topicWidth + 6;
    const badgeHeight = 5;

    // Alternate colors: violet and yellow
    if (index % 2 === 0) {
      doc.setFillColor(colors.violetLight.r, colors.violetLight.g, colors.violetLight.b);
      doc.setTextColor(colors.violet.r, colors.violet.g, colors.violet.b);
    } else {
      doc.setFillColor(colors.yellowLight.r, colors.yellowLight.g, colors.yellowLight.b);
      doc.setTextColor(161, 98, 7); // yellow-800
    }

    // Draw rounded rectangle (badge)
    doc.roundedRect(xOffset, yPosition - 3.5, badgeWidth, badgeHeight, 1.5, 1.5, 'F');
    doc.text(topic.toUpperCase(), xOffset + 3, yPosition);
    
    xOffset += badgeWidth + 3;
  });

  yPosition += 8;

  // Date
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.stone.r, colors.stone.g, colors.stone.b);
  doc.text(`Created: ${formatPdfDate(date)}`, margin, yPosition);
  yPosition += 6;

  // Decorative divider line
  doc.setDrawColor(colors.stoneLight.r, colors.stoneLight.g, colors.stoneLight.b);
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += PDF_LAYOUT.contentPadding;

  return yPosition;
}

/**
 * Draw footer with logo and page numbers
 */
export function drawPdfFooter(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  pageNumber: number,
  totalPages: number,
  logoDataUrl?: string
): void {
  const colors = PDF_COLORS;
  const margin = 20;
  const footerY = pageHeight - 15;

  // Decorative line
  doc.setDrawColor(colors.violetLight.r, colors.violetLight.g, colors.violetLight.b);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  // Small logo (if provided)
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', margin, footerY + 2, 4, 4);
    } catch (error) {
      console.error("Failed to add logo to PDF:");
    }
  }

  // Branding text
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(colors.stone.r, colors.stone.g, colors.stone.b);
  doc.text('Generated with AI', pageWidth / 2, footerY + 5, { align: 'center' });

  // Page numbers
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`${pageNumber} / ${totalPages}`, pageWidth - margin, footerY + 5, { align: 'right' });
}

/**
 * Calculate height needed for a chunk of text
 */
export function calculateChunkHeight(
  doc: jsPDF,
  chunk: string,
  maxWidth: number
): number {
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(chunk, maxWidth);
  const lineHeight = 6;
  return lines.length * lineHeight;
}

/**
 * Draw content chunk with Notion-style formatting
 */
export function drawContentChunk(
  doc: jsPDF,
  chunk: string,
  xPosition: number,
  yPosition: number,
  maxWidth: number
): number {
  const colors = PDF_COLORS;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.stoneDark.r, colors.stoneDark.g, colors.stoneDark.b);
  
  const lines = doc.splitTextToSize(chunk, maxWidth);
  const lineHeight = 6;
  
  doc.text(lines, xPosition, yPosition);
  
  return lines.length * lineHeight;
}
