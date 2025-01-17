const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.token;

        if (!token) {
            return res.redirect('/login');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            res.locals.user = {
                username: decoded.username
            };

            next();
        } catch (tokenError) {
            console.error('Invalid token:', tokenError);
            res.clearCookie('token');
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

// Add a middleware to check if user is already logged in
const redirectIfAuthenticated = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            return res.redirect('/');
        } catch (error) {
            res.clearCookie('token');
        }
    }
    next();
};

module.exports = { auth, redirectIfAuthenticated }; 