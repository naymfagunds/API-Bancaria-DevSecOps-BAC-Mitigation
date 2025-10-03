// server.js (O ARQUIVO DEVE FICAR BEM MAIS LIMPO AGORA)

const express = require('express');
// ... (outros imports)
const { validarCrachaDeAcesso } = require('./security_modules/auth'); 
const transacaoRoutes = require('./routes/transacao'); // O módulo de rotas

const app = express();
// ... (setup do express e body-parser)

// [...] Rota de LOGIN (Onde GERA o JWT) - Mantenha aqui por enquanto

// ROTA PROTEGIDA (Onde a mágica acontece!)
// O 'validarCrachaDeAcesso' age como um guarda antes do 'transacaoRoutes'
app.use('/api', validarCrachaDeAcesso, transacaoRoutes); 
// NOTE: Se você usar app.use, o 'transferir' já vai ser encontrado dentro do 'transacaoRoutes'

// INICIA O SERVIDOR
// ... app.listen(...)