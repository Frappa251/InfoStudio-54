// =====================================================================
// profilo.js
// Gestisce la pagina "Area VIP" del cliente:
//   - mostra i dati personali letti dal backend
//   - apre la modale con la tessera digitale
//   - apre la modale con il form di modifica dati e invia
//     le modifiche al backend
// =====================================================================

$(document).ready(function () {

    // -----------------------------------------------------------------
    // Riferimenti agli elementi della pagina che useremo più volte
    // -----------------------------------------------------------------
    var modaleTessera   = document.getElementById('tessera-modal');
    var bottoneTessera  = document.getElementById('btn-mostra-tessera');

    var modaleModifica  = document.getElementById('modifica-modal');
    var bottoneModifica = document.getElementById('btn-modifica-dati');
    var formModifica    = document.getElementById('form-modifica');

    // Qui salviamo i dati dell'utente quando li riceviamo dal backend,
    // così li possiamo riutilizzare
    var utenteCorrente = null;


    // -----------------------------------------------------------------
    // Apertura della modale "Tessera Digitale"
    // -----------------------------------------------------------------
    if (bottoneTessera != null) {
        bottoneTessera.addEventListener('click', function () {
            modaleTessera.style.display = 'block';
        });
    }


    // -----------------------------------------------------------------
    // Apertura della modale "Modifica Dati"
    // Quando l'utente la apre, precompiliamo i campi con i suoi dati
    // attuali, così non ricompila tutto
    // -----------------------------------------------------------------
    if (bottoneModifica != null) {
        bottoneModifica.addEventListener('click', function () {

            if (utenteCorrente != null) {
                document.getElementById('edit-nome').value     = utenteCorrente.nome;
                document.getElementById('edit-cognome').value  = utenteCorrente.cognome;

                if (utenteCorrente.telefono != null) {
                    document.getElementById('edit-telefono').value = utenteCorrente.telefono;
                } else {
                    document.getElementById('edit-telefono').value = '';
                }
            }

            modaleModifica.style.display = 'block';
        });
    }


    // -----------------------------------------------------------------
    // Chiusura delle modali tramite la "X" in alto a destra
    // -----------------------------------------------------------------
    var pulsantiChiusura = document.querySelectorAll('.close-modal');
    for (var i = 0; i < pulsantiChiusura.length; i++) {
        pulsantiChiusura[i].addEventListener('click', function (evento) {
            // closest cerca l'antenato più vicino con classe "modal"
            var modale = evento.target.closest('.modal');
            modale.style.display = 'none';
        });
    }


    // Chiusura delle modali cliccando sullo sfondo nero attorno
    window.addEventListener('click', function (evento) {
        if (evento.target == modaleTessera) {
            modaleTessera.style.display = 'none';
        }
        if (evento.target == modaleModifica) {
            modaleModifica.style.display = 'none';
        }
    });


    // -----------------------------------------------------------------
    // CARICAMENTO DATI: chiamata AJAX a me.php
    // Se l'utente non è loggato lo mandiamo alla pagina di login
    // Altrimenti riempiamo la pagina con i suoi dati
    // -----------------------------------------------------------------
    function caricaDatiUtente() {

        $.ajax({
            url: '../api/me.php',
            type: 'GET',
            dataType: 'json',

            success: function (risposta) {

                // Utente non loggato: vai alla pagina di login
                if (risposta.authenticated == false || risposta.user == null) {
                    window.location.href = 'login.html';
                    return;
                }

                var profilo = risposta.user;

                // Salviamo i dati nella variabile globale per il form di modifica
                utenteCorrente = profilo;

                // Costruiamo il blocco HTML con le informazioni del profilo
                var telefonoDaMostrare;
                if (profilo.telefono != null && profilo.telefono != '') {
                    telefonoDaMostrare = profilo.telefono;
                } else {
                    telefonoDaMostrare = 'Non specificato';
                }

                var html = '';
                html = html + '<p><strong>Nome Completo</strong> ' + profilo.nome + ' ' + profilo.cognome + '</p>';
                html = html + '<p><strong>Email</strong> ' + profilo.email + '</p>';
                html = html + '<p><strong>Telefono</strong> ' + telefonoDaMostrare + '</p>';

                document.getElementById('profilo-info').innerHTML = html;

                // Aggiorniamo anche la tessera digitale (modale)
                document.getElementById('card-name').textContent = profilo.nome + ' ' + profilo.cognome;

                // Trasformiamo l'id in una stringa di 8 cifre con gli zeri davanti
                // (es. id = 42 -> "00000042")
                var idStringa = String(profilo.id);
                while (idStringa.length < 8) {
                    idStringa = '0' + idStringa;
                }
                document.getElementById('card-id').textContent = 'ID: #' + idStringa;
            },

            error: function (xhr) {
                InfoStudioApi.logError('caricamento profilo', xhr);
                var messaggio = InfoStudioApi.userMessage(xhr, 'Profilo non disponibile.');
                document.getElementById('profilo-info').innerHTML = '<p>' + messaggio + '</p>';
            }
        });
    }


    // -----------------------------------------------------------------
    // GESTIONE FORM DI MODIFICA: invio al backend
    // -----------------------------------------------------------------
    if (formModifica != null) {

        formModifica.addEventListener('submit', function (evento) {
            evento.preventDefault();

            var msgEl = document.getElementById('modifica-msg');
            msgEl.textContent = 'Salvataggio in corso...';
            msgEl.style.color = '#FFD700';

            // Leggiamo i nuovi valori inseriti dall'utente
            var nuovoNome     = document.getElementById('edit-nome').value.trim();
            var nuovoCognome  = document.getElementById('edit-cognome').value.trim();
            var nuovoTelefono = document.getElementById('edit-telefono').value.trim();

            $.ajax({
                url: '../api/update_profile.php',
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify({
                    nome:     nuovoNome,
                    cognome:  nuovoCognome,
                    telefono: nuovoTelefono
                }),

                success: function (risposta) {

                    if (risposta.success == false) {
                        msgEl.textContent = risposta.message;
                        msgEl.style.color = '#ff3366';
                        return;
                    }

                    // Tutto ok: mostriamo il messaggio per un momento, poi
                    // chiudiamo la modale e ricarichiamo i dati a video
                    msgEl.textContent = 'Dati aggiornati con successo!';
                    msgEl.style.color = '#00ff64';

                    setTimeout(function () {
                        modaleModifica.style.display = 'none';
                        msgEl.textContent = '';
                        caricaDatiUtente();
                    }, 1200);
                },

                error: function (xhr) {
                    InfoStudioApi.logError('aggiornamento profilo', xhr);
                    msgEl.textContent = InfoStudioApi.userMessage(xhr, 'Errore durante il salvataggio.');
                    msgEl.style.color = '#ff3366';
                }
            });
        });
    }


    // Avviamo il caricamento dei dati appena la pagina è pronta
    caricaDatiUtente();
});
