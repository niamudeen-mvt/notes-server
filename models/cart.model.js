const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  cart: [
    {
      product_id: Number,
      title: String,
      description: String,
      image: String,
      category: String,
      price: Number,
    },
  ],
});

// define the model and collection name
const Cart = new mongoose.model("Cart", cartSchema);
module.exports = Cart;
