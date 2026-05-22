const express = require("express");
const { register, login, getProfile, updateProfile, changePassword, deleteAccount } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.put("/password", protect, changePassword);
router.delete("/me", protect, deleteAccount);

module.exports = router;
