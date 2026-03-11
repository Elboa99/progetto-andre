/**
 * Logica della pagina /admin/banner.html
 * Carica e salva lo stato del Banner degli Annunci
 */

document.addEventListener('DOMContentLoaded', () => {
    // Aspetto che Firebase sia inizializzato
    const checkReady = setInterval(() => {
        if (typeof db !== 'undefined') {
            clearInterval(checkReady);
            loadBannerSettings();
        }
    }, 100);

    // Gestione visuale label status
    document.getElementById('bannerActive').addEventListener('change', (e) => {
        const lbl = document.getElementById('statusLabel');
        if (e.target.checked) {
            lbl.textContent = "Banner ATTIVO (Visibile sul sito)";
            lbl.style.color = "var(--color-primary)";
        } else {
            lbl.textContent = "Banner disattivato (Spento)";
            lbl.style.color = "#666";
        }
    });

    // Event listeners bottoni salva
    document.getElementById('btnSaveHeader').addEventListener('click', saveBannerSettings);
    document.getElementById('btnSaveBottom').addEventListener('click', saveBannerSettings);
});

async function loadBannerSettings() {
    try {
        const docRef = db.collection('settings').doc('home_banner');
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();

            const chk = document.getElementById('bannerActive');
            chk.checked = data.isActive === true;

            // Aggiorna testuale
            const lbl = document.getElementById('statusLabel');
            if (chk.checked) {
                lbl.textContent = "Banner ATTIVO (Visibile sul sito)";
                lbl.style.color = "var(--color-primary)";
            }

            document.getElementById('bannerText').value = data.text || '';
            document.getElementById('bannerLink').value = data.link || '';
            document.getElementById('bannerLinkText').value = data.linkText || '';
        }
    } catch (error) {
        console.error("Errore caricamento impostazioni banner", error);
        alert("Errore nel caricamento dei dati del banner.");
    }
}

async function saveBannerSettings() {
    try {
        const btn1 = document.getElementById('btnSaveHeader');
        const btn2 = document.getElementById('btnSaveBottom');

        const originalText = btn1.innerHTML;
        const loadingText = '<i class="fa-solid fa-spinner fa-spin"></i> Salvataggio...';

        btn1.innerHTML = loadingText;
        btn2.innerHTML = loadingText;
        btn1.disabled = true;
        btn2.disabled = true;

        const isActive = document.getElementById('bannerActive').checked;
        const text = document.getElementById('bannerText').value.trim();
        const link = document.getElementById('bannerLink').value.trim();
        const linkText = document.getElementById('bannerLinkText').value.trim();

        const data = {
            isActive: isActive,
            text: text,
            link: link,
            linkText: linkText,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('settings').doc('home_banner').set(data, { merge: true });

        alert("Impostazioni del Banner salvate con successo!");

        btn1.innerHTML = originalText;
        btn2.innerHTML = originalText;
        btn1.disabled = false;
        btn2.disabled = false;

    } catch (error) {
        console.error("Errore salvataggio banner", error);
        alert("Si è verificato un errore durante il salvataggio.");
    }
}
