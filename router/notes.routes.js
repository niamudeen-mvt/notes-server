const express = require('express')
const notesRouter = express.Router()
const notesController = require("../controller/notes.controller")
const { verifyToken } = require("../middleware/auth.middleware");

notesRouter.route("/add").post(verifyToken, notesController.addNotes)
notesRouter.route("/").get(verifyToken, notesController.getUserNotes)
notesRouter.route("/edit/:id").patch(verifyToken, notesController.editNotes)
notesRouter.route("/delete/:id").patch(verifyToken, notesController.deleteNotes)




module.exports = notesRouter