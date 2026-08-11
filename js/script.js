// --- 1. VERİ TABANI VE GÜVENLİ HAFIZA ---
const siloHamVeri = [
    { isim: "Silo 1", materyal: "EDISTIR R 321P BULK CM P938", kod: "0002.01B" }, { isim: "Silo 2", materyal: "Mafill CR CT 5344H PPTV20 Rez.", kod: "0128.90B" },
    { isim: "Silo 3", materyal: "Scolefin CF 4002 black 225230", kod: "0208.45" }, { isim: "Silo 4", materyal: "Pentamid AB GV10 MC20 H2 RC1 tiefsch.", kod: "0497.90" },
    { isim: "Silo 5", materyal: "Mafill CRHT 6344 schwarz", kod: "0208.15" }, { isim: "Silo 6", materyal: "Seculene PPX 8027 S0 (DC) schwarz", kod: "0208.01B" },
    { isim: "Silo 7", materyal: "Mafill CR CT 5344H PPTV20 Rez.", kod: "0128.90B" }, { isim: "Silo 8", materyal: "Anjacom PA6 3255", kod: "0497.95B" },
    { isim: "Silo 9", materyal: "Hostacom XM2 U34 schwarz 102942", kod: "0128.01B" }, { isim: "Silo 10", materyal: "Hostacom XM2 U34 schwarz 102942", kod: "0128.01B" },
    { isim: "Silo 11", materyal: "BGV 25C evograu 2,G2/290 2,5L", kod: "0368.01B" }, { isim: "Silo 12", materyal: "Seculene PPX 8027 S0 (DC) schwarz", kod: "0208.01B" },
    { isim: "Silo 13", materyal: "Hostacom EKC297T schwarz", kod: "0312.01B" }, { isim: "Silo 14", materyal: "Durethan BKV 60 H2.0EF DUS 060 sw.", kod: "0350.65" }
];

function guvenliJSONParse(key) {
    try { let data = localStorage.getItem(key); return data ? JSON.parse(data) : null; } 
    catch(e) { localStorage.removeItem(key); return null; }
}

let silolar = []; let ks = guvenliJSONParse('bbp_silolar');
if (ks && Array.isArray(ks)) { silolar = ks.map(s => ({ kanallar: ["Boş","Boş","Boş","Boş"], ...s })); } 
else { siloHamVeri.forEach((s, i) => { silolar.push({ id_str: `silo_${i+1}`, isim: s.isim, materyal: s.materyal, kod: s.kod, teknik: "", aktif: true, kanallar: ["Boş", "Boş", "Boş", "Boş"], x: 100, y: i * 150 + 100 }); }); }

let firinlar = []; let kf = guvenliJSONParse('bbp_firinlar');
if (kf && Array.isArray(kf)) { firinlar = kf.map(f => ({ ekTip: "yok", ekVeri: "", ...f })); } 
else { for (let i = 1; i <= 16; i++) { firinlar.push({ id_str: `firin_${i}`, isim: `Fırın ${i}`, sicaklik: "80°C", aktif: true, hedef: "Boş", ekTip: "yok", ekVeri: "", x: 600, y: (i-1) * 150 + 100 }); } }

const makinaIsimleri = ["400-2", "400-3", "500-9", "600-4", "600-7", "650-2", "650-8", "800-1", "800-4", "850-2", "850-3", "850-4", "900-1", "1000-3", "1000-4", "1100-1", "1450-1", "1600-3", "1700-2", "1700-3"];
let makinalar = []; let km = guvenliJSONParse('bbp_makinalar');
if (km && Array.isArray(km)) { 
    makinalar = km.map(m => { if (!m.ekler) { m.ekler = [{ tip: m.ekTip||"yok", veri: m.ekVeri||"", x: null, y: null }, { tip: "yok", veri: "", x: null, y: null }, { tip: "yok", veri: "", x: null, y: null }]; } return m; }); 
} else { 
    makinaIsimleri.forEach((isim, index) => { makinalar.push({ id_str: `makina_${index + 1}`, isim: `Makina ${isim}`, urun: "Belirlenmedi", aktif: true, ekler: [{tip:"yok", veri:""}, {tip:"yok", veri:""}, {tip:"yok", veri:""}], x: 1100, y: index * 150 + 100 }); }); 
}

let receteler = guvenliJSONParse('bbp_receteler') || {};

function verileriKaydet() {
    localStorage.setItem('bbp_silolar', JSON.stringify(silolar)); localStorage.setItem('bbp_firinlar', JSON.stringify(firinlar));
    localStorage.setItem('bbp_makinalar', JSON.stringify(makinalar)); localStorage.setItem('bbp_receteler', JSON.stringify(receteler));
}

let konumlarKilitli = true;

function bagVarMi(kanalStr, id) {
    if (!kanalStr || kanalStr === "Boş") return false;
    return kanalStr.split(',').map(x => x.trim()).includes(id);
}
function getCihazIsim(idStr) {
    let s = silolar.find(x => x.id_str === idStr); if (s) return s.isim;
    let f = firinlar.find(x => x.id_str === idStr); if (f) return f.isim;
    let m = makinalar.find(x => x.id_str === idStr); if (m) return m.isim; return null;
}

// --- 2. ZİNCİR ÖZETİ (GELİŞMİŞ HOVER) ---
function hoverOzetUret(veri, tip) {
    let html = ""; let zincir = []; let kod = "";
    if (tip === "silo") {
        html += `KOD: <b>${veri.kod}</b><br>`;
        let out = []; veri.kanallar.forEach(k => { if (k && k !== "Boş") k.split(',').forEach(h => { let isim = getCihazIsim(h.trim()); if(isim) out.push(isim); }); });
        if(out.length > 0) html += `📤 Hedef: ${[...new Set(out)].join(', ')}`;
    } 
    else if (tip === "firin") {
        silolar.forEach(s => { s.kanallar.forEach(k => { if(bagVarMi(k, veri.id_str)) { zincir.push(s.isim); kod = s.kod; }})});
        if(zincir.length > 0) html += `📥 <b>${zincir[0]}</b> ➔ Fırın<br>KOD: <b>${kod}</b>`; else html += `<span style="color:#e74c3c">Giriş Yok</span>`;
    } 
    else if (tip === "makina") {
        firinlar.forEach(f => { if(bagVarMi(f.hedef, veri.id_str)) {
            let sBulundu = false; silolar.forEach(s => { s.kanallar.forEach(k => { if(bagVarMi(k, f.id_str)) { sBulundu = true; zincir.push(`<b>${s.isim}</b> ➔ ${f.isim}`); kod = s.kod; }})});
            if(!sBulundu) zincir.push(`<span style="color:#e74c3c">?</span> ➔ ${f.isim}`);
        }});
        silolar.forEach(s => { s.kanallar.forEach(k => { if(bagVarMi(k, veri.id_str)) { zincir.push(`<b>${s.isim}</b> ➔ Direkt`); kod = s.kod; }})});
        if(zincir.length > 0) html += `📥 Zincir:<br>${zincir.join('<br>')}<br>KOD: <b>${kod}</b>`; else html += `<span style="color:#e74c3c">Giriş Yok</span>`;
    }
    return `<div style="margin-top:6px; padding-top:6px; border-top:1px dashed rgba(255,255,255,0.3); font-size:11px;">${html}</div>`;
}

function durumLambalariniUret(veri, tip) {
    if (tip === "silo") return "";
    let ledHtml = ""; let isSilo = false; let isFirin = false;
    if (tip === "firin") { silolar.forEach(s => { s.kanallar.forEach(k => { if(bagVarMi(k, veri.id_str)) isSilo = true; }); }); } 
    else if (tip === "makina") {
        firinlar.forEach(f => { if (bagVarMi(f.hedef, veri.id_str)) { isFirin = true; silolar.forEach(s => { s.kanallar.forEach(k => { if(bagVarMi(k, f.id_str)) isSilo = true; }); }); } });
        silolar.forEach(s => { s.kanallar.forEach(k => { if(bagVarMi(k, veri.id_str)) isSilo = true; }); });
    }
    if (isSilo) ledHtml += `<div class="led led-silo" title="Silo Bağlı"></div>`;
    if (isFirin) ledHtml += `<div class="led led-firin" title="Fırın Bağlı"></div>`;
    if (tip === "firin") { if (veri.ekTip === "merkez") ledHtml += `<div class="led led-ek-merkez"></div>`; if (veri.ekTip === "lokal") ledHtml += `<div class="led led-ek-lokal"></div>`; } 
    else if (tip === "makina" && veri.ekler) { if (veri.ekler.some(e => e.tip === "merkez")) ledHtml += `<div class="led led-ek-merkez"></div>`; if (veri.ekler.some(e => e.tip === "lokal")) ledHtml += `<div class="led led-ek-lokal"></div>`; }
    return `<div class="durum-paneli">${ledHtml}</div>`;
}

const kutuGozlemci = new ResizeObserver(() => { statikSVGZorlaCiz(); });

// --- 3. AKILLI KUTU OLUŞTURMA ---
function ekranlariCiz() {
    kutuGozlemci.disconnect(); 
    const kapsayici = document.getElementById('cihazlar-kapsayici'); let html = "";
    silolar.forEach((s, i) => { html += olusturHTML(s, "silo", i, "🛢️"); });
    firinlar.forEach((f, i) => { html += olusturHTML(f, "firin", i, "🔥"); });
    makinalar.forEach((m, i) => { html += olusturHTML(m, "makina", i, "⚙️"); });
    kapsayici.innerHTML = html;
    
    document.querySelectorAll('.kutu').forEach(k => kutuGozlemci.observe(k));
    svgKablolariHazirla(); 
}

function olusturHTML(veri, tip, index, ikon) {
    let nodeSol = (tip === "firin" || tip === "makina") ? `<div class="node-in"></div>` : "";
    let nodeSag = ""; 
    if (tip === "silo") { nodeSag = `<div class="silo-ana-node">🔗</div><div class="silo-yaprak-menu"><div class="node-out node-ch1" data-kanal="0"></div><div class="node-out node-ch2" data-kanal="1"></div><div class="node-out node-ch3" data-kanal="2"></div><div class="node-out node-ch4" data-kanal="3"></div></div>`; } 
    else if (tip === "firin") { nodeSag = `<div class="node-out tekli" data-kanal="0"></div>`; } 
    
    let durumClass = veri.aktif ? `kutu-${tip}-aktif` : `kutu-${tip}-kapali`;
    let gizliDetayHtml = hoverOzetUret(veri, tip); 

    let anaKutuHtml = `<div class="kutu ${durumClass}" id="${veri.id_str}" data-tip="${tip}" data-index="${index}" style="left: ${veri.x}px; top: ${veri.y}px;">
                <div class="ayar-btn" title="Ayarlar">⚙️</div>
                ${durumLambalariniUret(veri, tip)}
                ${nodeSol} ${nodeSag}
                <div class="kutu-ikon">${ikon}</div>
                <div class="kutu-baslik">${veri.isim}</div>
                <div class="kutu-gizli-detay">
                    <div class="kutu-bilgi">${gizliDetayHtml}</div>
                    <div class="guc-dugmeleri"><button class="btn-toggle ${veri.aktif ? 'btn-on' : 'btn-off'}">${veri.aktif ? 'AÇIK' : 'KAPALI'}</button></div>
                </div>
            </div>`;

    let konteynerHtml = "";
    if (tip === "firin" && veri.ekTip && veri.ekTip !== "yok") {
        veri.ekX = veri.ekX || (veri.x - 90); veri.ekY = veri.ekY || (veri.y + 40); let renk = veri.ekTip === "merkez" ? "#1b1464" : "#00a8ff";
        konteynerHtml += `<div class="kutu seyyar-konteyner" id="kont_${veri.id_str}_0" data-tip="konteyner" data-parent="${veri.id_str}" data-parenttip="${tip}" data-ekindex="0" style="left: ${veri.ekX}px; top: ${veri.ekY}px; border-color:${renk};"><div class="node-out tekli" style="background:${renk}; right:-12px; width:20px; height:20px; margin-top:-10px;"></div>🛢️<br><b>${veri.ekTip==="merkez"?"Merkez":"Lokal"}</b><br><span style="font-size:8px;">${veri.ekVeri}</span></div>`;
    } else if (tip === "makina" && veri.ekler) {
        veri.ekler.forEach((ek, i) => {
            if (ek.tip && ek.tip !== "yok") {
                ek.x = ek.x || (veri.x - 90); ek.y = ek.y || (veri.y + 10 + (i * 65)); let renk = ek.tip === "merkez" ? "#1b1464" : "#00a8ff";
                konteynerHtml += `<div class="kutu seyyar-konteyner" id="kont_${veri.id_str}_${i}" data-tip="konteyner" data-parent="${veri.id_str}" data-parenttip="${tip}" data-ekindex="${i}" style="left: ${ek.x}px; top: ${ek.y}px; border-color:${renk};"><div class="node-out tekli" style="background:${renk}; right:-12px; width:20px; height:20px; margin-top:-10px;"></div>🛢️<br><b>${ek.tip==="merkez"?"Merkez":"Varil"}</b><br><span style="font-size:8px;">${ek.veri}</span></div>`;
            }
        });
    }
    return anaKutuHtml + konteynerHtml;
}

// --- 4. PAN/ZOOM VE KAMERA (YENİLİK: ZOOM ESNASINDA ÇİZGİLER GİZLENİR!) ---
document.getElementById('panel-baslik').onclick = function() { document.getElementById('kontrol-paneli').classList.toggle('acik'); };
const sahne = document.getElementById('sahne');
let scale = 1; let panX = 0; let panY = 0;

// Çizgilerin şeffaflık (görünmezlik) animasyonu için CSS takviyesi (JS ile atandı)
const svgAlan = document.getElementById('cizim-alani');
svgAlan.style.transition = "opacity 0.2s ease";

document.getElementById('btn-zoom-in').onclick = () => { 
    svgAlan.style.opacity = "0"; // GİZLE
    scale = Math.min(scale * 1.5, 3); guncelleSahne(); 
    setTimeout(() => { statikSVGZorlaCiz(); svgAlan.style.opacity = "1"; }, 250); // ÇİZ VE GÖSTER
};
document.getElementById('btn-zoom-out').onclick = () => { 
    svgAlan.style.opacity = "0"; // GİZLE
    scale = Math.max(scale * 0.4, 0.2); guncelleSahne(); 
    setTimeout(() => { statikSVGZorlaCiz(); svgAlan.style.opacity = "1"; }, 250); // ÇİZ VE GÖSTER
};
function guncelleSahne() { sahne.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`; document.getElementById('zoom-seviyesi').innerText = Math.round(scale * 100) + '%'; }

function cihazaGit(hedefIdStr) {
    const hedef = document.getElementById(hedefIdStr); if (!hedef) return;
    svgAlan.style.opacity = "0"; // GİZLE
    const w = document.getElementById('fabrika-sahasi').offsetWidth; const h = document.getElementById('fabrika-sahasi').offsetHeight;
    panX = (w / 2) - ((parseInt(hedef.style.left) + 65) * scale); panY = (h / 2) - ((parseInt(hedef.style.top) + 60) * scale);
    guncelleSahne(); 
    setTimeout(() => { statikSVGZorlaCiz(); svgAlan.style.opacity = "1"; }, 250); // ÇİZ VE GÖSTER
    hedef.classList.add('dokunuldu'); setTimeout(()=>hedef.classList.remove('dokunuldu'), 3000);
}

// --- 5. TIKLAMA, SÜRÜKLEME VE PINCH-TO-ZOOM MOTORU ---
let isPanning = false; let baslangicPanX = 0; let baslangicPanY = 0;
let suruklenenKutu = null; let offset = { x: 0, y: 0 }; 
let bekleyenCikisNoktasi = null; let startX = 0, startY = 0; let suruklemeYapildi = false; 

let isPinching = false; let initialPinchDistance = null; let initialScale = 1;
let svgAnimasyonFrame = null; let motorCalisiyor = false;

function motoruUyandir() { if (!motorCalisiyor) { motorCalisiyor = true; svgDinamikTakip(); } }
function motoruUyut() { if (motorCalisiyor) { cancelAnimationFrame(svgAnimasyonFrame); motorCalisiyor = false; statikSVGZorlaCiz(); } }
let geciciUyanmaTimer = null;
function motoruGeciciUyandir(sure = 400) { motoruUyandir(); if(geciciUyanmaTimer) clearTimeout(geciciUyanmaTimer); geciciUyanmaTimer = setTimeout(() => { if (!suruklenenKutu && !isPinching) motoruUyut(); }, sure); }

let auditBekleyenSiloId = null;
function tetikleAudit(siloId) {
    let s = silolar.find(x => x.id_str === siloId); if (!s || s.materyal === "") return;
    auditBekleyenSiloId = siloId;
    document.getElementById('audit-mesaj').innerHTML = `<span style="font-size:12px;">Güvenlik Kontrolü:</span><br><b>${s.isim}</b> içindeki malzeme hala<br><span style="color:#f1c40f">${s.kod} - ${s.materyal}</span> mi?`;
    document.getElementById('audit-toast').style.display = 'flex';
}
document.getElementById('btn-audit-evet').onclick = () => { document.getElementById('audit-toast').style.display = 'none'; };
document.getElementById('btn-audit-hayir').onclick = () => { document.getElementById('audit-toast').style.display = 'none'; let sKutu = document.getElementById(auditBekleyenSiloId); if(sKutu) { sKutu.querySelector('.ayar-btn').click(); } };

function baglantiEkle(kaynakKutu, kanalIndex, hedefIdStr) {
    const tip = kaynakKutu.dataset.tip; const idx = parseInt(kaynakKutu.dataset.index);
    if (hedefIdStr.startsWith('firin')) { silolar.forEach(s => { s.kanallar.forEach((k, kIdx) => { if (bagVarMi(k, hedefIdStr)) { let arr = k.split(',').map(x=>x.trim()).filter(x => x !== hedefIdStr); s.kanallar[kIdx] = arr.length > 0 ? arr.join(', ') : "Boş"; } }); }); }
    if (tip === "silo") {
        let m = silolar[idx].kanallar[kanalIndex]; silolar[idx].kanallar[kanalIndex] = (m === "Boş" || m === "") ? hedefIdStr : (!bagVarMi(m, hedefIdStr) ? m + `, ${hedefIdStr}` : m);
        if (Math.random() < 0.25) tetikleAudit(silolar[idx].id_str);
    } else if (tip === "firin") {
        let m = firinlar[idx].hedef; firinlar[idx].hedef = (m === "Boş" || m === "") ? hedefIdStr : (!bagVarMi(m, hedefIdStr) ? m + `, ${hedefIdStr}` : m);
    }
    verileriKaydet();
}

function getPinchDistance(touches) { return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY); }

function handleStart(e) {
    if (e.target.closest('#kontrol-paneli') || e.target.closest('.yan-panel') || e.target.closest('.audit-toast')) return;
    
    // YENİ V4.4: Pinch (Zoom) başlarken Çizgileri GİZLE! Hesaplama YAPMA!
    if (e.touches && e.touches.length === 2) {
        isPinching = true; isPanning = false; suruklenenKutu = null;
        initialPinchDistance = getPinchDistance(e.touches);
        initialScale = scale;
        svgAlan.style.opacity = "0"; // GİZLE
        return;
    }

    const t = e.target;
    if (t.classList.contains('node-out')) {
        e.preventDefault();
        if (bekleyenCikisNoktasi === t) { bekleyenCikisNoktasi.classList.remove('node-secili'); bekleyenCikisNoktasi = null; return; }
        if (bekleyenCikisNoktasi) bekleyenCikisNoktasi.classList.remove('node-secili');
        bekleyenCikisNoktasi = t; bekleyenCikisNoktasi.classList.add('node-secili'); return;
    }
    if (t.classList.contains('node-in') && bekleyenCikisNoktasi) {
        let kaynakKutu = bekleyenCikisNoktasi.closest('.kutu'); let kanalIndex = bekleyenCikisNoktasi.dataset.kanal || 0; let hedefKutu = t.closest('.kutu');
        if (kaynakKutu.id !== hedefKutu.id) { baglantiEkle(kaynakKutu, kanalIndex, hedefKutu.id); }
        bekleyenCikisNoktasi.classList.remove('node-secili'); bekleyenCikisNoktasi = null; ekranlariCiz(); return;
    }

    const pos = e.touches ? {x: e.touches[0].clientX, y: e.touches[0].clientY} : {x: e.clientX, y: e.clientY};
    startX = pos.x; startY = pos.y; suruklemeYapildi = false; 

    const kutu = t.closest('.kutu');
    
    if (e.touches && kutu && !t.matches('button') && !t.classList.contains('ayar-btn') && !t.classList.contains('goto-cihaz')) {
        document.querySelectorAll('.kutu.dokunuldu').forEach(el => { if(el !== kutu) el.classList.remove('dokunuldu') });
        kutu.classList.toggle('dokunuldu'); motoruGeciciUyandir(); 
    }

    if (kutu && !t.matches('button') && !t.classList.contains('ayar-btn') && !t.classList.contains('goto-cihaz') && !t.classList.contains('silo-ana-node') && !konumlarKilitli) {
        suruklenenKutu = kutu; offset.x = (pos.x - kutu.getBoundingClientRect().left) / scale; offset.y = (pos.y - kutu.getBoundingClientRect().top) / scale; kutu.style.zIndex = 1000;
        motoruUyandir(); 
    } else if (!kutu || konumlarKilitli) {
        document.querySelectorAll('.kutu.dokunuldu').forEach(el => el.classList.remove('dokunuldu'));
        document.querySelectorAll('.silo-yaprak-menu.acik').forEach(el => el.classList.remove('acik'));
        isPanning = true; baslangicPanX = pos.x - panX; baslangicPanY = pos.y - panY;
    }
}

function handleMove(e) {
    if (e.cancelable) e.preventDefault(); 

    // YENİ V4.4: Pinch (Zoom) sırasında HİÇBİR çizgi hesabı yapma!
    if (isPinching && e.touches.length === 2) {
        const currentDistance = getPinchDistance(e.touches);
        let newScale = initialScale * (currentDistance / initialPinchDistance);
        scale = Math.min(Math.max(newScale, 0.2), 3);
        guncelleSahne(); // Sadece fiziksel ekranı CSS ile büyütür. (Sıfır CPU Yükü)
        return;
    }

    if(!isPanning && !suruklenenKutu) return;
    const pos = e.touches ? {x: e.touches[0].clientX, y: e.touches[0].clientY} : {x: e.clientX, y: e.clientY};
    if (Math.abs(pos.x - startX) > 5 || Math.abs(pos.y - startY) > 5) suruklemeYapildi = true; 
    if (!suruklemeYapildi) return;
    
    if (isPanning) {
        panX = pos.x - baslangicPanX; panY = pos.y - baslangicPanY;
        sahne.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    } else if (suruklenenKutu && !konumlarKilitli) {
        let rect = sahne.getBoundingClientRect();
        suruklenenKutu.style.left = ((pos.x - rect.left) / scale - offset.x) + 'px';
        suruklenenKutu.style.top = ((pos.y - rect.top) / scale - offset.y) + 'px';
    }
}

function handleEnd(e) {
    // YENİ V4.4: Pinch bittiğinde 1 KEZ hesapla ve çizgileri GÖSTER!
    if (e.touches && e.touches.length < 2) {
        if(isPinching) { 
            isPinching = false; 
            statikSVGZorlaCiz(); // Sadece 1 kez kusursuz hesabı yap
            svgAlan.style.opacity = "1"; // Gizli çizgileri görünür yap
        }
    }
    isPanning = false;
    
    if (suruklenenKutu && !konumlarKilitli) {
        suruklenenKutu.style.zIndex = "";
        const yX = parseInt(suruklenenKutu.style.left); const yY = parseInt(suruklenenKutu.style.top);
        if (suruklenenKutu.dataset.tip === "konteyner") {
            const pId = suruklenenKutu.dataset.parent; const pTip = suruklenenKutu.dataset.parenttip; const ekIdx = parseInt(suruklenenKutu.dataset.ekindex) || 0;
            if (pTip === "firin") { let f = firinlar.find(x => x.id_str === pId); if(f) { f.ekX = yX; f.ekY = yY; } } 
            else { let m = makinalar.find(x => x.id_str === pId); if(m && m.ekler) { m.ekler[ekIdx].x = yX; m.ekler[ekIdx].y = yY; } }
        } else {
            const idx = parseInt(suruklenenKutu.dataset.index);
            if (suruklenenKutu.dataset.tip === "silo") { silolar[idx].x = yX; silolar[idx].y = yY; } 
            else if (suruklenenKutu.dataset.tip === "firin") { firinlar[idx].x = yX; firinlar[idx].y = yY; } 
            else { makinalar[idx].x = yX; makinalar[idx].y = yY; }
        }
        verileriKaydet(); suruklenenKutu = null; motoruUyut();
    }
    setTimeout(() => { suruklemeYapildi = false; }, 50);
}

document.addEventListener('mousedown', handleStart, {passive: false}); document.addEventListener('mousemove', handleMove, {passive: false}); document.addEventListener('mouseup', handleEnd);
document.addEventListener('touchstart', handleStart, {passive: false}); document.addEventListener('touchmove', handleMove, {passive: false}); document.addEventListener('touchend', handleEnd);


// --- 6. SVG ÇİZİM MOTORU ---
const kanalRenkleri = ["#f1c40f", "#3498db", "#e74c3c", "#bdc3c7"]; 
let aktifSvgKablolar = []; 

function svgKablolariHazirla() {
    svgAlan.innerHTML = ""; aktifSvgKablolar = [];
    
    function kabloEkle(kaynakNode, hedefNode, renk, aktif, isKonteyner, kaynakIdStr) {
        if (!kaynakNode || !hedefNode) return;
        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("class", aktif ? "svg-kablo svg-kablo-aktif" : "svg-kablo svg-kablo-pasif");
        if (aktif) path.style.stroke = renk; 
        svgAlan.appendChild(path);
        aktifSvgKablolar.push({ path: path, kNode: kaynakNode, gNode: hedefNode, kId: kaynakIdStr, isKont: isKonteyner });
    }

    silolar.forEach(s => { s.kanallar.forEach((kanal, kIdx) => { if (kanal && kanal !== "Boş") { kanal.split(',').forEach(hId => { let hEl = document.getElementById(hId.trim()); 
        if (hEl) {
            let hedefAktif = (hEl.dataset.tip === "firin") ? firinlar[parseInt(hEl.dataset.index)].aktif : makinalar[parseInt(hEl.dataset.index)].aktif;
            kabloEkle(document.getElementById(s.id_str).querySelector(`.node-out[data-kanal="${kIdx}"]`), hEl.querySelector('.node-in'), kanalRenkleri[kIdx], (s.aktif && hedefAktif), false, s.id_str); 
        }
    }); } }); });
    firinlar.forEach(f => { 
        if (f.hedef && f.hedef !== "Boş") f.hedef.split(',').forEach(hId => { let hEl = document.getElementById(hId.trim()); 
            if (hEl) {
                let hedefAktif = makinalar[parseInt(hEl.dataset.index)].aktif;
                kabloEkle(document.getElementById(f.id_str).querySelector('.node-out'), hEl.querySelector('.node-in'), "#e67e22", (f.aktif && hedefAktif), false, f.id_str); 
            }
        }); 
        if (f.ekTip && f.ekTip !== "yok") { let kEl = document.getElementById(`kont_${f.id_str}_0`); if(kEl) kabloEkle(kEl.querySelector('.node-out'), document.getElementById(f.id_str).querySelector('.node-in'), f.ekTip==="merkez"?"#1b1464":"#00a8ff", f.aktif, true, `kont_${f.id_str}_0`); }
    });
    makinalar.forEach(m => {
        if (m.ekler) { m.ekler.forEach((ek, i) => { if (ek.tip && ek.tip !== "yok") { let kEl = document.getElementById(`kont_${m.id_str}_${i}`); if(kEl) kabloEkle(kEl.querySelector('.node-out'), document.getElementById(m.id_str).querySelector('.node-in'), ek.tip==="merkez"?"#1b1464":"#00a8ff", m.aktif, true, `kont_${m.id_str}_${i}`); } }); }
    });
    
    statikSVGZorlaCiz(); 
}

function statikSVGZorlaCiz() {
    const rS = sahne.getBoundingClientRect();
    aktifSvgKablolar.forEach(bag => {
        let nK = bag.kNode;
        if (!bag.isKont && bag.kId.startsWith('silo')) {
            let menu = nK.closest('.silo-yaprak-menu');
            if (menu && !menu.classList.contains('acik')) { nK = document.getElementById(bag.kId).querySelector('.silo-ana-node'); }
        }
        if(!nK || !bag.gNode) return;
        
        const rC = nK.getBoundingClientRect(); const rG = bag.gNode.getBoundingClientRect();
        
        const sX = (rC.left - rS.left + rC.width / 2) / scale; 
        const sY = (rC.top - rS.top + rC.height / 2) / scale;
        
        const eX = (rG.left - rS.left + rG.width / 2) / scale; 
        const eY = (rG.top - rS.top + rG.height / 2) / scale;
        
        const p1X = sX + 40; const p1Y = sY;
        const p2X = eX - 40; const p2Y = eY;

        const pathData = `M ${sX} ${sY} L ${p1X} ${p1Y} C ${(p1X+p2X)/2} ${p1Y}, ${(p1X+p2X)/2} ${p2Y}, ${p2X} ${p2Y} L ${eX} ${eY}`;
        bag.path.setAttribute("d", pathData);
    });
}

function svgDinamikTakip() {
    if(!motorCalisiyor) return;
    statikSVGZorlaCiz();
    svgAnimasyonFrame = requestAnimationFrame(svgDinamikTakip);
}


// --- 7. ÇEKMECE PANELİ ---
window.baglantiSilGlobal = function(kaynakId, hedefId) {
    silolar.forEach((s, idx) => { s.kanallar.forEach((k, kIdx) => { if(bagVarMi(k, hedefId)) { let hList = k.split(',').map(x=>x.trim()).filter(x => x !== hedefId); silolar[idx].kanallar[kIdx] = hList.length > 0 ? hList.join(', ') : "Boş"; } }); });
    firinlar.forEach((f, idx) => { if(bagVarMi(f.hedef, hedefId)) { let hList = f.hedef.split(',').map(x=>x.trim()).filter(x => x !== hedefId); firinlar[idx].hedef = hList.length > 0 ? hList.join(', ') : "Boş"; } });
    verileriKaydet(); ekranlariCiz(); document.getElementById('ayar-paneli').classList.remove('acik');
};

function hedefCheckboxUret(kanalStr, kaynakTip) {
    let secili = kanalStr ? kanalStr.split(',').map(x=>x.trim()) : []; let html = "";
    if (kaynakTip === "silo") { firinlar.forEach(f => { let chk = secili.includes(f.id_str) ? "checked" : ""; html += `<label class="hedef-lbl ${chk?"secili":""}"><input type="checkbox" value="${f.id_str}" ${chk} onchange="this.parentElement.classList.toggle('secili', this.checked)"> ${f.isim} (Fırın)</label>`; }); }
    makinalar.forEach(m => { let chk = secili.includes(m.id_str) ? "checked" : ""; html += `<label class="hedef-lbl ${chk?"secili":""}"><input type="checkbox" value="${m.id_str}" ${chk} onchange="this.parentElement.classList.toggle('secili', this.checked)"> ${m.isim} (Makina)</label>`; });
    return html;
}

document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.classList.contains('goto-cihaz')) { cihazaGit(t.dataset.target); return; }
    if (t.classList.contains('btn-kopar') || t.classList.contains('node-out') || t.classList.contains('node-in') || t.closest('#kontrol-paneli') || t.closest('.audit-toast')) return; 

    if (t.classList.contains('silo-ana-node')) { t.nextElementSibling.classList.toggle('acik'); motoruGeciciUyandir(); return; }

    if (t.id === "btn-recete-yukle") {
        let seciliUrun = document.getElementById('modal-recete-secici').value;
        if(seciliUrun && receteler[seciliUrun]) {
            let r = receteler[seciliUrun]; document.getElementById('modal-input-veri').value = seciliUrun;
            let rEkler = r.ekler || [{tip: r.ekTip || "yok", veri: r.ekVeri || ""}, {tip:"yok", veri:""}, {tip:"yok", veri:""}];
            document.getElementById('modal-ek-tip-1').value = rEkler[0].tip; document.getElementById('modal-ek-malzeme-1').value = rEkler[0].veri;
            document.getElementById('modal-ek-tip-2').value = rEkler[1].tip; document.getElementById('modal-ek-malzeme-2').value = rEkler[1].veri;
            document.getElementById('modal-ek-tip-3').value = rEkler[2].tip; document.getElementById('modal-ek-malzeme-3').value = rEkler[2].veri;
            
            let mId = document.getElementById('modal-kaydet').dataset.hedefid;
            silolar.forEach(s => s.kanallar.forEach((k,i) => { if(bagVarMi(k, mId)) s.kanallar[i] = k.split(',').map(x=>x.trim()).filter(x=>x!==mId).join(', ') || "Boş"; }));
            firinlar.forEach(f => { if(bagVarMi(f.hedef, mId)) f.hedef = f.hedef.split(',').map(x=>x.trim()).filter(x=>x!==mId).join(', ') || "Boş"; });
            
            r.firinlar.forEach(fId => { let f = firinlar.find(x=>x.id_str===fId); if(f) f.hedef = (f.hedef==="Boş"||f.hedef==="") ? mId : f.hedef + ", " + mId; });
            r.silolar.forEach(sId => { let s = silolar.find(x=>x.id_str===sId); if(s) { let ch = s.kanallar.findIndex(x=>x==="Boş"||x===""); if(ch===-1)ch=0; s.kanallar[ch] = (s.kanallar[ch]==="Boş"||s.kanallar[ch]==="")?mId:s.kanallar[ch]+", "+mId; } });
            
            verileriKaydet(); ekranlariCiz(); t.innerText = "✅ Reçete Çekildi!"; setTimeout(() => t.innerText = "🔄 Reçeteyi Haritaya Bağla", 2000);
        }
        return;
    }

    if (t.classList.contains('btn-toggle')) {
        const kutu = t.closest('.kutu'); const tip = kutu.dataset.tip; const idx = parseInt(kutu.dataset.index);
        if (tip === "silo") silolar[idx].aktif = !silolar[idx].aktif;
        if (tip === "firin") firinlar[idx].aktif = !firinlar[idx].aktif;
        if (tip === "makina") makinalar[idx].aktif = !makinalar[idx].aktif;
        verileriKaydet(); ekranlariCiz(); return;
    }

    if (t.classList.contains('ayar-btn') && !suruklemeYapildi) {
        const kutu = t.closest('.kutu'); const tip = kutu.dataset.tip; const seciliIndex = parseInt(kutu.dataset.index);
        
        let gelenler = [];
        silolar.forEach(s => { s.kanallar.forEach(k => { if(bagVarMi(k, kutu.id)) gelenler.push(`<li class="liste-satiri"><b>${s.isim}</b> (${s.kod})<button class="btn-kopar" onclick="baglantiSilGlobal('${s.id_str}', '${kutu.id}')">X Sil</button><br><span style="font-size:11px; color:#e67e22;">${s.materyal}</span></li>`); }); });
        firinlar.forEach(f => { if(bagVarMi(f.hedef, kutu.id)) {
            let sBulundu = ""; silolar.forEach(s => { s.kanallar.forEach(k => { if(bagVarMi(k, f.id_str)) sBulundu = ` (Gelen: ${s.isim})`; }); });
            gelenler.push(`<li class="liste-satiri"><b>${f.isim}</b>${sBulundu}<button class="btn-kopar" onclick="baglantiSilGlobal('${f.id_str}', '${kutu.id}')">X Sil</button><br><span style="font-size:11px; color:#e74c3c;">Isı: ${f.sicaklik}</span></li>`); 
        }});

        if (tip === "makina") {
            let mEkler = makinalar[seciliIndex].ekler;
            mEkler.forEach((ek, i) => { if (ek.tip !== "yok" && ek.veri !== "") { gelenler.push(`<li class="liste-satiri" style="background:#e8f4f8; border-color:#3498db;">➕ <b>Ek Varil ${i+1}</b> (${ek.tip})<br><span style="font-size:11px; color:#2980b9;">${ek.veri}</span></li>`); } });
        } else if (tip === "firin") {
            let fEkTip = firinlar[seciliIndex].ekTip; let fEkVeri = firinlar[seciliIndex].ekVeri;
            if (fEkTip !== "yok" && fEkVeri !== "") { gelenler.push(`<li class="liste-satiri" style="background:#e8f4f8; border-color:#3498db;">➕ <b>Ek Besleme</b> (${fEkTip})<br><span style="font-size:11px; color:#2980b9;">${fEkVeri}</span></li>`); }
        }

        document.getElementById('gelen-listesi').innerHTML = gelenler.join('') || "<li>Henüz giriş yok.</li>";
        document.getElementById('silo-kanallari-inputlari').style.display = "none"; document.getElementById('firin-hedef-inputu').style.display = "none";
        document.getElementById('silo-ozel-bilgiler').style.display = "none"; document.getElementById('ek-besleme-alani').style.display = "none";
        document.getElementById('makina-recete-alani').style.display = "none";
        document.getElementById('modal-kaydet').dataset.hedefid = kutu.id; 

        if (tip === "silo") {
            document.getElementById('modal-baslik').innerText = silolar[seciliIndex].isim + " Ayarları"; document.getElementById('modal-etiket').innerText = "Materyal Açıklaması:"; document.getElementById('modal-input-veri').value = silolar[seciliIndex].materyal;
            document.getElementById('silo-ozel-bilgiler').style.display = "block"; document.getElementById('modal-input-kod').value = silolar[seciliIndex].kod; document.getElementById('modal-input-teknik').value = silolar[seciliIndex].teknik;
            document.getElementById('silo-kanallari-inputlari').style.display = "block";
            for(let i=1; i<=4; i++) document.getElementById(`modal-kanal-${i}`).innerHTML = hedefCheckboxUret(silolar[seciliIndex].kanallar[i-1], "silo");
        } 
        else if (tip === "firin") {
            document.getElementById('modal-baslik').innerText = firinlar[seciliIndex].isim + " Ayarları"; document.getElementById('modal-etiket').innerText = "Fırın Sıcaklığı:"; document.getElementById('modal-input-veri').value = firinlar[seciliIndex].sicaklik;
            document.getElementById('firin-hedef-inputu').style.display = "block"; document.getElementById('modal-firin-hedef').innerHTML = hedefCheckboxUret(firinlar[seciliIndex].hedef, "firin");
            document.getElementById('ek-besleme-alani').style.display = "block"; document.getElementById('ek-slot-2').style.display = "none"; document.getElementById('ek-slot-3').style.display = "none"; 
            document.getElementById('modal-ek-tip-1').value = firinlar[seciliIndex].ekTip; document.getElementById('modal-ek-malzeme-1').value = firinlar[seciliIndex].ekVeri;
        } 
        else {
            document.getElementById('modal-baslik').innerText = makinalar[seciliIndex].isim + " Ayarları"; document.getElementById('modal-etiket').innerText = "Üretilen Ürün / Kalıp:"; document.getElementById('modal-input-veri').value = makinalar[seciliIndex].urun;
            document.getElementById('ek-besleme-alani').style.display = "block"; document.getElementById('ek-slot-2').style.display = "block"; document.getElementById('ek-slot-3').style.display = "block"; 
            
            let mEkler = makinalar[seciliIndex].ekler;
            document.getElementById('modal-ek-tip-1').value = mEkler[0].tip; document.getElementById('modal-ek-malzeme-1').value = mEkler[0].veri;
            document.getElementById('modal-ek-tip-2').value = mEkler[1].tip; document.getElementById('modal-ek-malzeme-2').value = mEkler[1].veri;
            document.getElementById('modal-ek-tip-3').value = mEkler[2].tip; document.getElementById('modal-ek-malzeme-3').value = mEkler[2].veri;
            
            document.getElementById('makina-recete-alani').style.display = "block";
            let rHtml = `<option value="">-- Hafızadaki Reçeteler --</option>`;
            Object.keys(receteler).forEach(k => { rHtml += `<option value="${k}">${k}</option>`; });
            document.getElementById('modal-recete-secici').innerHTML = rHtml;
        }
        
        document.getElementById('ayar-paneli').classList.add('acik'); 
        
        document.getElementById('modal-kaydet').onclick = () => {
            const veri = document.getElementById('modal-input-veri').value;
            if (tip === "silo") {
                silolar[seciliIndex].materyal = veri; silolar[seciliIndex].kod = document.getElementById('modal-input-kod').value; silolar[seciliIndex].teknik = document.getElementById('modal-input-teknik').value;
                for(let i=1; i<=4; i++) { let secili = []; document.querySelectorAll(`#modal-kanal-${i} input:checked`).forEach(el => secili.push(el.value)); silolar[seciliIndex].kanallar[i-1] = secili.length > 0 ? secili.join(', ') : "Boş"; }
            } else if (tip === "firin") {
                firinlar[seciliIndex].sicaklik = veri; let secili = []; document.querySelectorAll(`#modal-firin-hedef input:checked`).forEach(el => secili.push(el.value)); firinlar[seciliIndex].hedef = secili.length > 0 ? secili.join(', ') : "Boş";
                firinlar[seciliIndex].ekTip = document.getElementById('modal-ek-tip-1').value; firinlar[seciliIndex].ekVeri = document.getElementById('modal-ek-malzeme-1').value;
            } else { 
                makinalar[seciliIndex].urun = veri; 
                makinalar[seciliIndex].ekler[0].tip = document.getElementById('modal-ek-tip-1').value; makinalar[seciliIndex].ekler[0].veri = document.getElementById('modal-ek-malzeme-1').value;
                makinalar[seciliIndex].ekler[1].tip = document.getElementById('modal-ek-tip-2').value; makinalar[seciliIndex].ekler[1].veri = document.getElementById('modal-ek-malzeme-2').value;
                makinalar[seciliIndex].ekler[2].tip = document.getElementById('modal-ek-tip-3').value; makinalar[seciliIndex].ekler[2].veri = document.getElementById('modal-ek-malzeme-3').value;
                if (veri && veri.trim() !== "" && veri !== "Belirlenmedi") {
                    let mId = makinalar[seciliIndex].id_str; let bgFirinlar = firinlar.filter(f => bagVarMi(f.hedef, mId)).map(f => f.id_str); let bgSilolar = silolar.filter(s => s.kanallar.some(k => bagVarMi(k, mId))).map(s => s.id_str);
                    receteler[veri] = { firinlar: bgFirinlar, silolar: bgSilolar, ekler: JSON.parse(JSON.stringify(makinalar[seciliIndex].ekler)) };
                }
            }
            verileriKaydet(); document.getElementById('ayar-paneli').classList.remove('acik'); ekranlariCiz();
        };
    }

    if (t.id === "modal-kapat" || t.id === "modal-kapat-alt") { document.getElementById('ayar-paneli').classList.remove('acik'); }
});

document.addEventListener("DOMContentLoaded", () => { 
    ekranlariCiz(); 
    const btnKilitle = document.getElementById('btn-kilitle');
    btnKilitle.className = "kilit-kapali"; btnKilitle.innerText = "🔒 Konumlar Kilitli"; 
    btnKilitle.onclick = function() {
        konumlarKilitli = !konumlarKilitli;
        if (konumlarKilitli) { this.className = "kilit-kapali"; this.innerText = "🔒 Konumlar Kilitli"; } 
        else { this.className = "kilit-acik"; this.innerText = "🔓 Konumlar Serbest"; }
    };
});
