/**
 * Gestione Tabella Immobili in admin/properties.html
 */

document.addEventListener('DOMContentLoaded', () => {
    // Aspetta che Firebase Auth sia pronto per assicurarsi che si possa leggere (se le regole lo richiedono)
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadProperties();
        }
    });
});

async function loadProperties() {
    const tbody = document.getElementById('propertiesTableBody');

    try {
        // Recupera dalla collection 'properties', in ordine decrescente di creazione (i più nuovi prima)
        const snapshot = await db.collection("properties").orderBy("createdAt", "desc").get();

        if (snapshot.empty) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding: 40px; color: #666;">
                        Nessun immobile trovato. <a href="edit.html" style="color:var(--primary);">Aggiungine uno!</a>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = ''; // Svuota il loading message

        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;

            // Thumbnail di fallback
            const thumbUrl = data.coverImage || data.images?.[0] || '../assets/images/placeholder-villa.jpg';
            const price = data.price || '0';
            const location = data.location || 'N/A';
            const title = data.title || 'Senza Titolo';

            // Gestione Status (di default se assente assumiamo 'published' / Online)
            const status = data.status || 'published';
            const isOnline = status === 'published';
            const statusClass = isOnline ? 'status-active' : 'status-draft';
            const statusText = isOnline ? 'Online' : 'Bozza / Offline';
            const toggleIcon = isOnline ? 'fa-eye-slash' : 'fa-eye';
            const toggleTitle = isOnline ? 'Metti Offline' : 'Metti Online';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="prop-main-info">
                        <img src="${thumbUrl}" alt="Thumb" class="prop-thumb"
                            onerror="this.src='https://via.placeholder.com/60x45?text=Img'">
                        <div>
                            <div class="prop-title">${title}</div>
                            <div class="prop-id">ID: ${id.substring(0, 8).toUpperCase()}</div>
                        </div>
                    </div>
                </td>
                <td>${location}</td>
                <td><strong>€ ${price}</strong></td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-btns">
                        <a href="edit.html?id=${id}" class="btn-icon" title="Modifica"><i class="fa-solid fa-pen"></i></a>
                        <button class="btn-icon" title="${toggleTitle}" onclick="togglePropertyStatus('${id}', '${status}')">
                            <i class="fa-solid ${toggleIcon}"></i>
                        </button>
                        <button class="btn-icon delete" title="Elimina" onclick="deleteProperty('${id}', '${title}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Errore caricamento immobili:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 40px; color: #d32f2f;">
                    Errore caricamento dati dal Database. Controlla la console.
                </td>
            </tr>
        `;
    }
}

// Cambia stato da published a draft e viceversa
async function togglePropertyStatus(id, currentStatus) {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
        await db.collection("properties").doc(id).update({
            status: newStatus
        });
        // Ricarichiamo la tabella
        loadProperties();
    } catch (error) {
        console.error("Errore modifica stato:", error);
        alert("Errore modifica stato: " + error.message);
    }
}

// Elimina immobile
async function deleteProperty(id, title) {
    if (confirm(`Sei SICURO di voler eliminare l'immobile "${title}"? Questa azione eliminerà anche tutte le foto e i video associati in modo irreversibile.`)) {
        try {
            // 1. Recupera il documento per avere gli URL dei file
            const doc = await db.collection("properties").doc(id).get();
            if (doc.exists) {
                const data = doc.data();
                const storage = firebase.storage();

                // Raccogli tutti gli URL da eliminare
                let fileUrls = [];
                if (data.coverImage) fileUrls.push(data.coverImage);
                if (data.images && data.images.length > 0) fileUrls.push(...data.images);
                if (data.videoTour && !data.videoTour.includes('youtube.com') && !data.videoTour.includes('vimeo.com')) {
                    fileUrls.push(data.videoTour); // Seleziona solo video caricati su Storage, non link esterni
                }

                // Rimuovi duplicati (coverImage è spesso anche dentro images[])
                fileUrls = [...new Set(fileUrls)];

                // 2. Elimina i file dallo Storage
                const deletePromises = fileUrls.map(async (url) => {
                    if (url.includes('firebasestorage.googleapis.com')) {
                        try {
                            const fileRef = storage.refFromURL(url);
                            await fileRef.delete();
                        } catch (err) {
                            console.warn("Impossibile eliminare da storage:", url, err);
                        }
                    }
                });

                // Aspetta che tutte le foto/video vengano eliminati (o ignorati se errore)
                await Promise.all(deletePromises);
            }

            // 3. Elimina il documento dal Database
            await db.collection("properties").doc(id).delete();

            // Ricarichiamo la tabella
            loadProperties();

        } catch (error) {
            console.error("Errore eliminazione:", error);
            alert("Errore eliminazione: " + error.message);
        }
    }
}
