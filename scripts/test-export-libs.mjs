import { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, PageBreak, Header, Footer, PageNumber, NumberFormat } from 'docx';
import pptxgen from 'pptxgenjs';
import fs from 'fs';

console.log('Testing docx and pptxgenjs imports:');
console.log('docx Document:', typeof Document);
console.log('pptxgen:', typeof pptxgen);
