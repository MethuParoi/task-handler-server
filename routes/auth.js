const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// JWT Authentication Route
router.post("/jwt-auth", (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .send({ success: false, error: "Email is required" });
    }

    // Generate JWT token
    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "5h", // Token expires in 5 hours
    });

    // Send token as an HTTP-only cookie
    res
      .cookie("token", token, {
        httpOnly: true, // Prevent access by JavaScript on the client side
        secure: process.env.NODE_ENV === "production", // HTTPS in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Cookie sharing policy
      })
      .send({ success: true, message: "JWT token issued successfully", token });
  } catch (error) {
    console.error("Error generating JWT token:", error);
    res
      .status(500)
      .send({ success: false, error: "Failed to generate JWT token" });
  }
});

//logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", { path: "/", httpOnly: true, secure: true });
  res.status(200).send({ success: true });
  // res
  //   .clearCookie("token", {
  //     httpOnly: true,
  //     secure: false,
  //   })
  //   .send({ success: true });
});

//jwt get
router.get("/jwt-get", (req, res) => {
  // console.log("User data from token:", req.user);
  // console.log("cookies", req.cookies.token);
  res.send({ success: true });
});

module.exports = router;
