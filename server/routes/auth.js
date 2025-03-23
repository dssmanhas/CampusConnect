import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email.endsWith('@thapar.edu')) {
      return done(null, false, { message: 'Only @thapar.edu emails are allowed' });
  }
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    console.log(existingUser)
    console.log(email)
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Invalid Credentials' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and send token
    console.log("hello",process.env.JWT_SECRET);  // Check if it prints the secret
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token , user: {
      _id: user._id,
      username: user.username,
      email: user.email
    }});

    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Serv error' });
  }
});

export default router;