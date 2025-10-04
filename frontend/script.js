/**
 * ARQUIVO: script.js
 * FUNÇÃO: Lógica do Front-end para Login, Saldo, Transferência e Navegação.
 * PORTA: Configurado para interagir com o Back-end na porta 3000.
 */

// URL base da API
const API_BASE_URL = 'http://localhost:3000/api'; 

// Armazena os dados do usuário logado (username, nome, saldo, etc.)
let currentUser = null;

// =========================================================
// 1. FUNÇÕES DE NAVEGAÇÃO E UTILS
// =========================================================

/**
 * Exibe uma mensagem flutuante de status.
 * @param {string} message A mensagem a ser exibida.
 * @param {string} type O tipo de mensagem ('success' ou 'error').
 */
function showStatusMessage(message, type) {
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');

    if (!messageBox || !messageText) return;

    messageText.textContent = message;
    messageBox.className = `message-box ${type}`; // Define a cor/estilo
    messageBox.style.display = 'flex';

    // Esconde a mensagem após 4 segundos
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 4000);
}

/**
 * Formata um valor numérico para o formato de moeda brasileira (R$).
 * @param {number} value O valor a ser formatado.
 * @returns {string} O valor formatado.
 */
function formatCurrency(value) {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Atualiza o Dashboard com os dados do usuário.
 */
function updateDashboardUI() {
    if (!currentUser) return; // Se não houver usuário logado, para.

    const nomeUsuarioEl = document.getElementById('nome-usuario');
    const valorSaldoEl = document.getElementById('valor-saldo');

    if (nomeUsuarioEl) {
        nomeUsuarioEl.textContent = currentUser.nome;
    }
    if (valorSaldoEl) {
        valorSaldoEl.textContent = formatCurrency(currentUser.saldo);
    }
}

// =========================================================
// 2. LÓGICA DE LOGIN (CORREÇÃO APLICADA AQUI)
// =========================================================

/**
 * Manipula a submissão do formulário de login.
 * @param {Event} e O evento de submissão do formulário.
 */
async function handleLoginSubmit(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const messageLogin = document.getElementById('login-message');
    
    // Verifica se os elementos existem antes de tentar acessar suas propriedades
    if (!usernameInput || !passwordInput || !messageLogin) {
        console.error("Elementos de login não encontrados.");
        showStatusMessage('Erro: Elementos da tela de login ausentes.', 'error');
        return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    messageLogin.textContent = 'Verificando...';

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();

        // Se o servidor responde com status 200 (Sucesso) E nos devolve os dados do usuário.
        if (response.ok && data.userData) {
            currentUser = data.userData;
            messageLogin.textContent = '';
            // AQUI FORÇAMOS A NAVEGAÇÃO APÓS O LOGIN BEM-SUCEDIDO
            window.location.href = `/painel.html?username=${currentUser.username}`;
            return;
        } else {
            // Falha: o servidor devolveu um erro (ex: 401) ou não mandou os dados.
            messageLogin.textContent = `Falha no Login: ${data.message || 'Credenciais inválidas.'}`;
            showStatusMessage(`Falha no Login.`, 'error');
        }

    } catch (error) {
        console.error('Erro de conexão:', error);
        messageLogin.textContent = 'Erro de conexão com o servidor. Tente novamente.';
        showStatusMessage('Erro de rede.', 'error');
    }
}

// =========================================================
// 3. LÓGICA DO PAINEL DE CONTROLE
// =========================================================

/**
 * Carrega os dados do usuário do Back-end ao entrar no painel.
 */
async function loadUserData() {
    // 1. Pega o username da URL (ex: ?username=alice)
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    
    if (!username) {
        // Se não houver username, manda de volta para o login
        window.location.href = '/';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/saldo?username=${username}`);
        const data = await response.json();

        if (response.ok) {
            currentUser = data.userData;
            updateDashboardUI(); // Atualiza a interface
        } else {
            showStatusMessage(`Erro ao carregar saldo: ${data.message}`, 'error');
            // Opcional: Deslogar se o usuário for inválido
            setTimeout(() => window.location.href = '/', 2000); 
        }

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showStatusMessage('Erro de rede ao carregar o painel.', 'error');
    }
}

/**
 * Manipula a submissão do formulário de transferência.
 * @param {Event} e O evento de submissão do formulário.
 */
async function handleTransferSubmit(e) {
    e.preventDefault();

    if (!currentUser) {
        showStatusMessage('Erro: Nenhum usuário logado.', 'error');
        return;
    }
    
    const destinatarioInput = document.getElementById('destinatario');
    const valorInput = document.getElementById('valor-transferencia');
    
    if (!destinatarioInput || !valorInput) {
        showStatusMessage('Erro: Elementos do formulário de transferência ausentes.', 'error');
        return;
    }

    const destinatario = destinatarioInput.value;
    const valor = valorInput.value;

    showStatusMessage('Processando transferência...', 'success'); // Exibe mensagem temporária

    try {
        const response = await fetch(`${API_BASE_URL}/transferir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: currentUser.username,
                destinatario,
                valor
            })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.userData; // Atualiza o objeto global com o novo saldo
            updateDashboardUI(); // Atualiza a tela
            destinatarioInput.value = ''; // Limpa campos
            valorInput.value = '';
            showStatusMessage('Transferência realizada com sucesso!', 'success');
        } else {
            showStatusMessage(`Falha na transferência: ${data.message}`, 'error');
        }

    } catch (error) {
        console.error('Erro de conexão na transferência:', error);
        showStatusMessage('Erro de rede na transferência. Tente novamente.', 'error');
    }
}

/**
 * Função de Logout
 */
function handleLogout() {
    currentUser = null;
    // Remove o username da URL e volta para o login
    window.location.href = '/'; 
}


// =========================================================
// 4. INICIALIZAÇÃO DA APLICAÇÃO
// =========================================================

/**
 * Configura os listeners de eventos quando o DOM é totalmente carregado.
 */
function initializeApp() {
    const loginForm = document.getElementById('login-form');
    const transferForm = document.getElementById('transfer-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Inicialização da Tela de Login
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // Inicialização da Tela do Painel
    // Esta lógica só deve rodar se estivermos na página do painel
    if (transferForm) {
        loadUserData(); // Carrega os dados ao entrar no Painel
        transferForm.addEventListener('submit', handleTransferSubmit);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Garante que a inicialização ocorra quando a página estiver totalmente carregada.
document.addEventListener('DOMContentLoaded', initializeApp);
