// --- 1. VERİ TABANI ---

// SİLOLAR (14 Adet)
let silolar = [];
for (let i = 1; i <= 14; i++) {
    silolar.push({
        id_str: `silo_${i}`,
        isim: `Silo ${i}`,
        materyal: "PP",
        aktif: true,
        // Örnek: İlk silo firin_1'e ve makina_2'ye bağlı başlasın
        kanallar: (i === 1) ? ["firin_1", "makina_2", "Boş", "Boş"] : ["Boş", "Boş", "Boş", "Boş"]
    });
}

// FIRINLAR (16 Adet)
let firinlar = [];
for (let i = 1; i <= 16; i++) {
    firinlar.push({
        id_str: `firin_${i}`,
        isim: `Fırın ${i}`,
        sicaklik: "80°C",
        aktif: true,
        // Örnek: İlk fırın makina_1'e malzeme versin
        hedef: (i === 1) ? "makina_1" : "Boş" 
    });
}

// MAKİNALAR (19 Adet)
let makinalar = [];
for (let i = 1; i <= 19; i++) {
    makinalar.push({
        id_str: `makina_${i}`,
        isim: `Makina ${i}`,
        urun: "Kapak V2",
        aktif: true,
        umbau: false
    });
}


// --- 2. HTML OLUŞTURMA ---
function ekranlariCiz() {
    // Silolar
    document.getElementById('silo-listesi').innerHTML = silolar.map((s, i) => `
        <div class="kutu" id="${s.id_str}" data-tip="silo" data-index="${i}">
            <div class="kutu-baslik">${s.isim}</div>
            <div class="kutu-bilgi">Mat: ${s.materyal}</div>
            <div class="kanal-bilgileri">
                <div>1: ${s.kanallar[0]}</div> <div>2: ${s.kanallar[1]}</div>
                <div>3: ${s.kanallar[2]}</div> <div>4: ${s.kanallar[3]}</div>
            </div>
            <div class="guc-dugmeleri">
                <button class="btn-on ${s.aktif ? 'aktif-buton':''}">ON</button>
                <button class="btn-off ${!s.aktif ? 'aktif-buton':''}">OFF</button>
            </div>
        </div>
    `).join('');

    // Fırınlar
    document.getElementById('firin-listesi').innerHTML = firinlar.map((f, i) => `
        <div class="kutu" id="${f.id_str}" data-tip="firin" data-index="${i}">
            <div class="kutu-baslik">${f.isim}</div>
            <div class="kutu-bilgi">Isı: ${f.sicaklik} <br> <small>Hedef: ${f.hedef}</small></div>
            <div class="guc-dugmeleri">
                <button class="btn-on ${f.aktif ? 'aktif-buton':''}">ON</button>
                <button class="btn-off ${!f.aktif ? 'aktif-buton':''}">OFF</button>
            </div>
        </div>
    `).join('');

    // Makinalar
    document.getElementById('makina-listesi').innerHTML = makinalar.map((m, i) => `
        <div class="kutu" id="${m.id_str}" data-tip="makina" data-index="${i}">
            <div class="umbau-lambasi ${m.umbau ? 'umbau-aktif':''}"></div>
            <div class="kutu-baslik">${m.isim}</div>
            <div class="kutu-bilgi">Ürün: ${m.urun}</div>
            <div class="guc-dugmeleri">
                <button class="btn-on ${m.aktif ? 'aktif-buton':''}">ON</button>
                <button class="btn-off ${!m.aktif ? 'aktif-buton':''}">OFF</button>
            </div>
        </div>
    `).join('');
}


// --- 3. CANVAS (ANİMASYONLU ÇİZGİLER) ---
const canvas = document.getElementById('cizim-alani');
const ctx = canvas.getContext('2d');
let dashOffset = 0;

function akisCizgileriniGuncelle() {
    // Canvas'ı tam sayfa boyutuna ayarla
    canvas.width = document.body.scrollWidth;
    canvas.height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Silolardan çıkan çizgiler (Mavi)
    silolar.forEach(silo => {
        if (!silo.aktif) return; // Kutu kapalıysa çizgi akmasın (isteğe bağlı)
        silo.kanallar.forEach(hedefId => {
            if (hedefId && hedefId !== "Boş") cizgiCiz(silo.id_str, hedefId, "#3498db");
        });
    });

    // Fırınlardan çıkan çizgiler (Turuncu)
    firinlar.forEach(firin => {
        if (!firin.aktif) return;
        if (firin.hedef && firin.hedef !== "Boş") cizgiCiz(firin.id_str, firin.hedef, "#e67e22");
    });
}

function cizgiCiz(kaynakId, hedefId, renk) {
    const kaynak = document.getElementById(kaynakId);
    const hedef = document.getElementById(hedefId);
    if (!kaynak || !hedef) return;

    const kRect = kaynak.getBoundingClientRect();
    const hRect = hedef.getBoundingClientRect();

    // Çizgi başlangıç (Kaynağın sağ ortası)
    const startX = kRect.right + window.scrollX;
    const startY = kRect.top + (kRect.height / 2) + window.scrollY;

    // Çizgi bitiş (Hedefin sol ortası)
    const endX = hRect.left + window.scrollX;
    const endY = hRect.top + (hRect.height / 2) + window.scrollY;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    // Kıvrımlı (Bezier) akış
    const ortaX = (startX + endX) / 2;
    ctx.bezierCurveTo(ortaX, startY, ortaX, endY, endX, endY);

    ctx.strokeStyle = renk;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]); // Kesik çizgi aralığı
    ctx.lineDashOffset = -dashOffset; // Hareketi sağlayan eksen
    ctx.stroke();
}

// 60FPS Animasyon Motoru
function animasyonDongusu() {
    dashOffset += 1.5; // Akış hızı
    akisCizgileriniGuncelle();
    requestAnimationFrame(animasyonDongusu);
}


// --- 4. TIKLAMA / MODAL OLAYLARI ---
let seciliTip = "";
let seciliIndex = null;

document.addEventListener('click', (e) => {
    const t = e.target;

    // A. Güç Butonları
    if (t.classList.contains('btn-on') || t.classList.contains('btn-off')) {
        const kutu = t.closest('.kutu');
        const aktifMi = t.classList.contains('btn-on');
        if (kutu.dataset.tip === "silo") silolar[kutu.dataset.index].aktif = aktifMi;
        if (kutu.dataset.tip === "firin") firinlar[kutu.dataset.index].aktif = aktifMi;
        if (kutu.dataset.tip === "makina") makinalar[kutu.dataset.index].aktif = aktifMi;
        ekranlariCiz(); return;
    }

    // B. Umbau Lambası
    if (t.classList.contains('umbau-lambasi')) {
        const idx = t.closest('.kutu').dataset.index;
        makinalar[idx].umbau = !makinalar[idx].umbau;
        ekranlariCiz(); return;
    }

    // C. Modal Açma
    const kutu = t.closest('.kutu');
    if (kutu && !t.matches('button') && !t.matches('.umbau-lambasi')) {
        seciliTip = kutu.dataset.tip;
        seciliIndex = parseInt(kutu.dataset.index);
        
        document.getElementById('silo-kanallari-inputlari').style.display = "none";
        document.getElementById('firin-hedef-inputu').style.display = "none";

        if (seciliTip === "silo") {
            document.getElementById('modal-baslik').innerText = silolar[seciliIndex].isim;
            document.getElementById('modal-input-veri').value = silolar[seciliIndex].materyal;
            document.getElementById('silo-kanallari-inputlari').style.display = "block";
            for(let i=1; i<=4; i++) document.getElementById(`modal-kanal-${i}`).value = silolar[seciliIndex].kanallar[i-1];
        } 
        else if (seciliTip === "firin") {
            document.getElementById('modal-baslik').innerText = firinlar[seciliIndex].isim;
            document.getElementById('modal-input-veri').value = firinlar[seciliIndex].sicaklik;
            document.getElementById('firin-hedef-inputu').style.display = "block";
            document.getElementById('modal-firin-hedef').value = firinlar[seciliIndex].hedef;
        } 
        else {
            document.getElementById('modal-baslik').innerText = makinalar[seciliIndex].isim;
            document.getElementById('modal-input-veri').value = makinalar[seciliIndex].urun;
        }
        document.getElementById('detay-modal').style.display = "block";
    }

    // D. Modal Kapat / Kaydet
    if (t.id === "modal-kapat") document.getElementById('detay-modal').style.display = "none";
    
    if (t.id === "modal-kaydet") {
        const veri = document.getElementById('modal-input-veri').value;
        if (seciliTip === "silo") {
            silolar[seciliIndex].materyal = veri;
            for(let i=1; i<=4; i++) silolar[seciliIndex].kanallar[i-1] = document.getElementById(`modal-kanal-${i}`).value;
        } else if (seciliTip === "firin") {
            firinlar[seciliIndex].sicaklik = veri;
            firinlar[seciliIndex].hedef = document.getElementById('modal-firin-hedef').value;
        } else {
            makinalar[seciliIndex].urun = veri;
        }
        document.getElementById('detay-modal').style.display = "none";
        ekranlariCiz(); // Ekranı güncelle
    }
});


// Başlangıç
document.addEventListener("DOMContentLoaded", () => {
    ekranlariCiz();
    animasyonDongusu(); // Animasyonu Başlat
});
// Pencere boyutu değişirse çizgileri kaydırmamak için baştan çiz
window.addEventListener('resize', ekranlariCiz);
