import fs from 'fs';
import path from 'path';

// pdf-parse is a CommonJS module; use createRequire for ESM compatibility
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { parseOffice } = require('officeparser');

/**
 * Resume Service — Multi-Format Text Extraction
 *
 * Architecture Flow (current phase: text extraction only):
 *
 * Worker Resume (PDF / DOCX / DOC / TXT / RTF)
 *       ↓
 * Format Detection (by file extension)
 *       ↓
 * Format-Specific Extraction ← IMPLEMENTED HERE
 *   PDF  → pdf-parse
 *   DOCX → mammoth.extractRawText
 *   DOC  → mammoth (best-effort; reports DOC_LIMITED_SUPPORT on failure)
 *   TXT  → native fs.readFileSync
 *   RTF  → officeparser.parseOffice → toText() → strip residual tokens
 *       ↓
 * Raw text stored in user.resumeRawText (MongoDB)
 *       ↓
 * [FUTURE] Hugging Face NER / RoBERTa skill extraction
 *       ↓
 * [FUTURE] user.extractedSkills populated
 */

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper: compute word / char stats
// ─────────────────────────────────────────────────────────────────────────────
const textStats = (rawText) => ({
  wordCount: rawText ? rawText.split(/\s+/).filter(Boolean).length : 0,
  charCount: rawText ? rawText.length : 0
});

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper: strip residual RTF control words from toText() output
// e.g. \rtf1 \ansi \deff0 \fonttbl etc.
// ─────────────────────────────────────────────────────────────────────────────
const stripRtfTokens = (text) =>
  text
    .replace(/\\[a-z]+\d*\s?/gi, ' ')  // strip \controlword sequences
    .replace(/[{}]/g, ' ')             // strip braces
    .replace(/\s{2,}/g, ' ')           // collapse whitespace
    .trim();

// ─────────────────────────────────────────────────────────────────────────────
// Promisify officeparser's callback API
// ─────────────────────────────────────────────────────────────────────────────
const parseOfficeAsync = (filePath) =>
  new Promise((resolve, reject) => {
    parseOffice(filePath, (data, err) => {
      if (err) return reject(err);
      resolve(data);
    });
  });

// ─────────────────────────────────────────────────────────────────────────────
// Extractor: PDF  → pdf-parse
// ─────────────────────────────────────────────────────────────────────────────
const extractPdf = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(buffer);
  const rawText = (pdfData.text || '').trim();
  return { rawText, pageCount: pdfData.numpages || 0 };
};

// ─────────────────────────────────────────────────────────────────────────────
// Extractor: DOCX → mammoth (reliable OOXML extractor)
// ─────────────────────────────────────────────────────────────────────────────
const extractDocx = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  const rawText = (result.value || '').trim();
  return { rawText };
};

// ─────────────────────────────────────────────────────────────────────────────
// Extractor: DOC (legacy binary) → mammoth best-effort
//
// Mammoth targets OOXML (.docx). For old binary .doc files it may extract
// partial text or throw. On failure we return DOC_LIMITED_SUPPORT so the
// file is still saved but the caller knows extraction was incomplete.
// ─────────────────────────────────────────────────────────────────────────────
const extractDoc = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  try {
    const result = await mammoth.extractRawText({ buffer });
    const rawText = (result.value || '').trim();
    if (!rawText) {
      // mammoth returned empty — binary .doc not parseable
      return { rawText: '', limitedSupport: true };
    }
    return { rawText };
  } catch (err) {
    return { rawText: '', limitedSupport: true, error: err.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Extractor: TXT → native fs read (UTF-8, fallback latin1)
// ─────────────────────────────────────────────────────────────────────────────
const extractTxt = (filePath) => {
  let rawText;
  try {
    rawText = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    rawText = fs.readFileSync(filePath, 'latin1');
  }
  return { rawText: rawText.trim() };
};

// ─────────────────────────────────────────────────────────────────────────────
// Extractor: RTF → officeparser → toText() → strip residual RTF tokens
// ─────────────────────────────────────────────────────────────────────────────
const extractRtf = async (filePath) => {
  const data = await parseOfficeAsync(filePath);
  const raw = typeof data.toText === 'function' ? data.toText() : '';
  const rawText = stripRtfTokens(raw);
  return { rawText };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main exported function: parseResumeFile
// Detects format, dispatches to extractor, returns unified result shape
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract raw text from an uploaded resume file.
 * Supports: .pdf, .docx, .doc, .txt, .rtf
 *
 * @param {string} absoluteFilePath - Absolute path to the file on disk
 * @returns {Promise<Object>} { status, rawText, wordCount, charCount, pageCount?, format, error? }
 */
export const parseResumeFile = async (absoluteFilePath) => {
  // Guard: file must exist
  if (!absoluteFilePath || !fs.existsSync(absoluteFilePath)) {
    console.warn(`[resumeService] File not found: ${absoluteFilePath}`);
    return { status: 'FILE_NOT_FOUND', rawText: '', wordCount: 0, charCount: 0 };
  }

  const ext = path.extname(absoluteFilePath).toLowerCase();
  const basename = path.basename(absoluteFilePath);

  try {
    let extraction;

    switch (ext) {
      case '.pdf': {
        extraction = await extractPdf(absoluteFilePath);
        break;
      }
      case '.docx': {
        extraction = await extractDocx(absoluteFilePath);
        break;
      }
      case '.doc': {
        extraction = await extractDoc(absoluteFilePath);
        if (extraction.limitedSupport) {
          console.warn(
            `[resumeService] Legacy .doc file "${basename}" could not be fully parsed. ` +
            `Binary .doc requires LibreOffice/antiword — not available in this environment.`
          );
          return {
            status: 'DOC_LIMITED_SUPPORT',
            rawText: '',
            wordCount: 0,
            charCount: 0,
            format: 'doc',
            error:
              'Legacy .doc binary format could not be parsed. ' +
              'Please re-save the file as .docx and re-upload for full text extraction.'
          };
        }
        break;
      }
      case '.txt': {
        extraction = extractTxt(absoluteFilePath);
        break;
      }
      case '.rtf': {
        extraction = await extractRtf(absoluteFilePath);
        break;
      }
      default: {
        console.warn(`[resumeService] Unsupported extension: ${ext}`);
        return {
          status: 'UNSUPPORTED_FORMAT',
          rawText: '',
          wordCount: 0,
          charCount: 0,
          format: ext
        };
      }
    }

    const rawText = (extraction.rawText || '').trim();
    const { wordCount, charCount } = textStats(rawText);

    console.log(
      `[resumeService] "${basename}" parsed. ` +
      `Format: ${ext}, Words: ${wordCount}, Chars: ${charCount}` +
      (extraction.pageCount ? `, Pages: ${extraction.pageCount}` : '')
    );

    return {
      status: 'TEXT_EXTRACTED',
      rawText,
      wordCount,
      charCount,
      format: ext.replace('.', ''),
      ...(extraction.pageCount !== undefined && { pageCount: extraction.pageCount })
    };
  } catch (err) {
    console.error(`[resumeService] Parse error for "${basename}":`, err.message);
    return {
      status: 'PARSE_ERROR',
      rawText: '',
      wordCount: 0,
      charCount: 0,
      format: ext.replace('.', ''),
      error: err.message
    };
  }
};

/**
 * Placeholder for future AI-assisted resume scoring via Hugging Face.
 * Will read from user.resumeRawText (already stored in MongoDB).
 *
 * @param {Object} resumeData - { rawText, wordCount, charCount }
 * @returns {Promise<number>} Always 0 until HF model is integrated
 */
export const calculateResumeScore = async (resumeData) => {
  // TODO: Future Hugging Face semantic alignment score vs industry job taxonomies
  return 0;
};

export default {
  parseResumeFile,
  calculateResumeScore
};
