document.addEventListener('DOMContentLoaded', async () => {
    console.log("File profilo.js caricato!");

    // Elementi del DOM
    const modal = document.getElementById('tessera-modal');
    const btnMostra = document.getElementById('btn-mostra-tessera');
    const closeBtn = document.querySelector('.close-modal');

    // 1. APERTURA / CHIUSURA MODAL
    if (btnMostra) {
        btnMostra.addEventListener('click', () => {
            console.log("Apro la tessera...");
            modal.style.display = "block";
        });
    } else {
        console.error("ERRORE: Non trovo il bottone 'Mostra Tessera' nell'HTML!");
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = "none";
        });
    }

    // Chiudi cliccando fuori dalla tessera
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // 2. CARICAMENTO DATI SUPABASE
    async function caricaDati() {
        console.log("Controllo l'utente su Supabase...");
        const { data: auth } = await supabaseClient.auth.getUser();
        
        if (!auth.user) {
            console.log("Nessun utente loggato, reindirizzo al login...");
            window.location.href = "login.html";
            return;
        }

        const { data: profilo, error } = await supabaseClient
            .from('profili')
            .select('*')
            .eq('id', auth.user.id)
            .single();

        if (profilo) {
            // Aggiorna il testo nella Dashboard
            document.getElementById('profilo-info').innerHTML = `
                <p><strong>Nome Completo</strong> ${profilo.nome} ${profilo.cognome}</p>
                <p><strong>Email</strong> ${auth.user.email}</p>
                <p><strong>Telefono</strong> ${profilo.telefono || "Non specificato"}</p>
            `;
            
            // Aggiorna il testo DENTRO la tessera digitale
            document.getElementById('card-name').textContent = `${profilo.nome} ${profilo.cognome}`;
            document.getElementById('card-id').textContent = `ID: #${auth.user.id.substring(0,8).toUpperCase()}`;
        } else {
            console.error("Errore nel recupero dati profilo:", error);
        }
    }

    // Avvia il caricamento
    caricaDati();
});