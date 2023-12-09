const mongoose = require("mongoose");
const User = require("../models/user.model.js");

const notesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: [
      {
        title: String,
        message: String,
        images: [
          {
            image: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const Notes = new mongoose.model("Notes", notesSchema);
module.exports = Notes;
