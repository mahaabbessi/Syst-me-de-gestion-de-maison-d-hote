const jwt = require("jsonwebtoken");
const User = require("../models/user");

const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token manquant" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé - Admin uniquement" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide" });
  }
};

module.exports = isAdmin;