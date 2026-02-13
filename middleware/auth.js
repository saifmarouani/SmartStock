const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // 1. Get the token from the header (the digital ID card)
    const token = req.header('x-auth-token');

    // 2. Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. Verify token
    try {
        const decoded = jwt.verify(token, 'secret_token_123'); // Must match the secret in routes/auth.js
        req.user = decoded.user;
        next(); // Move on to the next step
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};