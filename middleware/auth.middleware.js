const jwt = require("jsonwebtoken");
const TOKEN_DETAILS = require("../config/index");

const verifyToken = (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(200).send({
      success: false,
      message: "A token is required for authorization",
    });
  }
  try {
    const decodedUser = jwt.verify(token, TOKEN_DETAILS.JWT_SECRET_KEY);
    req.user = decodedUser;
  } catch (error) {
    return res.status(401).send({ message: "Token has expired" });
  }
  return next();
};

const refreshToken = async (req, res) => {
  const token = req.body.refresh_token;

  if (!token) {
    return res.status(200).send({
      success: false,
      message: "A token is required for authorization",
    });
  }
  try {
    // validating token
    const decodedUser = jwt.verify(token, TOKEN_DETAILS.REFRESH_SECRET_KEY);

    if (decodedUser) {
      const token = jwt.sign(
        {
          userId: decodedUser?.userId.toString(),
        },
        TOKEN_DETAILS.JWT_SECRET_KEY,
        {
          expiresIn: TOKEN_DETAILS.ACCESS_TOKEN_EXPIRATION_TIME,
        }
      );
      return res.status(200).send({
        access_token: token,
        message: "new token generated successfully",
      });
    } else {
      return res.send({ message: "invalid token" });
    }
  } catch (error) {
    return res.status(400).send({ message: "invalid token" });
  }
};

module.exports = { verifyToken, refreshToken };
