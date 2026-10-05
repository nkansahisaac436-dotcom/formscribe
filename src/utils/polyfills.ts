import { Buffer } from 'buffer';
import 'fast-text-encoding';

// Ensure global Buffer is available for docx and pptxgenjs / jszip
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

if (typeof g.Buffer === 'undefined') {
  g.Buffer = Buffer;
}

// Ensure process.env is defined
if (typeof g.process === 'undefined') {
  g.process = { env: {} };
} else if (!g.process.env) {
  g.process.env = {};
}

export { Buffer };
