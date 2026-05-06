// assets/js/profilo.js
// Profilo utente gestito tramite backend PHP + AJAX/jQuery.

$(document).ready(async function () {
    const modalTessera = document.getElementById('tessera-modal');
    const btnMostraTessera = document.getElementById('btn-mostra-tessera');

    const modalModifica = document.getElementById('modifica-modal');
    const btnModifica = document.getElementById('btn-modifica-dati');
    const formModifica = document.getElementById('form-modifica');

    let utenteCorrente = null;

    if (btnMostraTessera) {
        btnMostraTessera.addEventListener('click', () => modalTessera.style.display = 'block');
    }

    if (btnModifica) {
        btnModifica.addEventListener('click', () => {
            if (utenteCorrente) {
                document.getElementById('edit-nome').value = utenteCorrente.nome;
                document.getElementById('edit-cognome').value = utenteCorrente.cognome;
                document.getElementById('edit-telefono').value = utenteCorrente.telefono || '';
            }
            modalModifica.style.display = 'block';
        });
    }

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === modalTessera) modalTessera.style.display = 'none';
        if (event.target === modalModifica) modalModifica.style.display = 'none';
    });

    async function caricaDati() {
        try {
            const response = await InfoStudioApi.getCurrentUser();

            if (!response.authenticated || !response.user) {
                window.location.href = 'login.html';
                return;
            }

            const profilo = response.user;
            utenteCorrente = profilo;

            document.getElementById('profilo-info').innerHTML = `
                <p><strong>Nome Completo</strong> ${profilo.nome} ${profilo.cognome}</p>
                <p><strong>Email</strong> ${profilo.email}</p>
                <p><strong>Telefono</strong> ${profilo.telefono || 'Non specificato'}</p>
            `;

            document.getElementById('card-name').textContent = `${profilo.nome} ${profilo.cognome}`;
            document.getElementById('card-id').textContent = `ID: #${String(profilo.id).padStart(8, '0')}`;
        } catch (error) {
            InfoStudioApi.logError('caricamento profilo', error);
            document.getElementById('profilo-info').innerHTML = `<p>${InfoStudioApi.userMessage(error, 'Profilo non disponibile. Riprova tra poco.')}</p>`;
        }
    }

    if (formModifica) {
        formModifica.addEventListener('submit', async (e) => {
            e.preventDefault();

            const msgEl = document.getElementById('modifica-msg');
            msgEl.textContent = 'Salvataggio in corso...';
            msgEl.style.color = '#FFD700';

            const nuovoNome = document.getElementById('edit-nome').value.trim();
            const nuovoCognome = document.getElementById('edit-cognome').value.trim();
            const nuovoTelefono = document.getElementById('edit-telefono').value.trim();

            try {
                const response = await InfoStudioApi.request('update_profile.php', {
                    method: 'POST',
                    data: {
                        nome: nuovoNome,
                        cognome: nuovoCognome,
                        telefono: nuovoTelefono
                    }
                });

                if (!response.success) {
                    msgEl.textContent = response.message || 'Errore durante il salvataggio.';
                    msgEl.style.color = '#ff3366';
                    return;
                }

                msgEl.textContent = 'Dati aggiornati con successo!';
                msgEl.style.color = '#00ff64';

                setTimeout(() => {
                    modalModifica.style.display = 'none';
                    msgEl.textContent = '';
                    caricaDati();
                }, 1200);
            } catch (error) {
                InfoStudioApi.logError('aggiornamento profilo', error);
                msgEl.textContent = InfoStudioApi.userMessage(error, 'Errore durante il salvataggio.');
                msgEl.style.color = '#ff3366';
            }
        });
    }

    caricaDati();
});
