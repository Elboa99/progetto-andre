/**
 * Logica della pagina /admin/landing.html
 * Carica e salva le impostazioni della Promo Landing
 */

document.addEventListener('DOMContentLoaded', () => {
    // Aspetto che Firebase sia inizializzato e l'utente autenticato
    const checkReady = setInterval(() => {
        if (typeof db !== 'undefined') {
            clearInterval(checkReady);
            loadLandingPromo();
        }
    }, 100);

    // Event listeners bottoni salva
    document.getElementById('btnSaveHeader').addEventListener('click', saveLandingPromo);
    document.getElementById('btnSaveBottom').addEventListener('click', saveLandingPromo);
});

async function loadLandingPromo() {
    try {
        const docRef = db.collection('settings').doc('landing_promo');
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();
            document.getElementById('promoTitle').value = data.title || '';
            document.getElementById('promoSubtitle').value = data.subtitle || '';
            document.getElementById('promoButtonText').value = data.buttonText || '';
        }
    } catch (error) {
        console.error("Errore caricamento promo landing", error);
        alert("Errore nel caricamento dei dati promozionali.");
    }
}

async function saveLandingPromo() {
    try {
        const btn1 = document.getElementById('btnSaveHeader');
        const btn2 = document.getElementById('btnSaveBottom');

        const originalText = btn1.innerHTML;
        const loadingText = '<i class="fa-solid fa-spinner fa-spin"></i> Salvataggio...';

        btn1.innerHTML = loadingText;
        btn2.innerHTML = loadingText;
        btn1.disabled = true;
        btn2.disabled = true;

        const title = document.getElementById('promoTitle').value.trim();
        const subtitle = document.getElementById('promoSubtitle').value.trim();
        const buttonText = document.getElementById('promoButtonText').value.trim();

        // Se i campi sono tutti vuoti, potremmo pulire il doc o salvare stringhe vuote.
        // Salviamo stringhe vuote. Il frontend saprà che vuoto = off
        const data = {
            title: title,
            subtitle: subtitle,
            buttonText: buttonText,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('settings').doc('landing_promo').set(data, { merge: true });

        alert("Modifiche salvate con successo! La landing page è ora aggiornata.");

        btn1.innerHTML = originalText;
        btn2.innerHTML = originalText;
        btn1.disabled = false;
        btn2.disabled = false;

    } catch (error) {
        console.error("Errore salvataggio promo", error);
        alert("Si è verificato un errore durante il salvataggio.");
    }
}
