// --- 1. VERİ TABANI ---
let silolar = [];
for (let i = 1; i <= 14; i++) {
    silolar.push({
        id_str: `silo_${i}`, isim: `Silo ${i}`, materyal: "PP", aktif: true,
        kanallar: (i === 1) ? ["firin_1", "makina_2", "Boş", "Boş"] : ["Boş", "Boş", "Boş", "Boş"],
        x: 50, y: (i-1) * 160 + 20
    });
}
let firinlar = [];
for (let i = 1; i <= 16; i++) {
    firinlar.push({
        id_str: `firin_${i}`, isim: `Fırın ${i}`, sicaklik: "80°C", aktif: true,
        hedef: (i === 1) ? "makina_1" : "Boş",
        x: 450, y: (i-1) * 140 + 20
    });
}
let makinalar = [];
for (let i = 1; i <= 19; i++) {
    makinalar.push({
        id_str: `makina_${i}`, isim: `Makina ${i}`, urun: "Kapak V2", aktif: true, umbau: false,
        x: 900, y: (i-1) * 120 + 20
    });
}

// --- 2. HTML OLUŞTURMA VE DÜĞÜMLERİ (NODES) EKLEME ---
function ekranlariCiz() {
    const kapsayici = document.getElementById('cihazlar-kapsayici');
    kapsayici.innerHTML = ""; 

    silolar.forEach((s, i) => {
        kapsayici.innerHTML += `
            <div class="kutu" id="${s.id_str}" data-tip="silo" data-index="${i}" style="left: ${s.x}px; top: ${s.y}px;">
                <div class="silo-nodes">
                    <div class="node-out" data-kanal="0" title="Kanal 1 Çıkışı"></div>
                    <div class="node-out" data-kanal="1" title="Kanal 2 Çıkışı"></div>
                    <div class="node-out" data-kanal="2" title="Kanal 3 Çıkışı"></div>
                    <div class="node-out" data-kanal="3" title="Kanal 4 Çıkışı"></div>
                </div>
                <div class="kutu-ikon">🛢️</div>
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
                <div class="node-in" title="Malzeme Girişi"></div>
                <div class="node-out tekli" data-kanal="0" title="Malzeme Çıkışı"></div>
                <div class="kutu-ikon">🔥</div>
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
                <div class="node-in" title="Malzeme Girişi"></div>
                <div class="umbau-lambasi ${m.umbau ? 'umbau-aktif':''}"></div>
                <div class="kutu-ikon">⚙️</div>
                <div class="kutu-baslik">${m.isim}</div>
                <div class="kutu-bilgi">Ürün: ${m.urun}</div>
                <div class="guc-dugmeleri">
                    <button class="btn-on ${m.aktif ? 'aktif-buton':''}">ON</button>
                    <button class="btn-off ${!m.aktif ? 'aktif-buton':''}">OFF</button>
                </div>
            </div>`;
    });
}

// --- 3. İZLENEBİLİRLİK (TRACEABILITY) MOTORU ---
// Bir cihaza kimlerden malzeme geldiğini bulur
function gelenBaglantilariBul(hedefIdStr) {
    let gelenler = [];
    
    // Silolara bak
    silolar.forEach(s => {
        s.kanallar.forEach(k => {
            if(k && k.includes(hedefIdStr)) gelenler.push(`<b>${s.isim}</b>'dan (Malzeme: ${s.materyal})`);
        });
    });
    
    // Fırınlara bak
    firinlar.forEach(f => {
        if(f.hedef && f.hedef.includes(hedefIdStr)) gelenler.push(`<b>${f.isim}</b>'dan (Sıcaklık: ${f.sicaklik})`);
    });
    
    return gelenler;
}

// Yeni kablo bağlantısını hafızaya kaydeder
function baglantiEkle(kaynakTip, kaynakIndex, kanalIndex, hedefIdStr) {
    if (kaynakTip === "silo") {
        let mevcut = silolar[kaynakIndex].kanallar[kanalIndex];
        if (mevcut === "Boş" || mevcut === "") silolar[kaynakIndex].kanallar[kanalIndex] = hedefIdStr;
        else if (!mevcut.includes(hedefIdStr)) silolar[kaynakIndex].kanallar[kanalIndex] += `, ${hedefIdStr}`;
    } else if (kaynakTip === "firin") {
        let mevcut = firinlar[kaynakIndex].hedef;
        if (mevcut === "Boş" || mevcut === "") firinlar[kaynakIndex].hedef = hedefIdStr;
        else if (!mevcut.includes(hedefIdStr)) firinlar[kaynakIndex].hedef += `, ${hedefIdStr}`;
    }
}


// --- 4. SÜRÜKLE & BIRAK VE KABLO ÇEKME ---
let suruklenenKutu = null; let offset = { x: 0, y: 0 }; let suruklendiMi = false;
let kabloCekiliyor = false; let kabloBaslangic = null; let fareX = 0; let fareY = 0;

document.addEventListener('mousedown', (e) => {
    const t = e.target;
    
    // EĞER ÇIKIŞ NOKTASINA (SARI) TIKLANDIYSA KABLO ÇEKMEYİ BAŞLAT
    if (t.classList.contains('node-out')) {
        kabloCekiliyor = true;
        kabloBaslangic = t;
        return; // Kutuyu sürüklemeye geçmesini engelle
    }

    // KUTU SÜRÜKLEME
    const kutu = t.closest('.kutu');
    if (kutu && !t.closest('button') && !t.classList.contains('umbau-lambasi') && !t.classList.contains('node-in')) {
        suruklenenKutu = kutu; suruklendiMi = false;
        const rect = kutu.getBoundingClientRect();
        offset.x = e.clientX - rect.left; offset.y = e.clientY - rect.top;
        kutu.style.zIndex = 1000; 
    }
});

document.addEventListener('mousemove', (e) => {
    const sahaRect = document.getElementById('fabrika-sahasi').getBoundingClientRect();
    fareX = e.clientX - sahaRect.left;
    fareY = e.clientY - sahaRect.top;

    if (suruklenenKutu) {
        suruklendiMi = true; 
        suruklenenKutu.style.left = (fareX - offset.x) + 'px';
        suruklenenKutu.style.top = (fareY - offset.y) + 'px';
    }
});

document.addEventListener('mouseup', (e) => {
    // EĞER KABLO ÇEKİLİYORSA VE BİR GİRİŞE (YEŞİL) BIRAKILDIYSA
    if (kabloCekiliyor) {
        let hedefNokta = e.target;
        if (hedefNokta.classList.contains('node-in')) {
            let kaynakKutu = kabloBaslangic.closest('.kutu');
            let hedefKutu = hedefNokta.closest('.kutu');
            let kanalIndex = kabloBaslangic.dataset.kanal || 0;
            
            // Aynı kutuya bağlanmayı engelle
            if (kaynakKutu.id !== hedefKutu.id) {
                baglantiEkle(kaynakKutu.dataset.tip, kaynakKutu.dataset.index, kanalIndex, hedefKutu.id);
            }
        }
        kabloCekiliyor = false; kabloBaslangic = null;
    }

    if (suruklenenKutu) {
        suruklenenKutu.style.zIndex = "";
        const yeniX = parseInt(suruklenenKutu.style.left); const yeniY = parseInt(suruklenenKutu.style.top);
        const idx = parseInt(suruklenenKutu.dataset.index);

        if (suruklenenKutu.dataset.tip === "silo") { silolar[idx].x = yeniX; silolar[idx].y = yeniY; } 
        else if (suruklenenKutu.dataset.tip === "firin") { firinlar[idx].x = yeniX; firinlar[idx].y = yeniY; } 
        else { makinalar[idx].x = yeniX; makinalar[idx].y = yeniY; }
        
        suruklenenKutu = null;
        setTimeout(() => { suruklendiMi = false; }, 50); 
    }
});

// --- 5. CANVAS ÇİZİMİ (DURAĞAN VE HAREKETLİ) ---
const canvas = document.getElementById('cizim-alani');
const ctx = canvas.getContext('2d');
let dashOffset = 0;

function akisCizgileriniGuncelle() {
    const saha = document.getElementById('fabrika-sahasi');
    if(canvas.width !== saha.offsetWidth) canvas.width = saha.offsetWidth;
    if(canvas.height !== saha.offsetHeight) canvas.height = saha.offsetHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bağlı olan cihazları çiz
    silolar.forEach(silo => {
        silo.kanallar.forEach(kanalVerisi => {
            if (kanalVerisi && kanalVerisi !== "Boş") {
                kanalVerisi.split(',').forEach(hedefId => {
                    cizgiCiz(silo.id_str, hedefId.trim(), "#3498db", silo.aktif);
                });
            }
        });
    });

    firinlar.forEach(firin => {
        if (firin.hedef && firin.hedef !== "Boş") {
            firin.hedef.split(',').forEach(hedefId => {
                cizgiCiz(firin.id_str, hedefId.trim(), "#e67e22", firin.aktif);
            });
        }
    });

    // Eğer fareyle yeni bir kablo çekiliyorsa geçici çizgi çiz (Beyaz renk)
    if (kabloCekiliyor && kabloBaslangic) {
        const rect = kabloBaslangic.getBoundingClientRect();
        const sahaRect = saha.getBoundingClientRect();
        const startX = rect.left - sahaRect.left + (rect.width/2);
        const startY = rect.top - sahaRect.top + (rect.height/2);
        
        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(fareX, fareY);
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.setLineDash([5, 5]); ctx.stroke();
    }
}

function cizgiCiz(kaynakId, hedefId, aktifRenk, kaynakAktif) {
    const kaynak = document.getElementById(kaynakId);
    const hedef = document.getElementById(hedefId);
    if (!kaynak || !hedef) return;

    // Hedef cihazın çalışıp çalışmadığına bak
    let hedefAktif = true;
    if (hedef.dataset.tip === "firin") hedefAktif = firinlar[hedef.dataset.index].aktif;
    else if (hedef.dataset.tip === "makina") hedefAktif = makinalar[hedef.dataset.index].aktif;

    const startX = parseInt(kaynak.style.left) + kaynak.offsetWidth;
    const startY = parseInt(kaynak.style.top) + (kaynak.offsetHeight / 2);
    const endX = parseInt(hedef.style.left);
    const endY = parseInt(hedef.style.top) + (hedef.offsetHeight / 2);

    ctx.beginPath(); ctx.moveTo(startX, startY);
    const ortaX = (startX + endX) / 2;
    ctx.bezierCurveTo(ortaX, startY, ortaX, endY, endX, endY);

    // KONTROL: Eğer iki taraftan biri kapalıysa çizgiyi GRİ ve HAREKETSİZ yap
    const baglantiAktif = kaynakAktif && hedefAktif;
    
    ctx.strokeStyle = baglantiAktif ? aktifRenk : "rgba(120, 120, 120, 0.4)"; // Pasifse soluk gri
    ctx.lineWidth = baglantiAktif ? 4 : 2; // Pasifse çizgiyi incelt
    
    if (baglantiAktif) {
        ctx.setLineDash([10, 10]);
        ctx.lineDashOffset = -dashOffset; 
    } else {
        ctx.setLineDash([]); // Kesik değil, düz durağan çizgi
    }
    
    ctx.stroke();
}

function animasyonDongusu() {
    dashOffset += 1.5; 
    akisCizgileriniGuncelle();
    requestAnimationFrame(animasyonDongusu);
}

// --- 6. TIKLAMA / MODAL OLAYLARI ---
let seciliTip = ""; let seciliIndex = null;

document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.classList.contains('node-out') || t.classList.contains('node-in')) return; // Düğümlere tıklamayı es geç

    if (t.classList.contains('btn-on') || t.classList.contains('btn-off')) {
        const kutu = t.closest('.kutu'); const aktifMi = t.classList.contains('btn-on');
        if (kutu.dataset.tip === "silo") silolar[kutu.dataset.index].aktif = aktifMi;
        if (kutu.dataset.tip === "firin") firinlar[kutu.dataset.index].aktif = aktifMi;
        if (kutu.dataset.tip === "makina") makinalar[kutu.dataset.index].aktif = aktifMi;
        ekranlariCiz(); return;
    }
    
    if (t.classList.contains('umbau-lambasi')) {
        const idx = t.closest('.kutu').dataset.index; makinalar[idx].umbau = !makinalar[idx].umbau;
        ekranlariCiz(); return;
    }

    const kutu = t.closest('.kutu');
    if (kutu && !t.matches('button') && !t.matches('.umbau-lambasi') && !suruklendiMi) {
        seciliTip = kutu.dataset.tip; seciliIndex = parseInt(kutu.dataset.index);
        let idStr = kutu.id;
        
        // MODAL İÇİN GELEN BAĞLANTILARI BUL VE YAZDIR
        let gelenler = gelenBaglantilariBul(idStr);
        let gelenListesi = document.getElementById('gelen-listesi');
        if(gelenler.length > 0) {
            gelenListesi.innerHTML = gelenler.map(g => `<li>${g}</li>`).join('');
        } else {
            gelenListesi.innerHTML = "<li>Henüz bir malzeme girişi yok.</li>";
        }

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
