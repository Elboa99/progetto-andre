/**
 * Gestione Autenticazione Firebase (Admin Panel)
 */

const auth = firebase.auth();

// 1. Funzione di Login (chiamata dalla pagina admin/index.html)
async function loginAdmin(event) {
    event.preventDefault(); // Previene il ricaricamento della pagina

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('auth-error');
    const submitBtn = document.querySelector('button[type="submit"]');

    // Reset errori e stato bottone
    errorMsg.style.display = 'none';
    errorMsg.innerText = '';
    const oldText = submitBtn.innerText;
    submitBtn.innerText = 'Accesso in corso...';
    submitBtn.disabled = true;

    try {
        // Tenta il login con Firebase
        await auth.signInWithEmailAndPassword(email, password);
        // Se ha successo, reindirizza alla dashboard
        window.location.href = '/admin/dashboard.html';
    } catch (error) {
        console.error("Errore login:", error);
        // Mostra il messaggio di errore
        let msg = "Errore durante l'accesso.";
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            msg = "Password errata riprova";
        } else if (error.code === 'auth/too-many-requests') {
            msg = "Troppi tentativi falliti. Riprova più tardi.";
        } else {
            msg = "Errore: Inserisci Email e Password corrette. (" + error.code + ")";
        }

        errorMsg.innerText = msg;
        errorMsg.style.display = 'block';
        submitBtn.innerText = oldText;
        submitBtn.disabled = false;
    }
}

// 2. Funzione di Logout
async function logoutAdmin(event) {
    if (event) event.preventDefault();
    try {
        await auth.signOut();
        window.location.href = '/admin/index.html'; // Torna al login
    } catch (error) {
        console.error("Errore disconnessione:", error);
    }
}

// 3. Guardia di Sicurezza (chiamata sulle pagine interne tipo dashboard/edit)
function requireAuth() {
    // Osserva i cambiamenti di stato dell'utente
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // Se l'utente non è loggato, caccialo fuori!
            window.location.href = '/admin/index.html';
        }
    });
}

// 4. (Opzionale) Redirezione veloce se si è già loggati e si apre la pagina di Login
function redirectIfLoggedIn() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            window.location.href = '/admin/dashboard.html';
        }
    });
}
