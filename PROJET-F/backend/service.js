const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

// ✅ Middlewares AVANT les routes
app.use(express.json());
app.use(cors());

// ✅ Connexion MongoDB
connectDB();

// ✅ Routes correctes
app.use("/api/users", require("./routes/users"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT} 🚀`);
});
