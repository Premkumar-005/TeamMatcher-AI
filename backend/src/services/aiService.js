/**
 * AI Service (Architectural Placeholder)
 *
 * VERY IMPORTANT AI REQUIREMENT:
 * DO NOT IMPLEMENT THE HUGGING FACE MODEL, LLM, EMBEDDINGS, VECTOR DB, OR RAG IN THIS TASK.
 *
 * Future Scope:
 * - Hugging Face Sentence Transformers for dense project & profile embeddings
 * - Vector similarity search (e.g., Cosine similarity / Vector index)
 * - LLM-powered candidate summaries and automated team formation suggestions
 * - Semantic skill gap analysis and automated learning path recommendations
 *
 * NOTE: The application currently uses deterministic calculations in matchingService.js.
 */

/**
 * Placeholder for future Hugging Face embeddings generation
 * @param {string|Array<string>} text
 * @returns {Promise<Array<number>>}
 */
export const generateEmbeddings = async (text) => {
  // TODO: Future Hugging Face Feature Extraction pipeline
  return [];
};

/**
 * Placeholder for future Hugging Face Named Entity Recognition for skills & tech stacks
 * @param {string} rawText
 * @returns {Promise<Array<Object>>}
 */
export const extractSkillEntities = async (rawText) => {
  // TODO: Future Hugging Face Token Classification / NER model
  return [];
};

/**
 * Placeholder for future AI-driven skill gap recommendations
 * @param {Object} workerProfile
 * @param {Object} projectRequirements
 * @returns {Promise<Array<string>>}
 */
export const generateImprovementSuggestions = async (workerProfile, projectRequirements) => {
  // TODO: Future LLM prompt engineering for targeted candidate upskilling advice
  return [];
};

export default {
  generateEmbeddings,
  extractSkillEntities,
  generateImprovementSuggestions
};
