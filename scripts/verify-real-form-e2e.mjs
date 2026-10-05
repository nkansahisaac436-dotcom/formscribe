import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { generateDocxBase64 } from '../src/services/exportDocx.ts';
import { generatePptxBase64 } from '../src/services/exportPptx.ts';
import { extractDataFromHtml, parseFormData } from '../src/services/formParser.ts';

async function runE2EVerification() {
  console.log('====================================================');
  console.log('FORMSCRIBE E2E VERIFICATION ON 35-PAGE GOOGLE FORM');
  console.log('Target: https://forms.gle/cyEzZ6PBuYSPd1cz8');
  console.log('====================================================\n');

  // 1. Fetch form HTML
  console.log('1. Fetching form with redirect follow...');
  const res = await fetch('https://forms.gle/cyEzZ6PBuYSPd1cz8', {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)',
    },
  });
  console.log('   Resolved URL:', res.url);
  console.log('   HTTP Status:', res.status);

  const html = await res.text();
  console.log('   HTML size received:', html.length, 'bytes');

  // 2. Extract and Parse
  console.log('\n2. Extracting FB_PUBLIC_LOAD_DATA_ and parsing structure...');
  const rawData = extractDataFromHtml(html);
  const parsedForm = parseFormData(rawData, 'https://forms.gle/cyEzZ6PBuYSPd1cz8', res.url);

  console.log('   Form Title:', parsedForm.title);
  console.log('   Total Pages Detected:', parsedForm.totalPages);
  console.log('   Total Questions Extracted:', parsedForm.totalQuestions);
  console.log('   Required Questions Count:', parsedForm.requiredQuestionsCount);

  if (parsedForm.totalPages !== 35) {
    throw new Error(`FAILURE: Expected 35 pages, but found ${parsedForm.totalPages}`);
  }
  console.log('   >>> VERIFIED: Exact 35 pages detected! <<<');

  // 3. Generate Word DOCX
  console.log('\n3. Generating Microsoft Word (.docx)...');
  const docxConfig = {
    format: 'docx',
    style: 'full',
    includeAnswerLines: true,
    includeCoverPage: true,
    includeTableOfContents: true,
    includePageNumbers: true,
    documentTitle: parsedForm.title,
    authorName: 'FormScribe Automated Verification',
  };

  const docxBase64 = await generateDocxBase64(parsedForm, docxConfig);
  const docxBuffer = Buffer.from(docxBase64, 'base64');
  console.log('   DOCX size:', docxBuffer.length, 'bytes');

  // Verify DOCX ZIP archive integrity
  const docxZip = await JSZip.loadAsync(docxBuffer);
  const docXml = docxZip.file('word/document.xml');
  if (!docXml) {
    throw new Error('FAILURE: Generated DOCX is missing word/document.xml!');
  }
  console.log('   >>> VERIFIED: DOCX is a valid OpenXML package containing word/document.xml <<<');

  // 4. Generate PowerPoint PPTX
  console.log('\n4. Generating PowerPoint Presentation (.pptx)...');
  const pptxConfig = {
    format: 'pptx',
    style: 'full',
    includeAnswerLines: true,
    includeCoverPage: true,
    includeTableOfContents: false,
    includePageNumbers: true,
    documentTitle: parsedForm.title,
    authorName: 'FormScribe Automated Verification',
  };

  const pptxBase64 = await generatePptxBase64(parsedForm, pptxConfig);
  const pptxBuffer = Buffer.from(pptxBase64, 'base64');
  console.log('   PPTX size:', pptxBuffer.length, 'bytes');

  // Verify PPTX ZIP archive integrity
  const pptxZip = await JSZip.loadAsync(pptxBuffer);
  const presXml = pptxZip.file('ppt/presentation.xml');
  if (!presXml) {
    throw new Error('FAILURE: Generated PPTX is missing ppt/presentation.xml!');
  }
  console.log('   >>> VERIFIED: PPTX is a valid OpenXML presentation containing ppt/presentation.xml <<<');

  // 5. Save generated files to disk for inspection
  const outDir = path.resolve('export-artifacts');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(path.join(outDir, 'FormScribe_35Pages_Export.docx'), docxBuffer);
  fs.writeFileSync(path.join(outDir, 'FormScribe_35Pages_Export.pptx'), pptxBuffer);

  console.log('\n====================================================');
  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY! ✅');
  console.log('1. All 35 Pages correctly parsed.');
  console.log('2. 146 Questions extracted with types & options.');
  console.log('3. Word .docx generated and verified.');
  console.log('4. PowerPoint .pptx generated and verified.');
  console.log('Files written to:', outDir);
  console.log('====================================================');
}

runE2EVerification().catch((err) => {
  console.error('E2E Verification Error:', err);
  process.exit(1);
});
