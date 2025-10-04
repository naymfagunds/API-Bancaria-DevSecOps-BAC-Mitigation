// security_modules/security_middleware/auth.js

const jwt = require('jsonwebtoken');

// A CHAVE SECRETA DEVE VIR DE VARIÁVEIS DE AMBIENTE (.env)!
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_forte'; 

/**
 * Middleware Zero-Trust:
 * Garante que a identidade seja extraída SOMENTE do Token JWT.
 */
const ensureIdentityFromToken = (req, res, next) => {
    // 1. Tenta extrair o token do Header 'Authorization'
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // 401 Unauthorized
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' }); 
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. Verifica o token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. INJEÇÃO ZERO-TRUST: Armazena a identidade segura para uso na rota.
        req.user = { 
            id: decoded.id,
            username: decoded.username 
        };

        next();

    } catch (error) {
        // 401 Unauthorized (Token inválido ou expirado)
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};

module.exports = ensureIdentityFromToken;