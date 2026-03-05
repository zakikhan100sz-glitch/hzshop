import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 6 * 1024 * 1024 // 6MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  }
});

router.post(
  "/",
  requireAuth,
  requireRole("admin", "owner"),
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400);
        throw new Error("No file uploaded");
      }

      const base64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${base64}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: process.env.CLOUDINARY_FOLDER || "hzshop",
        resource_type: "image"
      });

      res.json({
        url: result.secure_url,
        public_id: result.public_id
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/multi",
  requireAuth,
  requireRole("admin", "owner"),
  upload.array("images", 3),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error("No files uploaded");
      }

      const uploads = [];

      for (const file of req.files) {
        const base64 = file.buffer.toString("base64");
        const dataUri = `data:${file.mimetype};base64,${base64}`;

        const result = await cloudinary.uploader.upload(dataUri, {
          folder: process.env.CLOUDINARY_FOLDER || "hzshop",
          resource_type: "image"
        });

        uploads.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }

      res.json({
        success: true,
        count: uploads.length,
        files: uploads
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;