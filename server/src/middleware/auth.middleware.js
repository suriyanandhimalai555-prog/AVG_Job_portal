import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (!token) {
            return res.status(403).json({ message: "Access Denied. No token provided." });
        }

        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trimLeft();
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret_key');
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token." });
    }
};