const express = require("express");
const productRouter = express.Router();
const productController = require("../controller/product.controller");
const { verifyToken } = require("../middleware/auth.middleware");

productRouter.route("/add").post(verifyToken, productController.addtoProduct);
productRouter.route("/get").get(verifyToken, productController.getProducts);

module.exports = productRouter;
