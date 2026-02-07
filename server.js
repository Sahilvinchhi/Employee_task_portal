require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { sql, poolPromise } = require('./db');

const app = express();

// In-memory store for refresh tokens (for production, persist in DB)
const refreshTokens = new Set();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

// Registration route
app.post('/api/register', async (req, res) => {
  const {
    fullName,
    dob,
    email,
    contactNumber,
    position,
    gender,
    password,
    confirmPassword,
  } = req.body;

  // Validation
  if (
    !fullName ||
    !dob ||
    !email ||
    !contactNumber ||
    !position ||
    !gender ||
    !password ||
    !confirmPassword
  ) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Password and Confirm Password do not match.',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters.',
    });
  }

  // Validate contact number - exactly 10 digits
  const contactRegex = /^\d{10}$/;
  if (!contactRegex.test(contactNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Contact number must be exactly 10 digits.',
    });
  }

  // Check if all digits are the same (e.g., 9999999999, 0000000000)
  if (/^(\d)\1{9}$/.test(contactNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Contact number cannot contain all same digits.',
    });
  }

  try {
    const pool = await poolPromise;
    if (!pool) {
      console.error('Attempted registration while DB not connected');
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    // Check if email already exists
    const existingUser = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT Id FROM Online_Training_Users1 WHERE Email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Please use a different email or login.',
      });
    }

    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool
      .request()
      .input('fullName', sql.NVarChar, fullName)
      .input('dob', sql.Date, dob)
      .input('email', sql.NVarChar, email)
      .input('contactNumber', sql.NVarChar, contactNumber)
      .input('position', sql.NVarChar, position)
      .input('gender', sql.NVarChar, gender)
      .input('passwordHash', sql.NVarChar, passwordHash)
      .input('role', sql.NVarChar, 'EMPLOYEE')
      .input('isActive', sql.Bit, 1)
      .query(
        `INSERT INTO Online_Training_Users1 
         (FullName, DOB, Email, ContactNumber, Position, Gender, PasswordHash, Role, IsActive, CreatedAt)
         VALUES (@fullName, @dob, @email, @contactNumber, @position, @gender, @passwordHash, @role, @isActive, GETUTCDATE());
         SELECT SCOPE_IDENTITY() AS Id;`
      );

    const userId = result.recordset[0].Id;

    return res.json({
      success: true,
      message: 'Registration successful! You can now login with your email.',
      userId,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
    });
  }

  try {
    const pool = await poolPromise;
    if (!pool) {
      console.error('Attempted login while DB not connected');
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    // Lookup user by email
    const result = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT TOP 1 Id, Email, FullName, Role, IsActive, PasswordHash FROM Online_Training_Users1 WHERE Email = @email');

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.recordset[0];

    if (!user.IsActive) {
      return res.status(403).json({ success: false, message: 'User is not active.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Create JWT tokens
    const accessToken = jwt.sign({ id: user.Id, role: user.Role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.Id, role: user.Role }, process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET + '_rt'), { expiresIn: '7d' });

    // Store refresh token (in-memory). Replace with DB storage in production.
    refreshTokens.add(refreshToken);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: 'Login successful.', user: { Id: user.Id, Email: user.Email, FullName: user.FullName, Role: user.Role }, accessToken });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
});

// Refresh token endpoint
app.post('/api/refresh', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: 'No refresh token provided' });
  if (!refreshTokens.has(token)) return res.status(403).json({ success: false, message: 'Invalid refresh token' });

  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET + '_rt'));
    const accessToken = jwt.sign({ id: payload.id, role: payload.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    return res.json({ success: true, accessToken });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
});

// Logout route
app.post('/api/logout', (req, res) => {
  const token = req.cookies.refreshToken;
  if (token && refreshTokens.has(token)) refreshTokens.delete(token);
  res.clearCookie('refreshToken');
  return res.json({ success: true, message: 'Logged out' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


