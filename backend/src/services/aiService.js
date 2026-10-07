/**
 * AI Service — Real Hugging Face AI Resume Skill Extraction
 *
 * Pipeline Flow:
 * REAL RESUME TEXT -> Hugging Face NLP Model -> Automatic Skill Extraction -> Categorization -> MongoDB
 */

const HF_ROUTER_CHAT_URL = 'https://router.huggingface.co/v1/chat/completions';
const DEFAULT_MODEL = 'Qwen/Qwen2.5-Coder-32B-Instruct';

/**
 * Normalizes and cleans a single skill name string.
 * @param {string} str
 * @returns {string}
 */
const cleanSkillName = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/^[-*•\d.)\s]+/, '') // Strip bullet points, list numbers
    .replace(/[;,\.]+$/, '')      // Strip trailing punctuation
    .trim();
};

/**
 * Validates whether an extracted skill appears in the resume text.
 * Prevents model hallucination and ensures only real skills from the resume are stored.
 *
 * @param {string} skill
 * @param {string} rawTextLower
 * @returns {boolean}
 */
const skillAppearsInText = (skill, rawTextLower) => {
  if (!skill || !rawTextLower) return false;
  const sLower = skill.toLowerCase().trim();
  if (sLower.length === 0) return false;

  // Direct substring check
  if (rawTextLower.includes(sLower)) return true;

  // Normalized variants check (e.g. "react.js" vs "react", "node.js" vs "nodejs")
  const stripped = sLower.replace(/[\.\s\-_]/g, '');
  const textStripped = rawTextLower.replace(/[\.\s\-_]/g, '');
  if (stripped.length >= 3 && textStripped.includes(stripped)) return true;

  return false;
};

/**
 * Real Hugging Face AI skill extraction function.
 * Connects to Hugging Face Inference API to extract and categorize skills from resume text.
 *
 * @param {string} rawText - Extracted text from uploaded resume
 * @returns {Promise<{
 *   success: boolean,
 *   extractedSkills?: { languages: string[], frameworks: string[], databases: string[], tools: string[], softSkills: string[] },
 *   modelUsed?: string,
 *   totalSkillsCount?: number,
 *   error?: string,
 *   code?: string
 * }>}
 */
export const extractSkillsWithHuggingFace = async (rawText) => {
  // 1. Guard: Check for empty resume text
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return {
      success: false,
      error: 'Resume text is empty. Could not extract skills.',
      code: 'EMPTY_TEXT'
    };
  }

  // 2. Guard: Check for Hugging Face API key in backend environment
  const apiKey = (
    process.env.HF_API_KEY ||
    process.env.HUGGINGFACE_API_KEY ||
    process.env.HF_TOKEN ||
    ''
  ).trim();

  if (!apiKey) {
    return {
      success: false,
      error: 'HF_API_KEY is not configured in backend/.env. Please set your Hugging Face API key in backend/.env.',
      code: 'MISSING_API_KEY'
    };
  }

  const model = (process.env.HUGGINGFACE_MODEL || DEFAULT_MODEL).trim();
  const rawTextLower = rawText.toLowerCase();

  // Truncate to reasonable context window (approx 12,000 chars) to prevent context overflow
  const contextSnippet = rawText.slice(0, 12000);

  const systemPrompt = [
    'You are an expert NLP technical recruiter and resume parser.',
    'Extract technical and professional skills that explicitly appear in the candidate resume text.',
    'Categorize every extracted skill into exactly one of these 5 categories:',
    '- languages: Programming languages (e.g., Python, JavaScript, Java, C++, TypeScript, Go, SQL, HTML, CSS)',
    '- frameworks: Software libraries and frameworks (e.g., React, Node.js, Express.js, FastAPI, Spring Boot, Tailwind CSS, Bootstrap)',
    '- databases: Database management systems and storage (e.g., PostgreSQL, MongoDB, MySQL, Redis, SQLite)',
    '- tools: DevOps, platforms, version control, clouds, IDEs, and systems (e.g., Git, GitHub, Docker, AWS, Linux, VS Code, Vercel, Postman)',
    '- softSkills: Professional interpersonal and cognitive competencies explicitly mentioned (e.g., Problem Solving, Team Leadership, Agile, Communication)',
    '',
    'STRICT RULES:',
    '1. ONLY extract skills that are EXPLICITLY present in the text.',
    '2. DO NOT hallucinate, guess, or invent skills not in the resume.',
    '3. Return ONLY a valid JSON object with the exact keys: "languages", "frameworks", "databases", "tools", "softSkills".',
    '4. Every key must map to an array of strings.',
    '5. Do NOT output markdown code fences, explanations, or any other text outside the JSON object.'
  ].join('\n');

  try {
    const payload = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extract and categorize the skills from this resume text:\n\n${contextSnippet}` }
      ],
      temperature: 0.1,
      max_tokens: 1500
    });

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    let response = await fetch(HF_ROUTER_CHAT_URL, {
      method: 'POST',
      headers,
      body: payload
    });

    // Fallback to model-specific inference endpoint if router is unavailable or 404
    if (!response.ok && (response.status === 404 || response.status === 502)) {
      const fallbackUrl = `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`;
      try {
        const fallbackRes = await fetch(fallbackUrl, {
          method: 'POST',
          headers,
          body: payload
        });
        if (fallbackRes.ok) {
          response = fallbackRes;
        }
      } catch (e) {
        // Continue with original response error handling
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: 'Hugging Face authentication failed (401 Unauthorized). Please check your HF_API_KEY in backend/.env.',
          code: 'UNAUTHORIZED'
        };
      }
      if (response.status === 429) {
        return {
          success: false,
          error: 'Hugging Face API rate limit reached (429). Please retry after a brief delay.',
          code: 'RATE_LIMIT'
        };
      }
      if (response.status === 503) {
        return {
          success: false,
          error: 'The Hugging Face model is currently loading (503). Please retry in 30 seconds.',
          code: 'MODEL_LOADING'
        };
      }
      const errBody = await response.text();
      return {
        success: false,
        error: `Hugging Face API returned error status ${response.status}: ${errBody.slice(0, 150)}`,
        code: 'API_ERROR'
      };
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    if (!rawContent || typeof rawContent !== 'string') {
      return {
        success: false,
        error: 'Hugging Face model returned empty or malformed completion content.',
        code: 'INVALID_MODEL_OUTPUT'
      };
    }

    // Strip markdown code fences if present (```json ... ``` or ``` ...)
    const cleanedJsonStr = rawContent
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed;
    try {
      // Find the outermost JSON object bounds if there's any surrounding text
      const firstBrace = cleanedJsonStr.indexOf('{');
      const lastBrace = cleanedJsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        parsed = JSON.parse(cleanedJsonStr.substring(firstBrace, lastBrace + 1));
      } else {
        parsed = JSON.parse(cleanedJsonStr);
      }
    } catch (parseErr) {
      return {
        success: false,
        error: `Failed to parse Hugging Face model JSON output: ${parseErr.message}`,
        code: 'JSON_PARSE_ERROR'
      };
    }

    // Extract, clean, deduplicate, and verify each category against real resume text
    const sanitizeCategory = (items) => {
      if (!Array.isArray(items)) return [];
      const seen = new Set();
      const result = [];

      for (const item of items) {
        const cleaned = cleanSkillName(item);
        if (cleaned && !seen.has(cleaned.toLowerCase())) {
          // Verify that this skill actually exists in the real resume text
          if (skillAppearsInText(cleaned, rawTextLower)) {
            seen.add(cleaned.toLowerCase());
            result.push(cleaned);
          }
        }
      }
      return result;
    };

    const extractedSkills = {
      languages: sanitizeCategory(parsed.languages),
      frameworks: sanitizeCategory(parsed.frameworks),
      databases: sanitizeCategory(parsed.databases),
      tools: sanitizeCategory(parsed.tools),
      softSkills: sanitizeCategory(parsed.softSkills)
    };

    const totalCount =
      extractedSkills.languages.length +
      extractedSkills.frameworks.length +
      extractedSkills.databases.length +
      extractedSkills.tools.length +
      extractedSkills.softSkills.length;

    console.log(
      `[aiService] Hugging Face extraction complete (${model}). ` +
      `Extracted: ${totalCount} skills ` +
      `(Lang: ${extractedSkills.languages.length}, Frame: ${extractedSkills.frameworks.length}, ` +
      `DB: ${extractedSkills.databases.length}, Tools: ${extractedSkills.tools.length}, Soft: ${extractedSkills.softSkills.length})`
    );

    return {
      success: true,
      extractedSkills,
      modelUsed: model,
      totalSkillsCount: totalCount
    };
  } catch (networkErr) {
    console.error('[aiService] Hugging Face network request error:', networkErr.message);
    return {
      success: false,
      error: `Network error communicating with Hugging Face API: ${networkErr.message}`,
      code: 'NETWORK_ERROR'
    };
  }
};

/**
 * Placeholder for future Hugging Face embeddings generation
 * @param {string|Array<string>} text
 * @returns {Promise<Array<number>>}
 */
export const generateEmbeddings = async (text) => {
  return [];
};

/**
 * Named Entity Recognition for skills & tech stacks
 * @param {string} rawText
 * @returns {Promise<Array<Object>>}
 */
export const extractSkillEntities = async (rawText) => {
  const result = await extractSkillsWithHuggingFace(rawText);
  if (!result.success || !result.extractedSkills) return [];

  const entities = [];
  Object.entries(result.extractedSkills).forEach(([category, skills]) => {
    skills.forEach((skill) => {
      entities.push({ name: skill, category });
    });
  });
  return entities;
};

/**
 * Placeholder for future AI-driven skill gap recommendations
 * @param {Object} workerProfile
 * @param {Object} projectRequirements
 * @returns {Promise<Array<string>>}
 */
export const generateImprovementSuggestions = async (workerProfile, projectRequirements) => {
  return [];
};

export default {
  extractSkillsWithHuggingFace,
  generateEmbeddings,
  extractSkillEntities,
  generateImprovementSuggestions
};
