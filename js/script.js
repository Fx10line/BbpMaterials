// --- 1. VERİTABANI VE KOORDİNATLAR ---
const db = [
    { id: 's1', type: 'silo', name: 'S1', mat: 'Mafill CR', x: 3050, y: 2250 },
    { id: 's2', type: 'silo', name: 'S2', mat: 'Scolefin', x: 3120, y: 2250 },
    { id: 's3', type: 'silo', name: 'S3', mat: 'Seculene', x: 3190, y: 2250 },
    
    { id: 'f1', type: 'oven', name: 'F1', x: 2150, y: 2250 },
    { id: 'f3', type: 'oven', name: 'F3', x: 2250, y: 2250 },
    { id: 'f7', type: 'oven', name: 'F7', x: 2450, y: 2250 },
    { id: 'tpe1', type: 'oven oven-tpe', name: 'TPE 1', x: 2600, y: 2250, special: 'Gummi' },
    
    { id: 'f12', type: 'oven', name: 'F12', x: 1250, y: 1250 },
    { id: 'f14', type: 'oven', name: 'F14', x: 1350, y: 1250 },
    { id: 'f8', type: 'oven', name: 'F8', x: 2450, y: 1850 },
    
    { id: 'm650', type: 'machine', name: 'K 650-02', nodes: 4, dir: 'm-h', x: 1350, y: 1450, part: 'BBP_Kapak_Rev3' },
    { id: 'm1000', type: 'machine', name: 'K 1000-02', nodes: 4, dir: 'm-h', x: 1350, y: 1650, part: 'Auto_Panel_Sol' },
    { id: 'm800', type: 'machine', name: 'K 800-4', nodes: 2, dir: 'm-v', x: 1800, y: 1850, part: 'Kutu_Alt_Gövde' }
];

const container = document.getElementById('devices-container');

// --- CİHAZ YÜKLEME VE ETKİLEŞİM ---
db.forEach(dev => {
    let el = document.createElement('div');
    el.className = `device ${dev.type} ${dev.dir || ''}`;
    el.style.left = dev.x + 'px'; el.style.top = dev.y + 'px';
    
    let nodesHtml = '';
    if (dev.nodes) {
        nodesHtml = `<div class="nodes-container">`;
        for(let i=0; i<dev.nodes; i++) nodesHtml += `<div class="node"></div>`;
        nodesHtml += `</div><div class="status-led"></div>`;
    }

    let infoHtml = `<div class="info-card">
        <div style="color:var(--pipe-main); font-weight:bold; border-bottom:1px solid #555; padding-bottom:5px; margin-bottom:5px;">${dev.name}</div>
        ${dev.mat ? 'Doluluk: %85<br>Mal: ' + dev.mat : (dev.part ? 'Üretim: ' + dev.part : 'Durum: Hazır')}
        <br><span style="font-size:11px; color:#f1c40f; display:block; margin-top:5px;">(Ayarlar için çift tıkla/dokun)</span>
    </div>`;

    el.innerHTML = nodesHtml + dev.name + infoHtml;
    
    const openDeviceModal = () => {
        document.getElementById('m-title').innerText = dev.name + " Kontrol";
        let content = dev.type === 'machine' ? 
            `<div style="margin-bottom:10px;"><b>Aktif Kalıp:</b> <span style="color:#f1c40f">${dev.part}</span></div>
            <div style="background:#2f3640; padding:15px; border-radius:8px;">
                <b>Bağlantı Reçetesi:</b><br><br>
                📥 Giriş 1: <span style="color:#00d2d3">Fırın 3 (PP)</span><br>
                📥 Giriş 2: <span style="color:#00d2d3">Fırın 14 (ABS)</span><br>
                📥 Giriş 3: ${dev.nodes >= 3 ? '<span style="color:#e67e22">TPE 1 (Gummi)</span>' : 'Boş'}<br>
                📥 Giriş 4: ${dev.nodes >= 4 ? '<span style="color:#9b59b6">Seyyar Boya</span>' : 'Boş'}
            </div>` : `Durum: Aktif.<br><br>Sıcaklık ve rota atamaları ana DB'den çekilecek.`;
        
        document.getElementById('m-content').innerHTML = content;
        document.getElementById('modal').style.display = 'flex';
    };

    el.addEventListener('dblclick', (e) => { e.stopPropagation(); openDeviceModal(); });

    let lastTap = 0;
    el.addEventListener('touchend', (e) => {
        let currentTime = new Date().getTime();
        let tapLength = currentTime - lastTap;
        
        document.querySelectorAll('.device').forEach(d => d.classList.remove('active-touch'));
        el.classList.add('active-touch');

        if (tapLength < 300 && tapLength > 0) { e.preventDefault(); openDeviceModal(); }
        lastTap = currentTime;
    });
    
    container.appendChild(el);
});

// MODAL KAPATMA VE BOŞLUK DOKUNMASI
document.getElementById('btn-close-modal').addEventListener('click', () => { document.getElementById('modal').style.display = 'none'; });
document.getElementById('scada-viewport').addEventListener('touchstart', (e) => {
    if(!e.target.closest('.device')) {
        document.querySelectorAll('.device').forEach(d => d.classList.remove('active-touch'));
    }
});

// --- ZOOM VE PAN MOTORU ---
const canvas = document.getElementById('scada-canvas');
const viewport = document.getElementById('scada-viewport');
let scale = 0.35, panX = -300, panY = -300;
let isDragging = false, startX, startY;

function updateTransform() { canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`; }

document.getElementById('btn-zoom-in').addEventListener('click', () => { scale = Math.min(scale * 1.3, 2.5); updateTransform(); });
document.getElementById('btn-zoom-out').addEventListener('click', () => { scale = Math.max(scale * 0.7, 0.1); updateTransform(); });
document.getElementById('btn-center').addEventListener('click', () => { scale = 0.35; panX = -300; panY = -300; updateTransform(); });

// MASAÜSTÜ Fare Pan
viewport.addEventListener('mousedown', e => {
    if(e.target.classList.contains('local-bin') || e.target.closest('.device')) return; 
    isDragging = true; startX = e.clientX - panX; startY = e.clientY - panY; canvas.style.transition = 'none';
});
window.addEventListener('mousemove', e => { if (!isDragging) return; panX = e.clientX - startX; panY = e.clientY - startY; updateTransform(); });
window.addEventListener('mouseup', () => { isDragging = false; canvas.style.transition = 'transform 0.1s'; });

// MOBİL Dokunmatik Pan
viewport.addEventListener('touchstart', e => {
    if(e.target.classList.contains('local-bin') || e.target.closest('.device')) return; 
    isDragging = true; startX = e.touches[0].clientX - panX; startY = e.touches[0].clientY - panY; canvas.style.transition = 'none';
});
window.addEventListener('touchmove', e => {
    if (!isDragging || e.touches.length !== 1) return;
    panX = e.touches[0].clientX - startX; panY = e.touches[0].clientY - startY; updateTransform();
}, {passive: false});
window.addEventListener('touchend', () => { isDragging = false; canvas.style.transition = 'transform 0.1s'; });

// --- SÜRÜKLE BIRAK (Masaüstü & Mobil) ---
let draggedBin = null, offsetX = 0, offsetY = 0;

document.querySelectorAll('.local-bin').forEach(bin => {
    bin.addEventListener('mousedown', e => {
        e.stopPropagation(); draggedBin = bin;
        let rect = bin.getBoundingClientRect();
        offsetX = (e.clientX - rect.left) / scale; offsetY = (e.clientY - rect.top) / scale;
        bin.style.zIndex = 2000;
    });
    bin.addEventListener('touchstart', e => {
        e.stopPropagation(); draggedBin = bin;
        let rect = bin.getBoundingClientRect();
        offsetX = (e.touches[0].clientX - rect.left) / scale; offsetY = (e.touches[0].clientY - rect.top) / scale;
        bin.style.zIndex = 2000; bin.style.transform = "scale(1.2)";
    }, {passive: false});
});

const handleDragMove = (clientX, clientY, e) => {
    if (!draggedBin) return;
    if (e && e.preventDefault) e.preventDefault();
    let canvasRect = canvas.getBoundingClientRect();
    let newX = (clientX - canvasRect.left) / scale - offsetX;
    let newY = (clientY - canvasRect.top) / scale - offsetY;
    draggedBin.style.left = newX + 'px'; draggedBin.style.top = newY + 'px';
};

window.addEventListener('mousemove', e => { if (draggedBin) handleDragMove(e.clientX, e.clientY, e); });
window.addEventListener('touchmove', e => { if (draggedBin) handleDragMove(e.touches[0].clientX, e.touches[0].clientY, e); }, {passive: false});

const handleDragEnd = () => {
    if(draggedBin) { draggedBin.style.zIndex = 100; draggedBin.style.transform = "scale(1)"; draggedBin = null; }
};
window.addEventListener('mouseup', handleDragEnd);
window.addEventListener('touchend', handleDragEnd);

updateTransform();
