const express = require("express");
const notesRouter = express.Router();
const notesController = require("../controller/notes.controller");
const { verifyToken } = require("../middleware/auth.middleware");

notesRouter.route("/add").post(verifyToken, notesController.addNotes);
notesRouter.route("/edit/:id").patch(verifyToken, notesController.editNotes);
notesRouter.route("/").get(verifyToken, notesController.getUserNotes);
notesRouter
  .route("/delete/:id")
  .patch(verifyToken, notesController.deleteNotes);

notesRouter
  .route("/delete-img")
  .patch(verifyToken, notesController.deleteNoteImg);

module.exports = notesRouter;
