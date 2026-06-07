const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

app.use(express.json());
app.use(cors());
connectDB();

app.use("/api/users", require("./routes/users"));  // ← ceci appelle votre fichier users.js
app.use("/api/maisons", require("./routes/maison"));
app.use("/api/chambres", require("./routes/chambreRoutes"));
app.use("/api/reservations", require("./routes/reservationRoutes"));

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

app.get("/api/test", (req, res) => {
    res.json({ message: "API fonctionne !" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT} 🚀`);
});