import pptxgen from 'pptxgenjs';
import '../utils/polyfills';
import { ExportConfig } from '../types/export';
import { FormQuestion, ParsedForm } from '../types/form';

const THEME = {
  primary: '1E3A8A', // Deep Navy
  primaryDark: '0F172A', // Slate 900
  accent: '2563EB', // Royal Blue
  accentLight: 'DBEAFE', // Soft Blue
  textDark: '1E293B', // Slate 800
  textMuted: '64748B', // Slate 500
  textLight: 'FFFFFF', // White
  bgLight: 'F8FAFC', // Slate 50
  cardBg: 'FFFFFF', // White
  cardBorder: 'E2E8F0', // Border
  required: 'DC2626', // Red
};

/**
 * Calculates a question's height weight to decide pagination per slide.
 */
function getQuestionWeight(q: FormQuestion): number {
  let weight = 1.0;
  if (q.title.length > 80) weight += 0.5;
  if (q.description) weight += 0.4;
  if (q.options && q.options.length > 0) {
    weight += q.options.length * 0.35;
  }
  if (q.scaleInfo) weight += 0.8;
  if (q.gridInfo) weight += (q.gridInfo.rows.length + 1) * 0.4;
  return weight;
}

/**
 * Generates a Microsoft PowerPoint (.pptx) presentation as a base64 string.
 */
export async function generatePptxBase64(
  form: ParsedForm,
  config: ExportConfig
): Promise<string> {
  const isFullDetail = config.style === 'full';
  const docTitle = config.documentTitle.trim() || form.title;
  const author = config.authorName.trim() || 'FormScribe';
  const exportDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = author;
  pres.title = docTitle;
  pres.subject = `Exported Google Form: ${form.title}`;

  // ==========================================
  // 1. TITLE SLIDE
  // ==========================================
  if (config.includeCoverPage) {
    const titleSlide = pres.addSlide();
    titleSlide.background = { color: THEME.primaryDark };

    // Accent top bar
    titleSlide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.33,
      h: 0.2,
      fill: { color: THEME.accent },
    });

    // Subtitle Pill
    titleSlide.addText('GOOGLE FORMS EXPORT', {
      x: 1.0,
      y: 1.4,
      w: 4.0,
      h: 0.35,
      fontSize: 11,
      bold: true,
      color: THEME.accent,
      rectRadius: 0.05,
      isTextBox: true,
    });

    // Presentation Title
    titleSlide.addText(docTitle, {
      x: 1.0,
      y: 1.9,
      w: 11.3,
      h: 1.8,
      fontSize: 28,
      bold: true,
      color: THEME.textLight,
      valign: 'top',
      isTextBox: true,
    });

    // Form Description (if any)
    if (form.description) {
      titleSlide.addText(
        form.description.length > 200 ? form.description.slice(0, 200) + '...' : form.description,
        {
          x: 1.0,
          y: 3.8,
          w: 11.3,
          h: 1.0,
          fontSize: 13,
          italic: true,
          color: '94A3B8',
          isTextBox: true,
        }
      );
    }

    // Metadata Card
    titleSlide.addShape(pres.ShapeType.roundRect, {
      x: 1.0,
      y: 5.2,
      w: 11.33,
      h: 1.3,
      rectRadius: 0.1,
      fill: { color: '1E293B' },
      line: { color: '334155', width: 1 },
    });

    const metaItems = [
      { text: `Author: ${author}   |   Date: ${exportDate}` },
      { text: `Total Sections: ${form.totalPages}   |   Total Questions: ${form.totalQuestions} (${form.requiredQuestionsCount} required)` },
      { text: `Extracted with FormScribe (100% On-Device)` },
    ];

    titleSlide.addText(
      metaItems.map((m, idx) => ({
        text: m.text + (idx < metaItems.length - 1 ? '\n' : ''),
        options: { fontSize: 11, color: 'CBD5E1', bold: idx === 0 },
      })),
      {
        x: 1.3,
        y: 5.35,
        w: 10.7,
        h: 1.0,
        isTextBox: true,
      }
    );
  }

  // ==========================================
  // 2. FORM SECTIONS AND QUESTION SLIDES
  // ==========================================
  form.pages.forEach((page) => {
    // --- SECTION COVER SLIDE ---
    const sectionSlide = pres.addSlide();
    sectionSlide.background = { color: THEME.primary };

    // Section Pill
    sectionSlide.addText(`SECTION ${page.pageNumber} OF ${form.totalPages}`, {
      x: 1.0,
      y: 1.8,
      w: 5.0,
      h: 0.4,
      fontSize: 12,
      bold: true,
      color: THEME.accentLight,
    });

    // Section Title
    sectionSlide.addText(page.title || `Section ${page.pageNumber}`, {
      x: 1.0,
      y: 2.3,
      w: 11.3,
      h: 2.2,
      fontSize: 26,
      bold: true,
      color: THEME.textLight,
      valign: 'top',
    });

    // Section Description
    if (page.description) {
      sectionSlide.addText(
        page.description.length > 300 ? page.description.slice(0, 300) + '...' : page.description,
        {
          x: 1.0,
          y: 4.6,
          w: 11.3,
          h: 1.8,
          fontSize: 14,
          italic: true,
          color: 'E2E8F0',
          valign: 'top',
        }
      );
    }

    // --- PAGINATE QUESTIONS ACROSS SLIDES ---
    const filterableQuestions = page.questions.filter(
      (q) => q.typeCategory !== 'page_break'
    );

    if (filterableQuestions.length === 0) {
      return;
    }

    // Chunk questions intelligently
    const chunks: FormQuestion[][] = [];
    let currentChunk: FormQuestion[] = [];
    let currentWeight = 0;
    const MAX_SLIDE_WEIGHT = 3.2; // Maximum weight per slide

    for (const q of filterableQuestions) {
      const qWeight = getQuestionWeight(q);

      if (currentChunk.length > 0 && currentWeight + qWeight > MAX_SLIDE_WEIGHT) {
        chunks.push(currentChunk);
        currentChunk = [q];
        currentWeight = qWeight;
      } else {
        currentChunk.push(q);
        currentWeight += qWeight;
      }
    }
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    // Render Each Question Slide Chunk
    chunks.forEach((chunk, chunkIdx) => {
      const qSlide = pres.addSlide();
      qSlide.background = { color: THEME.bgLight };

      // Top Header Banner
      qSlide.addShape(pres.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 13.33,
        h: 0.8,
        fill: { color: THEME.primaryDark },
      });

      qSlide.addText(`${page.title || `Section ${page.pageNumber}`}  (Part ${chunkIdx + 1}/${chunks.length})`, {
        x: 0.8,
        y: 0.15,
        w: 10.0,
        h: 0.5,
        fontSize: 14,
        bold: true,
        color: THEME.textLight,
      });

      if (config.includePageNumbers) {
        qSlide.addText(`Sec ${page.pageNumber}`, {
          x: 11.5,
          y: 0.15,
          w: 1.3,
          h: 0.5,
          fontSize: 12,
          color: '94A3B8',
          align: 'right',
        });
      }

      // Render Questions on this Slide
      const slideHeightAvailable = 5.8;
      const startY = 1.1;
      const itemHeight = slideHeightAvailable / chunk.length;

      chunk.forEach((q, idxInChunk) => {
        const itemY = startY + idxInChunk * itemHeight;
        const cardH = itemHeight - 0.2;

        // Card Container Background
        qSlide.addShape(pres.ShapeType.roundRect, {
          x: 0.8,
          y: itemY,
          w: 11.73,
          h: cardH,
          rectRadius: 0.08,
          fill: { color: THEME.cardBg },
          line: { color: THEME.cardBorder, width: 1 },
        });

        // Question Title and Badges
        const titleElements: pptxgen.TextProps[] = [
          {
            text: `${q.globalIndex > 0 ? q.globalIndex + '. ' : ''}${q.title || 'Untitled Question'}`,
            options: {
              bold: true,
              fontSize: 13,
              color: THEME.textDark,
            },
          },
        ];

        if (q.required) {
          titleElements.push({
            text: ' *',
            options: { bold: true, fontSize: 13, color: THEME.required },
          });
        }

        if (isFullDetail) {
          titleElements.push({
            text: `  [${q.typeName}]`,
            options: { fontSize: 10, bold: true, color: THEME.accent },
          });
        }

        qSlide.addText(titleElements, {
          x: 1.0,
          y: itemY + 0.1,
          w: 11.3,
          h: 0.4,
          isTextBox: true,
        });

        // Content / Options / Scale inside card
        let contentY = itemY + 0.5;

        // Description / Help text
        if (isFullDetail && q.description) {
          qSlide.addText(`ℹ️ ${q.description}`, {
            x: 1.0,
            y: contentY,
            w: 11.3,
            h: 0.3,
            fontSize: 10,
            italic: true,
            color: THEME.textMuted,
          });
          contentY += 0.3;
        }

        // Choice Options
        if (q.options && q.options.length > 0) {
          const displayOpts = q.options.slice(0, 8); // Display first 8 cleanly
          const symbol = q.typeCategory === 'checkboxes' ? '☐ ' : '⚪ ';

          const optTexts: pptxgen.TextProps[] = displayOpts.map((opt) => ({
            text: `${symbol}${opt.text}${isFullDetail && opt.note ? ` (${opt.note})` : ''}\n`,
            options: { fontSize: 11, color: THEME.textDark },
          }));

          if (q.options.length > 8) {
            optTexts.push({
              text: `... and ${q.options.length - 8} more options`,
              options: { fontSize: 10, italic: true, color: THEME.textMuted },
            });
          }

          qSlide.addText(optTexts, {
            x: 1.2,
            y: contentY,
            w: 11.0,
            h: Math.max(0.4, cardH - (contentY - itemY) - 0.1),
            isTextBox: true,
            valign: 'top',
          });
        }
        // Linear scale
        else if (q.scaleInfo) {
          const min = q.scaleInfo.min || 1;
          const max = q.scaleInfo.max || 5;
          const scaleNums: string[] = [];
          for (let s = min; s <= max; s++) scaleNums.push(`( ${s} )`);

          const scaleText = scaleNums.join('   ');
          const labelText = [
            q.scaleInfo.minLabel ? `${min} = ${q.scaleInfo.minLabel}` : '',
            q.scaleInfo.maxLabel ? `${max} = ${q.scaleInfo.maxLabel}` : '',
          ]
            .filter(Boolean)
            .join('   |   ');

          qSlide.addText(
            [
              { text: scaleText + '\n', options: { bold: true, fontSize: 12, color: THEME.accent } },
              { text: labelText, options: { italic: true, fontSize: 10, color: THEME.textMuted } },
            ],
            {
              x: 1.2,
              y: contentY,
              w: 11.0,
              h: 0.6,
              isTextBox: true,
            }
          );
        }
        // Answer line placeholder
        else if (config.includeAnswerLines && (q.typeCategory === 'short_answer' || q.typeCategory === 'paragraph')) {
          qSlide.addText('____________________________________________________________________________', {
            x: 1.2,
            y: contentY + 0.1,
            w: 11.0,
            h: 0.3,
            fontSize: 11,
            color: 'CBD5E1',
          });
        }
      });
    });
  });

  // Generate Base64
  const base64Data = (await pres.write({ outputType: 'base64' })) as string;
  return base64Data;
}
