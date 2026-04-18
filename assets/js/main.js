// assets/js/main.js

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Controlliamo se c'è un utente loggato in questo momento
    const { data: authData } = await supabaseClient.auth.getUser();

    if (authData.user) {
        // L'utente è LOGGATO!
        console.log("Utente riconosciuto:", authData.user.email);

        // Peschiamo il suo vero nome dalla nostra tabella "profili"
        const { data: profilo } = await supabaseClient
            .from('profili')
            .select('nome')
            .eq('id', authData.user.id)
            .single();

        const nomeUtente = profilo ? profilo.nome : 'VIP';

        // Troviamo tutti i link della navbar
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            // Se troviamo il link "Accedi", lo trasformiamo nel nome dell'utente
            if (link.textContent.includes('Accedi')) {
                link.textContent = `Ciao, ${nomeUtente}`;
                link.href = "#"; // Disattiviamo il link per ora
                link.style.color = "var(--accent-color)"; // Lo facciamo brillare di viola!
            }
        });

        // Aggiungiamo un bottone "Esci" in fondo al menu
        const ul = document.querySelector('.nav-links');
        const esciLi = document.createElement('li');
        esciLi.innerHTML = `<a href="#" id="logout-btn" style="color: #ff3366; font-size: 0.9rem;">Esci</a>`;
        ul.appendChild(esciLi);

        // Diamo vita al bottone "Esci"
        document.getElementById('logout-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            await supabaseClient.auth.signOut(); // Disconnette l'utente da Supabase
            window.location.reload(); // Ricarica la pagina per far tornare la scritta "Accedi"
        });
    }
});