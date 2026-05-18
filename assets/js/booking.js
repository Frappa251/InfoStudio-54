// =====================================================================
// booking.js
// Gestisce la pagina di prenotazione del tavolo:
//   - precompila nome/email se l'utente è già loggato
//   - aggiorna il riepilogo in tempo reale (tavolo, persone, prezzo)
//   - valida i campi del form
//   - genera un PDF con il riepilogo
//   - manda la prenotazione al backend e poi reindirizza a Stripe
// =====================================================================

document.addEventListener('DOMContentLoaded', function () {

    // -----------------------------------------------------------------
    // Riferimenti ai campi del form e agli elementi del riepilogo
    // -----------------------------------------------------------------
    var formPrenotazione   = document.getElementById('bookingForm');
    var selTipoTavolo      = document.getElementById('tipo_tavolo');
    var inputNumeroPersone = document.getElementById('numero_persone');
    var inputData          = document.getElementById('data_prenotazione');
    var selPrefisso        = document.getElementById('telefono_prefisso');
    var inputTelefono      = document.getElementById('telefono_numero');

    var bottoneInvia       = document.getElementById('submitBtn');
    var bottonePdf         = document.getElementById('downloadPdfBtn');

    var spanTavolo  = document.getElementById('summaryTable');
    var spanPersone = document.getElementById('summaryPeople');
    var spanPrezzo  = document.getElementById('summaryPrice');
    var pMessaggio  = document.getElementById('formMessage');


    // -----------------------------------------------------------------
    // Impediamo di scegliere una data nel passato
    // toISOString() restituisce "YYYY-MM-DDTHH:MM:SS.sssZ",
    // split('T')[0] prende solo la parte della data
    // -----------------------------------------------------------------
    var oggi = new Date().toISOString().split('T')[0];
    inputData.min = oggi;


    // -----------------------------------------------------------------
    // Link di pagamento Stripe per ogni tipo di tavolo
    // Sono "link di test" forniti da Stripe per le demo
    // l'utente paga in modalità simulata
    // -----------------------------------------------------------------
    var linkStripe = {
        1: 'https://buy.stripe.com/test_00w7sM82q5BadxP3vl2Nq01',
        2: 'https://buy.stripe.com/test_bJebJ2fuSfbK51j2rh2Nq02',
        3: 'https://buy.stripe.com/test_4gMaEYfuS9Rq65n2rh2Nq03'
    };


    // =================================================================
    // AUTOCOMPILAZIONE DATI UTENTE
    // Se l'utente è loggato, riempiamo automaticamente nome, email
    // e telefono prendendoli dal suo profilo (chiamata a me.php)
    // =================================================================
    function precompilaDati() {

        $.ajax({
            url: '../api/me.php',
            type: 'GET',
            dataType: 'json',

            success: function (risposta) {

                if (risposta.authenticated == false || risposta.user == null) {
                    return;
                }

                var inputEmail = document.getElementById('email');
                inputEmail.value = risposta.user.email;

                // Rendiamo l'email non modificabile: l'utente loggato deve
                // usare per forza l'email del suo account
                inputEmail.readOnly = true;
                inputEmail.style.opacity = '0.7';

                // Mettiamo nome e cognome insieme nel campo "Nome e cognome"
                document.getElementById('nome').value = risposta.user.nome + ' ' + risposta.user.cognome;

                // Telefono: prendiamo solo le cifre, max 10
                if (risposta.user.telefono != null) {
                    var soloCifre = risposta.user.telefono.replace(/[^0-9]/g, '');
                    if (soloCifre.length > 10) {
                        soloCifre = soloCifre.substring(0, 10);
                    }
                    inputTelefono.value = soloCifre;
                }
            },

            error: function (xhr) {
                InfoStudioApi.logError('autocompilazione prenotazione', xhr);
            }
        });
    }

    precompilaDati();


    // =================================================================
    // FUNZIONI DI UTILITÀ PER LA VALIDAZIONE
    // =================================================================

    // Imposta il messaggio sotto al form (positivo, negativo o neutro)
    function mostraMessaggio(testo, tipo) {
        pMessaggio.textContent = testo;
        pMessaggio.className = 'booking-page__message';

        if (tipo != null && tipo != '') {
            pMessaggio.classList.add(tipo);
        }
    }

    // Toglie le classi di errore/valido da un campo
    function resetCampo(campo) {
        campo.classList.remove('input-error');
        campo.classList.remove('input-valid');
    }

    function segnalaErrore(campo) {
        campo.classList.remove('input-valid');
        campo.classList.add('input-error');
    }

    function segnalaOk(campo) {
        campo.classList.remove('input-error');
        campo.classList.add('input-valid');
    }


    // =================================================================
    // GESTIONE DEL RIEPILOGO
    // Ogni volta che cambia tavolo o numero persone, aggiorniamo
    // le scritte "Tavolo / Persone / Totale" nel box riepilogo
    // =================================================================

    // Restituisce un oggetto con i dati del tavolo selezionato,
    // oppure null se non è stato selezionato nulla
    function leggiDatiTavolo() {

        var opzioneSelezionata = selTipoTavolo.options[selTipoTavolo.selectedIndex];
        var numeroPersone      = parseInt(inputNumeroPersone.value, 10);

        if (isNaN(numeroPersone)) {
            numeroPersone = 0;
        }

        // Se non è stata scelta alcuna opzione valida, restituiamo null
        if (opzioneSelezionata == null || opzioneSelezionata.value == '') {
            return null;
        }

        var prezzoTotale = parseFloat(opzioneSelezionata.dataset.prezzo);

        // Il testo è del tipo "Standard - €100 - max 4 persone"
        // Ci serve solo "Standard": tagliamo al primo " - "
        var nomeTavolo = opzioneSelezionata.textContent.split(' - ')[0];

        // Prezzo per persona (se sono state inserite delle persone)
        var prezzoPerPersona = null;
        if (numeroPersone > 0) {
            prezzoPerPersona = (prezzoTotale / numeroPersone).toFixed(2);
        }

        return {
            nomeTavolo:       nomeTavolo,
            numeroPersone:    numeroPersone,
            prezzoTotale:     prezzoTotale,
            prezzoPerPersona: prezzoPerPersona
        };
    }

    function aggiornaRiepilogo() {

        var dati = leggiDatiTavolo();

        if (dati == null) {
            spanTavolo.textContent  = '-';
            spanPersone.textContent = '-';
            spanPrezzo.textContent  = '-';
            return;
        }

        spanTavolo.textContent = dati.nomeTavolo;

        if (dati.numeroPersone > 0) {
            spanPersone.textContent = dati.numeroPersone;
            spanPrezzo.textContent  = '€' + dati.prezzoTotale + ' (€' + dati.prezzoPerPersona + '/persona)';
        } else {
            spanPersone.textContent = '-';
            spanPrezzo.textContent  = '€' + dati.prezzoTotale;
        }
    }


    // =================================================================
    // VALIDAZIONE DEL FORM PRIMA DI INVIARE
    // Controlla tutti i campi e mette le classi CSS giuste per
    // evidenziare visivamente quelli sbagliati
    // =================================================================
    function validaForm(dati) {

        var tuttoOk = true;

        var campoNome     = document.getElementById('nome');
        var campoEmail    = document.getElementById('email');
        var campoPrefisso = selPrefisso;
        var campoTelefono = inputTelefono;
        var campoData     = inputData;
        var campoPersone  = inputNumeroPersone;
        var campoTavolo   = selTipoTavolo;

        // Resettiamo lo stato visivo di tutti i campi
        resetCampo(campoNome);
        resetCampo(campoEmail);
        resetCampo(campoPrefisso);
        resetCampo(campoTelefono);
        resetCampo(campoData);
        resetCampo(campoPersone);
        resetCampo(campoTavolo);

        // Nome: almeno 3 caratteri
        if (dati.nome.length < 3) {
            segnalaErrore(campoNome);
            tuttoOk = false;
        } else {
            segnalaOk(campoNome);
        }

        // Email: deve passare una regex semplice (qualcosa@qualcosa.qualcosa)
        var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(dati.email)) {
            segnalaErrore(campoEmail);
            tuttoOk = false;
        } else {
            segnalaOk(campoEmail);
        }

        // Prefisso telefonico
        if (dati.prefisso == '') {
            segnalaErrore(campoPrefisso);
            tuttoOk = false;
        } else {
            segnalaOk(campoPrefisso);
        }

        // Telefono: deve essere esattamente 10 cifre
        var regexTelefono = /^[0-9]{10}$/;
        if (!regexTelefono.test(dati.telefono)) {
            segnalaErrore(campoTelefono);
            tuttoOk = false;
        } else {
            segnalaOk(campoTelefono);
        }

        // Data
        if (dati.data == '') {
            segnalaErrore(campoData);
            tuttoOk = false;
        } else {
            segnalaOk(campoData);
        }

        // Numero persone
        if (dati.persone < 1) {
            segnalaErrore(campoPersone);
            tuttoOk = false;
        } else {
            segnalaOk(campoPersone);
        }

        // Tavolo
        if (dati.opzioneTavolo == null || dati.opzioneTavolo.value == '') {
            segnalaErrore(campoTavolo);
            tuttoOk = false;
        } else {
            segnalaOk(campoTavolo);
        }

        return tuttoOk;
    }


    // =================================================================
    // GENERAZIONE PDF DEL RIEPILOGO
    // Usiamo la libreria jsPDF (caricata da CDN nell'HTML)
    // =================================================================
    function generaPDF() {

        var nome     = document.getElementById('nome').value.trim();
        var email    = document.getElementById('email').value.trim();
        var telefono = selPrefisso.value + ' ' + inputTelefono.value;
        var data     = inputData.value;
        var note     = document.getElementById('note').value.trim();

        if (nome == '')  { nome  = '-'; }
        if (email == '') { email = '-'; }
        if (data == '')  { data  = '-'; }
        if (note == '')  { note  = '-'; }

        var datiTavolo = leggiDatiTavolo();

        if (datiTavolo == null) {
            mostraMessaggio('Seleziona almeno un tavolo prima di scaricare il PDF.', 'error');
            return;
        }

        // Creiamo il documento PDF usando la libreria jsPDF
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF();

        // Intestazione
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('InfoStudio-54', 20, 20);

        doc.setFontSize(16);
        doc.text('Riepilogo prenotazione', 20, 35);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);

        // Riempiamo il PDF riga per riga
        var righe = [
            'Nome: ' + nome,
            'Email: ' + email,
            'Telefono: ' + telefono,
            'Data prenotazione: ' + data,
            'Tavolo: ' + datiTavolo.nomeTavolo,
            'Numero persone: ' + datiTavolo.numeroPersone,
            'Prezzo totale: €' + datiTavolo.prezzoTotale,
            'Note: ' + note
        ];

        var y = 55;
        for (var i = 0; i < righe.length; i++) {
            doc.text(righe[i], 20, y);
            y = y + 10;
        }

        doc.save('riepilogo-prenotazione.pdf');
    }


    // =================================================================
    // EVENT LISTENER
    // =================================================================

    // Quando l'utente cambia tavolo o numero persone, aggiorniamo il riepilogo
    selTipoTavolo.addEventListener('change', aggiornaRiepilogo);
    inputNumeroPersone.addEventListener('input', aggiornaRiepilogo);

    // Quando scrive nel telefono teniamo solo cifre e max 10 caratteri
    inputTelefono.addEventListener('input', function () {
        var soloCifre = inputTelefono.value.replace(/[^0-9]/g, '');
        if (soloCifre.length > 10) {
            soloCifre = soloCifre.substring(0, 10);
        }
        inputTelefono.value = soloCifre;
    });

    // Quando l'utente esce dal campo telefono, mostriamo verde o rosso
    inputTelefono.addEventListener('blur', function () {

        if (inputTelefono.value == '') {
            resetCampo(inputTelefono);
            return;
        }

        var regexTelefono = /^[0-9]{10}$/;
        if (regexTelefono.test(inputTelefono.value)) {
            segnalaOk(inputTelefono);
        } else {
            segnalaErrore(inputTelefono);
        }
    });

    // Bottone "Scarica PDF"
    bottonePdf.addEventListener('click', generaPDF);


    // =================================================================
    // CLICK SUL BOTTONE "VAI AL PAGAMENTO"
    // 1) Validiamo i campi
    // 2) Mandiamo la prenotazione al backend (create_booking.php)
    // 3) Se il backend salva tutto, reindirizziamo al link Stripe
    // =================================================================
    bottoneInvia.addEventListener('click', function () {

        mostraMessaggio('', '');

        // Leggiamo tutti i valori del form
        var datiForm = {
            nome:          document.getElementById('nome').value.trim(),
            email:         document.getElementById('email').value.trim(),
            prefisso:      selPrefisso.value,
            telefono:      inputTelefono.value.trim(),
            data:          inputData.value,
            persone:       parseInt(inputNumeroPersone.value, 10),
            opzioneTavolo: selTipoTavolo.options[selTipoTavolo.selectedIndex]
        };

        if (isNaN(datiForm.persone)) {
            datiForm.persone = 0;
        }

        // Validazione
        var formValido = validaForm(datiForm);
        if (formValido == false) {
            mostraMessaggio('Compila correttamente tutti i campi prima di procedere.', 'error');
            return;
        }

        // Controlliamo che il numero di persone non superi il massimo del tavolo
        var maxPersone = parseInt(datiForm.opzioneTavolo.dataset.max, 10);
        if (datiForm.persone > maxPersone) {
            segnalaErrore(inputNumeroPersone);
            mostraMessaggio('Questo tavolo accetta al massimo ' + maxPersone + ' persone.', 'error');
            return;
        }

        var idTavolo = parseInt(datiForm.opzioneTavolo.value, 10);
        var note     = document.getElementById('note').value.trim();
        var telefonoCompleto = datiForm.prefisso + ' ' + datiForm.telefono;

        mostraMessaggio('Verifico la disponibilità del tavolo...', '');

        // Chiamata AJAX al backend
        $.ajax({
            url: '../api/create_booking.php',
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            data: JSON.stringify({
                tavolo_id:         idTavolo,
                data_evento:       datiForm.data,
                numero_persone:    datiForm.persone,
                nome_contatto:     datiForm.nome,
                email_contatto:    datiForm.email,
                telefono_contatto: telefonoCompleto,
                note:              note
            }),

            success: function (risposta) {

                if (risposta.success == false) {
                    mostraMessaggio(risposta.message, 'error');
                    return;
                }

                // Prenotazione salvata: andiamo al link Stripe del tavolo scelto
                var url = linkStripe[idTavolo];

                if (url == null) {
                    mostraMessaggio('Link di pagamento non configurato per questo tavolo.', 'error');
                    return;
                }

                mostraMessaggio('Prenotazione confermata! Reindirizzamento al pagamento...', 'success');

                // Aspettiamo 1.5 secondi per far leggere il messaggio, poi cambiamo pagina
                setTimeout(function () {
                    window.location.href = url;
                }, 1500);
            },

            error: function (xhr) {
                InfoStudioApi.logError('creazione prenotazione', xhr);
                var messaggio = InfoStudioApi.userMessage(xhr, 'Per effettuare una prenotazione è necessario fare il login.');
                mostraMessaggio(messaggio, 'error');
            }
        });
    });


    // All'avvio mostriamo subito il riepilogo (sarà "-" finché l'utente non sceglie)
    aggiornaRiepilogo();
});
