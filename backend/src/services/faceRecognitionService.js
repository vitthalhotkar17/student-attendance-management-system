/**
 * faceRecognitionService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure-JS face recognition using cosine similarity on embedding vectors.
 *
 * HOW IT WORKS
 * ─────────────
 * 1. During registration the frontend sends a base64 face image.
 *    We store a synthetic 128-dim embedding derived from the pixel data.
 *    In production you would replace generateEmbedding() with a real model
 *    call (face-api.js / Python DeepFace / InsightFace microservice).
 *
 * 2. During attendance the live image is compared against the stored embedding
 *    using cosine similarity (range –1 to 1 → mapped to 0–100%).
 *
 * 3. If similarity >= threshold (default 60%) → verified.
 *
 * UPGRADING TO A REAL MODEL
 * ──────────────────────────
 * Replace generateEmbedding() with an HTTP call to your Python service:
 *   POST http://localhost:8000/embed  { "image": "<base64>" }
 *   → { "embedding": [0.12, -0.45, ...] }
 *
 * Then compareEmbeddings() stays identical — it only operates on numbers.
 */

const logger = require("../utils/logger");

// ─── Similarity threshold (0–100) ───────────────────────────────────────────
const DEFAULT_THRESHOLD = 60;

function getThreshold() {
  const rawThreshold = process.env.FACE_SIMILARITY_THRESHOLD;
  if (!rawThreshold) return DEFAULT_THRESHOLD;

  const parsed = Number.parseInt(rawThreshold, 10);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
    logger.warn(`FACE_SIMILARITY_THRESHOLD is invalid: ${rawThreshold}. Using default ${DEFAULT_THRESHOLD}.`);
    return DEFAULT_THRESHOLD;
  }
  return parsed;
}

logger.info(`FACE_SIMILARITY_THRESHOLD loaded: ${getThreshold()}`);

/**
 * Cosine similarity between two numeric vectors.
 * Returns a value in [-1, 1].
 */
function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Derive a pseudo-embedding from a base64 image string.
 *
 * ⚠️  This is a deterministic hash-based placeholder.
 *     It will give ~consistent results for the SAME image but will NOT
 *     generalise across different photos of the same person.
 *
 * Replace this function with a call to a real ML model in production.
 *
 * @param {string} base64Image - data URI or raw base64 string
 * @returns {number[]} 128-dimensional unit vector
 */
function generateEmbedding(base64Image) {
  // Strip data-URI prefix if present
  const raw = base64Image.replace(/^data:image\/\w+;base64,/, "");

  // Sample 128 bytes evenly from the base64 string → treat as embedding dims
  const embedding = new Array(128).fill(0);
  const step = Math.max(1, Math.floor(raw.length / 128));

  for (let i = 0; i < 128; i++) {
    const charCode = raw.charCodeAt(i * step) || 0;
    embedding[i] = (charCode - 64) / 64; // normalise roughly to [-1, 1]
  }

  // L2-normalise so cosine similarity works correctly
  const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0)) || 1;
  return embedding.map((v) => v / norm);
}

/**
 * Compare a live face image against one or more stored embeddings.
 *
 * @param {string} liveImage - base64 image from webcam
 * @param {number[]|number[][]} storedEmbeddings - one or more saved embeddings
 * @returns {{ verified: boolean, score: number }}
 */
function compareFaces(liveImage, storedEmbeddings) {
  try {
    if (!liveImage || !storedEmbeddings?.length) {
      return { verified: false, score: 0 };
    }

    const liveEmbed = generateEmbedding(liveImage);
    const candidates = Array.isArray(storedEmbeddings[0]) ? storedEmbeddings : [storedEmbeddings];
    const bestSimilarity = candidates.reduce((best, stored) => {
      const similarity = cosineSimilarity(liveEmbed, stored);
      return similarity > best ? similarity : best;
    }, -1);

    if (bestSimilarity < 0) {
      return { verified: false, score: 0 };
    }

    const score = Math.round(((bestSimilarity + 1) / 2) * 100);
    const threshold = getThreshold();
    const verified = score >= threshold;

    logger.info(`Face comparison: score=${score}, threshold=${threshold}, verified=${verified}`);
    return { verified, score };
  } catch (err) {
    logger.error("Face comparison error:", err.message);
    return { verified: false, score: 0 };
  }
}

module.exports = { generateEmbedding, compareFaces };
