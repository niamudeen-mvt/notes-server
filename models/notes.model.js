const mongoose = require("mongoose");
const User = require("../models/user.model.js");

const noteSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    images: [
      {
        image: String,
        fileId: String,
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }
  // { timestamps: true }
);

const notesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: [noteSchema],
  }
  // { timestamps: true }
);

// noteSchema.pre("save", function (next) {
//   this.updatedAt = new Date();
//   next();
// });

const Notes = mongoose.model("Notes", notesSchema);
module.exports = Notes;
