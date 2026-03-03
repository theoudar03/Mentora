const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { id_num, name, password, role, department } = req.body;
    
    if (!id_num || !name || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ id_num });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      id_num,
      name,
      password,
      role,
      department
    });
    
    // We don't necessarily log them in via cookie here, but we can.
    // Let's just return success for registration.
    res.status(201).json({
      message: 'User created successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { id_num, password } = req.body;
    
    console.log(`Login attempt: ${id_num}`);

    if (!id_num || !password) {
      return res.status(400).json({ message: 'Please provide ID Number and password' });
    }

    const user = await User.findOne({ id_num });
    console.log(`User found: ${user ? 'yes' : 'no'}`);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid ID Number or password' });
    }
    
    const isMatch = await user.matchPassword(password);
    console.log(`Password match: ${isMatch ? 'true' : 'false'}`);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid ID Number or password' });
    }

    const jwtToken = generateToken(user._id);

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      name: user.name,
      role: user.role,
      department: user.department
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

exports.logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json({
        id_num: user.id_num,
        name: user.name,
        role: user.role,
        department: user.department,
        ref_id: user.ref_id
      });
    } else {
      res.status(401).json({ message: 'User not found in database' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Server error retrieving profile' });
  }
};
