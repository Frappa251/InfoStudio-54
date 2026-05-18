// =====================================================================
// main.js
// Script "comune" caricato da quasi tutte le pagine.
// Si occupa di:
//   1) chiedere al backend chi è l'utente loggato e, se c'è qualcuno,
//      modificare la navbar (mostra il nome, aggiunge il pulsante Esci)
//   2) far lampeggiare le scritte del logo in stile insegna al neon
// =====================================================================


// Aspettiamo che il DOM sia pronto, così tutti gli elementi della pagina
// (navbar, logo, ecc.) esistono e possiamo cercarli con jQuery.
$(document).ready(function () {

    // -----------------------------------------------------------------
    // 1) GESTIONE NAVBAR E UTENTE LOGGATO
    // Chiediamo a me.php "chi sono?". Se l'utente è loggato, modifichiamo
    // il link "Accedi" trasformandolo in "Ciao, NomeUtente" e aggiungiamo
    // un pulsante "Esci".
    // -----------------------------------------------------------------
    InfoStudioApi.getCurrentUser()
        .done(function (risposta) {

            // Se nessuno è loggato non c'è niente da fare
            if (risposta.authenticated == false || risposta.user == null) {
                return;
            }

            // Prendiamo il nome dell'utente (con fallback "VIP" se manca)
            var nomeUtente;
            if (risposta.user.nome != null && risposta.user.nome != '') {
                nomeUtente = risposta.user.nome;
            } else {
                nomeUtente = 'VIP';
            }

            // Cerchiamo tutti i link della navbar
            var linkNavbar = document.querySelectorAll('.nav-links a');

            // Capiamo se siamo nella root o in una sottocartella /pages/.
            // Da questo dipende il percorso del link al profilo.
            var siamoInPages = window.location.pathname.indexOf('/pages/') != -1;
            var percorsoProfilo;
            if (siamoInPages) {
                percorsoProfilo = 'profilo.html';
            } else {
                percorsoProfilo = 'pages/profilo.html';
            }

            // Scorriamo i link e modifichiamo quello che dice "Accedi"
            for (var i = 0; i < linkNavbar.length; i++) {
                var link = linkNavbar[i];

                if (link.textContent.indexOf('Accedi') != -1) {
                    link.textContent = 'Ciao, ' + nomeUtente;
                    link.href = percorsoProfilo;
                    link.style.color = 'var(--accent-color)';
                }
            }

            // Aggiungiamo il pulsante "Esci" alla fine della lista
            // (se non c'è già stato aggiunto in una chiamata precedente).
            var listaNav = document.querySelector('.nav-links');
            var pulsanteEsciEsistente = document.getElementById('logout-btn');

            if (listaNav != null && pulsanteEsciEsistente == null) {

                // Creiamo il nuovo <li> con dentro il link "Esci"
                var nuovoLi = document.createElement('li');
                nuovoLi.innerHTML = '<a href="#" id="logout-btn" style="color: #ff3366; font-size: 0.9rem;">Esci</a>';
                listaNav.appendChild(nuovoLi);

                // Quando l'utente clicca su "Esci", chiamiamo logout.php
                // e poi ricarichiamo la pagina per aggiornare la navbar.
                document.getElementById('logout-btn').addEventListener('click', function (evento) {
                    evento.preventDefault();

                    InfoStudioApi.request('logout.php', { method: 'POST' })
                        .done(function () {
                            window.location.reload();
                        });
                });
            }
        })
        .fail(function (errore) {
            // Se il backend non è raggiungibile, non blocchiamo la pagina:
            // semplicemente la navbar resta com'è (con il link "Accedi").
            console.warn('Backend PHP non raggiungibile. La pagina funziona comunque.');
        });


    // -----------------------------------------------------------------
    // 2) EFFETTO "INSEGNA AL NEON" CHE LAMPEGGIA SUL LOGO
    // Ogni tot millisecondi prendiamo una parte casuale del logo
    // (es. "Info", "Studio", "-", "54") e le aggiungiamo la classe
    // CSS "flicker" per un piccolo lasso di tempo, così la lettera
    // tremola come se fosse un'insegna al neon vera.
    // -----------------------------------------------------------------
    var pezziLogo = document.querySelectorAll('.logo-neon span');

    // Se nella pagina non c'è il logo, non c'è niente da animare
    if (pezziLogo.length == 0) {
        return;
    }

    // Funzione ricorsiva: sceglie uno span casuale, lo fa lampeggiare
    // e poi richiama se stessa dopo un tempo casuale.
    function lampeggiaCasuale() {

        // Math.random() restituisce un numero tra 0 e 1.
        // Lo moltiplichiamo per la lunghezza dell'array e arrotondiamo
        // in giù con floor per avere un indice valido.
        var indice = Math.floor(Math.random() * pezziLogo.length);
        var pezzo = pezziLogo[indice];

        // Aggiungiamo la classe "flicker" (lo stile è nel CSS)
        pezzo.classList.add('flicker');

        // Dopo un tempo casuale (20-150ms) togliamo la classe
        var durataLampeggio = Math.random() * 130 + 20;
        setTimeout(function () {
            pezzo.classList.remove('flicker');
        }, durataLampeggio);

        // Programmiamo il prossimo lampeggio tra 100-300ms
        var prossimoLampeggio = Math.random() * 200 + 100;
        setTimeout(lampeggiaCasuale, prossimoLampeggio);
    }

    lampeggiaCasuale();
});
