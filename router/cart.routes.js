const express = require("express");
const cartRouter = express.Router();
const cartControllers = require("../controller/cart.controller");
const { verifyToken } = require("../middleware/auth.middleware");

cartRouter.route("/add").post(verifyToken, cartControllers.addtoCart);
cartRouter.route("/remove").post(verifyToken, cartControllers.removeFromCart);
cartRouter.route("/:id").get(cartControllers.cartDetails);

module.exports = cartRouter;
