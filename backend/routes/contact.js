const express = require("express");
const router = express.Router();
const { contact } = require("../controllers/contactController");

router.route("/").get(contact);

module.exports = router;