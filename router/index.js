const express = require("express");
const router = express.Router();
const userRouter = require("./auth.routes");
const productRouter = require("./product.routes");
const cartRouter = require("./cart.routes");
const notesRouter = require("./notes.routes");

router.use("/auth", userRouter);
router.use("/products", productRouter);
router.use("/cart", cartRouter);
router.use("/notes", notesRouter);

module.exports = router;
