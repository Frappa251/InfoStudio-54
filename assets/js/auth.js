// assets/js/auth.js
// Registrazione e login tramite backend PHP + AJAX/jQuery.

$(document).ready(function () {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome = document.getElementById('nome').value.trim();
            const cognome = document.getElementById('cognome').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (!email.includes('@') || !email.includes('.')) {
                mostraMessaggio(registerForm, '❌ Inserisci un indirizzo email valido.', 'error-msg');
                return;
            }

            if (password.length < 6) {
                mostraMessaggio(registerForm, '❌ La password deve contenere almeno 6 caratteri.', 'error-msg');
                return;
            }

            if (telefono.replace(/\D/g, '').length < 8) {
                mostraMessaggio(registerForm, '❌ Inserisci un numero di telefono valido.', 'error-msg');
                return;
            }

            try {
                const response = await InfoStudioApi.request('register.php', {
                    method: 'POST',
                    data: { nome, cognome, telefono, email, password }
                });

                if (!response.success) {
                    mostraMessaggio(registerForm, response.message || 'Errore di registrazione.', 'error-msg');
                    return;
                }

                mostraMessaggio(registerForm, `🎉 Benvenuto nel club ${nome}! Preparati a ballare.`, 'success-msg');

                setTimeout(() => {
                    registerForm.reset();
                    window.location.href = '../index.html';
                }, 1500);
            } catch (error) {
                InfoStudioApi.logError('registrazione', error);
                const message = InfoStudioApi.userMessage(error, 'Registrazione non riuscita. Riprova tra poco.');
                mostraMessaggio(registerForm, `⚠️ ${message}`, 'error-msg');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            try {
                const response = await InfoStudioApi.request('login.php', {
                    method: 'POST',
                    data: { email, password }
                });

                if (!response.success) {
                    mostraMessaggio(loginForm, response.message || 'Credenziali non valide.', 'error-msg');
                    return;
                }

                mostraMessaggio(loginForm, '🥂 Accesso autorizzato. Bentornato!', 'success-msg');

                setTimeout(() => {
                    loginForm.reset();
                    window.location.href = '../index.html';
                }, 1200);
            } catch (error) {
                InfoStudioApi.logError('login', error);
                const message = InfoStudioApi.userMessage(error, 'Accesso non riuscito. Controlla email e password.');
                mostraMessaggio(loginForm, `🚫 ${message}`, 'error-msg');
            }
        });
    }
});

function mostraMessaggio(formElement, testo, classeCSS) {
    const vecchiMessaggi = formElement.querySelectorAll('.success-msg, .error-msg');
    vecchiMessaggi.forEach(msg => msg.remove());

    const div = document.createElement('div');
    div.className = classeCSS;
    div.textContent = testo;
    formElement.appendChild(div);
}
