const express = require("express");
const router = express.Router();
const userController = require("../controller/users");
const { validateSeller } = require("../middleware/common");
const { protect } = require("../middleware/Auth");
const upload = require("../middleware/Multer");

router.get("/", protect, userController.getAllUser);
router.get("/profile", protect, userController.getProfile);
router.get("/user/:id", userController.getDetailUser);
router.put(
  "/update/:id",
  protect,
  upload,
  validateSeller,
  userController.updateUser
);
router.delete("/delete/:id", protect, userController.deleteUser);

// Authenticated
router.post("/register", validateSeller, userController.registerUser);
router.post("/login", userController.loginUser);

module.exports = router;
