const mongoose = require("mongoose");
const User = require("../models/user.model.js");

const noteSchema = new mongoose.Schema(
  {
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

const notesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  notes: [noteSchema],
});

const Notes = new mongoose.model("Notes", notesSchema);
module.exports = Notes;
