const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

class AuthController {
    showLogin(req, res) {
        res.render('auth/login', { layout: 'auth' });
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
                maxAge: remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 7 days if remember, else 24 hours
            };

            res.cookie('token', token, cookieOptions);

            console.log('Login successful for user:', username);
            res.json({ success: true });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, error: 'Login failed' });
        }
    }

    logout(req, res) {
        res.clearCookie('token');
        res.redirect('/login');
    }
}

module.exports = new AuthController(); 