const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { validate } = require("deep-email-validator");
const { isValidPhoneNumber } = require("libphonenumber-js");

// @route   POST api/auth/register
router.post(
  "/register",
  [
    body("name", "Name is required").not().isEmpty(),
    body("phone", "Please include a valid phone number").isLength({ min: 10, max: 15 }),
    body("email", "Please include a valid email").optional().isEmail(),
    body("password", "Please enter a password with 6 or more characters").isLength({ min: 6 }),
    body("district", "District is required").not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, phone, email, password, state, district } = req.body;

    try {
      if (email) {
        const emailCheck = await validate({
          email: email,
          validateSMTP: true,
        });

        if (!emailCheck.valid) {
          return res.status(400).json({
            msg: 'The email address specified does not exist. Please enter a valid, active email.',
          });
        }
      }

      const isPhoneValid = isValidPhoneNumber(phone, 'IN');
      if (!isPhoneValid) {
        return res.status(400).json({
          msg: 'The phone number is invalid. Please enter a real, active phone number.',
        });
      }

      let userByPhone = await User.findOne({ phone });
      if (userByPhone) {
        return res.status(400).json({ errors: [{ msg: "User with this phone already exists" }] });
      }

      if (email) {
        let userByEmail = await User.findOne({ email });
        if (userByEmail) {
          return res.status(400).json({ errors: [{ msg: "User with this email already exists" }] });
        }
      }

      const user = new User({ name, phone, email: email || undefined, password, state, district });
      
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const payload = { id: user.id };
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
        (err, token) => {
          if (err) throw err;
          const userResponse = user.toObject();
          delete userResponse.password;
          res.json({ token, user: userResponse });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   POST api/auth/login
router.post(
  "/login",
  [
    body("password", "Password is required").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { phone, email, password } = req.body;

    if (!phone && !email) {
      return res.status(400).json({ errors: [{ msg: "Please provide either an email or phone number" }] });
    }

    try {
      let user;
      if (email) {
        user = await User.findOne({ email });
      } else if (phone) {
        user = await User.findOne({ phone });
      }

      if (!user) {
        return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const payload = { id: user.id };
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
        (err, token) => {
          if (err) throw err;
          const userResponse = user.toObject();
          delete userResponse.password;
          res.json({ token, user: userResponse });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   GET api/auth/me
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
