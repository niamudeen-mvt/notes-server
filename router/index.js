const express = require("express");
const router = express.Router();
const userRouter = require("./auth.routes");
const productRouter = require("./product.routes");
const cartRouter = require("./cart.routes");

router.use("/auth", userRouter);
router.use("/products", productRouter);
router.use("/cart", cartRouter);

module.exports = router;
