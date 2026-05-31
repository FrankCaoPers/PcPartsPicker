const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.cookies.session_id;
    
    if (!token) {
        return res.status(401).json({ error: "Not logged in" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.userId = decoded.userId;
        
        next();
        
    } catch (err) {
        console.error("JWT Verification failed:", err.message);
        return res.status(403).json({ error: "Session expired or invalid token" });
    }
}

module.exports = authenticateToken;
