const express = require("express");
const notesRouter = express.Router();
const notesController = require("../controller/notes.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const multer = require("multer");
const path = require("path");

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    ); // File naming: fieldname-timestamp.ext
  },
});

// Multer Upload Configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB (adjust as needed)
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed."));
    }
  },
}).array("images", 5); // Accept up to 5 images, 'images' should match the input field name

notesRouter.route("/add").post(verifyToken, notesController.addNotes);
notesRouter.route("/").get(verifyToken, notesController.getUserNotes);
notesRouter.route("/edit/:id").patch(verifyToken, notesController.editNotes);
notesRouter
  .route("/delete/:id")
  .patch(verifyToken, notesController.deleteNotes);

notesRouter.route("/upload").post(async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      res.status(400).json({ message: err.message });
    } else {
      if (!req.files || req.files.length === 0) {
        res.status(400).json({ message: "No files uploaded." });
      } else {
        const fileUrls = req.files.map((file) => ({
          url: `/uploads/${file.filename}`,
        }));
        res.status(200).json({ files: fileUrls });
      }
    }
  });
});

module.exports = notesRouter;
