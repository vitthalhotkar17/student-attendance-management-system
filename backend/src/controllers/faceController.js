const User = require("../models/User");
const { success, error } = require("../utils/response");
const { generateEmbedding, compareFaces } = require("../services/faceRecognitionService");

// ─── POST /api/faces/register ─────────────────────────────────────────────────
/**
 * Store a face embedding for a student.
 * Accepts: { studentId, faceImage } — faceImage is base64 data-URI.
 * Or a multipart upload via req.file.
 */
const registerFace = async (req, res, next) => {
  try {
    const { studentId, faceImage: faceImageBase64 } = req.body;
    const targetId = studentId || req.user._id;

    let b64Image = faceImageBase64;

    // Multipart file upload path
    if (req.file) {
      const fs = require("fs");
      const buf = fs.readFileSync(req.file.path);
      b64Image = buf.toString("base64");
    }

    if (!b64Image) return error(res, "Face image is required", 400);

    const embedding = generateEmbedding(b64Image);

    const existing = await User.findById(targetId).select("+faceEmbeddings");
    if (!existing) return error(res, "User not found", 404);

    const updatedEmbeddings = Array.isArray(existing.faceEmbeddings)
      ? [...existing.faceEmbeddings, embedding]
      : [embedding];

    const faceImageValue = req.file
      ? `/uploads/faces/${req.file.filename}`
      : b64Image;

    const user = await User.findByIdAndUpdate(
      targetId,
      { faceEmbeddings: updatedEmbeddings, faceImage: faceImageValue },
      { new: true }
    );

    if (!user) return error(res, "User not found", 404);

    return success(res, { message: "Face registered successfully" }, "Face registered");
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/faces/verify ───────────────────────────────────────────────────
/**
 * Verify a live face against the stored embedding of req.user.
 * Accepts: { faceImage } — base64 data-URI.
 */
const verifyFace = async (req, res, next) => {
  try {
    const { faceImage } = req.body;
    if (!faceImage) return error(res, "Face image is required", 400);

    const student = await User.findById(req.user._id).select("+faceEmbeddings +faceEmbedding");
    const embeddings = student.faceEmbeddings?.length
      ? student.faceEmbeddings
      : student.faceEmbedding
      ? [student.faceEmbedding]
      : [];

    if (!embeddings.length) {
      return error(res, "No face registered for this account. Please register your face first.", 400);
    }

    const result = compareFaces(faceImage, embeddings);
    return success(res, result, result.verified ? "Face verified" : "Face verification failed");
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/faces/student/:id ───────────────────────────────────────────────
const getFaceData = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: "student" });
    if (!student) return error(res, "Student not found", 404);

    return success(
      res,
      {
        hasFace: (student.faceEmbeddings?.length || student.faceEmbedding?.length) > 0,
        faceImage: student.faceImage || null,
      },
      "Face data fetched"
    );
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/faces/student/:id ───────────────────────────────────────────
const deleteFaceData = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      faceEmbeddings: [],
      faceEmbedding: [],
      faceImage: null,
    });
    return success(res, {}, "Face data removed");
  } catch (err) {
    next(err);
  }
};

module.exports = { registerFace, verifyFace, getFaceData, deleteFaceData };
