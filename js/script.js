// --- 1. VERİ TABANI ---
let silolar = [];
for (let i = 1; i <= 14; i++) { silolar.push({ id_str: `silo_${i}`, isim: `Silo ${i}`, materyal: "PP", aktif: true, kanallar: ["Boş", "Boş", "Boş", "Boş"], x: 50, y: (i-1) * 150 + 50 }); }
let firinlar = [];
for (let i = 1; i <= 16; i++) { firinlar.push({ id_str: `firin_${i}`, isim: `Fırın ${i}`, sicaklik: "80°C", aktif: true, hedef: "Boş", x: 400, y: (i-1) * 130 + 50 }); }
const makinaIsimleri = ["400-2", "400-3", "500-9", "600-4", "600-7", "650-2", "650-8", "800-1", "800-4", "850-2", "850-3", "850-4", "900-1", "1000-3", "1000-4", "1100-1", "1450-1", "1600-3", "1700-2", "1700-3"];
let makinalar = [];
makinaIsimleri.forEach((isim, index) => { makinalar.push({ id_str: `makina_${index + 1}`, isim: `Makina ${isim}`, urun: "Belirlenmedi", aktif: true, umbau: false, x: 750, y: index * 110 + 50 }); });

// --- 2. HTML OLUŞTURMA ---
function ekranlariCiz() {
    const kapsayici = document.getElementById('cihazlar-kapsayici');
    let html = "";
    silolar.forEach((s, i) => { html += olusturHTML(s, "silo", i, "🛢️"); });
    firinlar.forEach((f, i) => { html += olusturHTML(f, "firin", i, "🔥"); });
    makinalar.forEach((m, i) => { html += olusturHTML(m, "makina", i, "⚙️"); });
    kapsayici.innerHTML = html;
}

function olusturHTML(veri, tip, index, ikon) {
    let nodeSol = (tip === "firin" || tip === "makina") ? `<div class="node-in"></div>` : "";
    let nodeSag = tip === "silo" ? `<div class="silo-nodes"><div class="node-out" data-kanal="0"></div><div class="node-out" data-kanal="1"></div><div class="node-out" data-kanal="2"></div><div class="node-out" data-kanal="3"></div></div>` : (tip === "firin" ? `<div class="node-out tekli" data-kanal="0"></div>` : "");
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

// --- 3. İZLENEBİLİRLİK ---
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

// --- 4. YENİ: MOBİL MOD SİSTEMİ (DÜZENLE / KAYDIR) ---
let aktifMod = "edit"; // 'edit' veya 'pan'
document.getElementById('btn-mod-edit').onclick = function() {
    aktifMod = "edit"; this.classList.add('mod-aktif'); document.getElementById('btn-mod-pan').classList.remove('mod-aktif');
};
document.getElementById('btn-mod-pan').onclick = function() {
    aktifMod = "pan"; this.classList.add('mod-aktif'); document.getElementById('btn-mod-edit').classList.remove('mod-aktif');
};

// --- 5. ZOOM SİSTEMİ ---
const sahne = document.getElementById('sahne');
let scale = 1; let panX = 0; let panY = 0;
document.getElementById('btn-zoom-in').onclick = () => { scale = Math.min(scale * 1.3, 3); guncelleSahne(); };
document.getElementById('btn-zoom-out').onclick = () => { scale = Math.max(scale * 0.7, 0.2); guncelleSahne(); };
function guncelleSahne() { 
    sahne.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`; 
    document.getElementById('zoom-seviyesi').innerText = Math.round(scale * 100) + '%';
}

// --- 6. TÜM EKRAN (MOUSE VE TOUCH) OLAYLARI ---
let isPanning = false; let baslangicPanX = 0; let baslangicPanY = 0;
let suruklenenKutu = null; let offset = { x: 0, y: 0 }; let kutuSuruklendiMi = false;
let kabloCekiliyor = false; let kabloBaslangic = null; let yerelFareX = 0; let yerelFareY = 0;

// Yardımcı Fonksiyon: Dokunma ve Mouse koordinatlarını birleştirir
function getKoordinatlar(e) {
    if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
}

function handleStart(e) {
    if (e.target.closest('#kontrol-paneli') || e.target.closest('.modal')) return;
    
    const pos = getKoordinatlar(e);

    // KAYDIRMA MODU
    if (aktifMod === "pan") {
        isPanning = true; baslangicPanX = pos.x - panX; baslangicPanY = pos.y - panY; return;
    }

    // DÜZENLEME MODU - KABLO ÇEKME
    const t = e.target;
    if (t.classList.contains('node-out')) {
        e.preventDefault(); kabloCekiliyor = true; kabloBaslangic = t; return;
    }

    // DÜZENLEME MODU - KUTU SÜRÜKLEME
    const kutu = t.closest('.kutu');
    if (kutu && !t.closest('button') && !t.classList.contains('umbau-lambasi') && !t.classList.contains('node-in')) {
        suruklenenKutu = kutu; kutuSuruklendiMi = false;
        const rect = kutu.getBoundingClientRect();
        offset.x = (pos.x - rect.left) / scale; offset.y = (pos.y - rect.top) / scale;
        kutu.style.zIndex = 1000;
    }
}

function handleMove(e) {
    if(!isPanning && !suruklenenKutu && !kabloCekiliyor) return;
    e.preventDefault(); // Ekranın telefonda sağa sola kaymasını engeller
    const pos = getKoordinatlar(e);
    
    // Farenin sahne üzerindeki gerçek (zoomlanmış) koordinatları
    const rect = sahne.getBoundingClientRect();
    yerelFareX = (pos.x - rect.left) / scale;
    yerelFareY = (pos.y - rect.top) / scale;

    if (isPanning) {
        panX = pos.x - baslangicPanX; panY = pos.y - baslangicPanY;
        sahne.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    }
    else if (suruklenenKutu) {
        kutuSuruklendiMi = true;
        suruklenenKutu.style.left = (yerelFareX - offset.x) + 'px';
        suruklenenKutu.style.top = (yerelFareY - offset.y) + 'px';
    }
}

function handleEnd(e) {
    const pos = getKoordinatlar(e);
    isPanning = false;

    // KABLO ÇEKME BİTTİ (Telefonda parmağın altındaki elementi bulma büyüsü)
    if (kabloCekiliyor) {
        // Parmağın kalktığı koordinattaki HTML elementini bul
        let altindakiElement = document.elementFromPoint(pos.x, pos.y);
        
        if (altindakiElement && altindakiElement.classList.contains('node-in')) {
            let kaynakKutu = kabloBaslangic.closest('.kutu'); let hedefKutu = altindakiElement.closest('.kutu');
            let kanalIndex = kabloBaslangic.dataset.kanal || 0;
            if (kaynakKutu.id !== hedefKutu.id) baglantiEkle(kaynakKutu.dataset.tip, kaynakKutu.dataset.index, kanalIndex, hedefKutu.id);
        }
        kabloCekiliyor = false; kabloBaslangic = null;
    }

    if (suruklenenKutu) {
        suruklenenKutu.style.zIndex = "";
        const idx = parseInt(suruklenenKutu.dataset.index);
        const yX = parseInt(suruklenenKutu.style.left); const yY = parseInt(suruklenenKutu.style.top);
        
        if (suruklenenKutu.dataset.tip === "silo") { silolar[idx].x = yX; silolar[idx].y = yY; } 
        else if (suruklenenKutu.dataset.tip === "firin") { firinlar[idx].x = yX; firinlar[idx].y = yY; } 
        else { makinalar[idx].x = yX; makinalar[idx].y = yY; }
        
        suruklenenKutu = null;
        setTimeout(() => { kutuSuruklendiMi = false; }, 50);
    }
}

// Eventleri hem Mouse hem de Touch için bağla
document.addEventListener('mousedown', handleStart, {passive: false});
document.addEventListener('mousemove', handleMove, {passive: false});
document.addEventListener('mouseup', handleEnd);

document.addEventListener('touchstart', handleStart, {passive: false});
document.addEventListener('touchmove', handleMove, {passive: false});
document.addEventListener('touchend', handleEnd);


// --- 7. CANVAS ÇİZİMİ ---
const canvas = document.getElementById('cizim-alani'); const ctx = canvas.getContext('2d'); let dashOffset = 0;
function akisCizgileriniGuncelle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    silolar.forEach(silo => {
        silo.kanallar.forEach(kanal => { if (kanal && kanal !== "Boş") kanal.split(',').forEach(hedefId => cizgiCiz(silo.id_str, hedefId.trim(), "#3498db", silo.aktif)); });
    });
    firinlar.forEach(firin => {
        if (firin.hedef && firin.hedef !== "Boş") firin.hedef.split(',').forEach(hedefId => cizgiCiz(firin.id_str, hedefId.trim(), "#e67e22", firin.aktif));
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
    let hedefAktif = (hedef.dataset.tip === "firin") ? firinlar[hedef.dataset.index].aktif : makinalar[hedef.dataset.index].aktif;

    const startX = kaynak.offsetLeft + kaynak.offsetWidth; const startY = kaynak.offsetTop + (kaynak.offsetHeight / 2);
    const endX = hedef.offsetLeft; const endY = hedef.offsetTop + (hedef.offsetHeight / 2);

    ctx.beginPath(); ctx.moveTo(startX, startY);
    ctx.bezierCurveTo((startX + endX)/2, startY, (startX + endX)/2, endY, endX, endY);
    
    const baglantiAktif = kaynakAktif && hedefAktif;
    ctx.strokeStyle = baglantiAktif ? aktifRenk : "rgba(100, 100, 100, 0.4)"; ctx.lineWidth = baglantiAktif ? 4 : 2;
    if (baglantiAktif) { ctx.setLineDash([10, 10]); ctx.lineDashOffset = -dashOffset; } else ctx.setLineDash([]);
    ctx.stroke();
}
function animasyonDongusu() { dashOffset += 1.5; akisCizgileriniGuncelle(); requestAnimationFrame(animasyonDongusu); }

// --- 8. TIKLAMA / MODAL OLAYLARI ---
// Telefonda 'click' yerine 'touchend' bazen çakışır, bu yüzden click eventini güvenli tutuyoruz.
document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.classList.contains('btn-on') || t.classList.contains('btn-off')) {
        const kutu = t.closest('.kutu'); const aktifMi = t.classList.contains('btn-on');
        if (kutu.dataset.tip === "silo") silolar[kutu.dataset.index].aktif = aktifMi;
        if (kutu.dataset.tip === "firin") firinlar[kutu.dataset.index].aktif = aktifMi;
        if (kutu.dataset.tip === "makina") makinalar[kutu.dataset.index].aktif = aktifMi;
        t.parentElement.querySelector('.btn-on').classList.toggle('aktif-buton', aktifMi);
        t.parentElement.querySelector('.btn-off').classList.toggle('aktif-buton', !aktifMi);
        return;
    }
    if (t.classList.contains('umbau-lambasi')) {
        const idx = t.closest('.kutu').dataset.index; makinalar[idx].umbau = !makinalar[idx].umbau;
        t.classList.toggle('umbau-aktif'); return;
    }

    const kutu = t.closest('.kutu');
    // Eğer tıklanan yer buton, lamba, node değilse ve o an kutu sürüklenmediyse pencereyi aç
    if (kutu && !t.matches('button') && !t.classList.contains('umbau-lambasi') && !t.classList.contains('node-out') && !t.classList.contains('node-in') && !kutuSuruklendiMi) {
        if(aktifMod === "pan") return; // Kaydır modundayken kutu penceresi açılmasın
        
        const tip = kutu.dataset.tip; const seciliIndex = parseInt(kutu.dataset.index);
        document.getElementById('gelen-listesi').innerHTML = gelenBaglantilariBul(kutu.id).map(g => `<li>${g}</li>`).join('') || "<li>Henüz giriş yok.</li>";
        document.getElementById('silo-kanallari-inputlari').style.display = "none"; document.getElementById('firin-hedef-inputu').style.display = "none";

        if (tip === "silo") {
            document.getElementById('modal-baslik').innerText = silolar[seciliIndex].isim; document.getElementById('modal-input-veri').value = silolar[seciliIndex].materyal;
            document.getElementById('silo-kanallari-inputlari').style.display = "block";
            for(let i=1; i<=4; i++) document.getElementById(`modal-kanal-${i}`).value = silolar[seciliIndex].kanallar[i-1];
        } else if (tip === "firin") {
            document.getElementById('modal-baslik').innerText = firinlar[seciliIndex].isim; document.getElementById('modal-input-veri').value = firinlar[seciliIndex].sicaklik;
            document.getElementById('firin-hedef-inputu').style.display = "block"; document.getElementById('modal-firin-hedef').value = firinlar[seciliIndex].hedef;
        } else {
            document.getElementById('modal-baslik').innerText = makinalar[seciliIndex].isim; document.getElementById('modal-input-veri').value = makinalar[seciliIndex].urun;
        }
        
        document.getElementById('detay-modal').style.display = "flex";
        
        document.getElementById('modal-kaydet').onclick = () => {
            const veri = document.getElementById('modal-input-veri').value;
            if (tip === "silo") {
                silolar[seciliIndex].materyal = veri;
                for(let i=1; i<=4; i++) silolar[seciliIndex].kanallar[i-1] = document.getElementById(`modal-kanal-${i}`).value;
            } else if (tip === "firin") {
                firinlar[seciliIndex].sicaklik = veri; firinlar[seciliIndex].hedef = document.getElementById('modal-firin-hedef').value;
            } else { makinalar[seciliIndex].urun = veri; }
            document.getElementById('detay-modal').style.display = "none";
            ekranlariCiz();
        };
    }
    if (t.id === "modal-kapat") document.getElementById('detay-modal').style.display = "none";
});

document.addEventListener("DOMContentLoaded", () => { ekranlariCiz(); animasyonDongusu(); });
