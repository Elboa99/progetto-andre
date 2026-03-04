/**
 * Pagina pubblica "I Nostri Immobili" — Carica dalla collection Firestore 'properties'
 * Sostituisce i card mockup con dati reali
 */

let allProperties = []; // Memorizza tutti gli immobili pubblicati base-caricati

document.addEventListener('DOMContentLoaded', () => {
    // Attendi che Firebase sia pronto
    const checkReady = setInterval(() => {
        if (typeof db !== 'undefined') {
            clearInterval(checkReady);
            loadPublicProperties();
        }
    }, 100);

    // Setup listener filtro
    const btnSearch = document.getElementById('btnSearch');
    if (btnSearch) {
        btnSearch.addEventListener('click', filterProperties);
    }
});

async function loadPublicProperties() {
    const container = document.getElementById('propertiesContainer');
    if (!container) return;

    try {
        const snapshot = await db.collection("properties")
            .where("status", "==", "published")
            .orderBy("createdAt", "desc")
            .get();

        if (snapshot.empty) {
            container.innerHTML = `
                <div style="text-align:center; padding: 80px 20px; color: #666;">
                    <i class="fa-solid fa-house-chimney" style="font-size: 3rem; color: #ddd; display:block; margin-bottom:20px;"></i>
                    <p style="font-size:1.2rem;" data-i18n="prop-empty">Stiamo aggiornando il catalogo... Coming soon!</p>
                    <p style="margin-top:10px;" data-i18n="prop-empty-sub">Torna a trovarci a breve per scoprire le nuove proprietà.</p>
                </div>
            `;
            if (typeof setLanguage === 'function') setLanguage(localStorage.getItem('gk_language') || 'it');
            return;
        }

        allProperties = [];
        const uniqueZones = new Set();
        const uniqueTypes = new Set();

        snapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;

            if (!data.type) data.type = 'Appartamento';

            allProperties.push(data);

            if (data.location) {
                // Prende l'intera stringa della location (es. "Milano, Centro") 
                // oppure potremmo prendere solo la prima parte. Per ora manteniamo l'intera stringa
                uniqueZones.add(data.location.trim());
            }
            if (data.type) {
                uniqueTypes.add(data.type.trim());
            }
        });

        // Popola tendina Zone dinamicamente
        populateZoneDropdown(uniqueZones);
        populateTypeDropdown(uniqueTypes);

        // Mostra tutti gli immobili all'avvio
        renderPropertiesCardList(allProperties);

    } catch (error) {
        console.error("Errore caricamento immobili pubblici:", error);
        container.innerHTML = `
            <div style="text-align:center; padding: 80px 20px; color: #666;">
                <i class="fa-solid fa-house-chimney" style="font-size: 3rem; color: #ddd; display:block; margin-bottom:20px;"></i>
                <p style="font-size:1.2rem;" data-i18n="prop-empty">Stiamo aggiornando il catalogo... Coming soon!</p>
                <p style="margin-top:10px;" data-i18n="prop-empty-sub">Torna a trovarci a breve per scoprire le nuove proprietà.</p>
            </div>
        `;
        if (typeof setLanguage === 'function') setLanguage(localStorage.getItem('gk_language') || 'it');
    }
}

function populateZoneDropdown(zonesSet) {
    const zoneSelect = document.getElementById('searchZone');
    if (!zoneSelect) return;

    // Mantieni l'opzione "Tutte le zone" e rimuovi il resto
    zoneSelect.innerHTML = '<option value="">Tutte le zone</option>';

    // Ordina alfabeticamente
    const sortedZones = Array.from(zonesSet).sort();

    sortedZones.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone;
        option.textContent = zone;
        zoneSelect.appendChild(option);
    });
}

function populateTypeDropdown(typesSet) {
    const typeSelect = document.getElementById('searchType');
    if (!typeSelect) return;

    // Mantieni l'opzione "Tutti i tipi"
    typeSelect.innerHTML = '<option value="">Tutti i tipi</option>';

    // Ordina alfabeticamente
    const sortedTypes = Array.from(typesSet).sort();

    sortedTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });
}

function filterProperties() {
    const searchZone = document.getElementById('searchZone')?.value || '';
    const searchType = document.getElementById('searchType')?.value || '';
    const searchPrice = document.getElementById('searchPrice')?.value;
    const maxPrice = searchPrice ? parseFloat(searchPrice) : null;

    const filtered = allProperties.filter(prop => {
        let matchZone = true;
        let matchType = true;
        let matchPrice = true;

        if (searchZone !== '') {
            matchZone = prop.location === searchZone;
        }

        if (searchType !== '') {
            matchType = prop.type === searchType;
        }

        if (maxPrice && !isNaN(maxPrice)) {
            // Assumo che prop.price sia un numero o una stringa numerica
            const price = parseFloat(prop.price);
            if (!isNaN(price)) {
                matchPrice = price <= maxPrice;
            }
        }

        return matchZone && matchType && matchPrice;
    });

    renderPropertiesCardList(filtered);
}

function renderPropertiesCardList(propertiesToRender) {
    const container = document.getElementById('propertiesContainer');
    if (!container) return;

    container.innerHTML = '';

    if (propertiesToRender.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 60px; color: #666;">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; color: #ddd; display:block; margin-bottom:15px;"></i>
                <p style="font-size:1.1rem;" data-i18n="prop-no-match">Nessun immobile corrisponde ai criteri di ricerca.</p>
                <p style="margin-top:10px;"><a href="#" onclick="resetFilters(event)" style="color:#bfa15f; text-decoration:underline;" data-i18n="prop-reset">Resetta i filtri</a></p>
            </div>
        `;
        if (typeof setLanguage === 'function') setLanguage(localStorage.getItem('gk_language') || 'it');
        return;
    }

    propertiesToRender.forEach(data => {
        const id = data.id;
        const thumbUrl = data.coverImage || data.images?.[0] || 'assets/images/placeholder-villa.jpg';
        const title = data.title || 'Immobile';
        const location = data.location || '';
        const price = data.price || '—';
        const beds = data.specs?.beds || 0;
        const rooms = data.specs?.rooms || 0;
        const baths = data.specs?.baths || 0;
        const area = data.specs?.area || 0;
        const description = data.description || '';

        const shortDesc = description.length > 150 ? description.substring(0, 150) + '...' : description;

        const card = document.createElement('a');
        card.href = `property.html?id=${id}`;
        card.className = 'property-card-horizontal';
        card.innerHTML = `
            <div class="property-img">
                <img src="${thumbUrl}" alt="${title}"
                     onerror="this.src='https://via.placeholder.com/600x400/1b3a1b/c9a227?text=GoldenKey'">
            </div>
            <div class="property-info">
                <div>
                    <div class="property-header">
                        <h2>${title}</h2>
                        <div class="property-location"><i class="fa-solid fa-location-dot"></i> ${location}</div>
                    </div>

                    <div class="property-specs">
                        <div class="spec-item" title="Posti letto"><i class="fa-solid fa-user-group"></i> ${beds}</div>
                        <div class="spec-item" title="Camere"><i class="fa-solid fa-bed"></i> ${rooms}</div>
                        <div class="spec-item" title="Bagni"><i class="fa-solid fa-bath"></i> ${baths}</div>
                        <div class="spec-item" title="Metri quadri"><i class="fa-solid fa-ruler-combined"></i> ${area} mq</div>
                    </div>

                    <p class="property-desc">${shortDesc}</p>
                </div>

                <div class="property-footer">
                    <div class="property-price">€ ${price} <span data-i18n="prop-search-price">/ Notte</span></div>
                    <div class="btn-view" data-i18n="prop-view-btn">Vedi Dettagli</div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    if (typeof setLanguage === 'function') setLanguage(localStorage.getItem('gk_language') || 'it');
}

function resetFilters(e) {
    e.preventDefault();
    const searchZone = document.getElementById('searchZone');
    const searchPrice = document.getElementById('searchPrice');

    if (searchZone) searchZone.value = '';
    if (searchPrice) searchPrice.value = '';

    filterProperties();
}
