const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Check for token in cookies first
        const token = req.cookies.token;

        // If no token in cookies, check Authorization header as fallback
        if (!token) {
            console.log('No token found in cookies, redirecting to login');
            return res.redirect('/login');
        }

        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Add user info to locals for use in views
            res.locals.user = {
                username: decoded.username
            };

            next();
        } catch (tokenError) {
            console.log('Invalid token, clearing and redirecting to login');
            res.clearCookie('token');
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.clearCookie('token');
        res.redirect('/login');
    }
};

// Add a middleware to check if user is already logged in
const redirectIfAuthenticated = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            // If token is valid, redirect to home
            return res.redirect('/');
        } catch (error) {
            // If token is invalid, clear it and continue
            res.clearCookie('token');
        }
    }
    next();
};

module.exports = { auth, redirectIfAuthenticated }; 