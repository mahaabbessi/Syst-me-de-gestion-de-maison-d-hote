const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User     = require("./models/user");
require("dotenv").config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" Connecté à MongoDB");

    const exists = await User.findOne({ email: "admin@darhotes.tn" });
    if (exists) {
      console.log("ℹ️  Admin déjà existant — aucune action.");
      return mongoose.connection.close();
    }

    const hashed = await bcrypt.hash("Admin@2026!", 12);
    await User.create({
      name:     "Super Admin",
      email:    "admin@darhotes.tn",
      password: hashed,
      phone:    "70000000",
      role:     "admin"
    });

    console.log(" Admin créé avec succès !");
    console.log("   Email    → admin@darhotes.tn");
    console.log("   Password → Admin@2026!");
    mongoose.connection.close();

  } catch (err) {
    console.error(" Erreur :", err.message);
    mongoose.connection.close();
  }
};

seedAdmin();