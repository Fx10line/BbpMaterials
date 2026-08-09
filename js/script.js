// --- 1. VERİ TABANI (Virgüllü Çoklu Bağlantı Desteği) ---

let silolar = [];
for (let i = 1; i <= 14; i++) {
    silolar.push({
        id_str: `silo_${i}`, isim: `Silo ${i}`, materyal: "PP", aktif: true,
        // ÖRNEK: Silo 1'in Kanal 1'i hem Fırın 1'e hem de Makina 2'ye gidiyor.
        kanallar: (i === 1) ? ["firin_1, makina_2", "Boş", "Boş", "Boş"] : ["Boş", "Boş", "Boş", "Boş"],
        x: 50, y: i * 140
    });
}

let firinlar = [];
for (let i = 1; i <= 16; i++) {
    firinlar.push({
        id_str: `firin_${i}`, isim: `Fırın ${i}`, sicaklik: "80°C", aktif: true,
        // ÖRNEK: Fırın 1 hem Makina 1'e hem Makina 3'e malzeme veriyor.
        hedef: (i === 1) ? "makina_1, makina_3" : "Boş",
        x: 500, y: i * 130 
    });
}

let makinalar = [];
for (let i = 1; i <= 19; i++) {
    makinalar.push({
        id_str: `makina_${i}`, isim: `Makina ${i}`, urun: "Kapak V2", aktif: true, umbau: false,
        x: 1000, y: i * 110 
    });
}

// --- 2. HTML OLUŞTURMA ---
function ekranlariCiz() {
    const kapsayici = document.getElementById('cihazlar-kapsayici');
    kapsayici.innerHTML = ""; 

    const siloIkon = "🛢️"; const firinIkon = "🔥"; const makinaIkon = "⚙️";

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

// --- 3. SÜRÜKLE & BIRAK ---
let suruklenenKutu = null; let offset = { x: 0, y: 0 }; let suruklendiMi = false;

document.addEventListener('mousedown', (e) => {
    const kutu = e.target.closest('.kutu');
    if (kutu && !e.target.closest('button') && !e.target.classList.contains('umbau-lambasi')) {
        suruklenenKutu = kutu; suruklendiMi = false;
        const rect = kutu.getBoundingClientRect();
        offset.x = e.clientX - rect.left; offset.y = e.clientY - rect.top;
        kutu.style.zIndex = 1000; 
    }
});

document.addEventListener('mousemove', (e) => {
    if (suruklenenKutu) {
        suruklendiMi = true; 
        const sahaRect = document.getElementById('fabrika-sahasi').getBoundingClientRect();
        suruklenenKutu.style.left = (e.clientX - sahaRect.left - offset.x) + 'px';
        suruklenenKutu.style.top = (e.clientY - sahaRect.top - offset.y) + 'px';
    }
});

document.addEventListener('mouseup', () => {
    if (suruklenenKutu) {
        suruklenenKutu.style.zIndex = "";
        
        // Yeni pozisyonu kaydet
        const yeniX = parseInt(suruklenenKutu.style.left);
        const yeniY = parseInt(suruklenenKutu.style.top);
        const tip = suruklenenKutu.dataset.tip;
        const index = parseInt(suruklenenKutu.dataset.index);

        if (tip === "silo") { silolar[index].x = yeniX; silolar[index].y = yeniY; } 
        else if (tip === "firin") { firinlar[index].x = yeniX; firinlar[index].y = yeniY; } 
        else if (tip === "makina") { makinalar[index].x = yeniX; makinalar[index].y = yeniY; }
        
        suruklenenKutu = null;
        setTimeout(() => { suruklendiMi = false; }, 50); 
    }
});

// --- 4. CANVAS (VİRGÜLLÜ ÇOKLU BAĞLANTI MOTORU) ---
const canvas = document.getElementById('cizim-alani');
const ctx = canvas.getContext('2d');
let dashOffset = 0;

function akisCizgileriniGuncelle() {
    const saha = document.getElementById('fabrika-sahasi');
    if(canvas.width !== saha.offsetWidth) canvas.width = saha.offsetWidth;
    if(canvas.height !== saha.offsetHeight) canvas.height = saha.offsetHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Silolardan çıkan çizgiler (Virgülle ayrılmış hedefleri böler)
    silolar.forEach(silo => {
        if (!silo.aktif) return;
        silo.kanallar.forEach(kanalVerisi => {
            if (kanalVerisi && kanalVerisi !== "Boş") {
                // "firin_7, makina_2" yazısını virgülden böler ve boşlukları siler
                const hedefler = kanalVerisi.split(',').map(isim => isim.trim());
                hedefler.forEach(hedefId => {
                    cizgiCiz(silo.id_str, hedefId, "#3498db"); // Mavi
                });
            }
        });
    });

    // Fırınlardan çıkan çizgiler (Virgülle ayrılmış hedefleri böler)
    firinlar.forEach(firin => {
        if (!firin.aktif) return;
        if (firin.hedef && firin.hedef !== "Boş") {
            const hedefler = firin.hedef.split(',').map(isim => isim.trim());
            hedefler.forEach(hedefId => {
                cizgiCiz(firin.id_str, hedefId, "#e67e22"); // Turuncu
            });
        }
    });
}

function cizgiCiz(kaynakId, hedefId, renk) {
    const kaynak = document.getElementById(kaynakId);
    const hedef = document.getElementById(hedefId);
    if (!kaynak || !hedef) return; // Eğer yanlış isim yazıldıysa hata vermesin, sadece çizmesin

    const startX = parseInt(kaynak.style.left) + (kaynak.offsetWidth / 2);
    const startY = parseInt(kaynak.style.top) + (kaynak.offsetHeight / 2);
    const endX = parseInt(hedef.style.left) + (hedef.offsetWidth / 2);
    const endY = parseInt(hedef.style.top) + (hedef.offsetHeight / 2);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
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

document.addEventListener("DOMContentLoaded", () => {
    ekranlariCiz();
    animasyonDongusu(); 
});
