"use client";

/**
 * PDF Generation Controller
 * Handles IO operations for PDF creation (file system, image loading)
 */

import type { PracticeText } from '../controller';
import {
  generatePdfFilename,
  drawPdfHeader,
  drawPdfFooter,
  type PdfTextData,
} from '../procedure/pdf-generator';

/**
 * Load logo image and convert to data URL
 */
async function loadLogoAsDataUrl(): Promise<string | undefined> {
  try {
    const response = await fetch('/logos/notelab-input.png');
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to load logo:");
    return undefined;
  }
}

/**
 * Generate and download beautiful PDF from practice text
 */
export async function generatePracticeTextPdf(text: PracticeText): Promise<void> {
  try {
    // Dynamic import to reduce bundle size
    const jsPDF = (await import('jspdf')).default;

    // Load logo
    const logoDataUrl = await loadLogoAsDataUrl();

    // Initialize PDF
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    const bottomMargin = 25;

    // Prepare data
    const pdfData: PdfTextData = {
      title: text.title,
      topic: text.topic,
      content: text.content,
      createdAt: text.createdAt,
    };

    const topics = pdfData.topic.split(", ");
    let yPosition = 0;

    // Draw header on first page
    yPosition = drawPdfHeader(doc, pageWidth, pdfData.title, topics, pdfData.createdAt);

    // Simple approach: split text into lines and add them one by one
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 39, 56);

    const allLines = doc.splitTextToSize(pdfData.content, contentWidth);
    const lineHeight = 6;

    allLines.forEach((line: string) => {
      // Check if we need a new page
      if (yPosition + lineHeight > pageHeight - bottomMargin) {
        doc.addPage();
        yPosition = margin;
      }

      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    // Add footers to all pages
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawPdfFooter(doc, pageWidth, pageHeight, i, totalPages, logoDataUrl);
    }

    // Save PDF
    const fileName = generatePdfFilename(pdfData.title);
    doc.save(fileName);
  } catch (error) {
    console.error("Failed to generate PDF:");
    throw new Error('Failed to generate PDF. Please try again.');
  }
}
