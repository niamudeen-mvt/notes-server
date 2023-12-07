const jwt = require("jsonwebtoken");

const TOKEN_DETAILS = {
  JWT_SECRET_KEY: "BACKENDPROJECTBYNIAMUDEEN",
  REFRESH_SECRET_KEY: "BACKENDPROJECTBYNIAMUDEEN",
  ACCESS_TOKEN_EXPIRATION_TIME: Math.floor(Date.now() / 1000) + 60 * 5,
  REFRESH_TOKEN_EXPIRATION_TIME: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  // ACCESS_TOKEN_COOKIE_EXPIRATION_TIME: 30 * 1000,
  // REFRESH_TOKEN_COOKIE_EXPIRATION_TIME: 30 * 24 * 60 * 60 * 1000,
};

module.exports = TOKEN_DETAILS;