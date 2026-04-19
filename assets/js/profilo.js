document.addEventListener('DOMContentLoaded', async () => {
    // Variabili Modal Tessera
    const modalTessera = document.getElementById('tessera-modal');
    const btnMostraTessera = document.getElementById('btn-mostra-tessera');
    
    // Variabili Modal Modifica
    const modalModifica = document.getElementById('modifica-modal');
    const btnModifica = document.getElementById('btn-modifica-dati');
    const closeModifica = document.getElementById('close-modifica');
    const formModifica = document.getElementById('form-modifica');

    let utenteCorrente = null; // Contenitore per ricordare i dati estratti

    // 1. GESTIONE APERTURA / CHIUSURA FINESTRE
    if (btnMostraTessera) {
        btnMostraTessera.addEventListener('click', () => modalTessera.style.display = "block");
    }

    if (btnModifica) {
        btnModifica.addEventListener('click', () => {
            // Se abbiamo i dati, li inseriamo nei campi prima di aprire la finestra
            if (utenteCorrente) {
                document.getElementById('edit-nome').value = utenteCorrente.nome;
                document.getElementById('edit-cognome').value = utenteCorrente.cognome;
                document.getElementById('edit-telefono').value = utenteCorrente.telefono || "";
            }
            modalModifica.style.display = "block";
        });
    }

    // Chiusura dai tasti "X" e cliccando fuori
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = "none";
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === modalTessera) modalTessera.style.display = "none";
        if (event.target === modalModifica) modalModifica.style.display = "none";
    });

    // 2. CARICAMENTO DATI DA SUPABASE
    async function caricaDati() {
        const { data: auth } = await supabaseClient.auth.getUser();
        
        if (!auth.user) {
            window.location.href = "login.html";
            return;
        }

        const { data: profilo, error } = await supabaseClient
            .from('profili')
            .select('*')
            .eq('id', auth.user.id)
            .single();

        if (profilo) {
            utenteCorrente = profilo; // Salviamo i dati nella memoria temporanea

            // Aggiorna la Dashboard HTML
            document.getElementById('profilo-info').innerHTML = `
                <p><strong>Nome Completo</strong> ${profilo.nome} ${profilo.cognome}</p>
                <p><strong>Email</strong> ${auth.user.email}</p>
                <p><strong>Telefono</strong> ${profilo.telefono || "Non specificato"}</p>
            `;
            
            // Aggiorna la Tessera VIP
            document.getElementById('card-name').textContent = `${profilo.nome} ${profilo.cognome}`;
            document.getElementById('card-id').textContent = `ID: #${auth.user.id.substring(0,8).toUpperCase()}`;
        }
    }

    // 3. SALVATAGGIO DELLE MODIFICHE (L'Aggiornamento!)
    if (formModifica) {
        formModifica.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita che la pagina si ricarichi
            
            const msgEl = document.getElementById('modifica-msg');
            msgEl.textContent = "Salvataggio in corso...";
            msgEl.style.color = "#FFD700";

            // Cattura i nuovi dati
            const nuovoNome = document.getElementById('edit-nome').value.trim();
            const nuovoCognome = document.getElementById('edit-cognome').value.trim();
            const nuovoTelefono = document.getElementById('edit-telefono').value.trim();

            const { data: auth } = await supabaseClient.auth.getUser();

            // Comando UPDATE per Supabase
            const { error } = await supabaseClient
                .from('profili')
                .update({ 
                    nome: nuovoNome, 
                    cognome: nuovoCognome, 
                    telefono: nuovoTelefono 
                })
                .eq('id', auth.user.id);

            if (error) {
                msgEl.textContent = "Errore durante il salvataggio.";
                msgEl.style.color = "#ff3366";
            } else {
                msgEl.textContent = "Dati aggiornati con successo!";
                msgEl.style.color = "#00ff64";
                
                // Dopo un secondo e mezzo chiude la finestra e rinfresca i dati a schermo!
                setTimeout(() => {
                    modalModifica.style.display = "none";
                    msgEl.textContent = "";
                    caricaDati(); // Magia: la scritta sulla dashboard si aggiorna all'istante
                }, 1500);
            }
        });
    }

    // Avvia la pagina
    caricaDati();
});