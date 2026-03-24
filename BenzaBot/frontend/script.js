// --- VARIÁVEIS GLOBAIS ---
let currentPage = 1;
const totalPages = 3;

// Endpoints Institucionais (INSIRA AQUI AS SUAS NOVAS URLs DO LOGIC APP)
const PROCESS_FORM_URL = "COLE_AQUI_SUA_NOVA_URL_DE_PROCESSAMENTO";
const FEEDBACK_URL = "COLE_AQUI_SUA_NOVA_URL_DE_FEEDBACK";
const CHATBOT_API_URL = "COLE_AQUI_SUA_NOVA_URL_DE_CHATBOT";
const GET_TAGS_URL = "COLE_AQUI_SUA_NOVA_URL_DE_GLOSSARIO_DE_TAGS";

// Variáveis de Estado
let currentResponseData = { hash: null, equipe: null };
let ratingValue = 0;
let hoverValue = 0;
let isRatingLocked = false;
let cachedTags = null;

let copyMessageTimeout;
let flashTimeout;
let isProcessing = false;

// --- FUNÇÕES DE UTILIDADE ---

function showFlashMessage(message) {
    const flash = document.getElementById('flashMessage');
    flash.textContent = message;
    flash.classList.add('active');
    clearTimeout(flashTimeout);
    flashTimeout = setTimeout(() => { flash.classList.remove('active'); }, 3000);
}

function filterProtocol(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

// --- LÓGICA DO GLOSSÁRIO DE TAGS ---

function openGlossary() {
    const overlay = document.getElementById('glossaryOverlay');
    const container = document.getElementById('glossaryContainer');
    const sidebar = document.getElementById('sidebar');

    if (sidebar) sidebar.classList.remove('open');

    overlay.style.display = 'flex';

    setTimeout(() => {
        overlay.classList.remove('pointer-events-none', 'opacity-0');
        container.classList.remove('scale-95');
        container.classList.add('scale-100');
    }, 10);

    loadGlossaryData();
}

function closeGlossary() {
    const overlay = document.getElementById('glossaryOverlay');
    const container = document.getElementById('glossaryContainer');

    overlay.classList.add('opacity-0', 'pointer-events-none');
    container.classList.remove('scale-100');
    container.classList.add('scale-95');

    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

async function loadGlossaryData() {
    if (cachedTags) {
        renderTags(cachedTags);
        return;
    }

    const content = document.getElementById('glossaryContent');

    content.innerHTML = `
        <div class="text-center text-gray-500 mt-10">
            <div class="spinner border-4 border-gray-200 border-t-cyan-600 rounded-full w-8 h-8 animate-spin mx-auto mb-2"></div>
            <p class="text-sm">Buscando tags atualizadas...</p>
        </div>`;

    try {
        const response = await fetch(GET_TAGS_URL);

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        const data = await response.json();

        let tagsDoAzure = [];
        if (data.tags && Array.isArray(data.tags)) {
            tagsDoAzure = data.tags;
        } else if (Array.isArray(data)) {
            tagsDoAzure = data;
        } else if (data.value && Array.isArray(data.value)) {
            tagsDoAzure = data.value;
        }

        if (tagsDoAzure.length === 0) {
            content.innerHTML = '<p class="text-center text-gray-500 text-sm mt-4">Nenhuma tag encontrada na base.</p>';
            return;
        }

        cachedTags = tagsDoAzure;
        renderTags(tagsDoAzure);

    } catch (error) {
        console.error("Erro ao carregar glossário:", error);
        content.innerHTML = `
            <div class="text-center text-red-500 mt-10 px-4">
                <p class="font-bold">Falha ao carregar.</p>
                <p class="text-xs mt-1">Verifique sua conexão.</p>
                <button onclick="loadGlossaryData()" class="mt-3 text-cyan-600 underline text-sm hover:text-cyan-800">Tentar novamente</button>
            </div>`;
    }
}

function renderTags(tags) {
    const content = document.getElementById('glossaryContent');
    content.innerHTML = '';

    if (!tags || tags.length === 0) {
        content.innerHTML = '<p class="text-center text-gray-500 text-sm mt-4">Nenhuma tag correspondente.</p>';
        return;
    }

    tags.forEach(tag => {
        const rawTag = tag.Tags || tag.TAG || "Sem Nome";
        const rawDesc = tag.Respostas || tag.RespostaBase || "";
        const rawEquipe = tag.Equipe || tag.EQUIPE || "GERAL";

        const displayTag = rawTag.startsWith('#') ? rawTag.substring(1) : rawTag;
        const copyValue = displayTag;

        const item = document.createElement('div');
        item.className = 'p-3 border border-gray-200 rounded-lg hover:border-cyan-500 hover:shadow-sm transition bg-white group cursor-pointer relative';

        item.onclick = () => copyTagToClipboard(copyValue);

        item.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="pr-6">
                    <span class="font-mono text-sm font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">${displayTag}</span>
                    <p class="text-xs text-gray-500 mt-2 line-clamp-2">${rawDesc || 'Sem descrição disponível.'}</p>
                    <span class="text-[10px] text-gray-400 uppercase font-bold mt-2 block tracking-wider">${rawEquipe}</span>
                </div>
                <div class="absolute top-3 right-3 text-gray-300 group-hover:text-cyan-600 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </div>
            </div>
        `;
        content.appendChild(item);
    });
}

function filterTags(query) {
    if (!cachedTags) return;
    const lowerQuery = query.toLowerCase();

    const filtered = cachedTags.filter(t => {
        const tTag = (t.Tags || t.TAG || "").toLowerCase();
        const tDesc = (t.Respostas || t.RespostaBase || "").toLowerCase();
        const tEquipe = (t.Equipe || t.EQUIPE || "").toLowerCase();

        return tTag.includes(lowerQuery) || tDesc.includes(lowerQuery) || tEquipe.includes(lowerQuery);
    });

    renderTags(filtered);
}

function copyTagToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showFlashMessage(`Tag copiada: ${text}`);
        }).catch(err => {
            console.error("Erro Clipboard API", err);
            fallbackCopyText(text);
        });
    } else {
        fallbackCopyText(text);
    }
}

function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand("copy");
        showFlashMessage(`Tag copiada: ${text}`);
    } catch (err) {
        showFlashMessage("Erro ao copiar tag.");
    }
    document.body.removeChild(textArea);
}

function addMessageToChat(sender, message) { /* ... mantido ... */ }
async function simulateUserMessage() { /* ... mantido ... */ }

window.openGlossary = openGlossary;
window.closeGlossary = closeGlossary;
window.openChatBot = function () {
    const overlay = document.getElementById('chatBotOverlay');
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.classList.remove('pointer-events-none', 'opacity-0');
    }, 10);
};
window.closeChatBotAndGoHome = function () {
    const overlay = document.getElementById('chatBotOverlay');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
};
window.handleStarMouseOut = handleStarMouseOut;
window.copyResponse = copyResponse;
window.loadAndChangePage = loadAndChangePage;
window.toggleSidebar = toggleSidebar;
window.simulateUserMessage = simulateUserMessage;
window.initializeTypewriter = initializeTypewriter;
window.filterProtocol = filterProtocol;

function resetFormFields() {
    document.getElementById('protocolo').value = '';
    document.getElementById('perguntaAluno').value = '';
    document.getElementById('tags').value = '';
    document.getElementById('sazonalidade').value = '';
    document.getElementById('tom').value = '';
    document.getElementById('equipe').value = '';
    resetRating();
}

// --- INTEGRAÇÃO PRINCIPAL DE PROCESSAMENTO (LIMPA E DIRETA) ---
async function loadAndChangePage(nextPage) {
    if (nextPage !== 3) return changePage(nextPage);
    if (isProcessing) return;

    const protocolo = document.getElementById('protocolo').value.trim();
    const pergunta = document.getElementById('perguntaAluno').value.trim();
    const equipe = document.getElementById('equipe').value;
    const tags = document.getElementById('tags').value.trim();
    const sazonalidade = document.getElementById('sazonalidade').value.trim();
    const tom = document.getElementById('tom').value.trim();

    // Validações Essenciais (A Tag não é validada aqui, pois é considerada "Opcional" no front)
    if (protocolo === "") { showFlashMessage("O campo 'Protocolo' é obrigatório."); return; }
    if (pergunta === "") { showFlashMessage("O campo 'Pergunta' é obrigatório."); return; }
    if (equipe === "") { showFlashMessage("Selecione uma Equipe."); return; }

    isProcessing = true;
    const overlay = document.getElementById('loadingOverlay');
    const responseBox = document.getElementById('responseBox');

    responseBox.innerText = "";
    overlay.style.display = 'flex';

    const loadingText = overlay.querySelector('p.animate-pulse');
    if (loadingText) loadingText.textContent = "Processando no Azure... aguarde.";

    const data = { protocolo, pergunta, tags, sazonalidade, tom, equipe, feedback: 0 };

    try {
        changePage(nextPage);
        const response = await fetch(PROCESS_FORM_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            if (result && result.status === "rejeitado_cache_vazio") {
                responseBox.innerText = "Nenhum conteúdo institucional encontrado para as tags e parâmetros fornecidos.";
                return;
            }
            throw new Error(result.erro || "Erro desconhecido no Azure.");
        }

        if (result && result.respostaEstilizada) {
            currentResponseData.equipe = equipe;
            currentResponseData.hash = result.hash;
            responseBox.innerText = result.respostaEstilizada;
        } else {
            throw new Error("Resposta inválida do Azure.");
        }
    } catch (error) {
        console.error("Erro Azure:", error);
        responseBox.innerText = `Erro Crítico: ${error.message}`;
    } finally {
        overlay.style.display = 'none';
        isProcessing = false;
    }
}

// --- FEEDBACK (CONECTADO AO AZURE) ---

async function sendFeedbackToAzure(nota) {
    if (!currentResponseData.equipe || !currentResponseData.hash) {
        console.warn("Dados de hash/equipe ausentes para feedback.");
        return;
    }
    const payload = { hash: currentResponseData.hash, equipe: currentResponseData.equipe, feedback: nota };
    try {
        await fetch(FEEDBACK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log("Feedback enviado.");
    } catch (e) { console.error("Erro ao enviar feedback:", e); }
}

function resetRating() {
    ratingValue = 0;
    hoverValue = 0;
    isRatingLocked = false;
    const starContainer = document.getElementById('starContainer');
    if (starContainer) starContainer.innerHTML = '';
    updateStarDisplay();
}

function lockRating(value) {
    if (isRatingLocked) return;
    ratingValue = value;
    isRatingLocked = true;
    updateStarDisplay();

    const mensagens = {
        1: ["Obrigada pelo retorno, prometo melhorar!", "Sua opinião me ajuda a evoluir."],
        2: ["Valeu pelo feedback, sigo em ajuste.", "Agradeço, bora buscar melhorias."],
        3: ["Obrigada! Continuarei em aprimoramento.", "Seu retorno me guia para evoluir."],
        4: ["Que bom poder ajudar!", "Fico felizes com sua experiência."],
        5: ["Excelente! Ótimo saber disso.", "Estou feliz em atender você!"]
    };

    let opcoes = mensagens[value] || [`Obrigada! Feedback de ${value} estrelas enviado.`];
    let mensagem = opcoes[Math.floor(Math.random() * opcoes.length)];

    showFlashMessage(mensagem);
    sendFeedbackToAzure(value);
}

function handleStarHover(value) {
    if (isRatingLocked) return;
    hoverValue = value;
    updateStarDisplay();
}

function handleStarMouseOut() {
    if (isRatingLocked) return;
    hoverValue = 0;
    updateStarDisplay();
}

function updateStarDisplay() {
    const starContainer = document.getElementById('starContainer');
    if (!starContainer) return;

    const displayValue = isRatingLocked ? ratingValue : (hoverValue || ratingValue);

    if (starContainer.children.length === 0) {
        for (let i = 1; i <= 5; i++) {
            const starDiv = document.createElement('div');
            starDiv.className = 'w-10 h-10 cursor-pointer transition-colors duration-200 text-gray-300';
            starDiv.innerHTML = `<svg class="pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;

            starDiv.onclick = () => lockRating(i);
            starDiv.onmouseenter = () => handleStarHover(i);
            starDiv.onmouseleave = () => handleStarMouseOut();

            starContainer.appendChild(starDiv);
        }
    }

    const stars = starContainer.children;
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const value = i + 1;

        star.classList.remove('text-cyan-400', 'text-gray-300');

        if (value <= displayValue) {
            star.classList.add('text-cyan-400');
        } else {
            star.classList.add('text-gray-300');
        }

        star.style.cursor = isRatingLocked ? 'default' : 'pointer';
    }
}

function copyResponse() {
    const responseBox = document.getElementById('responseBox');
    const copyMessage = document.getElementById('copyMessage');
    try {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(responseBox.innerText).then(() => showCopySuccess()).catch(() => fallbackCopyText(responseBox.innerText));
        } else { fallbackCopyText(responseBox.innerText); }
    } catch (err) { showFlashMessage("Erro ao copiar."); }
    function showCopySuccess() {
        copyMessage.style.opacity = '1';
        clearTimeout(copyMessageTimeout);
        copyMessageTimeout = setTimeout(() => { copyMessage.style.opacity = '0'; }, 2000);
    }
    function fallbackCopyText(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showCopySuccess();
    }
}

function initializeTypewriter() { const f = document.getElementById('typewriter-text'); if (f) f.style.width = 'auto'; }

function changePage(nextPage) {
    if (nextPage < 1 || nextPage > totalPages || currentPage === nextPage) {
        document.getElementById('sidebar').classList.remove('open');
        return;
    }
    const currentContainer = document.getElementById(`page${currentPage}`);
    const nextContainer = document.getElementById(`page${nextPage}`);
    if (nextPage === 2) { resetFormFields(); resetRating(); }

    document.getElementById('chatBotOverlay').style.display = 'none';
    document.getElementById('glossaryOverlay').style.display = 'none';
    document.getElementById('glossaryContainer').classList.remove('active');

    currentContainer.classList.remove('active');
    if (currentPage === 2) {
        document.querySelectorAll('#page2 .form-field').forEach(el => { el.style.opacity = 0; el.style.transform = 'translateY(20px)'; });
    }

    setTimeout(() => {
        currentContainer.style.display = 'none';
        if (nextPage === 3) updateStarDisplay();
        currentPage = nextPage;
        if (nextPage === 1 || nextPage === 2 || nextPage === 3) nextContainer.style.display = 'flex';
        else nextContainer.style.display = 'block';
        void nextContainer.offsetWidth;
        nextContainer.classList.add('active');
        if (currentPage === 2) {
            const fields = document.querySelectorAll('#page2 .form-field');
            fields.forEach((el, index) => {
                el.style.transitionDelay = `${index * 0.1}s`;
                el.style.opacity = '0'; el.style.transform = 'translateY(20px)';
                void el.offsetWidth;
                setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 50);
            });
        }
        document.getElementById('sidebar').classList.remove('open');
    }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.page-container').forEach(el => el.style.display = 'none');
    const initialPage = document.getElementById('page1');
    initialPage.style.display = 'flex';
    void initialPage.offsetWidth;
    initialPage.classList.add('active');
    currentPage = 1;
    initializeTypewriter();

    // --- SEGURANÇA BÁSICA (Anti-Inspeção) ---
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'F12' || e.keyCode === 123) { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && e.key === 'I') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && e.key === 'J') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return false; }
    });
});
