/**
 * Gestione Pagina Richieste Contatto in admin/requests.html
 */

document.addEventListener('DOMContentLoaded', () => {
    // Aspetta che Firebase Auth sia pronto
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadRequests();
        }
    });
});

async function loadRequests() {
    const container = document.getElementById('requestsBox');

    try {
        // Recupera dalla collection 'contacts'
        // Non avendo salvato una data standardizzata in main.js, i documenti potremmo prenderli così come sono,
        // ma Firestore restituisce i documenti in ordine approssimativo di iterazione, li ordineremo via JS se serve.
        const snapshot = await db.collection("contacts").get();

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-envelope-open"></i>
                    <p>Nessun messaggio ricevuto al momento.</p>
                </div>
            `;
            return;
        }

        // Convertiamo in array per poter visualizzare le aggiunte più recenti per ultime (ipotizzando che gli ID siano cronologici o semplicemente rovesciando l'ordine)
        let docs = [];
        snapshot.forEach(doc => {
            docs.push({ id: doc.id, data: doc.data() });
        });

        // Reverse array per avere le ultime inviate in cima (Approssimato senza un timestamp nativo di Firebase in write)
        docs.reverse();

        container.innerHTML = ''; // Svuota il loading message

        docs.forEach(item => {
            const data = item.data;
            const id = item.id;

            const name = data.name || 'Cliente Anonimo';
            const email = data.email || 'Nessuna Email';
            const phone = data.phone || 'Nessun Numero';
            const message = data.message || 'Nessun messaggio fornito.';
            const source = data.source || 'Sorgente Sconosciuta';

            // Costruiamo la Card della richiesta
            const card = document.createElement('div');
            card.className = 'request-card';
            card.innerHTML = `
                <div class="req-header">
                    <div>
                        <div class="req-client-name">${name}</div>
                        <div class="req-source"><i class="fa-solid fa-tag"></i> Modulo: ${source}</div>
                    </div>
                </div>

                <div class="req-details">
                    <div class="req-detail-item">
                        <i class="fa-solid fa-envelope"></i>
                        <a href="mailto:${email}" style="color:var(--text); text-decoration:none;">${email}</a>
                    </div>
                    <div class="req-detail-item">
                        <i class="fa-solid fa-phone"></i>
                        <a href="tel:${phone}" style="color:var(--text); text-decoration:none;">${phone}</a>
                    </div>
                </div>

                <div class="req-message">
                    ${message}
                </div>

                <div class="req-actions">
                    <button class="btn-delete" onclick="deleteRequest('${id}')">
                        <i class="fa-solid fa-trash"></i> Segna come Letto / Archivia
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Errore caricamento richieste:", error);
        container.innerHTML = `
            <div class="empty-state" style="color: var(--danger); border-color: var(--danger);">
                <i class="fa-solid fa-triangle-exclamation" style="color: var(--danger);"></i>
                <p>Errore caricamento messaggi dal Database.</p>
            </div>
        `;
    }
}

// Elimina (Archivia) richiesta
async function deleteRequest(id) {
    if (confirm(`Vuoi rimuovere questo messaggio dalla vista?`)) {
        try {
            await db.collection("contacts").doc(id).delete();
            // Ricarichiamo la lista
            loadRequests();
        } catch (error) {
            console.error("Errore eliminazione:", error);
            alert("Errore archiviazione: " + error.message);
        }
    }
}
