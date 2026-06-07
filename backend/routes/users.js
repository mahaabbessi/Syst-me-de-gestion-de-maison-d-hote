const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, phone, role });
        await user.save();
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, 
            process.env.SECRET_KEY,
            { expiresIn: "7d" }
        );
        res.status(201).json({ user, token, role: user.role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Route /login (existante)
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }
        
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, 
            process.env.SECRET_KEY,
            { expiresIn: "7d" }
        );
        
        res.json({ 
            message: "Connecté ✅", 
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token, 
            role: user.role 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ AJOUTEZ CETTE ROUTE POUR /signin
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }
        
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, 
            process.env.SECRET_KEY,
            { expiresIn: "7d" }
        );
        
        res.json({ 
            message: "Connecté ✅", 
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token, 
            role: user.role 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;