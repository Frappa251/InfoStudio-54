// assets/js/main.js

document.addEventListener('DOMContentLoaded', async () => {
    
    // ==========================================
    // 1. LOGICA AUTENTICAZIONE E NAVBAR VIP
    // ==========================================
    const { data: authData } = await window.supabaseClient.auth.getUser();

    if (authData && authData.user) {
        console.log("Utente riconosciuto:", authData.user.email);

        const { data: profilo } = await window.supabaseClient
            .from('profili')
            .select('nome')
            .eq('id', authData.user.id)
            .single();

        const nomeUtente = profilo ? profilo.nome : 'VIP';

        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            if (link.textContent.includes('Accedi')) {
                link.textContent = `Ciao, ${nomeUtente}`;
                
                const inPagesFolder = window.location.pathname.includes('/pages/');
                link.href = inPagesFolder ? "profilo.html" : "pages/profilo.html"; 
                
                link.style.color = "var(--accent-color)";
            }
        });

        const ul = document.querySelector('.nav-links');
        if (ul) {
            const esciLi = document.createElement('li');
            esciLi.innerHTML = `<a href="#" id="logout-btn" style="color: #ff3366; font-size: 0.9rem;">Esci</a>`;
            ul.appendChild(esciLi);

            document.getElementById('logout-btn').addEventListener('click', async (e) => {
                e.preventDefault();
                await window.supabaseClient.auth.signOut();
                window.location.reload(); 
            });
        }
    }

    // ==========================================
    // 2. ANIMAZIONE LOGO NEON (Dal branch menu-drink)
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