/**
 * Dashboard — Carica statistiche e ultimi immobili da Firestore
 */

document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadDashboard();
        }
    });
});

async function loadDashboard() {
    try {
        // 1. Fetch tutte le proprietà
        const propsSnap = await db.collection("properties").orderBy("createdAt", "desc").get();

        let total = 0;
        let published = 0;
        let drafts = 0;
        const allProps = [];

        propsSnap.forEach(doc => {
            const data = doc.data();
            total++;
            if (data.status === 'published') published++;
            else drafts++;
            allProps.push({ id: doc.id, ...data });
        });

        // 2. Fetch richieste contatti
        const contactsSnap = await db.collection("contacts").get();
        const totalContacts = contactsSnap.size;

        // 3. Aggiorna le card statistiche
        document.getElementById('statTotal').textContent = total;
        document.getElementById('statPublished').textContent = published;
        document.getElementById('statDrafts').textContent = drafts;
        document.getElementById('statContacts').textContent = totalContacts;

        // 4. Popola la tabella con i dati REALI (ultimi 5)
        const tbody = document.getElementById('dashboardTableBody');

        if (allProps.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding: 40px; color: var(--admin-text-muted);">
                        Nessun immobile trovato. <a href="edit.html" style="color:var(--color-primary); font-weight:700;">Aggiungine uno!</a>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = '';

        // Mostra solo gli ultimi 5 nella dashboard
        const recentProps = allProps.slice(0, 5);

        recentProps.forEach(data => {
            const id = data.id;
            const thumbUrl = data.coverImage || data.images?.[0] || 'https://via.placeholder.com/64x48/1b3a1b/c9a227?text=GK';
            const title = data.title || 'Senza Titolo';
            const location = data.location || 'N/A';
            const price = data.price || '0';
            const status = data.status || 'published';
            const isOnline = status === 'published';
            const statusClass = isOnline ? 'status-active' : 'status-draft';
            const statusText = isOnline ? 'Online' : 'Bozza';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="prop-main-info">
                        <img src="${thumbUrl}" alt="Thumb" class="prop-thumb"
                            onerror="this.src='https://via.placeholder.com/64x48/1b3a1b/c9a227?text=GK'">
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
                        <a href="properties.html" class="btn-icon" title="Vai alla lista"><i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Errore caricamento dashboard:", error);
    }
}
