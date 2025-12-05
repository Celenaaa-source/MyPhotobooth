// Elemen DOM
const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
const toggleCameraBtn = document.getElementById('toggleCameraBtn');
const photoGrid = document.getElementById('photoGrid');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const filterOverlay = document.getElementById('filterOverlay');

// State
let stream = null;
let canvas = null;
let photos = [];
let cameraActive = false;

// Fungsi untuk memulai kamera
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            },
            audio: false
        });
        
        video.srcObject = stream;
        cameraActive = true;
        toggleCameraBtn.textContent = '🎥 Matikan Kamera';
        toggleCameraBtn.classList.add('active');
        captureBtn.disabled = false;
        
        // Setup canvas
        canvas = document.createElement('canvas');
        
    } catch (error) {
        console.error('Error mengakses kamera:', error);
        alert('Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin akses kamera.');
    }
}

// Fungsi untuk menghentikan kamera
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    video.srcObject = null;
    cameraActive = false;
    toggleCameraBtn.textContent = '🎥 Hidupkan Kamera';
    toggleCameraBtn.classList.remove('active');
    captureBtn.disabled = true;
}

// Fungsi untuk mengambil foto
function capturePhoto() {
    if (!cameraActive || !video.readyState === video.HAVE_ENOUGH_DATA) {
        return;
    }

    // Setup canvas dengan dimensi video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Draw video frame ke canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Flash effect
    filterOverlay.classList.add('active');
    setTimeout(() => {
        filterOverlay.classList.remove('active');
    }, 500);
    
    // Convert ke blob dan simpan
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        photos.push({
            url: url,
            timestamp: new Date().getTime()
        });
        
        renderPhotos();
    }, 'image/jpeg', 0.95);
}

// Fungsi untuk render gallery
function renderPhotos() {
    photoGrid.innerHTML = '';
    
    if (photos.length === 0) {
        photoGrid.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;"><p>📷 Belum ada foto. Ambil foto pertamamu!</p></div>';
        return;
    }
    
    photos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
            <img src="${photo.url}" alt="Foto ${index + 1}">
            <div class="photo-actions">
                <button onclick="downloadPhoto(${index})">⬇️</button>
                <button onclick="deletePhoto(${index})">🗑️</button>
            </div>
        `;
        photoGrid.appendChild(photoItem);
    });
}

// Fungsi untuk download satu foto
function downloadPhoto(index) {
    const photo = photos[index];
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `photobooth-${photo.timestamp}.jpg`;
    link.click();
}

// Fungsi untuk hapus satu foto
function deletePhoto(index) {
    photos.splice(index, 1);
    renderPhotos();
}

// Fungsi untuk download semua foto
function downloadAllPhotos() {
    if (photos.length === 0) {
        alert('Tidak ada foto untuk diunduh');
        return;
    }
    
    photos.forEach((photo, index) => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = photo.url;
            link.download = `photobooth-${photo.timestamp}.jpg`;
            link.click();
        }, index * 500); // Delay antara download untuk menghindari masalah browser
    });
}

// Fungsi untuk hapus semua foto
function clearAllPhotos() {
    if (photos.length === 0) {
        alert('Tidak ada foto untuk dihapus');
        return;
    }
    
    if (confirm('Yakin ingin menghapus semua foto?')) {
        photos = [];
        renderPhotos();
    }
}

// Event listeners
toggleCameraBtn.addEventListener('click', () => {
    if (cameraActive) {
        stopCamera();
    } else {
        startCamera();
    }
});

captureBtn.addEventListener('click', capturePhoto);
downloadAllBtn.addEventListener('click', downloadAllPhotos);
clearAllBtn.addEventListener('click', clearAllPhotos);

// Keyboard shortcut untuk ambil foto
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && cameraActive) {
        e.preventDefault();
        capturePhoto();
    }
});

// Setup awal
captureBtn.disabled = true;
renderPhotos();

// Handle video play untuk memastikan canvas siap
video.addEventListener('play', () => {
    console.log('Kamera siap digunakan');
});
