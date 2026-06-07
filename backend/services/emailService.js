const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const envoyerEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"DarHôtes" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`✅ Email envoyé à ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur envoi email à ${to}:`, error.message);
    return false;
  }
};

module.exports = { envoyerEmail };