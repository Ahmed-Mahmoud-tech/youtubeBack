// const nodemailer = require("nodemailer");

// // Create a transporter for sending email
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.GOOGLE_EMAIL,
//     pass: process.env.GOOGLE_EMAIL_PASSWORD,
//   },
// });

// // Define the message to be sent
// const message = {
//   from: process.env.GOOGLE_EMAIL,
//   to: "ahmedmahmoudtech@gmail.com",
//   subject: "Test Email",
//   text: "This is a test email from Nodemailer",
// };

// // Send the email

// const mailFun = () =>
//   transporter.sendMail(message, (err, info) => {
//     if (err) {
//       console.error(err);
//     } else {
//       console.log(info);
//     }
//   });

// module.exports = { mailFun };

const nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: "localhost",
  port: 25,
  secure: false, // true for 465, false for other ports
});

// setup email data
let mailOptions = {
  from: '"Your Name" <your.email@example.com>', // sender address
  to: "recipient.email@example.com", // list of receivers
  subject: "Hello ✔", // Subject line
  text: "Hello world?", // plain text body
  html: "<b>Hello world?</b>", // html body
};

// send mail with defined transport object

const mailFun = () =>
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });

module.exports = { mailFun };
