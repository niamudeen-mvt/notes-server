const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Notes = require("../models/notes.model");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: Number,
    },
    password: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    notes: [
      {
        noteId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Notes",
        },
        message: String,
      },
    ],
  },
  { timestamps: true }
);

// secruring the password with bcrypt
userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    next();
  }

  try {
    const saltRound = 10;
    const hash_password = await bcrypt.hash(user.password, saltRound);
    user.password = hash_password;
  } catch (error) {
    next(error);
  }
});

// define the model and collection name
const User = new mongoose.model("User", userSchema);
module.exports = User;
