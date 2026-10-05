import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, PageBreak, Header, Footer, PageNumber } from 'docx';
import pptxgen from 'pptxgenjs';
import fs from 'fs';

async function testExport() {
  console.log('Testing docx generation...');
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'FormScribe Test Document',
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'This is a sample exported question.',
                bold: true,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const docxBase64 = await Packer.toBase64String(doc);
  console.log('DOCX base64 length:', docxBase64.length);

  console.log('Testing pptx generation...');
  const pres = new pptxgen();
  const slide = pres.addSlide();
  slide.addText('FormScribe Test Presentation', {
    x: 1,
    y: 1,
    w: 8,
    h: 1,
    fontSize: 24,
    bold: true,
    color: '1E293B',
  });
  slide.addText('1. Question Sample\n• Option A\n• Option B', {
    x: 1,
    y: 2.5,
    w: 8,
    h: 3,
    fontSize: 16,
    color: '334155',
  });

  const pptxBase64 = await pres.write({ outputType: 'base64' });
  console.log('PPTX base64 length:', pptxBase64.length);

  console.log('Both docx and pptx base64 generation succeeded!');
}

testExport().catch(console.error);
