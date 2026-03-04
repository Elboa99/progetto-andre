/**
 * Gestione Form "Inserisci Immobile"
 * - Legge i dati dal form in admin/edit.html
 * - Carica le immagini su Firebase Storage
 * - Salva l'oggetto su Firestore
 */

const form = document.getElementById('propertyForm');
const uploadArea = document.getElementById('uploadArea');
const imagePreviewContainer = document.querySelector('.images-preview');
const btnSaveHeader = document.querySelector('.topbar .btn-save');
const btnSaveBottom = document.querySelector('.form-section + div .btn-save');

let selectedFiles = []; // Array per mantenere in memoria i file (oggetti File) scelti
let selectedVideoFile = null; // File video opzionale

// 1. Gestione Drag & Drop e Selezione File
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.multiple = true;
fileInput.accept = 'image/jpeg, image/png, image/webp';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Gestione selezione Video
const videoInput = document.getElementById('videoInput');
const videoUploadHint = document.getElementById('videoUploadHint');

if (videoInput) {
    videoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('video/')) {
                // Check Max Size 50MB
                if (file.size > 50 * 1024 * 1024) {
                    alert('Il video supera i 50MB. Scegli un file più piccolo.');
                    videoInput.value = '';
                    selectedVideoFile = null;
                    return;
                }
                selectedVideoFile = file;
                videoUploadHint.innerText = `File selezionato: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                videoUploadHint.style.color = 'var(--success)';
            } else {
                alert('Seleziona un file video valido (MP4, WEBM).');
                videoInput.value = '';
                selectedVideoFile = null;
            }
        }
    });
}

function handleFiles(files) {
    // Aggiungi all'array mantenendo solo immagini
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            selectedFiles.push(file);
        }
    });
    renderPreviews();
}

function renderPreviews() {
    imagePreviewContainer.innerHTML = ''; // Pulisci anteprime precedenti
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const card = document.createElement('div');
            card.className = 'img-preview-card';

            // Etichetta "Copertina" sulla prima foto
            let badgeHtml = index === 0 ? '<div class="cover-badge">Copertina</div>' : '';

            card.innerHTML = `
                <img src="${e.target.result}" alt="Preview Foto">
                ${badgeHtml}
                <button class="btn-remove-img" type="button" onclick="removeImage(${index})"><i class="fa-solid fa-xmark"></i></button>
            `;
            imagePreviewContainer.appendChild(card);
        };
        reader.readAsDataURL(file);
    });
}

function removeImage(index) {
    selectedFiles.splice(index, 1);
    renderPreviews();
}

// 2. Salvataggio su Firebase
async function saveProperty() {
    // Raccogli dati dal form
    const title = document.getElementById('propTitle').value.trim();
    const location = document.getElementById('propLocation').value.trim();
    const price = document.getElementById('propPrice').value.trim();
    const type = document.getElementById('propType').value.trim();
    const beds = document.getElementById('propBeds').value.trim() || 0;
    const rooms = document.getElementById('propRooms').value.trim() || 0;
    const baths = document.getElementById('propBaths').value.trim() || 0;
    const area = document.getElementById('propArea').value.trim() || 0;
    const energyClass = document.getElementById('propEnergyClass').value;
    const ipe = document.getElementById('propIpe').value.trim();
    const description = document.getElementById('propDescription').value.trim();
    const videoUrl = document.getElementById('propVideoTour').value.trim();

    // Raccogli servizi (Checkboxes)
    const services = [];
    document.querySelectorAll('input[name="services"]:checked').forEach(cb => {
        services.push(cb.value);
    });

    // Validazione base
    if (!title || !location || !price) {
        alert("Attenzione: Compila almeno Titolo, Zona e Prezzo per notta.");
        return;
    }
    if (selectedFiles.length === 0) {
        alert("Attenzione: Inserisci almeno una foto di copertina.");
        return;
    }

    // Blocca pulsanti per evitare doppi click
    setLoading(true);

    try {
        // A. Carica Immagini su Firebase Storage
        const imageUrls = await uploadImagesParallel(selectedFiles);

        // B. Carica Video (se selezionato)
        if (selectedVideoFile) {
            btnSaveBottom.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sto caricando il video... (ci vorrà un attimo)';
            const uploadedVideoUrl = await uploadVideo(selectedVideoFile);
            if (uploadedVideoUrl) {
                videoUrl = uploadedVideoUrl; // Sovrascrive il link YT se c'è un file
            }
        }

        // C. Costruisci Oggetto Firestore
        const propertyData = {
            title: title,
            location: location,
            price: Number(price),
            type: type || 'Appartamento', // Default fallback
            specs: {
                beds: Number(beds),
                rooms: Number(rooms),
                baths: Number(baths),
                area: Number(area),
            },
            energy: {
                class: energyClass || 'ND',
                ipe: ipe || ''
            },
            description: description,
            services: services,
            images: imageUrls, // Array di url stringa
            coverImage: imageUrls[0], // Salvo direttamente la copertina
            videoTour: videoUrl || '',
            status: 'published', // Altre opzioni: 'draft'
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // C. Salva su Firestore Collection 'properties'
        await db.collection("properties").add(propertyData);

        alert("Immobile pubblicato con SUCCESSO!");
        // Ritorna alla dashboard
        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Errore salvataggio:", error);
        alert("Errore durante il salvataggio: " + error.message);
        setLoading(false);
    }
}

// Funzione helper per caricare in parallelo le immagini (per velocità)
async function uploadImagesParallel(files) {
    const storageRef = firebase.storage().ref();
    // Unique ID folder per questa sessione di caricamento
    const batchId = Date.now();

    const uploadPromises = files.map(async (file, index) => {
        const fileRef = storageRef.child(`properties/${batchId}/${index}_${file.name}`);
        const snapshot = await fileRef.put(file);
        const downloadUrl = await snapshot.ref.getDownloadURL();
        return downloadUrl;
    });

    // Aspetta che FINISCANO TUTTI i caricamenti
    return Promise.all(uploadPromises);
}

// Funzione helper per caricare il Video
async function uploadVideo(file) {
    const storageRef = firebase.storage().ref();
    const batchId = Date.now();
    const fileRef = storageRef.child(`properties_videos/${batchId}_${file.name}`);

    const snapshot = await fileRef.put(file);
    return await snapshot.ref.getDownloadURL();
}

function setLoading(isLoading) {
    if (isLoading) {
        btnSaveHeader.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvataggio...';
        btnSaveHeader.disabled = true;
        btnSaveBottom.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sto caricando le foto... attendi';
        btnSaveBottom.disabled = true;
    } else {
        btnSaveHeader.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Salva e Pubblica';
        btnSaveHeader.disabled = false;
        btnSaveBottom.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Salva Immobile nel Server';
        btnSaveBottom.disabled = false;
    }
}

// Event Listeners Buttons Salva
btnSaveHeader.addEventListener('click', saveProperty);
btnSaveBottom.addEventListener('click', saveProperty);

// Nascondo/Pulisco le immagini placeholder all'avvio reale in modo pulito
imagePreviewContainer.innerHTML = '';
