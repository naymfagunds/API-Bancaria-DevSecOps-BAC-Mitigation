

const express = require('express');
const { validarCrachaDeAcesso } = require('./security_modules/auth'); 
const transacaoRoutes = require('./routes/transacao'); // O módulo de rotas

const app = express();
// ... (setup do express e body-parser)

// [...] Rota de LOGIN (Onde GERA o JWT)

// ROTA PROTEGIDA (Onde a mágica acontece!)
// O 'validarCrachaDeAcesso' age como um guarda antes do 'transacaoRoutes'
app.use('/api', validarCrachaDeAcesso, transacaoRoutes); 

// INICIA O SERVIDOR

// ... app.listen(...)
