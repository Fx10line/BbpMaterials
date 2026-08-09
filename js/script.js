// --- 1. VERİ TABANI ---
const siloHamVeri = [
    { isim: "Silo 1", materyal: "EDISTIR R 321P BULK CM P938", kod: "0002.01B" }, { isim: "Silo 2", materyal: "Mafill CR CT 5344H PPTV20 Rez.", kod: "0128.90B" },
    { isim: "Silo 3", materyal: "Scolefin CF 4002 black 225230", kod: "0208.45" }, { isim: "Silo 4", materyal: "Pentamid AB GV10 MC20 H2 RC1 tiefsch.", kod: "0497.90" },
    { isim: "Silo 5", materyal: "Mafill CRHT 6344 schwarz", kod: "0208.15" }, { isim: "Silo 6", materyal: "Seculene PPX 8027 S0 (DC) schwarz", kod: "0208.01B" },
    { isim: "Silo 7", materyal: "Mafill CR CT 5344H PPTV20 Rez.", kod: "0128.90B" }, { isim: "Silo 8", materyal: "Anjacom PA6 3255", kod: "0497.95B" },
    { isim: "Silo 9", materyal: "Hostacom XM2 U34 schwarz 102942", kod: "0128.01B" }, { isim: "Silo 10", materyal: "Hostacom XM2 U34 schwarz 102942", kod: "0128.01B" },
    { isim: "Silo 11", materyal: "BGV 25C evograu 2,G2/290 2,5L", kod: "0368.01B" }, { isim: "Silo 12", materyal: "Seculene PPX 8027 S0 (DC) schwarz", kod: "0208.01B" },
    { isim: "Silo 13", materyal: "Hostacom EKC297T schwarz", kod: "0312.01B" }, { isim: "Silo 14", materyal: "Durethan BKV 60 H2.0EF DUS 060 sw.", kod: "0350.65" }
];
let silolar = []; siloHamVeri.forEach((s, i) => { silolar.push({ id_str: `silo_${i+1}`, isim: s.isim, materyal: s.materyal, kod: s.kod, teknik: "", aktif: true, kanallar: ["Boş", "Boş", "Boş", "Boş"], x: 50, y: i * 160 + 50 }); });
let firinlar = []; for (let i = 1; i <= 16; i++) { firinlar.push({ id_str: `firin_${i}`, isim: `Fırın ${i}`, sicaklik: "80°C", aktif: true, hedef: "Boş", x: 450, y: (i-1) * 140 + 50 }); }
const makinaIsimleri = ["400-2", "400-3", "500-9", "600-4", "600-7", "650-2", "650-8", "800-1", "800-4", "850-2", "850-3", "850-4", "900-1", "1000-3", "1000-4", "1100-1", "1450-1", "1600-3", "1700-2", "1700-3"];
let makinalar = []; makinaIsimleri.forEach((isim, index) => { makinalar.push({ id_str: `makina_${index + 1}`, isim: `Makina ${isim}`, urun: "Belirlenmedi", aktif: true, umbau: false, x: 850, y: index * 120 + 50 }); });

// --- 2. ZİNCİRLEME MATERYAL MOTORU (YENİ FORMAT: Silo 1 > Fırın 3 > Kod) ---
function zincirlemeMateryalBul(hedefIdStr, tip) {
    let matListesi = [];
    let eksikParcaMi = false;

    if (tip === "firin") {
        silolar.forEach(s => {
            s.kanallar.forEach(k => {
                if (k && k.includes(hedefIdStr)) {
                    matListesi.push(`<span class="goto-cihaz" data-target="${s.id_str}">${s.isim}</span> ➔ <br><b>${s.kod}</b> <span style="font-size:9px;">${s.materyal.substring(0,25)}...</span>`);
                }
            });
        });
    } else if (tip === "makina") {
        firinlar.forEach(f => {
            if (f.hedef && f.hedef.includes(hedefIdStr)) {
                let fırınaSiloBaglimi = false;
                silolar.forEach(s => {
                    s.kanallar.forEach(k => {
                        if (k && k.includes(f.id_str)) {
                            fırınaSiloBaglimi = true;
                            matListesi.push(`<span class="goto-cihaz" data-target="${s.id_str}">${s.isim}</span> ➔ <span class="goto-cihaz" data-target="${f.id_str}">${f.isim}</span> ➔ <br><b>${s.kod}</b> <span style="font-size:9px;">${s.materyal.substring(0,20)}...</span>`);
                        }
                    });
                });
                if (!fırınaSiloBaglimi) {
                    matListesi.push(`<span style="color:#e74c3c">? (Silo Yok)</span> ➔ <span class="goto-cihaz" data-target="${f.id_str}">${f.isim}</span> ➔ <b>Bilinmiyor</b>`);
                }
            }
        });
        // Silodan direkt makinaya kablo çekildiyse
        silolar.forEach(s => {
            s.kanallar.forEach(k => {
                if (k && k.includes(hedefIdStr)) {
                    matListesi.push(`<span class="goto-cihaz" data-target="${s.id_str}">${s.isim}</span> ➔ <br><b>${s.kod}</b> <span style="font-size:9px;">${s.materyal.substring(0,25)}...</span>`);
                }
            });
        });
    }

    matListesi = [...new Set(matListesi)];
    return matListesi.length > 0 ? matListesi.join('<hr style="margin:4px 0; border-top:1px dashed rgba(255,255,255,0.2);">') : "<span style='color:#e74c3c'>Bağlantı Yok</span>";
}

function gelenBaglantilariBulUI(hedefIdStr) {
    let gelenler = [];
    silolar.forEach(s => { s.kanallar.forEach(k => { if(k && k.includes(hedefIdStr)) gelenler.push(`<li class="liste-satiri"><b>${s.isim}</b> (Kanal)<button class="btn-kopar" onclick="baglantiSilGlobal('${s.id_str}', '${hedefIdStr}')">X Sil</button><br><span style="font-size:10px;">${s.kod}</span></li>`); }); });
    firinlar.forEach(f => { if(f.hedef && f.hedef.includes(hedefIdStr)) gelenler.push(`<li class="liste-satiri"><b>${f.isim}</b>'dan (Fırın)<button class="btn-kopar" onclick="baglantiSilGlobal('${f.id_str}', '${hedefIdStr}')">X Sil</button><br><span style="font-size:10px;">Isı: ${f.sicaklik}</span></li>`); });
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
window.baglantiSilGlobal = function(kaynakId, hedefId) {
    silolar.forEach((s, idx) => { if(s.id_str === kaynakId) { s.kanallar.forEach((k, kIdx) => { if(k) { let hList = k.split(',').map(x=>x.trim()).filter(x => x !== hedefId); silolar[idx].kanallar[kIdx] = hList.length > 0 ? hList.join(', ') : "Boş"; } }); } });
    firinlar.forEach((f, idx) => { if(f.id_str === kaynakId) { if(f.hedef) { let hList = f.hedef.split(',').map(x=>x.trim()).filter(x => x !== hedefId); firinlar[idx].hedef = hList.length > 0 ? hList.join(', ') : "Boş"; } } });
    document.getElementById('detay-modal').style.display = "none"; ekranlariCiz();
};
function kanalTemizle(kaynakKutu, kanalIndex) {
    const tip = kaynakKutu.dataset.tip; const idx = parseInt(kaynakKutu.dataset.index);
    if (tip === "silo") silolar[idx].kanallar[kanalIndex] = "Boş"; if (tip === "firin") firinlar[idx].hedef = "Boş";
    ekranlariCiz();
}

// --- 3. HTML OLUŞTURMA ---
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
    let nodeSag = "";
    if (tip === "silo") { nodeSag = `<div class="silo-nodes"><div class="node-out node-ch1" data-kanal="0"></div><div class="node-out node-ch2" data-kanal="1"></div><div class="node-out node-ch3" data-kanal="2"></div><div class="node-out node-ch4" data-kanal="3"></div></div>`; } 
    else if (tip === "firin") { nodeSag = `<div class="node-out tekli" data-kanal="0"></div>`; }
    let lamba = tip === "makina" ? `<div class="umbau-lambasi ${veri.umbau ? 'umbau-aktif':''}"></div>` : "";
    
    let bilgi = "";
    if (tip === "silo") {
        bilgi = `<b>${veri.kod}</b><br><span style="font-size:10px;">${veri.materyal.substring(0,30)}${veri.materyal.length > 30 ? '...' : ''}</span>`;
    } else if (tip === "firin") {
        bilgi = `Isı: ${veri.sicaklik}<div style="margin-top:5px; padding-top:5px; border-top:1px dashed #555;">${zincirlemeMateryalBul(veri.id_str, tip)}</div>`;
    } else {
        bilgi = `Ürün: ${veri.urun}<div style="margin-top:5px; padding-top:5px; border-top:1px dashed #555;">${zincirlemeMateryalBul(veri.id_str, tip)}</div>`;
    }

    return `<div class="kutu" id="${veri.id_str}" data-tip="${tip}" data-index="${index}" style="left: ${veri.x}px; top: ${veri.y}px;">
                ${nodeSol} ${nodeSag} ${lamba}
                <div class="kutu-ikon">${ikon}</div>
                <div class="kutu-baslik">${veri.isim}</div>
                <div class="kutu-bilgi">${bilgi}</div>
                <div class="guc-dugmeleri"><button class="btn-toggle ${veri.aktif ? 'btn-on' : 'btn-off'}">${veri.aktif ? 'AÇIK' : 'KAPALI'}</button></div>
            </div>`;
}

// --- 4. PANEL, MOBİL MOD, ZOOM VE KAMERA UÇUŞ MOTORU ---
document.getElementById('panel-baslik').onclick = function() { document.getElementById('kontrol-paneli').classList.toggle('acik'); };
let aktifMod = "edit"; 
document.getElementById('btn-mod-edit').onclick = function() { aktifMod = "edit"; this.classList.add('mod-aktif'); document.getElementById('btn-mod-pan').classList.remove('mod-aktif'); };
document.getElementById('btn-mod-pan').onclick = function() { aktifMod = "pan"; this.classList.add('mod-aktif'); document.getElementById('btn-mod-edit').classList.remove('mod-aktif'); };

const sahne = document.getElementById('sahne');
let scale = 1; let panX = 0; let panY = 0;
document.getElementById('btn-zoom-in').onclick = () => { scale = Math.min(scale * 1.5, 3); guncelleSahne(); };
document.getElementById('btn-zoom-out').onclick = () => { scale = Math.max(scale * 0.5, 0.2); guncelleSahne(); };
function guncelleSahne() { sahne.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`; document.getElementById('zoom-seviyesi').innerText = Math.round(scale * 100) + '%'; }

// YENİ: KAMERA MERKEZLEME FONKSİYONU
function cihazaGit(hedefIdStr) {
    const hedef = document.getElementById(hedefIdStr);
    if (!hedef) return;
    
    // Ekranın tam ortasına hizalamak için panX ve panY hesapla
    const w = document.getElementById('fabrika-sahasi').offsetWidth;
    const h = document.getElementById('fabrika-sahasi').offsetHeight;
    
    const kutuX = parseInt(hedef.style.left);
    const kutuY = parseInt(hedef.style.top);
    
    panX = (w / 2) - ((kutuX + 85) * scale); // 85 kutunun yarısı
    panY = (h / 2) - ((kutuY + 100) * scale);
    
    guncelleSahne();

    // Görsel Parlama Efekti
    hedef.classList.remove('highlight');
    void hedef.offsetWidth; // Reflow tetikleme
    hedef.classList.add('highlight');
}

// --- 5. EKRAN OLAYLARI (TOUCH / SÜRÜKLE BIRAK / KABLO SİLME) ---
let isPanning = false; let baslangicPanX = 0; let baslangicPanY = 0;
let suruklenenKutu = null; let offset = { x: 0, y: 0 }; let kutuSuruklendiMi = false;
let kabloCekiliyor = false; let kabloBaslangic = null; let yerelFareX = 0; let yerelFareY = 0;

function getKoordinatlar(e) {
    if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
}

function handleStart(e) {
    if (e.target.closest('#kontrol-paneli') || e.target.closest('.modal')) return;
    const pos = getKoordinatlar(e);

    if (aktifMod === "pan") { isPanning = true; baslangicPanX = pos.x - panX; baslangicPanY = pos.y - panY; return; }

    const t = e.target;
    if (t.classList.contains('node-out')) { e.preventDefault(); kabloCekiliyor = true; kabloBaslangic = t; return; }

    const kutu = t.closest('.kutu');
    // Eğer tıklanan yer "goto-cihaz" linki ise kutuyu sürükleme
    if (kutu && !t.matches('button') && !t.classList.contains('umbau-lambasi') && !t.classList.contains('node-in') && !t.classList.contains('goto-cihaz')) {
        suruklenenKutu = kutu; kutuSuruklendiMi = false;
        const rect = kutu.getBoundingClientRect();
        offset.x = (pos.x - rect.left) / scale; offset.y = (pos.y - rect.top) / scale;
        kutu.style.zIndex = 1000;
    }
}

function handleMove(e) {
    if(!isPanning && !suruklenenKutu && !kabloCekiliyor) return;
    e.preventDefault(); 
    const pos = getKoordinatlar(e);
    const rect = sahne.getBoundingClientRect();
    yerelFareX = (pos.x - rect.left) / scale; yerelFareY = (pos.y - rect.top) / scale;

    if (isPanning) {
        panX = pos.x - baslangicPanX; panY = pos.y - baslangicPanY;
        sahne.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    } else if (suruklenenKutu) {
        kutuSuruklendiMi = true;
        suruklenenKutu.style.left = (yerelFareX - offset.x) + 'px';
        suruklenenKutu.style.top = (yerelFareY - offset.y) + 'px';
    }
}

function handleEnd(e) {
    const pos = getKoordinatlar(e);
    isPanning = false;

    if (kabloCekiliyor) {
        let hedefNokta = null;
        let altindakiElement = document.elementFromPoint(pos.x, pos.y);
        
        if (altindakiElement && altindakiElement.classList.contains('node-in')) { hedefNokta = altindakiElement; } 
        else {
            let tumGirisler = document.querySelectorAll('.node-in');
            for (let giris of tumGirisler) {
                let rect = giris.getBoundingClientRect();
                let merkezX = rect.left + rect.width / 2; let merkezY = rect.top + rect.height / 2;
                if (Math.hypot(merkezX - pos.x, merkezY - pos.y) < 60) { hedefNokta = giris; break; }
            }
        }

        let kaynakKutu = kabloBaslangic.closest('.kutu'); let kanalIndex = kabloBaslangic.dataset.kanal || 0;
        if (hedefNokta) {
            let hedefKutu = hedefNokta.closest('.kutu');
            if (kaynakKutu.id !== hedefKutu.id) { baglantiEkle(kaynakKutu.dataset.tip, kaynakKutu.dataset.index, kanalIndex, hedefKutu.id); ekranlariCiz(); }
        } else { kanalTemizle(kaynakKutu, kanalIndex); }
        kabloCekiliyor = false; kabloBaslangic = null;
    }

    if (suruklenenKutu) {
        suruklenenKutu.style.zIndex = "";
        const idx = parseInt(suruklenenKutu.dataset.index);
        const yX = parseInt(suruklenenKutu.style.left); const yY = parseInt(suruklenenKutu.style.top);
        if (suruklenenKutu.dataset.tip === "silo") { silolar[idx].x = yX; silolar[idx].y = yY; } 
        else if (suruklenenKutu.dataset.tip === "firin") { firinlar[idx].x = yX; firinlar[idx].y = yY; } 
        else { makinalar[idx].x = yX; makinalar[idx].y = yY; }
        suruklenenKutu = null; setTimeout(() => { kutuSuruklendiMi = false; }, 50);
    }
}

document.addEventListener('mousedown', handleStart, {passive: false});
document.addEventListener('mousemove', handleMove, {passive: false});
document.addEventListener('mouseup', handleEnd);
document.addEventListener('touchstart', handleStart, {passive: false});
document.addEventListener('touchmove', handleMove, {passive: false});
document.addEventListener('touchend', handleEnd);

// --- 6. CANVAS ÇİZİMİ ---
const canvas = document.getElementById('cizim-alani'); const ctx = canvas.getContext('2d'); let dashOffset = 0;
const kanalRenkleri = ["#f1c40f", "#3498db", "#e74c3c", "#bdc3c7"]; 

function akisCizgileriniGuncelle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    silolar.forEach(silo => { silo.kanallar.forEach((kanal, kIdx) => { if (kanal && kanal !== "Boş") kanal.split(',').forEach(hedefId => cizgiCiz(silo.id_str, hedefId.trim(), kanalRenkleri[kIdx], silo.aktif, kIdx)); }); });
    firinlar.forEach(firin => { if (firin.hedef && firin.hedef !== "Boş") firin.hedef.split(',').forEach(hedefId => cizgiCiz(firin.id_str, hedefId.trim(), "#e67e22", firin.aktif, 0)); });

    if (kabloCekiliyor && kabloBaslangic) {
        let tempRenk = "#fff";
        if (kabloBaslangic.classList.contains("node-ch1")) tempRenk = kanalRenkleri[0];
        else if (kabloBaslangic.classList.contains("node-ch2")) tempRenk = kanalRenkleri[1];
        else if (kabloBaslangic.classList.contains("node-ch3")) tempRenk = kanalRenkleri[2];
        else if (kabloBaslangic.classList.contains("node-ch4")) tempRenk = kanalRenkleri[3];
        else if (kabloBaslangic.closest('.kutu').dataset.tip === "firin") tempRenk = "#e67e22";

        const rectSahne = sahne.getBoundingClientRect(); const rectCikis = kabloBaslangic.getBoundingClientRect();
        const startX = (rectCikis.left - rectSahne.left + rectCikis.width / 2) / scale; const startY = (rectCikis.top - rectSahne.top + rectCikis.height / 2) / scale;
        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(yerelFareX, yerelFareY);
        ctx.strokeStyle = tempRenk; ctx.lineWidth = 4; ctx.setLineDash([5, 5]); ctx.stroke();
    }
}
function cizgiCiz(kaynakId, hedefId, aktifRenk, kaynakAktif, kanalIndex) {
    const kaynak = document.getElementById(kaynakId); const hedef = document.getElementById(hedefId);
    if (!kaynak || !hedef) return;
    let hedefAktif = (hedef.dataset.tip === "firin") ? firinlar[hedef.dataset.index].aktif : makinalar[hedef.dataset.index].aktif;
    let cikisNoktasi = kaynak.querySelector(`.node-out[data-kanal="${kanalIndex}"]`);
    if(!cikisNoktasi) cikisNoktasi = kaynak.querySelector('.node-out');
    let girisNoktasi = hedef.querySelector('.node-in');
    
    const rectSahne = sahne.getBoundingClientRect(); const rectCikis = cikisNoktasi.getBoundingClientRect(); const rectGiris = girisNoktasi.getBoundingClientRect();
    const startX = (rectCikis.left - rectSahne.left + rectCikis.width / 2) / scale; const startY = (rectCikis.top - rectSahne.top + rectCikis.height / 2) / scale;
    const endX = (rectGiris.left - rectSahne.left + rectGiris.width / 2) / scale; const endY = (rectGiris.top - rectSahne.top + rectGiris.height / 2) / scale;

    ctx.beginPath(); ctx.moveTo(startX, startY); ctx.bezierCurveTo((startX + endX)/2, startY, (startX + endX)/2, endY, endX, endY);
    const baglantiAktif = kaynakAktif && hedefAktif;
    ctx.strokeStyle = baglantiAktif ? aktifRenk : "rgba(100, 100, 100, 0.4)"; ctx.lineWidth = baglantiAktif ? 5 : 2;
    if (baglantiAktif) { ctx.setLineDash([12, 12]); ctx.lineDashOffset = -dashOffset; } else ctx.setLineDash([]);
    ctx.stroke();
}
function animasyonDongusu() { dashOffset += 1.5; akisCizgileriniGuncelle(); requestAnimationFrame(animasyonDongusu); }

// --- 7. TIKLAMA / MODAL OLAYLARI ---
document.addEventListener('click', (e) => {
    const t = e.target;
    
    // YENİ: EĞER "SİLO 1" YAZISINA TIKLANDIYSA CİHAZA GİT (KAMERA UÇUŞU)
    if (t.classList.contains('goto-cihaz')) {
        cihazaGit(t.dataset.target);
        return; 
    }

    if (t.classList.contains('btn-kopar') || t.classList.contains('node-out') || t.classList.contains('node-in') || t.closest('#kontrol-paneli')) return; 

    if (t.classList.contains('btn-toggle')) {
        const kutu = t.closest('.kutu'); const tip = kutu.dataset.tip; const idx = parseInt(kutu.dataset.index);
        let aktifMi = false;
        if (tip === "silo") { silolar[idx].aktif = !silolar[idx].aktif; aktifMi = silolar[idx].aktif; }
        if (tip === "firin") { firinlar[idx].aktif = !firinlar[idx].aktif; aktifMi = firinlar[idx].aktif; }
        if (tip === "makina") { makinalar[idx].aktif = !makinalar[idx].aktif; aktifMi = makinalar[idx].aktif; }
        t.className = `btn-toggle ${aktifMi ? 'btn-on' : 'btn-off'}`; t.innerText = aktifMi ? 'AÇIK' : 'KAPALI';
        ekranlariCiz(); return;
    }
    
    if (t.classList.contains('umbau-lambasi')) {
        const idx = t.closest('.kutu').dataset.index; makinalar[idx].umbau = !makinalar[idx].umbau;
        t.classList.toggle('umbau-aktif'); return;
    }

    const kutu = t.closest('.kutu');
    if (kutu && !t.matches('button') && !t.classList.contains('umbau-lambasi') && !kutuSuruklendiMi) {
        if(aktifMod === "pan") return; 
        const tip = kutu.dataset.tip; const seciliIndex = parseInt(kutu.dataset.index);
        
        document.getElementById('gelen-listesi').innerHTML = gelenBaglantilariBulUI(kutu.id).join('') || "<li>Henüz giriş yok.</li>";
        document.getElementById('silo-kanallari-inputlari').style.display = "none"; document.getElementById('firin-hedef-inputu').style.display = "none";
        document.getElementById('silo-ozel-bilgiler').style.display = "none";

        if (tip === "silo") {
            document.getElementById('modal-baslik').innerText = silolar[seciliIndex].isim; document.getElementById('modal-etiket').innerText = "Materyal Açıklaması:"; document.getElementById('modal-input-veri').value = silolar[seciliIndex].materyal;
            document.getElementById('silo-ozel-bilgiler').style.display = "block"; document.getElementById('modal-input-kod').value = silolar[seciliIndex].kod; document.getElementById('modal-input-teknik').value = silolar[seciliIndex].teknik;
            document.getElementById('silo-kanallari-inputlari').style.display = "block";
            for(let i=1; i<=4; i++) document.getElementById(`modal-kanal-${i}`).value = silolar[seciliIndex].kanallar[i-1];
        } else if (tip === "firin") {
            document.getElementById('modal-baslik').innerText = firinlar[seciliIndex].isim; document.getElementById('modal-etiket').innerText = "Fırın Sıcaklığı:"; document.getElementById('modal-input-veri').value = firinlar[seciliIndex].sicaklik;
            document.getElementById('firin-hedef-inputu').style.display = "block"; document.getElementById('modal-firin-hedef').value = firinlar[seciliIndex].hedef;
        } else {
            document.getElementById('modal-baslik').innerText = makinalar[seciliIndex].isim; document.getElementById('modal-etiket').innerText = "Üretilen Ürün / Plan:"; document.getElementById('modal-input-veri').value = makinalar[seciliIndex].urun;
        }
        
        document.getElementById('detay-modal').style.display = "flex";
        
        document.getElementById('modal-kaydet').onclick = () => {
            const veri = document.getElementById('modal-input-veri').value;
            if (tip === "silo") {
                silolar[seciliIndex].materyal = veri; silolar[seciliIndex].kod = document.getElementById('modal-input-kod').value; silolar[seciliIndex].teknik = document.getElementById('modal-input-teknik').value;
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
