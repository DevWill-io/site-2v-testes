// Script do Mascote - Funcionalidades interativas com limite de 1 MILHÃO de carinhos
document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos
    const mascoteImg = document.getElementById('mascoteImg');
    const btnCarinho = document.getElementById('darCarinhoBtn');
    const mascoteLikesSpan = document.getElementById('mascote-likes');
    const mascoteMensagensSpan = document.getElementById('mascote-mensagens');
    const progressoFill = document.getElementById('progresso-fill');
    const progressoTexto = document.getElementById('progresso-texto');
    
    // LIMITE MÁXIMO DE CARINHOS: 1 MILHÃO
    const LIMITE_CARINHOS = 1000000;
    
    // Carregar dados salvos no localStorage
    let likes = localStorage.getItem('mascoteLikes') ? parseInt(localStorage.getItem('mascoteLikes')) : 0;
    let mensagens = localStorage.getItem('mascoteMensagens') ? parseInt(localStorage.getItem('mascoteMensagens')) : 0;
    
    // VARIÁVEL ADICIONADA: Controle do delay de 0.7s
    let podeClicar = true;
    
    // Função para atualizar a barra de progresso
    function atualizarProgresso() {
        if (progressoFill) {
            const percentual = (likes / LIMITE_CARINHOS) * 100;
            progressoFill.style.width = `${percentual}%`;
        }
        
        if (progressoTexto) {
            // Formatar números com separadores de milhar
            const likesFormatado = likes.toLocaleString('pt-BR');
            const limiteFormatado = LIMITE_CARINHOS.toLocaleString('pt-BR');
            progressoTexto.textContent = `${likesFormatado} / ${limiteFormatado}`;
        }
        
        if (mascoteLikesSpan) {
            mascoteLikesSpan.textContent = likes.toLocaleString('pt-BR');
        }
    }
    
    // Verificar se já atingiu o limite
    function atingiuLimite() {
        return likes >= LIMITE_CARINHOS;
    }
    
    // Atualizar display inicial
    if (mascoteMensagensSpan) mascoteMensagensSpan.textContent = mensagens;
    atualizarProgresso();
    
    // Atualizar botão e adicionar classe se atingiu limite
    function atualizarBotaoLimite() {
        if (btnCarinho) {
            if (atingiuLimite()) {
                btnCarinho.disabled = true;
                btnCarinho.style.opacity = '0.6';
                btnCarinho.style.cursor = 'not-allowed';
                btnCarinho.innerHTML = '<i class="fa-solid fa-trophy"></i> 🏆 MISSÃO CUMPRIDA! 1 MILHÃO DE CARINHOS! 🏆';
                
                // Adicionar classe especial no container
                const mascoteSection = document.querySelector('.mascote-section');
                if (mascoteSection) mascoteSection.classList.add('limite-atingido');
                
                // Mostrar medalha de conquista
                const imagemWrapper = document.querySelector('.mascote-imagem');
                if (imagemWrapper && !document.querySelector('.medalha-conquista')) {
                    const medalha = document.createElement('div');
                    medalha.className = 'medalha-conquista';
                    medalha.innerHTML = '🏆';
                    medalha.title = '1 MILHÃO DE CARINHOS!';
                    imagemWrapper.style.position = 'relative';
                    imagemWrapper.appendChild(medalha);
                }
            } else {
                btnCarinho.disabled = false;
                btnCarinho.style.opacity = '1';
                btnCarinho.style.cursor = 'pointer';
                btnCarinho.innerHTML = '<i class="fa-solid fa-heart"></i> Dar carinho';
            }
        }
    }
    atualizarBotaoLimite();
    
    // Função para criar coração animado
    function criarCoracao(x, y) {
        const coracao = document.createElement('div');
        coracao.innerHTML = '<i class="fa-solid fa-heart"></i>';
        coracao.classList.add('coracao-animado');
        coracao.style.left = (x - 15) + 'px';
        coracao.style.top = (y - 15) + 'px';
        document.body.appendChild(coracao);
        
        setTimeout(() => {
            coracao.remove();
        }, 1000);
    }
    
    // Função para mostrar notificação
    function mostrarNotificacao(mensagem, tipo = 'sucesso') {
        const notificacao = document.createElement('div');
        notificacao.textContent = mensagem;
        notificacao.style.position = 'fixed';
        notificacao.style.bottom = '100px';
        notificacao.style.left = '50%';
        notificacao.style.transform = 'translateX(-50%)';
        notificacao.style.backgroundColor = tipo === 'erro' ? '#e74c3c' : 'var(--accent)';
        notificacao.style.color = 'var(--bg-base)';
        notificacao.style.padding = '10px 20px';
        notificacao.style.borderRadius = '40px';
        notificacao.style.fontWeight = 'bold';
        notificacao.style.zIndex = '9999';
        notificacao.style.animation = 'subirESumir 2s ease forwards';
        notificacao.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
        
        document.body.appendChild(notificacao);
        setTimeout(() => notificacao.remove(), 2000);
    }
    
    // Função para dar carinho (com limite de 1 MILHÃO)
    function darCarinho(event) {
        // VERIFICAÇÃO ADICIONADA: Impede o clique se não tiver passado 0.7s
        if (!podeClicar) return;
        podeClicar = false;
        setTimeout(() => {
            podeClicar = true;
        }, 200); // 200ms = 0.2 segundos
        
        // Verificar limite
        if (atingiuLimite()) {
            mostrarNotificacao(`🎉 PARABÉNS! VOCÊ AJUDOU A ATINGIR 1 MILHÃO DE CARINHOS! O MASCOTE É LENDÁRIO! 🎉`, 'erro');
            return;
        }
        
        // Incrementar likes
        likes++;
        localStorage.setItem('mascoteLikes', likes);
        
        // Atualizar UI
        atualizarProgresso();
        
        // Verificar se atingiu o limite após incrementar
        if (atingiuLimite()) {
            mostrarNotificacao(`🏆 INCRÍVEL! 1 MILHÃO DE CARINHOS! MASCOTE ENTRA PARA A HISTÓRIA! 🏆`, 'sucesso');
            atualizarBotaoLimite();
        }
        
        // Calcular quantos faltam para o limite
        const faltam = LIMITE_CARINHOS - likes;
        
        // Animação de clique no mascote
        if (mascoteImg) {
            mascoteImg.style.transform = 'scale(0.95)';
            setTimeout(() => {
                mascoteImg.style.transform = '';
            }, 200);
        }
        
        // Criar coração na posição do clique
        let x, y;
        if (event && event.clientX && event.clientY) {
            x = event.clientX;
            y = event.clientY;
        } else if (mascoteImg) {
            const rect = mascoteImg.getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;
        } else {
            x = window.innerWidth / 2;
            y = window.innerHeight / 2;
        }
        
        // Criar múltiplos corações baseado na proximidade do limite
        let numCoracoes = 3;
        if (faltam <= 1000) numCoracoes = 20;
        else if (faltam <= 10000) numCoracoes = 15;
        else if (faltam <= 100000) numCoracoes = 10;
        else if (faltam <= 500000) numCoracoes = 7;
        
        for (let i = 0; i < numCoracoes; i++) {
            setTimeout(() => {
                criarCoracao(x + (Math.random() - 0.5) * 80, y + (Math.random() - 0.5) * 80);
            }, i * 60);
        }
        
        // Mensagens diferentes baseado na proximidade do limite
        let frases = [];
        if (faltam <= 1000) {
            frases = [`🎯 FALTAM APENAS ${faltam.toLocaleString('pt-BR')} CARINHOS! 🎯`, `💪 ÚLTIMO EMPURRÃO! Faltam ${faltam.toLocaleString('pt-BR')}!`, `🏁 QUASE 1 MILHÃO! Faltam ${faltam.toLocaleString('pt-BR')}!`, `⭐ VOCÊ CONSEGUE! Faltam ${faltam.toLocaleString('pt-BR')}!`];
        } else if (faltam <= 100000) {
            frases = [`🔥 Faltam só ${faltam.toLocaleString('pt-BR')} carinhos!`, `💪 Continue assim! Faltam ${faltam.toLocaleString('pt-BR')}`, `🎯 Meta próxima: ${faltam.toLocaleString('pt-BR')} carinhos!`, `✨ Rumo ao 1 MILHÃO! Faltam ${faltam.toLocaleString('pt-BR')}`];
        } else {
            const percentual = ((likes / LIMITE_CARINHOS) * 100).toFixed(2);
            frases = ["🥰 Obrigado pelo carinho!", "💖 Você é demais!", "🐾 Auuu! Adorei!", "🤗 Mais um carinho!", "✨ Que fofo!", `📊 ${percentual}% do 1 MILHÃO!`, "🎉 Continue assim!", "💕 Mascote feliz!"];
        }
        
        const mensagemAleatoria = frases[Math.floor(Math.random() * frases.length)];
        mostrarNotificacao(mensagemAleatoria);
    }
    
    // Função para enviar mensagem
    function enviarMensagem() {
        mensagens++;
        if (mascoteMensagensSpan) mascoteMensagensSpan.textContent = mensagens;
        localStorage.setItem('mascoteMensagens', mensagens);
        
        const frasesMensagem = [
            "💬 Mensagem enviada! Mascote adorou!",
            "📨 Recebido com carinho!",
            "✉️ Obrigado pela mensagem!",
            "💌 Que legal! Mascote respondeu com um abraço!",
            "📱 Mensagem entregue ao mascote!"
        ];
        const msgAleatoria = frasesMensagem[Math.floor(Math.random() * frasesMensagem.length)];
        mostrarNotificacao(msgAleatoria);
    }
    
    // Função para resetar carinhos (apenas para admin - opcional)
    window.resetarCarinhos = function() {
        if (confirm(`⚠️ Tem certeza que quer resetar os ${likes.toLocaleString('pt-BR')} carinhos? Essa ação não pode ser desfeita!`)) {
            likes = 0;
            localStorage.setItem('mascoteLikes', likes);
            atualizarProgresso();
            
            // Remover classe de limite
            const mascoteSection = document.querySelector('.mascote-section');
            if (mascoteSection) mascoteSection.classList.remove('limite-atingido');
            
            // Remover medalha
            const medalha = document.querySelector('.medalha-conquista');
            if (medalha) medalha.remove();
            
            // Reativar botão
            atualizarBotaoLimite();
            
            mostrarNotificacao('🔄 Carinhos resetados! Agora é buscar 1 MILHÃO novamente! 🎉', 'sucesso');
        }
    };
    
    // Mostrar progresso no console
    const percentual = ((likes / LIMITE_CARINHOS) * 100).toFixed(4);
    console.log(`🐾 Mascote carregado! ${likes.toLocaleString('pt-BR')}/${LIMITE_CARINHOS.toLocaleString('pt-BR')} carinhos dados (${percentual}%). Faltam ${(LIMITE_CARINHOS - likes).toLocaleString('pt-BR')}`);
    
    // Eventos
    if (btnCarinho) {
        btnCarinho.addEventListener('click', (e) => darCarinho(e));
    }
    
    if (mascoteImg) {
        mascoteImg.addEventListener('click', (e) => darCarinho(e));
    }
    
    // Exportar funções para uso global
    window.darCarinho = darCarinho;
    window.enviarMensagem = enviarMensagem;
});