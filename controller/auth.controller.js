const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const TOKEN_DETAILS = require("../config/index");

// ================ REGISTER ======================

const register = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    } else {
      const { username, email, phone, password, isAdmin } = req.body;

      const userExist = await User.findOne({ email });

      if (userExist) {
        return res.status(400).send({ message: "email already exists" });
      }

      const userCreated = await User.create({
        username,
        email,
        phone,
        password,
        isAdmin,
      });

      res.status(201).send({
        success: true,
        data: userCreated,
        message: "user registred successfully",
      });
    }
  } catch (error) {
    console.log(error, "error");
    res.status(500).send({ msg: error });
  }
};

// ============= LOGIN ======================

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    } else {
      const { email, password } = req.body;

      const userExist = await User.findOne({ email });
      if (!userExist) {
        return res.status(400).send({
          message: "Invalid Credentials",
        });
      }

      const isPasswordMatch = await bcrypt.compare(
        password,
        userExist.password
      );

      const payload = {
        userId: userExist._id.toString(),
      };

      const token = jwt.sign(payload, TOKEN_DETAILS.JWT_SECRET_KEY, {
        expiresIn: TOKEN_DETAILS.ACCESS_TOKEN_EXPIRATION_TIME,
      });

      const refresh_token = jwt.sign(
        payload,
        TOKEN_DETAILS.REFRESH_SECRET_KEY,
        {
          expiresIn: TOKEN_DETAILS.REFRESH_TOKEN_EXPIRATION_TIME,
        }
      );

      if (isPasswordMatch) {
        res.status(200).send({
          success: true,
          access_token: token,
          refresh_token: refresh_token,
          expiresIn: TOKEN_DETAILS.ACCESS_TOKEN_EXPIRATION_TIME,
          message: "user login successfully",
          userId: userExist._id.toString(),
        });
      } else {
        return res.status(401).send({
          message: "Invalid email or passoword",
        });
      }
    }
  } catch (error) {
    res.status(500).send({ msg: error });
  }
};

// ============== FETCHING USER DETAILS

const userDetails = async (req, res) => {
  try {
    const userExist = await User.findById({ _id: req.user.userId });
    if (!userExist) {
      return res.status(400).send({
        message: "User not found",
      });
    } else {
      res.status(200).send({
        success: true,
        user: userExist,
        message: "user found successfully",
      });
    }
  } catch (error) {
    console.log(error, "error");
    res.status(500).send({ msg: error });
  }
};

const editUserDetails = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: req.user.userId },
      {
        ...req.body,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).send({
        message: "User not found",
      });
    } else {
      res.status(200).send({
        success: true,
        user: updatedUser,
        message: "user details updated successfully",
      });
    }
  } catch (error) {
    console.log(error, "error");
    res.status(500).send({ msg: error });
  }
};

module.exports = { login, register, userDetails, editUserDetails };
