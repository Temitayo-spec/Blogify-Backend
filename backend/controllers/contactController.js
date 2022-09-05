const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");

const contact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL,
    subject: `Message from ${name}`,
    html: `<p>Name: ${name}</p>
           <p>Email: ${email}</p>
           <p>Message: ${message}</p>`,
  };

  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Email sent!",
      });
    }
  });
});


module.exports = {
    contact,
};
