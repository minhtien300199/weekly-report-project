const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

class AuthController {
    showLogin(req, res) {
        res.render('auth/login', { layout: 'auth' });
    }

    showRegister(req, res) {
        res.render('auth/register', { layout: 'auth' });
    }

    async register(req, res) {
        try {
            console.log('Registration attempt for username:', req.body.username);
            const { username, password, confirmPassword } = req.body;

            // Validate input
            if (!username || !password || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'All fields are required'
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Passwords do not match'
                });
            }

            // Check if username already exists
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Username already exists'
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            const newUser = await User.create({
                username,
                password: hashedPassword
            });

            // Generate JWT token
            const token = jwt.sign(
                { id: newUser.id, username: newUser.username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Set cookie
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                sameSite: 'lax',
                path: '/',
                domain: req.hostname,
            };

            res.cookie('token', token, cookieOptions);
            console.log('Registration successful for user:', username);
            res.json({ success: true });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                error: 'Registration failed'
            });
        }
    }

    async login(req, res) {
        try {
            console.log('Login attempt for username:', req.body.username);
            const { username, password, remember } = req.body;

            const user = await User.findOne({ where: { username } });
            if (!user) {
                console.log('User not found:', username);
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                console.log('Invalid password for user:', username);
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
                sameSite: 'lax',
                path: '/',
                domain: req.hostname,
            };

            console.log('Setting cookie with options:', {
                ...cookieOptions,
                hostname: req.hostname,
                originalUrl: req.originalUrl
            });

            res.cookie('token', token, cookieOptions);
            console.log('Login successful for user:', username);
            res.json({ success: true });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, error: 'Login failed' });
        }
    }

    logout(req, res) {
        res.clearCookie('token', {
            path: '/',
            domain: req.hostname,
        });
        res.redirect('/login');
    }
}

module.exports = new AuthController(); 