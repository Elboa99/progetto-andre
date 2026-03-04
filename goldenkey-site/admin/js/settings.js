/**
 * Gestione Pagina Impostazioni (Cambio Credenziali Admin)
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnUpdateSettings = document.getElementById('btnUpdateSettings');

    if (btnUpdateSettings) {
        btnUpdateSettings.addEventListener('click', updateCredentials);
    }
});

async function updateCredentials() {
    const newEmail = document.getElementById('newEmail').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const msgEl = document.getElementById('settingsMsg');

    msgEl.innerText = "";
    msgEl.style.color = "inherit";

    if (!newEmail && !newPassword) {
        alert("Inserisci almeno un nuovo dato (Email o Password) da aggiornare.");
        return;
    }

    if (!currentPassword) {
        alert("Devi confermare la tua password attuale per poter effettuare modifiche critiche.");
        return;
    }

    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Utente non autenticato.");
        return;
    }

    try {
        // 1. Riautenticazione obbligatoria per Firebase quando si cambiano email o password
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
        await user.reauthenticateWithCredential(credential);

        let successMsg = "Modifiche effettuate con successo.\n";

        // 2. Modifica Email (se richiesta)
        if (newEmail && newEmail !== user.email) {
            await user.updateEmail(newEmail);
            successMsg += "- La tua email di accesso è stata aggiornata.\n";
        }

        // 3. Modifica Password (se richiesta)
        if (newPassword) {
            if (newPassword.length < 6) {
                alert("La nuova password deve essere di almeno 6 caratteri.");
                return;
            }
            await user.updatePassword(newPassword);
            successMsg += "- La tua password è stata modificata.\n";
        }

        // Finito
        msgEl.innerText = successMsg;
        msgEl.style.color = "var(--admin-success)";

        // Pulisci i campi
        document.getElementById('newEmail').value = "";
        document.getElementById('newPassword').value = "";
        document.getElementById('currentPassword').value = "";

    } catch (error) {
        console.error("Errore aggiornamento credenziali:", error);
        msgEl.innerText = "Errore: " + getReadableAuthError(error.code);
        msgEl.style.color = "var(--admin-danger)";
    }
}

// Mappatura errori Firebase
function getReadableAuthError(code) {
    if (code === 'auth/wrong-password') return 'La password attuale inserita non è corretta.';
    if (code === 'auth/invalid-email') return 'Formato della nuova email non valido.';
    if (code === 'auth/email-already-in-use') return 'La nuova email è già associata ad un altro account.';
    if (code === 'auth/weak-password') return 'La nuova password è troppo debole.';
    return 'Si è verificato un errore sconosciuto (' + code + '). Riprova.';
}
