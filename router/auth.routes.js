const express = require("express");
const userRouter = express.Router();
const authControllers = require("../controller/auth.controller");
const { verifyToken, refreshToken } = require("../middleware/auth.middleware");
const {
  validateRegisterSchema,
  validateLoginSchema,
} = require("../middleware/validtion.middleware");

userRouter
  .route("/register")
  .post(validateRegisterSchema, authControllers.register);
userRouter.route("/login").post(validateLoginSchema, authControllers.login);
userRouter.route("/refresh-token").post(refreshToken);
userRouter.route("/user").get(verifyToken, authControllers.userDetails);
userRouter
  .route("/user/edit")
  .patch(verifyToken, authControllers.editUserDetails);

module.exports = userRouter;
