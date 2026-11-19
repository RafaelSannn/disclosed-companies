// ==========================================
// script2.js - VERSÃO OOP COM BACKEND FILTER & BCRYPT
// ==========================================

let currentLoggedInUser = null;
let currentChatWith = null;
let chatInterval = null; // Variável global para o motor de atualização do chat

const DEFAULT_PROFILE_IMAGE = 'https://via.placeholder.com/150/007bff/FFFFFF?text=Perfil';
const DEFAULT_COMPANY_IMAGE = 'https://via.placeholder.com/150/28a745/FFFFFF?text=Empresa';

// ==========================================
// 1. CLASSES
// ==========================================
class Usuario {
    constructor(id, nome, email, tipo) {
        this.id = id; this.nome = nome; this.email = email; this.tipo = tipo;
    }
    renderProfile() { console.warn("Implementar nas filhas"); }
}

class Visitante extends Usuario {
    constructor(id, nome, email, profileImage) {
        super(id, nome, email, 'visitante');
        this.profileImage = profileImage || DEFAULT_PROFILE_IMAGE;
    }
    renderProfile() {
        document.getElementById('profileVisitorId').textContent = this.id;
        document.getElementById('profileVisitorEmail').textContent = this.email;
        document.getElementById('editarNomeVisitante').value = this.nome || '';
        document.getElementById('profileVisitorImage').src = this.profileImage;
    }
}

class Empresa extends Usuario {
    constructor(id, nome, email, companyDetails) {
        super(id, nome, email, 'empresa');
        this.companyDetails = {
            name: nome, location: '', category: '', description: '',
            profileImage: DEFAULT_COMPANY_IMAGE, views: 0, images: [], cnpj: '', ...companyDetails
        };
    }
    renderProfile() {
        document.getElementById('profileCompanyId').textContent = this.id;
        document.getElementById('profileCompanyEmail').textContent = this.email;
        document.getElementById('editarNomeEmpresa').value = this.companyDetails.name || this.nome;
        document.getElementById('editarLocalizacaoEmpresa').value = this.companyDetails.location || '';
        document.getElementById('editarCategoriaEmpresa').value = this.companyDetails.category || '';
        document.getElementById('descricaoEmpresa').value = this.companyDetails.description || '';
        document.getElementById('companyViewsCount').textContent = this.companyDetails.views || 0;
        document.getElementById('profileCompanyProfileImage').src = this.companyDetails.profileImage || DEFAULT_COMPANY_IMAGE;
        inserirGaleria(document.getElementById('previewImagensEmpresa'), this.companyDetails.images || []);
    }
}

class UserFactory {
    static criar(data) {
        if (!data) return null;
        if (data.tipo === 'empresa') {
            return new Empresa(data.id, data.nome || data.name, data.email, {
                ...data.companyDetails,
                profileImage: data.profileImage ?? data.companyDetails?.profileImage
            });
        }
        return new Visitante(data.id, data.nome || data.name, data.email, data.profileImage);
    }
}

// ==========================================
// 1.5 FUNÇÕES AUXILIARES DE FORMULÁRIO
// ==========================================

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.textContent = isPassword ? '🙈' : '👁';
    btn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
}

function mostrarErro(elementId, mensagem) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = mensagem;
        el.classList.add('visible');
    }
}

function limparErros() {
    document.querySelectorAll('.error-message').forEach(e => {
        e.textContent = '';
        e.classList.remove('visible');
    });
    document.querySelectorAll('.input-error').forEach(e => e.classList.remove('input-error'));
    document.querySelectorAll('.input-success').forEach(e => e.classList.remove('input-success'));
}

function setLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCNPJ(cnpj) {
    const nums = cnpj.replace(/[^\d]/g, '');
    if (nums.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(nums)) return false;
    let soma = 0, peso = 5;
    for (let i = 0; i < 12; i++) { soma += parseInt(nums[i]) * peso; peso = peso === 2 ? 9 : peso - 1; }
    let dig1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (parseInt(nums[12]) !== dig1) return false;
    soma = 0; peso = 6;
    for (let i = 0; i < 13; i++) { soma += parseInt(nums[i]) * peso; peso = peso === 2 ? 9 : peso - 1; }
    let dig2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return parseInt(nums[13]) === dig2;
}

function formatarCNPJ(input) {
    let val = input.value.replace(/[^\d]/g, '').slice(0, 14);
    if (val.length > 2) val = val.slice(0, 2) + '.' + val.slice(2);
    if (val.length > 6) val = val.slice(0, 6) + '.' + val.slice(6);
    if (val.length > 10) val = val.slice(0, 10) + '/' + val.slice(10);
    if (val.length > 15) val = val.slice(0, 15) + '-' + val.slice(15);
    input.value = val;
}

// ==========================================
// 2. INICIALIZAÇÃO
// ==========================================
function loadApp() {
    const rawUser = JSON.parse(localStorage.getItem('currentLoggedInUser'));
    if (rawUser) {
        currentLoggedInUser = UserFactory.criar(rawUser);
        document.getElementById('authContainer').style.display = 'none';
        showDashboard(currentLoggedInUser.tipo);
    } else {
        showForm('login');
    }
}

function showForm(formId) {
    limparErros();
    document.querySelectorAll('.form').forEach(f => f.classList.remove('active'));
    document.getElementById(formId + 'Form').classList.add('active');
    document.querySelectorAll('.form-toggle button').forEach(b => b.classList.remove('active'));
    document.getElementById(formId + 'Btn').classList.add('active');
}

function toggleEmpresaCampos(show) { document.getElementById('empresaCampos').style.display = show ? 'block' : 'none'; }
function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }

function showDashboard(userType) {
    if (userType === 'visitante') {
        document.getElementById('visitanteContainer').style.display = 'block';
        document.getElementById('empresaContainer').style.display = 'none';
        document.getElementById('visitanteDashboardTitle').textContent = `Bem-vindo(a), ${currentLoggedInUser.nome}!`;
        showPage('exploreCompanies');
    } else {
        document.getElementById('empresaContainer').style.display = 'block';
        document.getElementById('visitanteContainer').style.display = 'none';
        document.getElementById('empresaDashboardTitle').textContent = `Bem-vindo(a), Empresa ${currentLoggedInUser.companyDetails.name}!`;
        showPage('companyProfile');
    }
}

function showPage(pageId) {
    document.querySelectorAll('.profile-page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById(pageId);
    if (pageEl) pageEl.classList.add('active');

    document.querySelectorAll('.dashboard-nav button').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.dashboard-nav button[onclick="showPage('${pageId}')"]`);
    if (activeBtn) activeBtn.classList.add('active');

    if (pageId === 'visitorProfile' || pageId === 'companyProfile') currentLoggedInUser.renderProfile();
    else if (pageId === 'exploreCompanies') renderCompanies();
    else if (pageId === 'visitorServicePublications' || pageId === 'companyServicePublications') renderPublications(currentLoggedInUser.tipo);
    else if (pageId === 'companyAllVisitorPublications') renderAllVisitorPublications();
    else if (pageId === 'visitorChats' || pageId === 'companyChats') renderChatList();
}

// ==========================================
// 3. AUTENTICAÇÃO COM API (Erros tratados)
// ==========================================
function fazerCadastro() {
    limparErros();
    const btn = document.querySelector('#registerForm button');
    setLoading(btn, true);

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confSenha = document.getElementById('confirmarSenha').value;

    let valido = true;

    if (!nome) { mostrarErro('nomeError', 'Nome é obrigatório.'); valido = false; }
    if (!email) { mostrarErro('emailError', 'Email é obrigatório.'); valido = false; }
    else if (!validarEmail(email)) { mostrarErro('emailError', 'Email inválido.'); valido = false; }
    if (!senha) { mostrarErro('senhaError', 'Senha é obrigatória.'); valido = false; }
    else if (senha.length < 6) { mostrarErro('senhaError', 'Mínimo de 6 caracteres.'); valido = false; }
    if (!confSenha) { mostrarErro('confirmarSenhaError', 'Confirme sua senha.'); valido = false; }
    else if (senha !== confSenha) { mostrarErro('confirmarSenhaError', 'Senhas não conferem.'); valido = false; }

    const tipoCadastro = document.querySelector('input[name="tipoCadastro"]:checked').value;

    if (tipoCadastro === 'empresa') {
        const nomeEmp = document.getElementById('nomeEmpresa').value.trim();
        const local = document.getElementById('localizacao').value.trim();
        const cnpj = document.getElementById('cadastroCNPJ').value.trim();
        const cat = document.getElementById('categoriaEmpresa').value;
        if (!nomeEmp) { mostrarErro('nomeEmpresaError', 'Nome da empresa é obrigatório.'); valido = false; }
        if (!local) { mostrarErro('localizacaoError', 'Localização é obrigatória.'); valido = false; }
        if (!cnpj) { mostrarErro('cadastroCNPJError', 'CNPJ é obrigatório.'); valido = false; }
        else if (!validarCNPJ(cnpj)) { mostrarErro('cadastroCNPJError', 'CNPJ inválido.'); valido = false; }
        if (!cat) { mostrarErro('categoriaEmpresaError', 'Selecione uma categoria.'); valido = false; }
    }

    if (!valido) { setLoading(btn, false); return; }

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('email', email);
    formData.append('senha', senha);
    formData.append('tipo', tipoCadastro);

    if (tipoCadastro === 'empresa') {
        formData.append('localizacao', document.getElementById('localizacao').value.trim());
        formData.append('cnpj', document.getElementById('cadastroCNPJ').value.replace(/[^\d]/g, ''));
        formData.append('categoria', document.getElementById('categoriaEmpresa').value);
    }

    fetch('/php/register.php', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
        setLoading(btn, false);
        alert(data.mensagem);
        if (data.status === 'sucesso') {
            document.getElementById('senha').value = '';
            document.getElementById('confirmarSenha').value = '';
            document.getElementById('loginEmail').value = email;
            showForm('login');
        }
    }).catch(err => { setLoading(btn, false); console.error(err); });
}

function fazerLogin() {
    limparErros();
    const btn = document.querySelector('#loginForm button');
    setLoading(btn, true);

    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value;

    let valido = true;
    if (!email) { mostrarErro('loginEmailError', 'Email é obrigatório.'); valido = false; }
    else if (!validarEmail(email)) { mostrarErro('loginEmailError', 'Email inválido.'); valido = false; }
    if (!senha) { mostrarErro('loginSenhaError', 'Senha é obrigatória.'); valido = false; }

    if (!valido) { setLoading(btn, false); return; }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('senha', senha);

    fetch('/php/login.php', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
        setLoading(btn, false);
        if (data.status === 'sucesso') {
            document.getElementById('loginSenha').value = '';
            currentLoggedInUser = UserFactory.criar(data.usuario);
            localStorage.setItem('currentLoggedInUser', JSON.stringify(currentLoggedInUser));
            loadApp();
        } else {
            mostrarErro('loginSenhaError', data.mensagem || 'Credenciais inválidas.');
        }
    }).catch(err => { setLoading(btn, false); console.error(err); });
}

function logout() {
    currentLoggedInUser = null;
    localStorage.removeItem('currentLoggedInUser');
    document.getElementById('visitanteContainer').style.display = 'none';
    document.getElementById('empresaContainer').style.display = 'none';
    document.getElementById('authContainer').style.display = 'block';
    showForm('login');
}

// ==========================================
// 4. FILTRO INTELIGENTE NO BACKEND
// ==========================================
function elemento(tag, texto, classe) {
    const node = document.createElement(tag);
    if (texto) node.textContent = texto;
    if (classe) node.className = classe;
    return node;
}

function botao(texto, aoClicar) {
    const node = elemento('button', texto);
    node.type = 'button';
    node.addEventListener('click', aoClicar);
    return node;
}

async function respostaJson(response) {
    const dados = await response.json().catch(() => null);
    if (!response.ok || dados?.status === 'erro') {
        throw new Error(dados?.mensagem || dados?.message || 'O servidor não conseguiu concluir a operação.');
    }
    return dados;
}

const carregamentos = new WeakMap();

async function carregarPagina(url, container, renderItem, vazio, numero = 0, tamanho = 10) {
    const pedido = new AbortController();
    carregamentos.get(container)?.abort();
    carregamentos.set(container, pedido);
    container.replaceChildren(elemento('p', 'Carregando...'));

    try {
        const query = new URLSearchParams({ page: numero, size: tamanho });
        const response = await fetch(url + '?' + query, { signal: pedido.signal });
        const pagina = await respostaJson(response);
        if (pedido.signal.aborted) return;

        const itens = pagina.content.map(item => renderItem(item, pagina));
        container.replaceChildren(...(itens.length ? itens : [elemento('p', vazio)]));

        if (pagina.totalPages > 1) {
            const navegacao = elemento('p');
            const anterior = botao('Anterior', () => carregarPagina(url, container, renderItem, vazio, pagina.number - 1, tamanho));
            const proxima = botao('Próxima', () => carregarPagina(url, container, renderItem, vazio, pagina.number + 1, tamanho));
            anterior.disabled = pagina.first;
            proxima.disabled = pagina.last;
            navegacao.append(anterior, ' Página ' + (pagina.number + 1) + ' de ' + pagina.totalPages + ' ', proxima);
            container.appendChild(navegacao);
        }
    } catch (erro) {
        if (!pedido.signal.aborted) {
            container.replaceChildren(elemento('p', 'Não foi possível carregar os resultados.'),
                botao('Tentar novamente', () => carregarPagina(url, container, renderItem, vazio, numero, tamanho)));
        }
    }
}

function imagemValida(src) {
    return typeof src === 'string' && /^(data:image\/(?:jpeg|png|webp|gif);base64,|https?:\/\/)/i.test(src);
}

function inserirGaleria(container, imagens) {
    const nos = imagens.filter(imagemValida).map((src, index) => {
        const img = elemento('img');
        img.alt = 'Foto ' + (index + 1);
        img.loading = 'lazy';
        img.src = src;
        return img;
    });
    container.replaceChildren(...nos);
}

function renderCompanies(categoria = '') {
    const url = categoria ? '/php/usuarios/empresa/' + encodeURIComponent(categoria) : '/php/usuarios/empresas';
    return carregarPagina(url, document.getElementById('listaEmpresas'), empresa => {
        const card = elemento('div', null, 'company-card');
        card.append(elemento('h3', empresa.nome),
            elemento('p', 'Categoria: ' + (empresa.categoria || 'Não informada')),
            elemento('p', 'Localização: ' + (empresa.localizacao || 'Não informada')),
            botao('Entrar em contato', () => iniciarChatGenerico(empresa.id, empresa.nome)),
            botao('Ver perfil', () => openCompanyDetailsModal(empresa)));
        return card;
    }, 'Nenhuma empresa encontrada com os filtros atuais.');
}

function filtrarEmpresas() {
    return renderCompanies(document.getElementById('filtroCategoria').value);
}

function openCompanyDetailsModal(company) {
    const conteudo = document.getElementById('modalCompanyContent');
    const foto = elemento('img', null, 'profile-image-display');
    foto.src = imagemValida(company.profileImage) ? company.profileImage : DEFAULT_COMPANY_IMAGE;
    foto.alt = 'Foto do perfil da empresa';
    const galeria = elemento('div', null, 'image-gallery');
    inserirGaleria(galeria, company.imagensPerfil || []);
    conteudo.replaceChildren(foto, elemento('h3', company.nome), elemento('p', 'E-mail: ' + company.email),
        elemento('p', 'Localização: ' + (company.localizacao || 'Não informada')),
        elemento('p', 'Categoria: ' + (company.categoria || 'Não informada')),
        elemento('p', company.descricao || ''), galeria);

    currentChatWith = { targetUserId: company.id, targetUserName: company.nome };
    document.getElementById('companyDetailsModal').style.display = 'flex';
    return carregarPagina('/api/publicacoes/usuario/' + company.id,
        document.getElementById('modalCompanyPublicationsList'), pub => cartaoPublicacao(pub),
        'Esta empresa ainda não tem publicações.');
}

function startChatFromCompanyDetails() {
    closeModal('companyDetailsModal');
    openChat(currentChatWith.targetUserId, currentChatWith.targetUserName);
}

// ==========================================
// 5. CRUD DE PUBLICAÇÕES
// ==========================================
const FORMULARIO_VISITANTE = {
    titulo: 'pubTitulo', descricao: 'pubDescricao', imagens: 'pubImagens',
    previa: 'previewPubImagens', modal: 'addPublicationModal'
};
const FORMULARIO_EMPRESA = {
    titulo: 'companyPubTitulo', descricao: 'companyPubDescricao', imagens: 'companyPubImagens',
    previa: 'previewCompanyPubImagens', modal: 'addCompanyPublicationModal'
};

function abrirFormularioPublicacao(campos) {
    [campos.titulo, campos.descricao, campos.imagens].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById(campos.previa).replaceChildren();
    document.getElementById(campos.modal).style.display = 'flex';
}

function openAddPublicationModal() { abrirFormularioPublicacao(FORMULARIO_VISITANTE); }
function openAddCompanyPublicationModal() { abrirFormularioPublicacao(FORMULARIO_EMPRESA); }

async function processarEEnviarPublicacao(campos, button) {
    const titulo = document.getElementById(campos.titulo).value.trim();
    const descricao = document.getElementById(campos.descricao).value.trim();
    const arquivos = Array.from(document.getElementById(campos.imagens).files);
    if (!titulo || !descricao) {
        alert('Preencha o título e a descrição.');
        return;
    }

    const autor = currentLoggedInUser;
    button.disabled = true;
    try {
        const [imagem = '', ...imagensAdicionais] = await prepararGaleria(arquivos);
        const response = await fetch('/api/publicacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                titulo, descricao, tipoAutor: autor.tipo, nomeAutor: autor.nome,
                usuarioId: autor.id, imagens: imagem, imagensAdicionais
            })
        });
        await respostaJson(response);
        if (currentLoggedInUser !== autor) return;
        closeModal(campos.modal);
        await renderPublications(autor.tipo);
        alert('Publicação salva.');
    } catch (erro) {
        alert(erro.message || 'Não foi possível salvar a publicação.');
    } finally {
        button.disabled = false;
    }
}

function adicionarPublicacao(button) { return processarEEnviarPublicacao(FORMULARIO_VISITANTE, button); }
function adicionarCompanyPublication(button) { return processarEEnviarPublicacao(FORMULARIO_EMPRESA, button); }

function cartaoPublicacao(pub, acao = null, mostrarAutor = false) {
    const card = elemento('div', null, 'publication-entry');
    const metadados = mostrarAutor ? 'Por: ' + pub.nomeAutor
        : 'Publicado em: ' + new Date(pub.dataCriacao).toLocaleString('pt-BR');
    card.append(elemento('h4', pub.titulo), elemento('p', metadados, 'meta'), elemento('p', pub.descricao));
    const galeria = elemento('div', null, 'image-gallery');
    inserirGaleria(galeria, [pub.imagens, ...(pub.imagensAdicionais || [])]);
    if (galeria.childElementCount) card.appendChild(galeria);
    if (acao) card.appendChild(acao);
    return card;
}

function renderPublications(tipo, numero = 0) {
    const containerId = tipo === 'visitante' ? 'visitorPublications' : 'companyPublications';
    return carregarPagina('/api/publicacoes/usuario/' + currentLoggedInUser.id, document.getElementById(containerId),
        (pub, pagina) => cartaoPublicacao(pub, botao('Excluir', () => excluirPublicacao(pub.id, tipo, pagina))),
        'Você ainda não tem publicações.', numero);
}

async function excluirPublicacao(id, tipo, pagina) {
    if (!confirm('Excluir esta publicação?')) return;
    try {
        const response = await fetch('/api/publicacoes/' + id, { method: 'DELETE' });
        if (!response.ok) await respostaJson(response);
        const numero = pagina.content.length === 1 ? Math.max(0, pagina.number - 1) : pagina.number;
        await renderPublications(tipo, numero);
    } catch (erro) {
        alert(erro.message || 'Não foi possível excluir a publicação.');
    }
}

function renderAllVisitorPublications() {
    return carregarPagina('/api/publicacoes/tipo/visitante', document.getElementById('allVisitorPublicationsList'),
        pub => cartaoPublicacao(pub, botao('Entrar em contato', () => iniciarChatGenerico(pub.usuarioId, pub.nomeAutor)), true),
        'Nenhuma publicação de visitante para exibir.');
}

// ==========================================
// 6. CHAT E MENSAGENS
// ==========================================
function renderChatList() {
    const list = document.getElementById(currentLoggedInUser.tipo === 'visitante' ? 'visitorChatList' : 'companyChatList');
    if (!list) return;

    fetch(`/api/mensagens/usuario/${currentLoggedInUser.id}`)
    .then(res => res.json())
    .then(mensagens => {
        if (mensagens.length === 0) return list.innerHTML = '<p>Ainda não tens mensagens na Base de Dados.</p>';

        const chatsAgrupados = {};
        mensagens.forEach(msg => {
            const idOutro = msg.remetenteId === currentLoggedInUser.id ? msg.destinatarioId : msg.remetenteId;
            const nomeOutro = msg.remetenteId === currentLoggedInUser.id ? "Conversa" : msg.remetenteNome;
            chatsAgrupados[idOutro] = { id: idOutro, nome: nomeOutro, ultima: msg };
        });

        list.innerHTML = Object.values(chatsAgrupados).map(chat => `
            <li class="chat-list-item" onclick="openChat(${chat.id}, '${chat.nome}')">
                <div class="chat-info">
                    <img src="${DEFAULT_PROFILE_IMAGE}">
                    <div><h4>ID #${chat.id}</h4><p>${chat.ultima.conteudo || '📷 Imagem'}</p></div>
                </div>
            </li>
        `).join('');
    });
}

function iniciarChatGenerico(alvoId, alvoNome) {
    closeModal('visitorPublicationDetailsModal');
    openChat(alvoId, alvoNome);
}

function openChat(targetUserId, targetUserName) {
    currentChatWith = { id: targetUserId, nome: targetUserName };
    document.getElementById('chatWithUserName').textContent = targetUserName || `Utilizador #${targetUserId}`;

    // Faz a primeira busca imediatamente
    const buscarMensagens = () => {
        fetch(`/api/mensagens/conversa/${currentLoggedInUser.id}/${targetUserId}`)
        .then(res => res.json())
        .then(mensagens => {
            renderChatMessages(mensagens);
            document.getElementById('chatOverlay').style.display = 'flex';
        });
    };

    buscarMensagens();

    // Cria o loop que busca mensagens novas a cada 3 segundos (3000 ms)
    if (chatInterval) clearInterval(chatInterval);
    chatInterval = setInterval(buscarMensagens, 3000);
}

function renderChatMessages(mensagens) {
    const div = document.getElementById('chatMessages');

    div.innerHTML = mensagens.map(msg => `
        <div class="message ${msg.remetenteId === currentLoggedInUser.id ? 'sent' : 'received'}">
            <span class="sender-name">${msg.remetenteId === currentLoggedInUser.id ? 'Tu' : msg.remetenteNome}</span>
            ${msg.conteudo ? `<span class="message-text">${msg.conteudo}</span>` : ''}
            ${msg.imagemBase64 ? `<img src="${msg.imagemBase64}">` : ''}
        </div>
    `).join('');

    div.scrollTop = div.scrollHeight;
}

function closeChat() {
    document.getElementById('chatOverlay').style.display = 'none';
    currentChatWith = null;
    // Desliga o motor quando fecha o chat para não gastar internet
    if (chatInterval) clearInterval(chatInterval);
}

function handleImageSend() {
    sendMessage();
}

function sendMessage() {
    const input = document.getElementById('chatMessageInput');
    const imgUpload = document.getElementById('chatImageUpload');

    // Se não tem texto E não tem imagem, não faz nada
    if (!input.value.trim() && (!imgUpload.files || imgUpload.files.length === 0)) return;

    const payload = {
        remetenteId: currentLoggedInUser.id,
        remetenteNome: currentLoggedInUser.nome,
        destinatarioId: currentChatWith.id,
        conteudo: input.value.trim(),
        imagemBase64: null
    };

    const enviarRest = () => {
        fetch('/api/mensagens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(() => {
            input.value = '';
            imgUpload.value = '';
            openChat(currentChatWith.id, currentChatWith.nome);
            renderChatList();
        })
        .catch(err => console.error("Erro ao enviar mensagem:", err));
    };

    if (imgUpload.files && imgUpload.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            payload.imagemBase64 = e.target.result;
            enviarRest();
        };
        reader.readAsDataURL(imgUpload.files[0]);
    } else {
        enviarRest();
    }
}

// ==========================================
// 7. ATUALIZAÇÃO DE PERFIL
// ==========================================

const MAX_FOTOS_GALERIA = 3;
const MAX_FOTO_KB = 400;
const FORMATOS_FOTO = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function prepararFoto(arquivo) {
    if (!FORMATOS_FOTO.has(arquivo.type) || !arquivo.size || arquivo.size > 20 * 1024 * 1024) {
        throw new Error('Selecione uma foto JPEG, PNG ou WebP de até 20 MB.');
    }
    const imagem = await createImageBitmap(arquivo).catch(() => {
        throw new Error('Não foi possível abrir a foto selecionada.');
    });
    try {
        const escala = Math.min(1, 1200 / Math.max(imagem.width, imagem.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(imagem.width * escala));
        canvas.height = Math.max(1, Math.round(imagem.height * escala));
        const contexto = canvas.getContext('2d', { alpha: false });
        contexto.fillStyle = '#fff';
        contexto.fillRect(0, 0, canvas.width, canvas.height);
        contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
        for (const qualidade of [0.85, 0.7, 0.55, 0.4]) {
            const foto = canvas.toDataURL('image/jpeg', qualidade);
            const bytesBase64 = foto.slice(foto.indexOf(',') + 1).replace(/=+$/, '').length;
            if (foto.startsWith('data:image/jpeg;base64,') && Math.floor(bytesBase64 * 3 / 4) <= MAX_FOTO_KB * 1024) {
                return foto;
            }
        }
        throw new Error('Não foi possível reduzir a foto. Tente uma imagem menor.');
    } finally {
        imagem.close();
    }
}

async function prepararGaleria(arquivos) {
    if (arquivos.length > MAX_FOTOS_GALERIA) {
        throw new Error('Selecione até ' + MAX_FOTOS_GALERIA + ' fotos.');
    }
    const fotos = [];
    for (const arquivo of arquivos) {
        fotos.push(await prepararFoto(arquivo));
    }
    return fotos;
}

async function mostrarPreviaGaleria(input, destino) {
    const arquivos = input.files;
    const previa = document.getElementById(destino);
    try {
        const fotos = await prepararGaleria(Array.from(arquivos));
        if (input.files === arquivos) inserirGaleria(previa, fotos);
    } catch (erro) {
        if (input.files === arquivos) {
            previa.replaceChildren(elemento('p', erro.message));
        }
    }
}

async function mostrarFotoPerfil(input, destino) {
    const arquivo = input.files[0];
    if (!arquivo) return;
    try {
        const foto = await prepararFoto(arquivo);
        if (input.files[0] === arquivo) document.getElementById(destino).src = foto;
    } catch (erro) {
        if (input.files[0] === arquivo) alert(erro.message);
    }
}

async function salvarPerfil(button, campos, fotoInput, galeriaInput = null) {
    const usuario = currentLoggedInUser;
    const arquivo = fotoInput.files[0];
    const arquivosGaleria = Array.from(galeriaInput?.files || []);
    const formData = new FormData();
    formData.append('id', usuario.id);
    for (const [campo, valor] of Object.entries(campos)) {
        if (campo !== 'nome' || valor) formData.append(campo, valor);
    }

    button.disabled = true;
    try {
        const foto = arquivo ? await prepararFoto(arquivo) : null;
        const galeria = await prepararGaleria(arquivosGaleria);
        if (foto) formData.append('profileImage', foto);
        galeria.forEach(imagem => formData.append('imagensPerfil', imagem));

        const dados = await respostaJson(await fetch('/php/perfil.php', { method: 'PUT', body: formData }));
        if (currentLoggedInUser !== usuario) return;
        if (campos.nome) usuario.nome = campos.nome;
        if (usuario.tipo === 'empresa') {
            Object.assign(usuario.companyDetails, {
                name: usuario.nome, location: campos.localizacao, category: campos.categoria, description: campos.descricao
            });
            if (foto) usuario.companyDetails.profileImage = foto;
            if (galeria.length) usuario.companyDetails.images = galeria;
        } else if (foto) {
            usuario.profileImage = foto;
        }

        fotoInput.value = '';
        if (galeriaInput) galeriaInput.value = '';
        try {
            localStorage.setItem('currentLoggedInUser', JSON.stringify(usuario));
        } catch (erro) {
            console.warn('O perfil foi salvo no servidor. Não foi possível atualizar a cópia no navegador.', erro);
        }
        usuario.renderProfile();
        alert(dados.mensagem || 'Perfil atualizado.');
    } catch (erro) {
        alert(erro.message || 'Não foi possível salvar o perfil.');
    } finally {
        button.disabled = false;
    }
}

function salvarVisitante(button) {
    const nome = document.getElementById('editarNomeVisitante').value.trim();
    return salvarPerfil(button, { nome }, document.getElementById('uploadVisitorImage'));
}

function salvarEmpresa(button) {
    return salvarPerfil(button, {
        nome: document.getElementById('editarNomeEmpresa').value.trim(),
        localizacao: document.getElementById('editarLocalizacaoEmpresa').value.trim(),
        categoria: document.getElementById('editarCategoriaEmpresa').value,
        descricao: document.getElementById('descricaoEmpresa').value.trim()
    }, document.getElementById('uploadCompanyProfileImage'), document.getElementById('imagensEmpresa'));
}

// ==========================================
// INICIALIZAÇÃO E EVENTOS DE TECLADO (ENTER)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadApp();

    // Enter no Login (qualquer campo)
    document.getElementById('loginEmail').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fazerLogin();
    });
    document.getElementById('loginSenha').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fazerLogin();
    });

    // Enter no Cadastro (qualquer campo)
    document.getElementById('nome').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fazerCadastro();
    });
    document.getElementById('email').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fazerCadastro();
    });
    document.getElementById('senha').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fazerCadastro();
    });
    document.getElementById('confirmarSenha').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fazerCadastro();
    });

    // CNPJ auto-format
    document.getElementById('cadastroCNPJ').addEventListener('input', function() {
        formatarCNPJ(this);
    });

    // Toggle pills: garantir que toggleEmpresaCampos dispare via clique no label
    document.querySelectorAll('#cadastroTipoToggle .toggle-pill').forEach(pill => {
        pill.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                toggleEmpresaCampos(radio.value === 'empresa');
            }
        });
    });

    // Enter no Chat
    document.getElementById('chatMessageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});