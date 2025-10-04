const express = require('express');
const router = express.Router();

// 🚨 IMPORTAÇÃO DO GUARDA-COSTAS: Importa o Middleware Zero-Trust 
// Certifique-se de que o caminho está correto para o seu arquivo auth.js
const ensureIdentityFromToken = require('../security_modules/security_middleware/auth'); 

// Rota crítica de transferência (EXIGE SEGURANÇA MÁXIMA)
router.post('/transferir', 
    ensureIdentityFromToken, // <-- AQUI! O Middleware é aplicado antes de tudo.
    (req, res) => {
        
        // 🚨 A PROVA DE FOGO (Mitigação de BAC): 
        // Usa o nome de usuário SEGURO (extraído do Token pelo Middleware).
        const remetenteSeguro = req.user.username; 
        
        // Dados de transferência (esses podem vir do body, pois não definem a identidade)
        const valor = req.body.valor; 
        const destino = req.body.destino;
        
        // [Aqui viria a LÓGICA DE NEGÓCIO para transferir o dinheiro no banco de dados]
        // Se o remetenteSeguro não for dono da conta, a transferência falhará.
        
        if (!valor || !destino) {
            return res.status(400).json({ message: "Dados de transferência incompletos." });
        }
        
        console.log(`Tentativa de transferência de ${remetenteSeguro} para ${destino} no valor de ${valor}`);

        // Retorna um status 200 para sucesso (exemplo)
        return res.status(200).json({ 
            message: "Transação processada com sucesso (Zero-Trust aplicado).", 
            de: remetenteSeguro, 
            para: destino, 
            valor: valor 
        });
    }
);

module.exports = router;
