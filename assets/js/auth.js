// assets/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Peschiamo entrambi i form (uno dei due sarà "null" in base alla pagina in cui siamo)
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    // --- LOGICA DI REGISTRAZIONE ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            // Catturiamo TUTTI i campi
            const nome = document.getElementById('nome').value.trim();
            const cognome = document.getElementById('cognome').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            // Validazioni Extra
            if (!email.includes('@') || !email.includes('.')) {
                alert("❌ Inserisci un indirizzo email valido."); return;
            }
            if (password.length < 6) {
                alert("❌ La password deve contenere almeno 6 caratteri."); return; 
            }
            if (telefono.length < 9) {
                alert("❌ Inserisci un numero di telefono valido."); return;
            }

            console.log("Dati corretti, creo l'account su Supabase...");
            
            // 1. Creiamo l'utente (Email + Password)
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
            });

            if (authError) {
                alert("⚠️ Errore di registrazione: " + authError.message);
                return; // Ferma tutto se l'email esiste già
            }

            // 2. Se l'utente è stato creato, salviamo i dati extra nella tabella "profili"
            if (authData.user) {
                console.log("Account creato! Salvo il profilo...");
                
                const { error: profileError } = await supabaseClient
                    .from('profili')
                    .insert([
                        { 
                            id: authData.user.id, // Colleghiamo il profilo all'utente appena creato
                            nome: nome, 
                            cognome: cognome, 
                            telefono: telefono 
                        }
                    ]);

                if (profileError) {
                    console.error("Errore salvataggio profilo:", profileError);
                    alert("Account creato, ma c'è stato un problema col salvataggio del nome.");
                } else {
                    alert("🎉 Benvenuto nel club " + nome + "! Registrazione completata.");
                    registerForm.reset(); 
                    window.location.href = "../index.html"; 
                }
            }
        });
    }

    // --- LOGICA DI LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            // Chiamata di Login a Supabase
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                // Errore classico: password sbagliata o utente non esiste
                alert("🚫 Accesso negato: Credenziali non valide.");
            } else {
                alert("🥂 Accesso autorizzato. Bentornato!");
                loginForm.reset();
                window.location.href = "prenotazioni.html"; // Mandiamolo dritto a prenotare!
            }
        });
    }
});