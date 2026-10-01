// ==========================================
// validation.js - VALIDAÇÃO INLINE DE FORMULÁRIOS
// ==========================================

/**
 * Validadores inline para formulários
 * Fornece feedback em tempo real enquanto o usuário digita
 */

// ==========================================
// VALIDADORES DE FORMATO
// ==========================================

/**
 * Valida formato de email
 * @param {string} email 
 * @returns {boolean}
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida CNPJ (apenas formato e dígitos verificadores)
 * @param {string} cnpj - CNPJ com ou sem formatação
 * @returns {boolean}
 */
function validarCNPJ(cnpj) {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;
    
    // Valida se não é sequência repetida
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validação dos dígitos verificadores
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
    
    return true;
}

/**
 * Valida telefone brasileiro (formatos aceitos: (99) 99999-9999 ou (99) 9999-9999)
 * @param {string} telefone 
 * @returns {boolean}
 */
function validarTelefone(telefone) {
    const regex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
    return regex.test(telefone);
}

/**
 * Valida senha (mínimo 6 caracteres)
 * @param {string} senha 
 * @returns {object} - {valido: boolean, mensagem: string}
 */
function validarSenha(senha) {
    if (!senha || senha.length < 6) {
        return { valido: false, mensagem: 'A senha deve ter pelo menos 6 caracteres' };
    }
    
    // Força da senha
    let forca = 0;
    if (senha.length >= 8) forca++;
    if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) forca++; // Maiúsculas e minúsculas
    if (/\d/.test(senha)) forca++; // Números
    if (/[!@#$%^&*(),.?":{}|<>]/.test(senha)) forca++; // Caracteres especiais
    
    let mensagemForca = '';
    if (forca <= 1) mensagemForca = ' (Fraca)';
    else if (forca === 2) mensagemForca = ' (Média)';
    else if (forca >= 3) mensagemForca = ' (Forte)';
    
    return { valido: true, mensagem: 'Senha válida' + mensagemForca, forca };
}

/**
 * Valida nome (mínimo 3 caracteres)
 * @param {string} nome 
 * @returns {boolean}
 */
function validarNome(nome) {
    return nome && nome.trim().length >= 3;
}

// ==========================================
// FORMATADORES
// ==========================================

/**
 * Formata CNPJ enquanto digita: 99.999.999/9999-99
 * @param {string} value 
 * @returns {string}
 */
function formatarCNPJ(value) {
    value = value.replace(/\D/g, ''); // Remove não-dígitos
    value = value.substring(0, 14); // Limita a 14 dígitos
    
    if (value.length <= 2) return value;
    if (value.length <= 5) return value.replace(/(\d{2})(\d{1,3})/, '$1.$2');
    if (value.length <= 8) return value.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
    if (value.length <= 12) return value.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
    return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata telefone enquanto digita: (99) 99999-9999
 * @param {string} value 
 * @returns {string}
 */
function formatarTelefone(value) {
    value = value.replace(/\D/g, '');
    value = value.substring(0, 11);
    
    if (value.length <= 2) return value;
    if (value.length <= 6) return value.replace(/(\d{2})(\d{1,4})/, '($1) $2');
    if (value.length <= 10) return value.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
    return value.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
}

// ==========================================
// FEEDBACK VISUAL
// ==========================================

/**
 * Mostra feedback visual em campo de input
 * @param {HTMLElement} inputElement 
 * @param {boolean} isValid 
 * @param {string} mensagem 
 */
function mostrarFeedback(inputElement, isValid, mensagem) {
    // Remove classes antigas
    inputElement.classList.remove('input-error', 'input-success');
    
    // Adiciona classe apropriada
    if (isValid) {
        inputElement.classList.add('input-success');
    } else {
        inputElement.classList.add('input-error');
    }
    
    // Procura ou cria elemento de feedback
    let feedbackElement = inputElement.parentElement.querySelector('.validation-feedback');
    
    if (!feedbackElement) {
        feedbackElement = document.createElement('div');
        feedbackElement.className = 'validation-feedback';
        inputElement.parentElement.appendChild(feedbackElement);
    }
    
    feedbackElement.textContent = mensagem;
    feedbackElement.className = `validation-feedback ${isValid ? 'success' : 'error'}`;
}

/**
 * Limpa feedback visual
 * @param {HTMLElement} inputElement 
 */
function limparFeedback(inputElement) {
    inputElement.classList.remove('input-error', 'input-success');
    const feedbackElement = inputElement.parentElement.querySelector('.validation-feedback');
    if (feedbackElement) {
        feedbackElement.remove();
    }
}

// ==========================================
// CONFIGURADORES DE VALIDAÇÃO INLINE
// ==========================================

/**
 * Configura validação inline para campo de email
 * @param {string} inputId 
 */
function configurarValidacaoEmail(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    input.addEventListener('blur', () => {
        const email = input.value.trim();
        if (!email) {
            limparFeedback(input);
            return;
        }
        
        const isValid = validarEmail(email);
        mostrarFeedback(
            input,
            isValid,
            isValid ? '✓ Email válido' : '✗ Formato de email inválido'
        );
    });
    
    input.addEventListener('input', () => {
        if (input.classList.contains('input-error') || input.classList.contains('input-success')) {
            const email = input.value.trim();
            if (email) {
                const isValid = validarEmail(email);
                mostrarFeedback(
                    input,
                    isValid,
                    isValid ? '✓ Email válido' : '✗ Formato de email inválido'
                );
            }
        }
    });
}

/**
 * Configura validação inline para campo de CNPJ com formatação automática
 * @param {string} inputId 
 */
function configurarValidacaoCNPJ(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // Formata enquanto digita
    input.addEventListener('input', (e) => {
        const cursorPos = e.target.selectionStart;
        const oldLength = e.target.value.length;
        e.target.value = formatarCNPJ(e.target.value);
        const newLength = e.target.value.length;
        
        // Ajusta posição do cursor após formatação
        e.target.setSelectionRange(cursorPos + (newLength - oldLength), cursorPos + (newLength - oldLength));
    });
    
    // Valida ao perder foco
    input.addEventListener('blur', () => {
        const cnpj = input.value.trim();
        if (!cnpj) {
            limparFeedback(input);
            return;
        }
        
        const isValid = validarCNPJ(cnpj);
        mostrarFeedback(
            input,
            isValid,
            isValid ? '✓ CNPJ válido' : '✗ CNPJ inválido'
        );
    });
}

/**
 * Configura validação inline para campo de senha com indicador de força
 * @param {string} inputId 
 */
function configurarValidacaoSenha(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    input.addEventListener('input', () => {
        const senha = input.value;
        if (!senha) {
            limparFeedback(input);
            return;
        }
        
        const resultado = validarSenha(senha);
        mostrarFeedback(input, resultado.valido, resultado.mensagem);
    });
}

/**
 * Configura validação de confirmação de senha
 * @param {string} senhaId 
 * @param {string} confirmacaoId 
 */
function configurarValidacaoConfirmacaoSenha(senhaId, confirmacaoId) {
    const inputSenha = document.getElementById(senhaId);
    const inputConfirmacao = document.getElementById(confirmacaoId);
    
    if (!inputSenha || !inputConfirmacao) return;
    
    const validar = () => {
        const senha = inputSenha.value;
        const confirmacao = inputConfirmacao.value;
        
        if (!confirmacao) {
            limparFeedback(inputConfirmacao);
            return;
        }
        
        const isValid = senha === confirmacao;
        mostrarFeedback(
            inputConfirmacao,
            isValid,
            isValid ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'
        );
    };
    
    inputConfirmacao.addEventListener('input', validar);
    inputSenha.addEventListener('input', () => {
        if (inputConfirmacao.value) validar();
    });
}

/**
 * Configura validação inline para campo de nome
 * @param {string} inputId 
 */
function configurarValidacaoNome(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    input.addEventListener('blur', () => {
        const nome = input.value.trim();
        if (!nome) {
            limparFeedback(input);
            return;
        }
        
        const isValid = validarNome(nome);
        mostrarFeedback(
            input,
            isValid,
            isValid ? '✓ Nome válido' : '✗ Nome deve ter pelo menos 3 caracteres'
        );
    });
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

/**
 * Inicializa todas as validações inline no carregamento da página
 */
function inicializarValidacoes() {
    // Formulário de cadastro
    configurarValidacaoNome('nomeRegistro');
    configurarValidacaoEmail('emailRegistro');
    configurarValidacaoSenha('senhaRegistro');
    configurarValidacaoConfirmacaoSenha('senhaRegistro', 'senhaRegistroConfirmar');
    configurarValidacaoCNPJ('cnpjEmpresa');
    
    // Formulário de login
    configurarValidacaoEmail('emailLogin');
    
    console.log('✓ Validações inline inicializadas');
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarValidacoes);
} else {
    inicializarValidacoes();
}
