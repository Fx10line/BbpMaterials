// --- 1. VERİ TABANI ---
let silolar = [];
for (let i = 1; i <= 14; i++) {
    silolar.push({ id_str: `silo_${i}`, isim: `Silo ${i}`, materyal: "PP", aktif: true, kanallar: (i === 1) ? ["firin_1", "makina_2", "Boş", "Boş"] : ["Boş", "Boş", "Boş", "Boş"], x: 100, y: (i-1) * 160 + 50 });
}
let firinlar = [];
for (let i = 1; i <= 16; i++) {
    firinlar.push({ id_str: `firin_${i}`, isim: `Fırın ${i}`, sicaklik: "80°C", aktif: true, hedef: (i === 1) ? "makina_1" : "Boş", x: 600, y: (i-1) * 140 + 50 });
}
let makinalar = [];
for (let i = 1; i <= 19; i++) {
    makinalar.push({ id_str: `makina_${i}`, isim: `Makina ${i}`, urun: "Kapak V2", aktif: true, umbau: false, x: 1100, y: (i-1) * 120 + 50 });
}

// --- 2. HTML OLUŞTURMA VE DÜĞÜMLER ---
function ekranlariCiz() {
    const kapsayici = document.getElementById('cihazlar-kapsayici');
    
    // Kutuları sadece verideki pozisyonlarına taşır (sıfırdan yaratmaz, böylece seçimler kaybolmaz)
    // Eğer ekran ilk kez çiziliyorsa HTML'i oluşturur
    if(kapsayici.innerHTML.trim() === "") {
        let html = "";
        silolar.forEach((s, i) => { html += olusturHTML(s, "silo", i, "🛢️"); });
        firinlar.forEach((f, i) => { html += olusturHTML(f, "firin", i, "🔥"); });
        makinalar.forEach((m, i) => { html += olusturHTML(m, "makina", i, "⚙️"); });
        kapsayici.innerHTML = html;
    } else {
        // Zaten çiziliyse sadece yerini, rengini ve bilgilerini güncelle (Çoklu seçim efekti kaybolmasın diye)
        silolar.forEach(s => guncelleHTML(s));
        firinlar.forEach(f => guncelleHTML(f));
        makinalar.forEach(m => guncelleHTML(m));
    }
}

function olusturHTML(veri, tip, index, ikon) {
    let nodeSol = (tip === "firin" || tip === "makina") ? `<div class="node-in" title="Malzeme Girişi"></div>` : "";
    let nodeSag = "";
    if (tip === "silo") {
        nodeSag = `<div class="silo-nodes">
            <div class="node-out" data-kanal="0"></div><div class="node-out" data-kanal="1"></div>
            <div class="node-out" data-kanal="2"></div><div class="node-out" data-kanal="3"></div></div>`;
    } else if (tip === "firin") {
        nodeSag = `<div class="node-out tekli" data-kanal="0"></div>`;
    }

    let lamba = tip === "makina" ? `<div class="umbau-lambasi ${veri.umbau ? 'umbau-aktif':''}"></div>` : "";
    let bilgi = tip === "silo" ? `Mat: ${veri.materyal}` : (tip === "firin" ? `Isı: ${veri.sicaklik}` : `Ürün: ${veri.urun}`);

    return `<div class="kutu" id="${veri.id_str}" data-tip="${tip}" data-index="${index}" style="left: ${veri.x}px; top: ${veri.y}px;">
                ${nodeSol} ${nodeSag} ${lamba}
                <div class="kutu-ikon">${ikon}</div>
                <div class="kutu-baslik">${veri.isim}</div>
                <div class="kutu-bilgi">${bilgi}</div>
                <div class="guc-dugmeleri">
                    <button class="btn-on ${veri.aktif ? 'aktif-buton':''}">ON</button>
                    <button class="btn-off ${!veri.aktif ? 'aktif-buton':''}">OFF</button>
                </div>
            </div>`;
}

function guncelleHTML(veri) {
    let kutu = document.getElementById(veri.id_str);
    if(!kutu) return;
    kutu.style.left = veri.x + 'px';
    kutu.style.top = veri.y + 'px';
    // Durum güncellemelerini de buraya ekleyebilirsin
}


// --- 3. İZLENEBİLİRLİK MOTORU ---
function gelenBaglantilariBul(hedefIdStr) {
    let gelenler = [];
    silolar.forEach(s => { s.kanallar.forEach(k => { if(k && k.includes(hedefIdStr)) gelenler.push(`<b>${s.isim}</b>'dan (Mat: ${s.materyal})`); }); });
    firinlar.forEach(f => { if(f.hedef && f.hedef.includes(hedefIdStr)) gelenler.push(`<b>${f.isim}</b>'dan (Isı: ${f.sicaklik})`); });
    return gelenler;
}
function baglantiEkle(kaynakTip, kaynakIndex, kanalIndex, hedefIdStr) {
    if (kaynakTip === "silo") {
        let m = silolar[kaynakIndex].kanallar[kanalIndex];
        silolar[kaynakIndex].kanallar[kanalIndex] = (m === "Boş" || m === "") ? hedefIdStr : (!m.includes(hedefIdStr) ? m + `, ${hedefIdStr}` : m);
    } else if (kaynakTip === "firin") {
        let m = firinlar[kaynakIndex].hedef;
        firinlar[kaynakIndex].hedef = (m === "Boş" || m === "") ? hedefIdStr : (!m.includes(hedefIdStr) ? m + `, ${hedefIdStr}` : m);
    }
}


// --- 4. ZOOM, PAN VE ÇOKLU SÜRÜKLEME ---
const sahne = document.getElementById('sahne');
let scale = 1; let panX = 0; let panY = 0;
let isPanning = false; let baslangicPanX = 0; let baslangicPanY = 0;

let seciliKutular = new Set(); // Çoklu seçim için kutu ID'lerini tutar
let suruklenenKutular = []; // Sürüklenen kutuların referanslarını tutar
let sonFareX = 0; let sonFareY = 0; let kutuSurukleniyor = false;

let kabloCekiliyor = false; let kabloBaslangic = null; let yerelFareX = 0; let yerelFareY = 0;

// ZOOM (Fare Tekerleği)
document.getElementById('fabrika-sahasi').addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomMiktari = e.deltaY < 0 ? 1.1 : 0.9;
    scale = Math.min(Math.max(scale * zoomMiktari, 0.2), 3); // %20 ile %300 arası
    sahne.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    document.getElementById('zoom-seviyesi').innerText = Math.round(scale * 100) + '%';
});

// ZOOM (Butonlar)
document.getElementById('btn-zoom-in').onclick = () => { scale = Math.min(scale * 1.2, 3); guncelleSahne(); };
document.getElementById('btn-zoom-out').onclick = () => { scale = Math.max(scale * 0.8, 0.2); guncelleSahne(); };
document.getElementById('btn-zoom-reset').onclick = () => { scale = 1; panX = 0; panY = 0; guncelleSahne(); };
function guncelleSahne() { 
    sahne.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`; 
    document.getElementById('zoom-seviyesi').innerText = Math.round(scale * 100) + '%';
}

// MOUSE İŞLEMLERİ (KAYDIRMA, SEÇİM, SÜRÜKLEME, KABLO)
document.addEventListener('mousedown', (e) => {
    // 1. BOŞLUK TUŞU İLE EKRAN KAYDIRMA (PAN)
    if (e.code === "Space" || document.body.style.cursor === "grab") {
        isPanning = true; baslangicPanX = e.clientX - panX; baslangicPanY = e.clientY - panY;
        document.getElementById('fabrika-sahasi').style.cursor = "grabbing";
        return;
    }

    const t = e.target;
    
    // 2. KABLO ÇEKME
    if (t.classList.contains('node-out')) {
        kabloCekiliyor = true; kabloBaslangic = t; return;
    }

    // 3. KUTU SEÇİMİ VE SÜRÜKLEME
    const kutu = t.closest('.kutu');
    if (kutu && !t.closest('button') && !t.classList.contains('umbau-lambasi') && !t.classList.contains('node-in')) {
        // Eğer CTRL veya Shift'e basılıysa, çoklu seçime ekle/çıkar
        if (e.ctrlKey || e.shiftKey) {
            if (seciliKutular.has(kutu.id)) { seciliKutular.delete(kutu.id); kutu.classList.remove('secili'); } 
            else { seciliKutular.add(kutu.id); kutu.classList.add('secili'); }
        } 
        else {
            // CTRL'ye basılmadıysa ve tıklanan kutu zaten seçili değilse, diğer seçimleri iptal et
            if (!seciliKutular.has(kutu.id)) {
                document.querySelectorAll('.kutu.secili').forEach(k => k.classList.remove('secili'));
                seciliKutular.clear();
                seciliKutular.add(kutu.id); kutu.classList.add('secili');
            }
        }

        kutuSurukleniyor = true;
        sonFareX = e.clientX; sonFareY = e.clientY;
        suruklenenKutular = Array.from(seciliKutular).map(id => document.getElementById(id));
    } else if (!kutu && !t.closest('#kontrol-paneli')) {
        // Boşluğa tıklandıysa tüm seçimleri kaldır
        document.querySelectorAll('.kutu.secili').forEach(k => k.classList.remove('secili'));
        seciliKutular.clear();
    }
});

document.addEventListener('mousemove', (e) => {
    // Zoom seviyesine göre farenin sahnedeki gerçek konumunu bul
    const rect = sahne.getBoundingClientRect();
    yerelFareX = (e.clientX - rect.left) / scale;
    yerelFareY = (e.clientY - rect.top) / scale;

    if (isPanning) {
        panX = e.clientX - baslangicPanX; panY = e.clientY - baslangicPanY;
        sahne.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    }
    else if (kutuSurukleniyor) {
        // Fare ne kadar hareket ettiyse (Zoom oranına göre bölüyoruz ki kutu hızlı kaçmasın)
        let deltaX = (e.clientX - sonFareX) / scale;
        let deltaY = (e.clientY - sonFareY) / scale;

        suruklenenKutular.forEach(k => {
            let yeniX = parseFloat(k.style.left || 0) + deltaX;
            let yeniY = parseFloat(k.style.top || 0) + deltaY;
            k.style.left = yeniX + 'px'; k.style.top = yeniY + 'px';
        });

        sonFareX = e.clientX; sonFareY = e.clientY;
    }
});

document.addEventListener('mouseup', (e) => {
    if (isPanning) {
        isPanning = false; document.getElementById('fabrika-sahasi').style.cursor = "default";
    }
    
    if (kabloCekiliyor) {
        let hedefNokta = e.target;
        if (hedefNokta.classList.contains('node-in')) {
            let kaynakKutu = kabloBaslangic.closest('.kutu');
            let hedefKutu = hedefNokta.closest('.kutu');
            let kanalIndex = kabloBaslangic.dataset.kanal || 0;
            if (kaynakKutu.id !== hedefKutu.id) baglantiEkle(kaynakKutu.dataset.tip, kaynakKutu.dataset.index, kanalIndex, hedefKutu.id);
        }
        kabloCekiliyor = false; kabloBaslangic = null;
    }

    if (kutuSurukleniyor) {
        // Yeni pozisyonları veri dizisine kaydet
        suruklenenKutular.forEach(k => {
            const yX = parseInt(k.style.left); const yY = parseInt(k.style.top);
            const idx = parseInt(k.dataset.index);
            if (k.dataset.tip === "silo") { silolar[idx].x = yX; silolar[idx].y = yY; } 
            else if (k.dataset.tip === "firin") { firinlar[idx].x = yX; firinlar[idx].y = yY; } 
            else { makinalar[idx].x = yX; makinalar[idx].y = yY; }
        });
        kutuSurukleniyor = false; suruklenenKutular = [];
    }
});

// Boşluk tuşu basılıyken pan moduna geç
window.addEventListener('keydown', (e) => { if (e.code === "Space" && e.target.tagName !== "INPUT") document.body.style.cursor = "grab"; });
window.addEventListener('keyup', (e) => { if (e.code === "Space") document.body.style.cursor = "default"; });


// --- 5. CANVAS (YENİ LOKASYON MANTIĞI) ---
const canvas = document.getElementById('cizim-alani');
const ctx = canvas.getContext('2d');
let dashOffset = 0;

function akisCizgileriniGuncelle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    silolar.forEach(silo => {
        silo.kanallar.forEach(kanal => {
            if (kanal && kanal !== "Boş") {
                kanal.split(',').forEach(hedefId => cizgiCiz(silo.id_str, hedefId.trim(), "#3498db", silo.aktif));
            }
        });
    });
    firinlar.forEach(firin => {
        if (firin.hedef && firin.hedef !== "Boş") {
            firin.hedef.split(',').forEach(hedefId => cizgiCiz(firin.id_str, hedefId.trim(), "#e67e22", firin.aktif));
        }
    });

    if (kabloCekiliyor && kabloBaslangic) {
        const kaynak = kabloBaslangic.closest('.kutu');
        const startX = kaynak.offsetLeft + kaynak.offsetWidth;
        const startY = kaynak.offsetTop + kabloBaslangic.offsetTop + (kabloBaslangic.offsetHeight/2);
        
        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(yerelFareX, yerelFareY);
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.setLineDash([5, 5]); ctx.stroke();
    }
}

function cizgiCiz(kaynakId, hedefId, aktifRenk, kaynakAktif) {
    const kaynak = document.getElementById(kaynakId); const hedef = document.getElementById(hedefId);
    if (!kaynak || !hedef) return;

    let hedefAktif = true;
    if (hedef.dataset.tip === "firin") hedefAktif = firinlar[hedef.dataset.index].aktif;
    else if (hedef.dataset.tip === "makina") hedefAktif = makinalar[hedef.dataset.index].aktif;

    // Kutu offset'leri direkt "#sahne" içindeki yerlerini verir. (Ekran koordinatı değil!)
    const startX = kaynak.offsetLeft + kaynak.offsetWidth;
    const startY = kaynak.offsetTop + (kaynak.offsetHeight / 2);
    const endX = hedef.offsetLeft;
    const endY = hedef.offsetTop + (hedef.offsetHeight / 2);

    ctx.beginPath(); ctx.moveTo(startX, startY);
    ctx.bezierCurveTo((startX + endX)/2, startY, (startX + endX)/2, endY, endX, endY);
    
    const baglantiAktif = kaynakAktif && hedefAktif;
    ctx.strokeStyle = baglantiAktif ? aktifRenk : "rgba(100, 100, 100, 0.4)";
    ctx.lineWidth = baglantiAktif ? 4 : 2;
    if (baglantiAktif) { ctx.setLineDash([10, 10]); ctx.lineDashOffset = -dashOffset; } else ctx.setLineDash([]);
    ctx.stroke();
}

function animasyonDongusu() { dashOffset += 1.5; akisCizgileriniGuncelle(); requestAnimationFrame(animasyonDongusu); }


// --- 6. TIKLAMA / MODAL OLAYLARI ---
let seciliTip = ""; let seciliIndex = null;
document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.classList.contains('node-out') || t.classList.contains('node-in')) return; 

    if (t.classList.contains('btn-on') || t.classList.contains('btn-off')) {
        const kutu = t.closest('.kutu'); const aktifMi = t.classList.contains('btn-on');
        if (kutu.dataset.tip === "silo") silolar[kutu.dataset.index].aktif = aktifMi;
        if (kutu.dataset.tip === "firin") firinlar[kutu.dataset.index].aktif = aktifMi;
        if (kutu.dataset.tip === "makina") makinalar[kutu.dataset.index].aktif = aktifMi;
        
        // Sadece sınıfı güncelle ki tüm HTML baştan çizilip seçimler iptal olmasın
        t.parentElement.querySelector('.btn-on').classList.toggle('aktif-buton', aktifMi);
        t.parentElement.querySelector('.btn-off').classList.toggle('aktif-buton', !aktifMi);
        return;
    }
    if (t.classList.contains('umbau-lambasi')) {
        const idx = t.closest('.kutu').dataset.index; makinalar[idx].umbau = !makinalar[idx].umbau;
        t.classList.toggle('umbau-aktif'); return;
    }

    const kutu = t.closest('.kutu');
    // Eğer çift tıkladıysa veya tıklayıp bırakma çok kısa sürdüyse detay penceresini aç
    if (kutu && !t.matches('button') && !t.matches('.umbau-lambasi') && !kutuSurukleniyor && !e.ctrlKey && !e.shiftKey) {
        
        // Kutunun sürüklendiğini tespit etmek için hafif bir gecikme engeli
        seciliTip = kutu.dataset.tip; seciliIndex = parseInt(kutu.dataset.index);
        
        document.getElementById('gelen-listesi').innerHTML = gelenBaglantilariBul(kutu.id).map(g => `<li>${g}</li>`).join('') || "<li>Henüz giriş yok.</li>";
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

document.addEventListener("DOMContentLoaded", () => { ekranlariCiz(); animasyonDongusu(); });
