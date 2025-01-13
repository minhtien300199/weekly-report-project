const jwt = require('jsonwebtoken');

const decodeToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('Token decode error:', error);
        return null;
    }
};

module.exports = { decodeToken }; 