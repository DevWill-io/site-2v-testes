document.addEventListener('DOMContentLoaded', () => {

    // 1. Efeito de Digitação
    const textElement = document.getElementById('typing-text');
    const words = ["Informática.", "Inovação.", "Tecnologia.", "Código."];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        if (!textElement) return;
        const currentWord = words[wordIndex];
        if (isDeleting) {
            textElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            textElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }
        let typeSpeed = isDeleting ? 40 : 100;
        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500;
        }
        setTimeout(typeEffect, typeSpeed);
    }
    setTimeout(typeEffect, 500);

    // 2. Menu Mobile
    const btnMenu = document.getElementById('btn-menu');
    const navLinks = document.querySelector('.nav-links');
    if (btnMenu && navLinks) {
        const iconMenu = btnMenu.querySelector('i');
        btnMenu.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            if (navLinks.classList.contains('show')) {
                iconMenu.classList.replace('fa-bars-staggered', 'fa-xmark');
            } else {
                iconMenu.classList.replace('fa-xmark', 'fa-bars-staggered');
            }
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('show');
                if (iconMenu) iconMenu.classList.replace('fa-xmark', 'fa-bars-staggered');
            });
        });
    }

    // 3. Scroll Reveal
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealOnScroll.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    reveals.forEach(reveal => revealOnScroll.observe(reveal));

    // 4. Highlight Menu
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= (sectionTop - 250)) {
                current = section.getAttribute('id');
            }
        });
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') && item.getAttribute('href').substring(1) === current) {
                item.classList.add('active');
            }
        });
    });

    // 5. Ano Dinâmico
    const spanAno = document.getElementById('ano');
    if (spanAno) spanAno.textContent = new Date().getFullYear();

    // 6. Tema Claro/Escuro
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        const themeIcon = themeToggleBtn.querySelector('i');
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'light') {
            document.body.classList.add('light-theme');
            if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
        }
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            if (document.body.classList.contains('light-theme')) {
                if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('theme', 'light');
            } else {
                if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // 7. Botão Voltar ao Topo
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
    }

    // 8. Contadores
    const counters = document.querySelectorAll('.counter');
    const statsSection = document.getElementById('estatisticas');
    let animated = false;
    if (statsSection && counters.length > 0) {
        window.addEventListener('scroll', () => {
            const sectionPos = statsSection.getBoundingClientRect().top;
            const screenPos = window.innerHeight;
            if (sectionPos < screenPos && !animated) {
                counters.forEach(counter => {
                    const updateCount = () => {
                        const target = +counter.getAttribute('data-target');
                        const count = +counter.innerText;
                        const speed = 50;
                        const inc = target / speed;
                        if (count < target) {
                            counter.innerText = Math.ceil(count + inc);
                            setTimeout(updateCount, 40);
                        } else {
                            counter.innerText = target + (target >= 300 ? '+' : '');
                        }
                    };
                    updateCount();
                });
                animated = true;
            }
        });
    }

    // 9. Barra de Progresso
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / scrollable) * 100;
            scrollProgress.style.width = `${progress}%`;
        });
    }

    // 10. Partículas
    function createParticles() {
        const container = document.getElementById('particles-container');
        if (!container) return;
        const particleCount = 25;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100 + 20}vh`;
            particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            container.appendChild(particle);
        }
    }
    createParticles();

    // 11. Efeito Tilt
    const tiltCards = document.querySelectorAll('.tilt-element');
    function ativarTilt() {
        const cards = document.querySelectorAll('.tilt-element');
        if (window.matchMedia("(min-width: 850px)").matches) {
            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -8;
                    const rotateY = ((x - centerX) / centerX) * 8;
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                    card.style.transition = 'transform 0.5s ease';
                });
                card.addEventListener('mouseenter', () => {
                    card.style.transition = 'none';
                });
            });
        }
    }
    ativarTilt();
    window.ativarTilt = ativarTilt; // exportar para uso após carregar projetos

    // 12. Frase do Dia
    const frases = [
        { texto: "A melhor maneira de prever o futuro é criá-lo.", autor: "Peter Drucker" },
        { texto: "Código é poesia.", autor: "WordPress" },
        { texto: "Primeiro resolva o problema. Depois, escreva o código.", autor: "John Johnson" },
        { texto: "A tecnologia move o mundo.", autor: "Steve Jobs" },
        { texto: "Qualquer um pode escrever código que um computador entende. Bons programadores escrevem código que humanos entendem.", autor: "Martin Fowler" },
        { texto: "O segredo para progredir é começar.", autor: "Mark Twain" },
        { texto: "Não tenha medo de errar, tenha medo de não tentar.", autor: "Desconhecido" }
    ];

    function exibirFraseAleatoria() {
        const hoje = new Date().toDateString();
        const indice = hoje.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % frases.length;
        const frase = frases[indice];
        const fraseTexto = document.getElementById('frase-texto');
        const fraseAutor = document.getElementById('frase-autor');
        if (fraseTexto) fraseTexto.textContent = `"${frase.texto}"`;
        if (fraseAutor) fraseAutor.textContent = `— ${frase.autor}`;
    }
    exibirFraseAleatoria();

    // 13. Carregar Projetos do GitHub
    async function carregarProjetosGitHub() {
        const container = document.getElementById('projetos-container');
        if (!container) return;

        const username = 'infoWeb2026-2V';
        
        try {
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
            if (!response.ok) throw new Error('Erro na API');
            const repos = await response.json();
            
            if (repos.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fa-regular fa-folder-open"></i>
                        <h3>Nenhum projeto público ainda</h3>
                        <p>Em breve nossos repositórios aparecerão aqui!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = repos.map(repo => `
                <div class="projeto-card tilt-element">
                    <h3><i class="fa-regular fa-bookmark"></i> ${repo.name}</h3>
                    <p>${repo.description || 'Sem descrição fornecida.'}</p>
                    ${repo.topics && repo.topics.length ? `
                        <div class="projeto-tags">
                            ${repo.topics.slice(0, 3).map(topic => `<span class="projeto-tag">${topic}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 0.8rem;">
                            <i class="fa-regular fa-star"></i> ${repo.stargazers_count} 
                            <i class="fa-solid fa-code-branch" style="margin-left: 10px;"></i> ${repo.forks_count}
                        </span>
                        <a href="${repo.html_url}" target="_blank" class="projeto-link">
                            Ver no GitHub <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    </div>
                </div>
            `).join('');
            
            if (window.ativarTilt) window.ativarTilt();
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-folder-open"></i>
                    <h3>Não foi possível carregar os projetos</h3>
                    <p>Verifique sua conexão ou tente novamente mais tarde.</p>
                </div>
            `;
        }
    }
    carregarProjetosGitHub();

    // 14. Mural de Recados com localStorage
    const STORAGE_KEY = 'mural_recados_2v';

    function carregarRecados() {
        const recados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        renderizarRecados(recados);
    }

    function salvarRecados(recados) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recados));
    }

    function escapeHTML(str) {
        return str.replace(/[&<>"]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            return m;
        });
    }

    function formatarData(timestamp) {
        const data = new Date(timestamp);
        return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    }

    function renderizarRecados(recados) {
        const container = document.getElementById('lista-recados');
        if (!container) return;
        
        if (recados.length === 0) {
            container.innerHTML = '<div class="sem-recados"><i class="fa-regular fa-message"></i> Nenhum recado ainda. Seja o primeiro!</div>';
            return;
        }

        const recadosOrdenados = [...recados].reverse();
        
        container.innerHTML = recadosOrdenados.map(recado => `
            <div class="recado-item" data-id="${recado.id}">
                <div class="recado-header">
                    <span class="recado-nome"><i class="fa-regular fa-user"></i> ${escapeHTML(recado.nome)}</span>
                    <span class="recado-data">${formatarData(recado.data)}</span>
                </div>
                <div class="recado-mensagem">${escapeHTML(recado.mensagem)}</div>
                <div class="recado-acoes">
                    <button class="btn-like" data-id="${recado.id}">
                        <i class="fa-regular fa-heart"></i> <span class="like-count">${recado.likes || 0}</span>
                    </button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.btn-like').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const recados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
                const recado = recados.find(r => r.id === id);
                if (recado) {
                    recado.likes = (recado.likes || 0) + 1;
                    salvarRecados(recados);
                    renderizarRecados(recados);
                }
            });
        });
    }

    function adicionarRecado(nome, mensagem) {
        const recados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const novoRecado = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            nome: nome.trim(),
            mensagem: mensagem.trim(),
            data: Date.now(),
            likes: 0
        };
        recados.push(novoRecado);
        salvarRecados(recados);
        renderizarRecados(recados);
    }

    carregarRecados();
    
    const form = document.getElementById('form-recado');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = document.getElementById('recado-nome').value;
            const mensagem = document.getElementById('recado-mensagem').value;
            if (nome && mensagem) {
                adicionarRecado(nome, mensagem);
                form.reset();
            }
        });
    }

    // 15. Easter Egg no Console
    console.log('%c🐾 Turma 2V - IFRN Caicó', 'font-size: 16px; font-weight: bold; color: #8B5EDD;');
    console.log('%cVocê é curioso(a)! Isso é uma qualidade de dev 😉', 'font-size: 12px; color: #CEBDEC;');
    console.log('%cDá um "carinho" no mascote aí embaixo!', 'font-size: 12px;');
});

// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});