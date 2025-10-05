const jwt = require('jsonwebtoken');
require('dotenv').config();

// Chave secreta que deve ser a mesma usada para assinar o JWT no server.js
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_forte'; 

/**
 * Middleware para validar o JWT (Zero-Trust) e injetar a identidade do usuário na requisição.
 * Mitiga Broken Access Control (BAC) ao garantir que a identidade do usuário seja extraída
 * de uma fonte CONFIÁVEL (o token assinado) e não do corpo da requisição.
 */
const validarCrachaDeAcesso = (req, res, next) => {
    // 1. Pega o token do header 'Authorization'
    const authHeader = req.headers['authorization'];
    
    // Formato esperado: "Bearer [TOKEN]"
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        console.warn(`[DEFESA BAC] Acesso negado: Token ausente.`);
        return res.status(401).json({ message: 'Acesso negado. Token de acesso JWT necessário.' });
    }

    // 2. Verifica e decodifica o token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error(`[DEFESA BAC] Falha na verificação do token: ${err.message}`);
            // Token expirado, inválido, etc.
            return res.status(403).json({ message: 'Token de acesso inválido ou expirado.' });
        }
        
        // 3. Sucesso: Injeta o payload do usuário (identidade confiável) na requisição
        req.user = user; 
        console.log(`[DEFESA BAC] Acesso concedido para User ID: ${user.id}`);
        
        // Continua para o próximo middleware ou manipulador de rota
        next(); 
    });
};

module.exports = validarCrachaDeAcesso;
