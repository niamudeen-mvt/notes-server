const mongoose = require("mongoose");
const User = require("../models/user.model.js")

const notesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  notes: [
    {
      message: {
        type: String
      },
    }
  ],
})

const Notes = new mongoose.model("Notes", notesSchema)
module.exports = Notes