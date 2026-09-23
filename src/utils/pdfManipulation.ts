import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

/**
 * Merge multiple PDF files into one in-memory PDF Document
 */
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Split or extract pages from a PDF file based on page numbers/ranges (e.g. "1-3, 5, 8")
 */
export async function splitPDF(file: File, pageRangesStr: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);
  const totalPages = srcPdf.getPageCount();

  const targetIndices = new Set<number>();
  const parts = pageRangesStr.split(',').map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map((n) => parseInt(n.trim(), 10));
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalPages, Math.max(start, end));
        for (let i = min; i <= max; i++) {
          targetIndices.add(i - 1);
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        targetIndices.add(pageNum - 1);
      }
    }
  }

  // If nothing matched, take all pages
  const indicesArray = targetIndices.size > 0
    ? Array.from(targetIndices).sort((a, b) => a - b)
    : srcPdf.getPageIndices();

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(srcPdf, indicesArray);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

/**
 * Convert images (JPG, PNG) into a single multipage or single page PDF document
 */
export async function imagesToPDF(files: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

    let image;
    if (isPng) {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else {
      image = await pdfDoc.embedJpg(arrayBuffer);
    }

    const { width, height } = image.scale(1);
    // Standard A4 dimensions or image-fitted
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  return await pdfDoc.save();
}

/**
 * Rotate all or selected pages of a PDF by 90, 180, or 270 degrees
 */
export async function rotatePDF(file: File, rotDegrees: 90 | 180 | 270): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + rotDegrees) % 360));
  }

  return await pdfDoc.save();
}

/**
 * Add a diagonal or horizontal text watermark across all pages
 */
export async function watermarkPDF(file: File, text: string, opacity = 0.25): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) / 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      size: fontSize,
      font,
      color: rgb(0.7, 0.1, 0.1),
      opacity,
      rotate: degrees(45),
    });
  }

  return await pdfDoc.save();
}

/**
 * Helper to trigger browser download of generated PDF Uint8Array
 */
export function downloadPdfBlob(data: Uint8Array, filename: string) {
  const blob = new Blob([data as any], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
