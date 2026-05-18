// =====================================================================
// auth.js
// Gestisce i form di registrazione e di login.
// Comunica col backend PHP usando AJAX (tramite jQuery)
// =====================================================================

// Aspettiamo che il documento HTML sia pronto prima di agganciare gli eventi
// In questo modo siamo sicuri che i campi del form esistano nel DOM
$(document).ready(function () {

    // Prendiamo i due form. In ogni pagina di solito ce n'è solo uno dei due,
    // quindi uno dei due valori sarà null
    var formRegistrazione = document.getElementById('register-form');
    var formLogin = document.getElementById('login-form');


    // -----------------------------------------------------------------
    // FORM DI REGISTRAZIONE
    // -----------------------------------------------------------------
    if (formRegistrazione != null) {

        formRegistrazione.addEventListener('submit', function (evento) {
            // Evitiamo che il browser ricarichi la pagina al submit:
            // vogliamo mandare i dati con AJAX
            evento.preventDefault();

            // Leggiamo i valori scritti dall'utente nei campi del form
            var nome     = document.getElementById('nome').value.trim();
            var cognome  = document.getElementById('cognome').value.trim();
            var telefono = document.getElementById('telefono').value.trim();
            var email    = document.getElementById('email').value.trim();
            var password = document.getElementById('password').value;


            // Controlli lato client 

            // L'email deve contenere almeno una @ e un punto
            if (email.indexOf('@') == -1 || email.indexOf('.') == -1) {
                mostraMessaggio(formRegistrazione, 'Inserisci un indirizzo email valido.', 'error-msg');
                return;
            }

            // La password deve essere lunga almeno 6 caratteri
            if (password.length < 6) {
                mostraMessaggio(formRegistrazione, 'La password deve contenere almeno 6 caratteri.', 'error-msg');
                return;
            }

            // Il telefono deve avere almeno 8 cifre
            // Usiamo replace con una regex semplice per togliere i non-numeri
            var soloCifre = telefono.replace(/[^0-9]/g, '');
            if (soloCifre.length < 8) {
                mostraMessaggio(formRegistrazione, 'Inserisci un numero di telefono valido.', 'error-msg');
                return;
            }


            // Chiamata AJAX al backend PHP
            // Usiamo $.ajax di jQuery con il pattern visto a lezione:
            // success: viene chiamata se la risposta è 2xx
            // error:   viene chiamata se c'è un errore di rete o HTTP
            $.ajax({
                url: '../api/register.php',
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify({
                    nome:     nome,
                    cognome:  cognome,
                    telefono: telefono,
                    email:    email,
                    password: password
                }),
                success: function (risposta) {
                    // Il PHP risponde sempre con un oggetto che ha il campo "success"
                    // Se è false, mostriamo il messaggio che ci ha mandato il server
                    if (risposta.success == false) {
                        mostraMessaggio(formRegistrazione, risposta.message, 'error-msg');
                        return;
                    }

                    // Registrazione andata a buon fine: mostriamo un messaggio
                    // di benvenuto e dopo 1.5 secondi mandiamo l'utente in home
                    mostraMessaggio(formRegistrazione, 'Benvenuto nel club ' + nome + '!', 'success-msg');
                    setTimeout(function () {
                        window.location.href = '../index.html';
                    }, 1500);
                },
                error: function (xhr) {
                    // Se il server ha mandato un messaggio JSON di errore lo usiamo,
                    // altrimenti mostriamo un messaggio generico
                    var messaggio = 'Registrazione non riuscita. Riprova tra poco.';
                    if (xhr.responseJSON != null && xhr.responseJSON.message != null) {
                        messaggio = xhr.responseJSON.message;
                    }
                    mostraMessaggio(formRegistrazione, messaggio, 'error-msg');
                }
            });
        });
    }


    // -----------------------------------------------------------------
    // FORM DI LOGIN
    // -----------------------------------------------------------------
    if (formLogin != null) {

        formLogin.addEventListener('submit', function (evento) {
            evento.preventDefault();

            var email    = document.getElementById('login-email').value.trim();
            var password = document.getElementById('login-password').value;

            $.ajax({
                url: '../api/login.php',
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify({
                    email:    email,
                    password: password
                }),
                success: function (risposta) {
                    if (risposta.success == false) {
                        mostraMessaggio(formLogin, risposta.message, 'error-msg');
                        return;
                    }

                    mostraMessaggio(formLogin, 'Accesso autorizzato. Bentornato!', 'success-msg');
                    setTimeout(function () {
                        window.location.href = '../index.html';
                    }, 1200);
                },
                error: function (xhr) {
                    var messaggio = 'Accesso non riuscito. Controlla email e password.';
                    if (xhr.responseJSON != null && xhr.responseJSON.message != null) {
                        messaggio = xhr.responseJSON.message;
                    }
                    mostraMessaggio(formLogin, messaggio, 'error-msg');
                }
            });
        });
    }
});


// =====================================================================
// FUNZIONI DI UTILITÀ
// =====================================================================

// Mostra un messaggio (di errore o di successo) sotto al form
// - elementoForm: il form a cui aggiungere il messaggio
// - testo:        il testo da scrivere
// - classeCSS:    'error-msg' oppure 'success-msg'
function mostraMessaggio(elementoForm, testo, classeCSS) {

    // Rimuoviamo eventuali messaggi precedenti
    var vecchi = elementoForm.querySelectorAll('.success-msg, .error-msg');
    for (var i = 0; i < vecchi.length; i++) {
        vecchi[i].remove();
    }

    // Creiamo un nuovo <div> con il testo e lo aggiungiamo in fondo al form
    var div = document.createElement('div');
    div.className = classeCSS;
    div.textContent = testo;
    elementoForm.appendChild(div);
}
