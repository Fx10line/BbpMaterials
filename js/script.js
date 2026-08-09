// --- 1. VERİ TABANI (X, Y Koordinatları Eklendi) ---

let silolar = [];
for (let i = 1; i <= 14; i++) {
    silolar.push({
        id_str: `silo_${i}`, isim: `Silo ${i}`, materyal: "PP", aktif: true,
        kanallar: (i === 1) ? ["firin_1", "makina_2", "Boş", "Boş"] : ["Boş", "Boş", "Boş", "Boş"],
        x: 50, y: i * 140 // Sol tarafa dikey olarak dizer
    });
}

let firinlar = [];
for (let i = 1; i <= 16; i++) {
    firinlar.push({
        id_str: `firin_${i}`, isim: `Fırın ${i}`, sicaklik: "80°C", aktif: true,
        hedef: (i === 1) ? "makina_1" : "Boş",
        x: 500, y: i * 130 // Orta alana dikey olarak dizer
    });
}

let makinalar = [];
for (let i = 1; i <= 19; i++) {
    makinalar.push({
        id_str: `makina_${i}`, isim: `Makina ${i}`, urun: "Kapak V2", aktif: true, umbau: false,
        x: 1000, y: i * 110 // Sağ alana dikey olarak dizer
    });
}

// --- 2. HTML OLUŞTURMA ---
function ekranlariCiz() {
    const kapsayici = document.getElementById('cihazlar-kapsayici');
    kapsayici.innerHTML = ""; // Temizle

    // Görsel belirleyiciler (Emojiler yerine ileride img etiketi koyabilirsin)
    const siloIkon = "🛢️";
    const firinIkon = "🔥";
    const makinaIkon = "⚙️";

    // Siloları Çiz
    silolar.forEach((s, i) => {
        kapsayici.innerHTML += `
            <div class="kutu" id="${s.id_str}" data-tip="silo" data-index="${i}" style="left: ${s.x}px; top: ${s.y}px;">
                <div class="kutu-ikon">${siloIkon}</div>
                <div class="kutu-baslik">${s.isim}</div>
                <div class="kutu-bilgi">Mat: ${s.materyal}</div>
                <div class="guc-dugmeleri">
                    <button class="btn-on ${s.aktif ? 'aktif-buton':''}">ON</button>
                    <button class="btn-off ${!s.aktif ? 'aktif-buton':''}">OFF</button>
                </div>
            </div>`;
    });

    // Fırınları Çiz
    firinlar.forEach((f, i) => {
        kapsayici.innerHTML += `
            <div class="kutu" id="${f.id_str}" data-tip="firin" data-index="${i}" style="left: ${f.x}px; top: ${f.y}px;">
                <div class="kutu-ikon">${firinIkon}</div>
                <div class="kutu-baslik">${f.isim}</div>
                <div class="kutu-bilgi">Isı: ${f.sicaklik}</div>
                <div class="guc-dugmeleri">
                    <button class="btn-on ${f.aktif ? 'aktif-buton':''}">ON</button>
                    <button class="btn-off ${!f.aktif ? 'aktif-buton':''}">OFF</button>
                </div>
            </div>`;
    });

    // Makinaları Çiz
    makinalar.forEach((m, i) => {
        kapsayici.innerHTML += `
            <div class="kutu" id="${m.id_str}" data-tip="makina" data-index="${i}" style="left: ${m.x}px; top: ${m.y}px;">
                <div class="umbau-lambasi ${m.umbau ? 'umbau-aktif':''}"></div>
                <div class="kutu-ikon">${makinaIkon}</div>
                <div class="kutu-baslik">${m.isim}</div>
                <div class="kutu-bilgi">Ürün: ${m.urun}</div>
                <div class="guc-dugmeleri">
                    <button class="btn-on ${m.aktif ? 'aktif-buton':''}">ON</button>
                    <button class="btn-off ${!m.aktif ? 'aktif-buton':''}">OFF</button>
                </div>
            </div>`;
    });
}

// --- 3. SÜRÜKLE & BIRAK (DRAG & DROP) MANTIĞI ---
let suruklenenKutu = null;
let offset = { x: 0, y: 0 };
let suruklendiMi = false; // Tıklama ile sürüklemeyi ayırt etmek için

document.addEventListener('mousedown', (e) => {
    const kutu = e.target.closest('.kutu');
    // Eğer butona veya lambaya tıklamadıysa sürüklemeyi başlat
    if (kutu && !e.target.closest('button') && !e.target.classList.contains('umbau-lambasi')) {
        suruklenenKutu = kutu;
        suruklendiMi = false;
        
        // Farenin kutu içindeki tıklama noktasını hesapla
        const rect = kutu.getBoundingClientRect();
        const sahaRect = document.getElementById('fabrika-sahasi').getBoundingClientRect();
        
        offset.x = e.clientX - rect.left;
        offset.y = e.clientY - rect.top;
        
        kutu.style.zIndex = 1000; // Sürüklerken en üste al
    }
});

document.addEventListener('mousemove', (e) => {
    if (suruklenenKutu) {
        suruklendiMi = true; // Kutu hareket etti
        const sahaRect = document.getElementById('fabrika-sahasi').getBoundingClientRect();
        
        // Yeni pozisyonu hesapla (Ekranın kaydırma oranını da hesaba kat)
        let yeniX = (e.clientX - sahaRect.left) - offset.x;
        let yeniY = (e.clientY - sahaRect.top) - offset.y;
        
        suruklenenKutu.style.left = yeniX + 'px';
        suruklenenKutu.style.top = yeniY + 'px';
    }
});

document.addEventListener('mouseup', () => {
    if (suruklenenKutu) {
        suruklenenKutu.style.zIndex = "";
        
        // YENİ EKLENEN BÖLÜM: Kutunun yeni konumunu (X ve Y) bulup hafızaya (diziye) kaydet
        const yeniX = parseInt(suruklenenKutu.style.left);
        const yeniY = parseInt(suruklenenKutu.style.top);
        const tip = suruklenenKutu.dataset.tip;
        const index = parseInt(suruklenenKutu.dataset.index);

        if (tip === "silo") {
            silolar[index].x = yeniX;
            silolar[index].y = yeniY;
        } else if (tip === "firin") {
            firinlar[index].x = yeniX;
            firinlar[index].y = yeniY;
        } else if (tip === "makina") {
            makinalar[index].x = yeniX;
            makinalar[index].y = yeniY;
        }
        
        suruklenenKutu = null;
        // Tıklama olayının (Modal açılışının) sürükleme bittikten hemen sonra tetiklenmesini engelle
        setTimeout(() => { suruklendiMi = false; }, 50); 
    }
});


// --- 4. CANVAS (ANİMASYONLU ÇİZGİLER) ---
const canvas = document.getElementById('cizim-alani');
const ctx = canvas.getContext('2d');
let dashOffset = 0;

function akisCizgileriniGuncelle() {
    const saha = document.getElementById('fabrika-sahasi');
    if(canvas.width !== saha.offsetWidth) canvas.width = saha.offsetWidth;
    if(canvas.height !== saha.offsetHeight) canvas.height = saha.offsetHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    silolar.forEach(silo => {
        if (!silo.aktif) return;
        silo.kanallar.forEach(hedefId => {
            if (hedefId && hedefId !== "Boş") cizgiCiz(silo.id_str, hedefId, "#3498db"); // Mavi Çizgi
        });
    });

    firinlar.forEach(firin => {
        if (!firin.aktif) return;
        if (firin.hedef && firin.hedef !== "Boş") cizgiCiz(firin.id_str, firin.hedef, "#e67e22"); // Turuncu Çizgi
    });
}

function cizgiCiz(kaynakId, hedefId, renk) {
    const kaynak = document.getElementById(kaynakId);
    const hedef = document.getElementById(hedefId);
    if (!kaynak || !hedef) return;

    // Sürüklenebilir alan içindeki mevcut pozisyonlarını alıyoruz
    const startX = parseInt(kaynak.style.left) + (kaynak.offsetWidth / 2);
    const startY = parseInt(kaynak.style.top) + (kaynak.offsetHeight / 2);
    
    const endX = parseInt(hedef.style.left) + (hedef.offsetWidth / 2);
    const endY = parseInt(hedef.style.top) + (hedef.offsetHeight / 2);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    // Yılan gibi kıvrılan (Bezier) akış
    const ortaX = (startX + endX) / 2;
    ctx.bezierCurveTo(ortaX, startY, ortaX, endY, endX, endY);

    ctx.strokeStyle = renk;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 10]); 
    ctx.lineDashOffset = -dashOffset; 
    ctx.stroke();
}

function animasyonDongusu() {
    dashOffset += 1.5; 
    akisCizgileriniGuncelle();
    requestAnimationFrame(animasyonDongusu);
}


// --- 5. TIKLAMA / MODAL OLAYLARI ---
let seciliTip = ""; let seciliIndex = null;

document.addEventListener('click', (e) => {
    const t = e.target;

    // Güç Butonları ve Umbau Lambası Olayları
    if (t.classList.contains('btn-on') || t.classList.contains('btn-off')) {
        const kutu = t.closest('.kutu');
        const aktifMi = t.classList.contains('btn-on');
        if (kutu.dataset.tip === "silo") silolar[kutu.dataset.index].aktif = aktifMi;
        if (kutu.dataset.tip === "firin") firinlar[kutu.dataset.index].aktif = aktifMi;
        if (kutu.dataset.tip === "makina") makinalar[kutu.dataset.index].aktif = aktifMi;
        ekranlariCiz(); return;
    }
    if (t.classList.contains('umbau-lambasi')) {
        const idx = t.closest('.kutu').dataset.index;
        makinalar[idx].umbau = !makinalar[idx].umbau;
        ekranlariCiz(); return;
    }

    // Modal Açma (Eğer az önce sürükleme yapıldıysa AÇMA)
    const kutu = t.closest('.kutu');
    if (kutu && !t.matches('button') && !t.matches('.umbau-lambasi') && !suruklendiMi) {
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

    // Modal Kapat / Kaydet
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
        ekranlariCiz(); 
    }
});

// Başlat
document.addEventListener("DOMContentLoaded", () => {
    ekranlariCiz();
    animasyonDongusu(); 
});
