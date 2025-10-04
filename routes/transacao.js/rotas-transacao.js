// routes/transacao.js
const express = require('express');
const router = express.Router();

// ----------------------------------------------------------------------
// ROTA PROTEGIDA DE MITIGAÇÃO BAC (Broken Access Control)
// Esta rota JÁ é protegida pelo Middleware em server.js
// Aqui, o 'req.user.id' já está INJETADO e é CONFIÁVEL (Zero-Trust)
// ----------------------------------------------------------------------

router.post('/transferir', (req, res) => {
    // 1. DADO CONFIÁVEL: Pega a identidade do usuário do JWT (injetado pelo Middleware)
    const secureUserId = req.user.id; 
    
    // 2. DADO NÃO CONFIÁVEL: Pega a quantia e o destinatário do Body (do cliente)
    const { amount, recipientId, attemptedUserId } = req.body; 

    // 3. ENFORCEMENT BAC (A Defesa):
    // Garante que o ID do usuário (vindo do token) seja usado na transação.
    // Qualquer tentativa de usar o 'attemptedUserId' do body é IGNORADA.

    if (!amount || !recipientId) {
        return res.status(400).json({ message: "É necessário fornecer a quantia e o destinatário." });
    }

    // 4. Lógica da Transação (Mockup)
    
    // A transação é executada na conta do secureUserId (o usuário REAL do token).
    console.log(`[LOG SEGURO] Transação iniciada por User ID Confiável: ${secureUserId}`);
    
    res.json({ 
        status: "Transação bem-sucedida (Mitigação BAC ON)",
        message: `Transferência de R$ ${amount} para ${recipientId} processada com sucesso.`,
        executed_by_id: secureUserId,
        risk_audit: "BAC Mitigated: Identity verified via Zero-Trust Middleware."
    });
});

module.exports = router;
