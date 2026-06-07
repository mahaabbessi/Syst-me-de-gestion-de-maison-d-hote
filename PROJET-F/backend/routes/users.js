const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");

// ───── REGISTER ─────
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone, role } = req.body;

        // 1. Champs obligatoires
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "Tous les champs obligatoires sont requis" });
        }

        // 2. Format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Format email invalide" });
        }

        // 3. Mot de passe fort
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Min 8 caractères, une majuscule et un chiffre"
            });
        }

        // 4. Confirmation mot de passe
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Les mots de passe ne correspondent pas" });
        }

        // 5. Email déjà utilisé ?
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        // 6. Chiffrer le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // 7. Créer l'utilisateur
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone: phone || null,
            role: role || "client"
        });
        await newUser.save();

        // 8. Générer le token
        const token = jwt.sign(
            { email, id: newUser._id, role: newUser.role },
            process.env.SECRET_KEY,
            { expiresIn: "1w" }
        );

        res.status(201).json({
            message: "Compte créé ✅",
            user: newUser,
            token
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ───── SIGNIN ─────
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }

        // 2. Chercher l'utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }

        // 3. Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }

        // 4. Générer le token
        const token = jwt.sign(
            { email, id: user._id, role: user.role },
            process.env.SECRET_KEY,
            { expiresIn: "1w" }
        );

        res.status(200).json({
            message: "Connecté ✅",
            user,
            token,
            role: user.role
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ───── GET PROFIL (protégé) ─────
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ───── GET USER BY ID (protégé) ─────
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;