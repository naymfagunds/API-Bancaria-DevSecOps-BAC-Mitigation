const express = require('express');
const bodyParser = require('body-parser'); 
const jwt = require('jsonwebtoken'); // Adiciona import do JWT aqui
require('dotenv').config();

// IMPORTAÇÕES
const validarCrachaDeAcesso = require('./security_modules/security_middleware/auth'); 
// A linha abaixo foi COMENTADA para eliminar conflitos e injetar a rota no server.js:
// const transacaoRoutes = require('./rotas-seguras'); 

// ----------------------------------------------------
// DEFINIÇÃO DO EXPRESS (CRÍTICO: DEVE VIR ANTES DAS ROTAS)
// ----------------------------------------------------
const app = express();
// SETUP: Express e Body-parser
app.use(express.json());
app.use(bodyParser.json());


// --- ROTAS NÃO PROTEGIDAS ---

// Rota de LOGIN (Gera o JWT - Mockup)
app.post('/login', (req, res) => {
    // Atenção: Use uma chave secreta real em produção!
    const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_forte'; 

    const userPayload = {
        id: '12345',
        username: req.body.username || 'user-seguro'
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, message: "Token de acesso gerado com sucesso." });
});


// --- ROTAS PROTEGIDAS (MITIGAÇÃO BAC) ---

// ROTA PROTEGIDA COM O MIDDLEWARE DE DEFESA BAC
// O Middleware 'validarCrachaDeAcesso' age antes do manipulador de rota.
app.post('/api/transferir', validarCrachaDeAcesso, (req, res) => {
    // 1. DADO CONFIÁVEL: Pega a identidade do usuário do JWT (injetado pelo Middleware)
    const secureUserId = req.user.id; 
    
    // 2. DADO NÃO CONFIÁVEL: Pega dados do Body (e ignora qualquer ID de usuário malicioso).
    const { amount, recipientId, attemptedUserId } = req.body; 

    // 3. ENFORCEMENT BAC: Validação básica
    if (!amount || !recipientId) {
        return res.status(400).json({ message: "É necessário fornecer a quantia e o destinatário." });
    }

    // Lógica da Transação (Mockup)
    console.log(`[LOG SEGURO] Transação iniciada por User ID Confiável: ${secureUserId}`);
    
    res.json({ 
        status: "Transação bem-sucedida (Mitigação BAC ON)",
        message: `Transferência de R$ ${amount} para ${recipientId} processada com sucesso.`,
        executed_by_id: secureUserId,
        risk_audit: "BAC Mitigated: Identity verified via Zero-Trust Middleware."
    });
});


// --- INICIA O SERVIDOR ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\nServidor de Defesa Zero-Trust rodando na porta ${PORT}`);
    console.log(`1. Acesse: http://localhost:${PORT}/login (POST) para gerar o token.`);
    console.log(`2. Use o token em http://localhost:${PORT}/api/transferir (POST) para testar a defesa BAC.`);
    console.log(`\n========================================================================\n`);
});
