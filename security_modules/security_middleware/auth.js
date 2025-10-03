
const jwt = require('jsonwebtoken');

// IMPORTANTE: A CHAVE SECRETA DEVE VIR DE VARIÁVEIS DE AMBIENTE (.env)!
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_forte'; 

/**
 * Middleware Zero-Trust para Broken Access Control (BAC):
 * Garante que a identidade do usuário seja extraída APENAS do Token JWT.
 * Ignora e anula qualquer tentativa de forjar o ID pelo req.body.
 */
const ensureIdentityFromToken = (req, res, next) => {
    // Tenta extrair o token do Header 'Authorization'
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Encerra: 401 Unauthorized
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' }); 
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verifica o token usando a chave secreta
        const decoded = jwt.verify(token, JWT_SECRET);

        // INJEÇÃO ZERO-TRUST: Usa a identidade segura do token.
        // O código da rota deve USAR APENAS req.user.username.
        req.user = { 
            id: decoded.id,
            username: decoded.username 
        };

        next(); // Continua para a lógica de negócio

    } catch (error) {
        // Encerra: 401 Unauthorized (Token inválido ou expirado)
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};

module.exports = ensureIdentityFromToken;
