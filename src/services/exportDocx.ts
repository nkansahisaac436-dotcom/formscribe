import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import '../utils/polyfills';
import { ExportConfig } from '../types/export';
import { FormPage, FormQuestion, ParsedForm } from '../types/form';

const BRAND_PRIMARY = '1E3A8A'; // Deep Navy
const BRAND_SECONDARY = '2563EB'; // Royal Blue
const COLOR_TEXT_DARK = '1E293B'; // Slate 800
const COLOR_TEXT_MUTED = '64748B'; // Slate 500
const COLOR_REQUIRED = 'DC2626'; // Red 600
const COLOR_BORDER = 'E2E8F0'; // Light Slate border
const COLOR_BG_LIGHT = 'F8FAFC'; // Light surface

/**
 * Generates a Microsoft Word (.docx) document as base64 string.
 */
export async function generateDocxBase64(
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

  const children: (Paragraph | Table)[] = [];

  // ==========================================
  // 1. COVER PAGE (Optional)
  // ==========================================
  if (config.includeCoverPage) {
    children.push(
      new Paragraph({
        spacing: { before: 1800, after: 300 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: docTitle,
            bold: true,
            size: 48, // 24pt
            color: BRAND_PRIMARY,
            font: 'Calibri',
          }),
        ],
      })
    );

    if (form.description) {
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 600 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: form.description.length > 300 ? form.description.slice(0, 300) + '...' : form.description,
              italics: true,
              size: 24, // 12pt
              color: COLOR_TEXT_MUTED,
              font: 'Calibri',
            }),
          ],
        })
      );
    }

    // Decorative Metadata Card Table
    const metaTable = new Table({
      width: { size: 85, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
              margins: { top: 300, bottom: 300, left: 300, right: 300 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 8, color: BRAND_SECONDARY },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
                left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
                right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              },
              children: [
                new Paragraph({
                  spacing: { after: 120 },
                  children: [
                    new TextRun({ text: 'Author / Extractor: ', bold: true, size: 20, color: COLOR_TEXT_DARK }),
                    new TextRun({ text: author, size: 20, color: COLOR_TEXT_MUTED }),
                  ],
                }),
                new Paragraph({
                  spacing: { after: 120 },
                  children: [
                    new TextRun({ text: 'Export Date: ', bold: true, size: 20, color: COLOR_TEXT_DARK }),
                    new TextRun({ text: exportDate, size: 20, color: COLOR_TEXT_MUTED }),
                  ],
                }),
                new Paragraph({
                  spacing: { after: 120 },
                  children: [
                    new TextRun({ text: 'Total Sections / Pages: ', bold: true, size: 20, color: COLOR_TEXT_DARK }),
                    new TextRun({ text: `${form.totalPages}`, size: 20, color: COLOR_TEXT_MUTED }),
                  ],
                }),
                new Paragraph({
                  spacing: { after: 120 },
                  children: [
                    new TextRun({ text: 'Total Questions: ', bold: true, size: 20, color: COLOR_TEXT_DARK }),
                    new TextRun({ text: `${form.totalQuestions} (${form.requiredQuestionsCount} required)`, size: 20, color: COLOR_TEXT_MUTED }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Document Style: ', bold: true, size: 20, color: COLOR_TEXT_DARK }),
                    new TextRun({ text: isFullDetail ? 'Full Detail (Worksheet)' : 'Simple Question List', size: 20, color: COLOR_TEXT_MUTED }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    children.push(metaTable);

    // Page Break after Cover Page
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // ==========================================
  // 2. TABLE OF CONTENTS / OUTLINE (Optional)
  // ==========================================
  if (config.includeTableOfContents && form.totalPages > 1) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: 'Section Outline',
            bold: true,
            size: 32,
            color: BRAND_PRIMARY,
            font: 'Calibri',
          }),
        ],
      })
    );

    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `This document contains ${form.totalPages} sections and ${form.totalQuestions} extracted items.`,
            size: 20,
            color: COLOR_TEXT_MUTED,
          }),
        ],
      })
    );

    form.pages.forEach((page, idx) => {
      const qCount = page.questions.filter(
        (q) => q.typeCategory !== 'section_header' && q.typeCategory !== 'page_break'
      ).length;

      children.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          children: [
            new TextRun({
              text: `Section ${idx + 1}: `,
              bold: true,
              size: 22,
              color: BRAND_SECONDARY,
            }),
            new TextRun({
              text: page.title || `Page ${idx + 1}`,
              bold: true,
              size: 22,
              color: COLOR_TEXT_DARK,
            }),
            new TextRun({
              text: `  (${qCount} questions)`,
              italics: true,
              size: 18,
              color: COLOR_TEXT_MUTED,
            }),
          ],
        })
      );
    });

    // Break after TOC
    children.push(
      new Paragraph({
        spacing: { before: 300 },
        children: [new PageBreak()],
      })
    );
  }

  // ==========================================
  // 3. SECTIONS & QUESTIONS CONTENT
  // ==========================================
  form.pages.forEach((page, pageIdx) => {
    // Section Header / Page Title
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: pageIdx === 0 && !config.includeCoverPage && !config.includeTableOfContents ? 100 : 400, after: 150 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 12, color: BRAND_PRIMARY },
        },
        children: [
          new TextRun({
            text: `Page ${page.pageNumber}: ${page.title || `Section ${page.pageNumber}`}`,
            bold: true,
            size: 28, // 14pt
            color: BRAND_PRIMARY,
            font: 'Calibri',
          }),
        ],
      })
    );

    // Section Description
    if (page.description) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 250 },
          children: [
            new TextRun({
              text: page.description,
              italics: true,
              size: 20,
              color: COLOR_TEXT_MUTED,
              font: 'Calibri',
            }),
          ],
        })
      );
    }

    // Questions in this page
    page.questions.forEach((q) => {
      // Handle Section Header blocks (type 6) differently
      if (q.typeCategory === 'section_header') {
        children.push(
          new Paragraph({
            spacing: { before: 250, after: 100 },
            shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
            children: [
              new TextRun({
                text: `📌 ${q.title}`,
                bold: true,
                size: 24,
                color: BRAND_SECONDARY,
              }),
            ],
          })
        );
        if (q.description) {
          children.push(
            new Paragraph({
              spacing: { after: 180 },
              children: [
                new TextRun({
                  text: q.description,
                  italics: true,
                  size: 20,
                  color: COLOR_TEXT_MUTED,
                }),
              ],
            })
          );
        }
        return;
      }

      // Normal Question Render
      renderQuestionInDocx(children, q, isFullDetail, config.includeAnswerLines);
    });

    // If not the last page, add spacing
    if (pageIdx < form.pages.length - 1) {
      children.push(
        new Paragraph({
          spacing: { before: 300, after: 200 },
          children: [
            new TextRun({
              text: '—'.repeat(40),
              color: COLOR_BORDER,
              size: 16,
            }),
          ],
        })
      );
    }
  });

  // ==========================================
  // 4. HEADER & FOOTER CONFIGURATION
  // ==========================================
  const headers: { default?: Header } = {};
  const footers: { default?: Footer } = {};

  if (config.includePageNumbers) {
    footers.default = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: `${docTitle} | Page `,
              size: 18,
              color: COLOR_TEXT_MUTED,
            }),
            new TextRun({
              children: [PageNumber.CURRENT],
              size: 18,
              color: COLOR_TEXT_MUTED,
            }),
            new TextRun({
              text: ' of ',
              size: 18,
              color: COLOR_TEXT_MUTED,
            }),
            new TextRun({
              children: [PageNumber.TOTAL_PAGES],
              size: 18,
              color: COLOR_TEXT_MUTED,
            }),
          ],
        }),
      ],
    });
  }

  // Create docx Document
  const doc = new Document({
    title: docTitle,
    creator: author,
    description: `Exported from Google Forms with FormScribe`,
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22, // 11pt
            color: COLOR_TEXT_DARK,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers,
        footers,
        children,
      },
    ],
  });

  return await Packer.toBase64String(doc);
}

/**
 * Helper to render individual question block in Docx.
 */
function renderQuestionInDocx(
  children: (Paragraph | Table)[],
  q: FormQuestion,
  isFullDetail: boolean,
  includeAnswerLines: boolean
) {
  const runs: TextRun[] = [];

  // Question number & title
  runs.push(
    new TextRun({
      text: `${q.globalIndex > 0 ? q.globalIndex + '. ' : ''}${q.title || 'Untitled Question'}`,
      bold: true,
      size: 22,
      color: COLOR_TEXT_DARK,
    })
  );

  // Required asterisk and badge
  if (q.required) {
    runs.push(
      new TextRun({
        text: ' *',
        bold: true,
        size: 22,
        color: COLOR_REQUIRED,
      })
    );
  }

  // Type badge in full detail mode
  if (isFullDetail) {
    runs.push(
      new TextRun({
        text: `  [${q.typeName}]`,
        size: 18,
        bold: true,
        color: BRAND_SECONDARY,
      })
    );

    if (q.required) {
      runs.push(
        new TextRun({
          text: ' [Required]',
          size: 18,
          bold: true,
          color: COLOR_REQUIRED,
        })
      );
    }
  }

  // Question Title Paragraph
  children.push(
    new Paragraph({
      spacing: { before: 220, after: 60 },
      children: runs,
    })
  );

  // Question Help Text / Description
  if (isFullDetail && q.description) {
    children.push(
      new Paragraph({
        spacing: { before: 0, after: 100 },
        indent: { left: 360 },
        children: [
          new TextRun({
            text: `ℹ️ ${q.description}`,
            italics: true,
            size: 19,
            color: COLOR_TEXT_MUTED,
          }),
        ],
      })
    );
  }

  // Question Options (Multiple choice, Checkboxes, Dropdown)
  if (q.options && q.options.length > 0) {
    const symbol = q.typeCategory === 'checkboxes' ? '☐ ' : '⚪ ';

    q.options.forEach((opt) => {
      const optRuns: TextRun[] = [
        new TextRun({
          text: `${symbol} ${opt.text}`,
          size: 21,
          color: COLOR_TEXT_DARK,
        }),
      ];

      if (isFullDetail && opt.note) {
        optRuns.push(
          new TextRun({
            text: `  (${opt.note})`,
            italics: true,
            size: 18,
            color: COLOR_TEXT_MUTED,
          })
        );
      }

      children.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          indent: { left: 450 },
          children: optRuns,
        })
      );
    });
  }

  // Linear Scale Display
  if (q.scaleInfo) {
    const min = q.scaleInfo.min || 1;
    const max = q.scaleInfo.max || 5;
    const scaleNums: string[] = [];
    for (let s = min; s <= max; s++) {
      scaleNums.push(`( ${s} )`);
    }

    const scaleText = scaleNums.join('   ');
    const labelLine = [
      q.scaleInfo.minLabel ? `${min} = ${q.scaleInfo.minLabel}` : '',
      q.scaleInfo.maxLabel ? `${max} = ${q.scaleInfo.maxLabel}` : '',
    ]
      .filter(Boolean)
      .join('   |   ');

    children.push(
      new Paragraph({
        spacing: { before: 80, after: 60 },
        indent: { left: 450 },
        children: [
          new TextRun({
            text: scaleText,
            bold: true,
            size: 21,
            color: BRAND_SECONDARY,
          }),
        ],
      })
    );

    if (labelLine) {
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          indent: { left: 450 },
          children: [
            new TextRun({
              text: labelLine,
              italics: true,
              size: 19,
              color: COLOR_TEXT_MUTED,
            }),
          ],
        })
      );
    }
  }

  // Grid Question Display (Choice Grid / Checkbox Grid)
  if (q.gridInfo && q.gridInfo.rows.length > 0) {
    const cols = q.gridInfo.columns;
    const isCheckbox = q.gridInfo.isCheckbox;
    const cellSymbol = isCheckbox ? '☐' : '⚪';

    const headerCells = [
      new TableCell({
        width: { size: 40, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
        children: [new Paragraph({ text: 'Items / Columns', heading: HeadingLevel.HEADING_2 })],
      }),
      ...cols.map(
        (col) =>
          new TableCell({
            width: { size: Math.floor(60 / cols.length), type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: col, bold: true, size: 18 })],
              }),
            ],
          })
      ),
    ];

    const tableRows = [new TableRow({ children: headerCells })];

    q.gridInfo.rows.forEach((rowName) => {
      const rowCells = [
        new TableCell({
          margins: { top: 80, bottom: 80, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: rowName, size: 20 })],
            }),
          ],
        }),
        ...cols.map(
          () =>
            new TableCell({
              margins: { top: 80, bottom: 80, left: 50, right: 50 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: cellSymbol, size: 20, color: COLOR_TEXT_MUTED })],
                }),
              ],
            })
        ),
      ];
      tableRows.push(new TableRow({ children: rowCells }));
    });

    const gridTable = new Table({
      width: { size: 95, type: WidthType.PERCENTAGE },
      rows: tableRows,
    });

    children.push(gridTable);
  }

  // Answer lines / Blank Worksheet Space (if enabled)
  if (includeAnswerLines) {
    if (q.typeCategory === 'short_answer') {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 120 },
          indent: { left: 450 },
          children: [
            new TextRun({
              text: 'Answer: ____________________________________________________________________',
              color: COLOR_TEXT_MUTED,
              size: 20,
            }),
          ],
        })
      );
    } else if (q.typeCategory === 'paragraph') {
      for (let l = 0; l < 3; l++) {
        children.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            indent: { left: 450 },
            children: [
              new TextRun({
                text: '____________________________________________________________________________',
                color: COLOR_TEXT_MUTED,
                size: 20,
              }),
            ],
          })
        );
      }
    } else if (q.typeCategory === 'date') {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 100 },
          indent: { left: 450 },
          children: [
            new TextRun({
              text: 'Date: [  DD  /  MM  /  YYYY  ]   📅',
              color: COLOR_TEXT_MUTED,
              size: 20,
            }),
          ],
        })
      );
    } else if (q.typeCategory === 'time') {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 100 },
          indent: { left: 450 },
          children: [
            new TextRun({
              text: 'Time: [  HH  :  MM  ]  (  AM  /  PM  )   ⏰',
              color: COLOR_TEXT_MUTED,
              size: 20,
            }),
          ],
        })
      );
    } else if (q.typeCategory === 'file_upload') {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 100 },
          indent: { left: 450 },
          children: [
            new TextRun({
              text: '📎 [ File Attachment / Upload placeholder ]',
              italics: true,
              color: COLOR_TEXT_MUTED,
              size: 20,
            }),
          ],
        })
      );
    }
  }
}
