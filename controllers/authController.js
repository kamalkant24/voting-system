const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../utils/hashPassword");




// Register User API
exports.register = async (req, res) => {
  const { name, email, password, walletAddress } = req.body;

  try {
    // Check if the user with this email or wallet address already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ error: "User with this email already exists!" });
    }

    const existingUserByWallet = await User.findOne({ walletAddress });
    if (existingUserByWallet) {
      return res.status(400).json({ error: "User with this wallet address already exists!" });
    }

    // Hash the password before saving
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword, // Storing the hashed password
      walletAddress
    });
    
    await user.save();

    res.status(201).json({ message: "User registered successfully!", user });
  } catch (error) {
    res.status(500).json({ error: "User registration failed", details: error.message });
  }
};


// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined in environment variables");

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};



