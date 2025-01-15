const nodemailer = require("nodemailer");

type EMailOption = {
  from: string;
  to: string;
  subject: string;
  content: string;
};

async function sendEmail(option: EMailOption) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  var mailOptions = {
    from: option.from,
    to: option.to,
    subject: option.subject,
    text: option.content,
  };

  await transporter.sendMail(mailOptions);
}

export default sendEmail;
