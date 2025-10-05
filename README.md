API Bancária Segura: Mitigação de Broken Access Control (BAC)
🛡️ Visão Geral do Projeto (DevSecOps)
Este projeto demonstra a implementação de um Zero-Trust Middleware em uma API crítica de transferência bancária para mitigar a vulnerabilidade Broken Access Control (BAC), classificada como crítica no OWASP Top 10.

O objetivo foi proteger um endpoint sensível contra a manipulação de IDs de usuário (IDOR), garantindo que apenas a identidade autenticada e autorizada pelo token JWT possa executar a transação.

🚩 A Vulnerabilidade (BAC)
A API original permitia que o usuário enviasse o userId no corpo da requisição POST ({ "amount": 100, "userId": "hacker-444" }).

Risco: Um invasor com um token JWT válido (logado com sua própria conta) poderia manipular este campo para realizar uma ação (transferência, consulta de saldo) na conta de outra pessoa.

✅ A Solução (Zero-Trust Middleware)
Foi implementada uma arquitetura de segurança que segue o princípio Zero Trust: Nunca Confie, Sempre Verifique.

Middleware de Autenticação (auth.js): Valida a integridade do token JWT.

Extração de Identidade Segura: O middleware extrai o ID de usuário (12345) diretamente do payload do token (a fonte mais confiável) e o armazena em req.user.id.

Reforço na Rota (/api/transferir): A lógica da rota de transferência foi alterada para ignorar qualquer ID de usuário fornecido pelo corpo (body) da requisição e utilizar APENAS o ID injetado pelo middleware (req.user.id).

// Exemplo de como o backend garante a segurança
app.post('/api/transferir', validarCrachaDeAcesso, (req, res) => {
    // ESTA LINHA É A CHAVE DA MITIGAÇÃO BAC:
    const userIdSeguro = req.user.id; // ID 100% confiável, extraído do token.

    // O servidor IGNORA completamente req.body.attemptedUserId (o ID de ataque)
    
    // ... lógica de transação usa userIdSeguro ...
});

🚀 Como Executar e Testar (DevSecOps Proof)
Pré-requisitos
Node.js (v18+)

npm (Gerenciador de pacotes)

Cliente HTTP (Insomnia ou Postman)

Instalação
# Clone o repositório
git clone [https://github.com/naymfagunds/API-Bancaria-DevSecOps-BAC-Mitigation.git](https://github.com/naymfagunds/API-Bancaria-DevSecOps-BAC-Mitigation.git)
cd API-Bancaria-DevSecOps-BAC-Mitigation

# Instale as dependências
npm install

# Inicie o servidor
node server.js

Teste de Mitigação (Prova de Segurança)
Para comprovar a mitigação, siga o teste de invasão:

Obter Token Válido (Identidade: 12345)

POST http://localhost:5000/login

Body: { "username": "user-seguro" }

Resultado: Copie o JWT gerado.

Tentar Ataque BAC (Transação)

POST http://localhost:5000/api/transferir

Header: Authorization: Bearer [Seu Token do Passo 1]

Body (Tentativa de Ataque):

{
  "amount": 50.00,
  "recipientId": "Conta-Alvo-A-Ser-Invadida",
  "attemptedUserId": "99999" 
  // O VALOR "99999" SERÁ IGNORADO PELO MIDDLEWARE!
}

Resultado Esperado (Mitigado)
A resposta do servidor deve confirmar que a transação foi executada apenas pelo ID confiável (12345), e não pelo ID de ataque (99999).

{
  "status": "Transação bem-sucedida (Mitigação BAC ON)",
  "executed_by_id": "12345", 
  "risk_audit": "BAC Mitigated: Identity verified via Zero-Trust Middleware."
}
