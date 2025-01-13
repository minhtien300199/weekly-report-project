const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { decodeToken } = require('../utils/tokenUtil');

class AuthController {
    generateToken(user) {
        return jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    setTokenCookie(res, token) {
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
    }

    showLogin = async (req, res) => {
        res.render('auth/login', { layout: 'auth' });
    }

    login = async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ where: { username } });

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }

            const token = this.generateToken(user);
            this.setTokenCookie(res, token);

            res.json({ success: true });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Login failed'
            });
        }
    }

    logout = async (req, res) => {
        res.clearCookie('token');
        res.redirect('/login');
    }

    // Utility method to get current user from token
    static getCurrentUser(req) {
        const token = req.cookies.token;
        return token ? decodeToken(token) : null;
    }
}

module.exports = new AuthController(); 