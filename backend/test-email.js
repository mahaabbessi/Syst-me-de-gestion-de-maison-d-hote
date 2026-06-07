require("dotenv").config();
const { envoyerEmail } = require("./services/emailService");

const tester = async () => {
  console.log("📧 Test d'envoi d'email...");
  const result = await envoyerEmail(
    "mahaabbessi715@gmail.com", // ← Remplacez par votre email
    "✅ Test Nodemailer",
    "<h1 style='color: green;'>Félicitations !</h1><p>Nodemailer fonctionne parfaitement sur votre projet DarHôtes.</p>"
  );
  
  if (result) {
    console.log("✅ Email envoyé avec succès !");
  } else {
    console.log("❌ Échec de l'envoi");
  }
};

tester();