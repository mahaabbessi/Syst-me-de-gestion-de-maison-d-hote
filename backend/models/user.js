const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  role: { type: String, enum: ["client", "owner", "admin"], default: "client" },
  createdAt: { type: Date, default: Date.now }
});

// ⚠️ COMMENTEZ ou SUPPRIMEZ ce middleware
// Le hash est déjà fait dans la route /register
// userSchema.pre("save", async function(next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// Compare password method (gardez cette méthode)
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);