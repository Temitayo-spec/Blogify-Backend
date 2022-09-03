const express = require("express");
const multer = require("multer");
const {
  register,
  login,
  update,
  deleteUser,
  getUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

router.route("/user").get(protect, getUser);
router.route("/login").post(login);
router.route("/register").post(upload.single("profile"), register);
router.route("/update/:id").put(protect,
  upload.single("profile"), update);
router.route("/delete/:id").delete(protect, deleteUser);
module.exports = router;
