// assets/js/main.js

$(document).ready(async function () {
    // ==========================================
    // 1. LOGICA AUTENTICAZIONE E NAVBAR VIP
    // ==========================================
    try {
        const authData = await InfoStudioApi.getCurrentUser();

        if (authData.authenticated && authData.user) {
            const nomeUtente = authData.user.nome || 'VIP';
            const navLinks = document.querySelectorAll('.nav-links a');

            navLinks.forEach(link => {
                if (link.textContent.includes('Accedi')) {
                    link.textContent = `Ciao, ${nomeUtente}`;

                    const inPagesFolder = window.location.pathname.includes('/pages/');
                    link.href = inPagesFolder ? 'profilo.html' : 'pages/profilo.html';
                    link.style.color = 'var(--accent-color)';
                }
            });

            const ul = document.querySelector('.nav-links');
            if (ul && !document.getElementById('logout-btn')) {
                const esciLi = document.createElement('li');
                esciLi.innerHTML = '<a href="#" id="logout-btn" style="color: #ff3366; font-size: 0.9rem;">Esci</a>';
                ul.appendChild(esciLi);

                document.getElementById('logout-btn').addEventListener('click', async (e) => {
                    e.preventDefault();
                    await InfoStudioApi.request('logout.php', { method: 'POST' });
                    window.location.reload();
                });
            }
        }
    } catch (error) {
        console.warn('Backend PHP non raggiungibile o database non configurato.', error);
    }

    // ==========================================
    // 2. ANIMAZIONE LOGO NEON
    // ==========================================
    const logoParts = document.querySelectorAll('.logo-neon span');

    if (logoParts.length > 0) {
        const randomFlicker = () => {
            const part = logoParts[Math.floor(Math.random() * logoParts.length)];
            part.classList.add('flicker');

            setTimeout(() => {
                part.classList.remove('flicker');
            }, Math.random() * 130 + 20);

            setTimeout(randomFlicker, Math.random() * 200 + 100);
        };

        randomFlicker();
    }
});
