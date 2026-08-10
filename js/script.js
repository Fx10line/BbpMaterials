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

let silolar = []; 
let kaydedilmisSilolar = localStorage.getItem('bbp_silolar');
if (kaydedilmisSilolar) { silolar = JSON.parse(kaydedilmisSilolar).map(s => ({ kanallar: ["Boş","Boş","Boş","Boş"], ...s })); } 
else { siloHamVeri.forEach((s, i) => { silolar.push({ id_str: `silo_${i+1}`, isim: s.isim, materyal: s.materyal, kod: s.kod, teknik: "", aktif: true, kanallar: ["Boş", "Boş", "Boş", "Boş"], x: 100, y: i * 200 + 100 }); }); }

let firinlar = [];
let kaydedilmisFirinlar = localStorage.getItem('bbp_firinlar');
if (kaydedilmisFirinlar) { firinlar = JSON.parse(kaydedilmisFirinlar).map(f => ({ ekTip: "yok", ekVeri: "", ...f })); } 
else { for (let i = 1; i <= 16; i++) { firinlar.push({ id_str: `firin_${i}`, isim: `Fırın ${i}`, sicaklik: "80°C", aktif: true, hedef: "Boş", ekTip: "yok", ekVeri: "", x: 600, y: (i-1) * 200 + 100 }); } }

const makinaIsimleri = ["400-2", "400-3", "500-9", "600-4", "600-7", "650-2", "650-8", "800-1", "800-4", "850-2", "850-3", "850-4", "900-1", "1000-3", "1000-4", "1100-1", "1450-1", "1600-3", "1700-2", "1700-3"];
let makinalar = [];
let kaydedilmisMakinalar = localStorage.getItem('bbp_makinalar');
if (kaydedilmisMakinalar) { makinalar = JSON.parse(kaydedilmisMakinalar).map(m => ({ ekTip: "yok", ekVeri: "", ...m })); } 
else { makinaIsimleri.forEach((isim, index) => { makinalar.push({ id_str: `makina_${index + 1}`, isim: `Makina ${isim}`, urun: "Belirlenmedi", aktif: true, umbau: false, ekTip: "yok", ekVeri: "", x: 1100, y: index * 200 + 100 }); }); }

function verileriKaydet() {
    localStorage.setItem('bbp_silolar', JSON.stringify(silolar));
    localStorage.setItem('bbp_firinlar', JSON.stringify(firinlar));
    localStorage.setItem('bbp_makinalar', JSON.stringify(makinalar));
}

let konumlarKilitli = false;

// --- 2. ZİNCİR VE LED MOTORU ---
function getCihazIsim(idStr) {
    let s = silolar.find(x => x.id_str === idStr); if (s) return s.isim;
    let f = firinlar.find(x => x.id_str === idStr); if (f) return f.isim;
    let m = makinalar.find(x => x.id_str === idStr); if (m) return m.isim;
    return null;
}

function baglantiOzetiniOlustur(veri, tip) {
    let html = "";
    if (tip === "silo") {
        let out = [];
        veri.kanallar.forEach(k => { if (k && k !== "Boş") k.split(',').forEach(h => { let isim = getCihazIsim(h.trim()); if(isim) out.push(`<span class="goto-cihaz" data-target="${h.trim()}">${isim}</span>`); }); });
        html = out.length > 0 ? `📤 Giden: ${[...new Set(out)].join(', ')}` : `<span style='color:#7f8c8d'>📤 Bağlantı Yok</span>`;
    } 
    else if (tip === "firin" || tip === "makina") {
        let inc = [];
        if (tip === "makina") {
            firinlar.forEach(f => {
                if (f.hedef && f.hedef.includes(veri.id_str)) {
                    let siloBulundu = false;
                    silolar.forEach(s => { s.kanallar.forEach(k => { if (k && k.includes(f.id_str)) { siloBulundu = true; inc.push(`📥 <span class="goto-cihaz" data-target="${s.id_str}">${s.isim}</span> ➔ <span class="goto-cihaz" data-target="${f.id_str}">${f.isim}</span> ➔ <br><span style="color:#2c3e50;"><b>${s.kod}</b> ${s.materyal}</span>`); } }) });
                    if (!siloBulundu) inc.push(`📥 <span style="color:#e74c3c">? (Silo Yok)</span> ➔ <span class="goto-cihaz" data-target="${f.id_str}">${f.isim}</span>`);
                }
            });
        }
        silolar.forEach(s => { s.kanallar.forEach(k => { if (k && k.split(',').map(x=>x.trim()).includes(veri.id_str)) { inc.push(`📥 <span class="goto-cihaz" data-target="${s.id_str}">${s.isim}</span> ➔ <br><span style="color:#2c3e50;"><b>${s.kod}</b> ${s.materyal}</span>`); } }) });
        if (veri.ekTip !== "yok" && veri.ekVeri !== "") { inc.push(`➕ Ek: <span style="color:#2980b9;">${veri.ekVeri}</span>`); }
        
        inc = [...new Set(inc)];
        html = inc.length > 0 ? `${inc.join('<hr style="margin:4px 0; border-top:1px solid rgba(0,0,0,0.1);">')}` : `<span style='color:#7f8c8d'>📥 Giriş Yok</span>`;
        
        if (tip === "firin") {
            let out = [];
            if (veri.hedef && veri.hedef !== "Boş") veri.hedef.split(',').forEach(h => { let isim = getCihazIsim(h.trim()); if(isim) out.push(`<span class="goto-cihaz" data-target="${h.trim()}">${isim}</span>`); });
            html += `<hr style="margin:4px 0; border-top:1px solid rgba(0,0,0,0.1);">${out.length > 0 ? `📤 Giden: ${out.join(', ')}` : `<span style='color:#7f8c8d'>📤 Çıkış Yok</span>`}`;
        }
    }
    return `<div style="margin-top:5px; padding-top:5px; border-top:1px dashed rgba(0,0,0,0.2); color:#2c3e50; line-height:1.4; font-size:10px;">${html}</div>`;
}

function durumLambalariniUret(veri, tip) {
    if (tip === "silo") return "";
    let ledHtml = ""; let isSilo = false; let isFirin = false;
    
    if (tip === "firin") { silolar.forEach(s => { s.kanallar.forEach(k => { if(k && k.includes(veri.id_str)) isSilo = true; }); }); } 
    else if (tip === "makina") {
        firinlar.forEach(f => { if (f.hedef && f.hedef.includes(veri.id_str)) { isFirin = true; silolar.forEach(s => { s.kanallar.forEach(k => { if(k && k.includes(f.id_str)) isSilo = true; }); }); } });
        silolar.forEach(s => { s.kanallar.forEach(k => { if(k && k.includes(veri.id_str)) isSilo = true; }); });
    }

    if (isSilo) ledHtml += `<div class="led led-silo" title="Silo Bağlı"></div>`;
    if (isFirin) ledHtml += `<div class="led led-firin" title="Fırın Bağlı"></div>`;
    if (veri.ekTip === "merkez") ledHtml += `<div class="led led-ek-merkez" title="Merkezî Ek Besleme"></div>`;
    if (veri.ekTip === "lokal") ledHtml += `<div class="led led-ek-lokal" title="Lokal Ek Besleme"></div>`;

    return `<div class="durum-paneli">${ledHtml}</div>`;
}

// --- 3. HTML OLUŞTURMA VE YAPRAK MENÜ ---
function ekranlariCiz() {
    const kapsayici = document.getElementById('cihazlar-kapsayici'); let html = "";
    silolar.forEach((s, i) => { html += olusturHTML(s, "silo", i, "🛢️"); });
    firinlar.forEach((f, i) => { html += olusturHTML(f, "firin", i, "🔥"); });
    makinalar.forEach((m, i) => { html += olusturHTML(m, "makina", i, "⚙️"); });
    kapsayici.innerHTML = html;
}

function olusturHTML(veri, tip, index, ikon) {
    let nodeSol = (tip === "firin" || tip === "makina") ? `<div class="node-in"></div>` : "";
    let nodeSag = "";
    let detayGizli = ""; let bilgiOzeti = "";

    if (tip === "silo") { 
        // YENİ: YAPRAK MENÜ (Ana Buton + Açılır Dallar)
        nodeSag = `<div class="silo-ana-node">🔗</div>
                   <div class="silo-yaprak-menu">
                       <div class="node-out node-ch1" data-kanal="0" title="Kanal 1"></div>
                       <div class="node-out node-ch2" data-kanal="1" title="Kanal 2"></div>
                       <div class="node-out node-ch3" data-kanal="2" title="Kanal 3"></div>
                       <div class="node-out node-ch4" data-kanal="3" title="Kanal 4"></div>
                   </div>`;
        detayGizli = `<div class="kutu-detay-gizli"><b>${veri.kod}</b><br><span style="font-size:10px;">${veri.materyal}</span></div>`;
    } else if (tip === "firin") { 
        nodeSag = `<div class="node-out tekli" data-kanal="0"></div>`; 
        bilgiOzeti = `Isı: ${veri.sicaklik}`;
    } else {
        bilgiOzeti = `Ürün: ${veri.urun}`;
    }
    
    let durumClass = veri.aktif ? "kutu-aktif" : "kutu-kapali";
    bilgiOzeti += baglantiOzetiniOlustur(veri, tip); 

    return `<div class="kutu ${durumClass}" id="${veri.id_str}" data-tip="${tip}" data-index="${index}" style="left: ${veri.x}px; top: ${veri.y}px;">
                ${durumLambalariniUret(veri, tip)}
                ${nodeSol} ${nodeSag}
                <div class="kutu-ikon">${ikon}</div>
                <div class="kutu-baslik">${veri.isim}</div>
                <div class="kutu-bilgi">${detayGizli}${bilgiOzeti}</div>
                <div class="guc-dugmeleri"><button class="btn-toggle ${veri.aktif ? 'btn-on' : 'btn-off'}">${veri.aktif ? 'AÇIK' : 'KAPALI'}</button></div>
            </div>`;
}

// --- 4. PAN/ZOOM VE KAMERA ---
document.getElementById('panel-baslik').onclick = function() { document.getElementById('kontrol-paneli').classList.toggle('acik'); };
const sahne = document.getElementById('sahne');
let scale = 1; let panX = 0; let panY = 0;
document.getElementById('btn-zoom-in').onclick = () => { scale = Math.min(scale * 1.5, 3); guncelleSahne(); };
document.getElementById('btn-zoom-out').onclick = () => { scale = Math.max(scale * 0.4, 0.2); guncelleSahne(); };
function guncelleSahne() { sahne.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`; document.getElementById('zoom-seviyesi').innerText = Math.round(scale * 100) + '%'; }

function cihazaGit(hedefIdStr) {
    const hedef = document.getElementById(hedefIdStr); if (!hedef) return;
    const w = document.getElementById('fabrika-sahasi').offsetWidth; const h = document.getElementById('fabrika-sahasi').offsetHeight;
    panX = (w / 2) - ((parseInt(hedef.style.left) + 90) * scale); panY = (h / 2) - ((parseInt(hedef.style.top) + 120) * scale);
    guncelleSahne(); hedef.classList.remove('highlight'); void hedef.offsetWidth; hedef.classList.add('highlight');
}


// --- 5. TIKLA-TIKLA BAĞLANTI (KOPMAYAN PAN) ---
let isPanning = false; let baslangicPanX = 0; let baslangicPanY = 0;
let suruklenenKutu = null; let offset = { x: 0, y: 0 }; 
let bekleyenCikisNoktasi = null;
let startX = 0, startY = 0; let suruklemeYapildi = false; 

function baglantiEkle(kaynakKutu, kanalIndex, hedefIdStr) {
    const tip = kaynakKutu.dataset.tip; const idx = parseInt(kaynakKutu.dataset.index);
    if (tip === "silo") {
        let m = silolar[idx].kanallar[kanalIndex];
        silolar[idx].kanallar[kanalIndex] = (m === "Boş" || m === "") ? hedefIdStr : (!m.includes(hedefIdStr) ? m + `, ${hedefIdStr}` : m);
    } else if (tip === "firin") {
        let m = firinlar[idx].hedef;
        firinlar[idx].hedef = (m === "Boş" || m === "") ? hedefIdStr : (!m.includes(hedefIdStr) ? m + `, ${hedefIdStr}` : m);
    }
    verileriKaydet();
}

function handleStart(e) {
    if (e.target.closest('#kontrol-paneli') || e.target.closest('.modal')) return;
    const t = e.target;
    
    // YENİ: Sadece Çıkışa Dokunulduğunda İptal/Seçim Yap
    if (t.classList.contains('node-out')) {
        e.preventDefault();
        if (bekleyenCikisNoktasi === t) { // Aynı noktaya tekrar tıklanırsa İPTAL ET
            bekleyenCikisNoktasi.classList.remove('node-secili'); bekleyenCikisNoktasi = null; return;
        }
        if (bekleyenCikisNoktasi) bekleyenCikisNoktasi.classList.remove('node-secili');
        bekleyenCikisNoktasi = t; bekleyenCikisNoktasi.classList.add('node-secili'); return;
    }
    
    // YENİ: Hedefe Bağlama İşlemi
    if (t.classList.contains('node-in') && bekleyenCikisNoktasi) {
        let kaynakKutu = bekleyenCikisNoktasi.closest('.kutu'); let kanalIndex = bekleyenCikisNoktasi.dataset.kanal || 0; let hedefKutu = t.closest('.kutu');
        if (kaynakKutu.id !== hedefKutu.id) { baglantiEkle(kaynakKutu, kanalIndex, hedefKutu.id); }
        bekleyenCikisNoktasi.classList.remove('node-secili'); bekleyenCikisNoktasi = null; ekranlariCiz(); return;
    }

    const pos = e.touches ? {x: e.touches[0].clientX, y: e.touches[0].clientY} : {x: e.clientX, y: e.clientY};
    startX = pos.x; startY = pos.y; suruklemeYapildi = false; 

    const kutu = t.closest('.kutu');
    
    if (kutu && !t.matches('button') && !t.classList.contains('goto-cihaz') && !t.classList.contains('silo-ana-node') && !konumlarKilitli) {
        suruklenenKutu = kutu; 
        offset.x = (pos.x - kutu.getBoundingClientRect().left) / scale; 
        offset.y = (pos.y - kutu.getBoundingClientRect().top) / scale;
        kutu.style.zIndex = 1000;
    } else {
        isPanning = true; baslangicPanX = pos.x - panX; baslangicPanY = pos.y - panY;
    }
}

function handleMove(e) {
    if(!isPanning && !suruklenenKutu) return;
    if (e.cancelable) e.preventDefault(); 
    
    const pos = e.touches ? {x: e.touches[0].clientX, y: e.touches[0].clientY} : {x: e.clientX, y: e.clientY};
    if (Math.abs(pos.x - startX) > 5 || Math.abs(pos.y - startY) > 5) suruklemeYapildi = true; 
    
    if (!suruklemeYapildi) return;
    
    if (isPanning) {
        panX = pos.x - baslangicPanX; panY = pos.y - baslangicPanY;
        sahne.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    } else if (suruklenenKutu) {
        let rect = sahne.getBoundingClientRect();
        suruklenenKutu.style.left = ((pos.x - rect.left) / scale - offset.x) + 'px';
        suruklenenKutu.style.top = ((pos.y - rect.top) / scale - offset.y) + 'px';
    }
}

function handleEnd(e) {
    isPanning = false;
    if (suruklenenKutu) {
        suruklenenKutu.style.zIndex = "";
        const idx = parseInt(suruklenenKutu.dataset.index);
        const yX = parseInt(suruklenenKutu.style.left); const yY = parseInt(suruklenenKutu.style.top);
        if (suruklenenKutu.dataset.tip === "silo") { silolar[idx].x = yX; silolar[idx].y = yY; } 
        else if (suruklenenKutu.dataset.tip === "firin") { firinlar[idx].x = yX; firinlar[idx].y = yY; } 
        else { makinalar[idx].x = yX; makinalar[idx].y = yY; }
        verileriKaydet(); suruklenenKutu = null; 
    }
    setTimeout(() => { suruklemeYapildi = false; }, 50);
}

document.addEventListener('mousedown', handleStart, {passive: false});
document.addEventListener('mousemove', handleMove, {passive: false});
document.addEventListener('mouseup', handleEnd);
document.addEventListener('touchstart', handleStart, {passive: false});
document.addEventListener('touchmove', handleMove, {passive: false});
document.addEventListener('touchend', handleEnd);


// --- 6. CANVAS ÇİZİMİ (Yaprak Menü Kapalıysa Ana Çizgiden Çek) ---
const canvas = document.getElementById('cizim-alani'); const ctx = canvas.getContext('2d'); let dashOffset = 0;
const kanalRenkleri = ["#f1c40f", "#3498db", "#e74c3c", "#bdc3c7"]; 

function cizgiCiz(kaynakId, hedefId, aktifRenk, kaynakAktif, kanalIndex) {
    const kaynak = document.getElementById(kaynakId); const hedef = document.getElementById(hedefId);
    if (!kaynak || !hedef) return;
    let hedefAktif = (hedef.dataset.tip === "firin") ? firinlar[hedef.dataset.index].aktif : makinalar[hedef.dataset.index].aktif;
    
    let c = kaynak.querySelector(`.node-out[data-kanal="${kanalIndex}"]`) || kaynak.querySelector('.node-out');
    let yaprakMenu = kaynak.querySelector('.silo-yaprak-menu');
    // EĞER YAPRAK MENÜ KAPALIYSA LİNYELERİ ANA NOKTADAN ÇIKAR
    if (yaprakMenu && !yaprakMenu.classList.contains('acik')) {
        c = kaynak.querySelector('.silo-ana-node');
    }

    let g = hedef.querySelector('.node-in');
    const rS = sahne.getBoundingClientRect(); const rC = c.getBoundingClientRect(); const rG = g.getBoundingClientRect();
    const sX = (rC.left - rS.left + rC.width / 2) / scale; const sY = (rC.top - rS.top + rC.height / 2) / scale;
    const eX = (rG.left - rS.left + rG.width / 2) / scale; const eY = (rG.top - rS.top + rG.height / 2) / scale;
    
    ctx.beginPath(); ctx.moveTo(sX, sY); ctx.bezierCurveTo((sX + eX)/2, sY, (sX + eX)/2, eY, eX, eY);
    const bag = kaynakAktif && hedefAktif;
    ctx.strokeStyle = bag ? aktifRenk : "rgba(100, 100, 100, 0.4)"; ctx.lineWidth = bag ? 5 : 2;
    if (bag) { ctx.setLineDash([12, 12]); ctx.lineDashOffset = -dashOffset; } else ctx.setLineDash([]);
    ctx.stroke();
}

function animasyonDongusu() { 
    dashOffset += 1.5; ctx.clearRect(0, 0, canvas.width, canvas.height);
    silolar.forEach(s => { s.kanallar.forEach((kanal, kIdx) => { if (kanal && kanal !== "Boş") kanal.split(',').forEach(hId => cizgiCiz(s.id_str, hId.trim(), kanalRenkleri[kIdx], s.aktif, kIdx)); }); });
    firinlar.forEach(f => { if (f.hedef && f.hedef !== "Boş") f.hedef.split(',').forEach(hId => cizgiCiz(f.id_str, hId.trim(), "#e67e22", f.aktif, 0)); });
    requestAnimationFrame(animasyonDongusu); 
}

// --- 7. TIKLAMA / MODAL VE AKILLI LİSTE YÖNETİMİ ---
window.baglantiSilGlobal = function(kaynakId, hedefId) {
    silolar.forEach((s, idx) => { if(s.id_str === kaynakId) { s.kanallar.forEach((k, kIdx) => { if(k) { let hList = k.split(',').map(x=>x.trim()).filter(x => x !== hedefId); silolar[idx].kanallar[kIdx] = hList.length > 0 ? hList.join(', ') : "Boş"; } }); } });
    firinlar.forEach((f, idx) => { if(f.id_str === kaynakId) { if(f.hedef) { let hList = f.hedef.split(',').map(x=>x.trim()).filter(x => x !== hedefId); firinlar[idx].hedef = hList.length > 0 ? hList.join(', ') : "Boş"; } } });
    verileriKaydet(); document.getElementById('detay-modal').style.display = "none"; ekranlariCiz();
};

// CHECKBOX LİSTESİ ÜRETİCİ
function hedefCheckboxUret(kanalStr) {
    let secili = kanalStr ? kanalStr.split(',').map(x=>x.trim()) : [];
    let html = "";
    firinlar.forEach(f => {
        let chk = secili.includes(f.id_str) ? "checked" : "";
        let cls = chk ? "secili" : "";
        html += `<label class="hedef-lbl ${cls}"><input type="checkbox" value="${f.id_str}" ${chk} onchange="this.parentElement.classList.toggle('secili', this.checked)"> ${f.isim} (Fırın)</label>`;
    });
    makinalar.forEach(m => {
        let chk = secili.includes(m.id_str) ? "checked" : "";
        let cls = chk ? "secili" : "";
        html += `<label class="hedef-lbl ${cls}"><input type="checkbox" value="${m.id_str}" ${chk} onchange="this.parentElement.classList.toggle('secili', this.checked)"> ${m.isim} (Makina)</label>`;
    });
    return html;
}

document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.classList.contains('goto-cihaz')) { cihazaGit(t.dataset.target); return; }
    if (t.classList.contains('btn-kopar') || t.classList.contains('node-out') || t.classList.contains('node-in') || t.closest('#kontrol-paneli')) return; 

    // ANA BAĞLANTI (YAPRAK MENÜ) AÇMA BUTONU
    if (t.classList.contains('silo-ana-node')) {
        t.nextElementSibling.classList.toggle('acik');
        return;
    }

    if (t.classList.contains('btn-toggle')) {
        const kutu = t.closest('.kutu'); const tip = kutu.dataset.tip; const idx = parseInt(kutu.dataset.index);
        if (tip === "silo") silolar[idx].aktif = !silolar[idx].aktif;
        if (tip === "firin") firinlar[idx].aktif = !firinlar[idx].aktif;
        if (tip === "makina") makinalar[idx].aktif = !makinalar[idx].aktif;
        verileriKaydet(); ekranlariCiz(); return;
    }

    const kutu = t.closest('.kutu');
    
    // AKILLI SİLO DARALMA & GENİŞLEME VE MODAL AÇILIŞI
    if (kutu && !t.matches('button') && !suruklemeYapildi) {
        
        // Eğer Silo ise ve kapalıysa, önce Genişlet (Modal açma)
        if (kutu.dataset.tip === "silo" && !kutu.classList.contains('expanded')) {
            document.querySelectorAll('.kutu.expanded').forEach(el => el.classList.remove('expanded'));
            document.querySelectorAll('.silo-yaprak-menu.acik').forEach(el => el.classList.remove('acik'));
            kutu.classList.add('expanded');
            return;
        }

        const tip = kutu.dataset.tip; const seciliIndex = parseInt(kutu.dataset.index);
        
        let gelenler = [];
        silolar.forEach(s => { s.kanallar.forEach(k => { if(k && k.includes(kutu.id)) gelenler.push(`<li class="liste-satiri"><b>${s.isim}</b><button class="btn-kopar" onclick="baglantiSilGlobal('${s.id_str}', '${kutu.id}')">X Sil</button><br><span style="font-size:10px;">${s.kod}</span></li>`); }); });
        firinlar.forEach(f => { if(f.hedef && f.hedef.includes(kutu.id)) gelenler.push(`<li class="liste-satiri"><b>${f.isim}</b><button class="btn-kopar" onclick="baglantiSilGlobal('${f.id_str}', '${kutu.id}')">X Sil</button><br><span style="font-size:10px;">Isı: ${f.sicaklik}</span></li>`); });
        document.getElementById('gelen-listesi').innerHTML = gelenler.join('') || "<li>Henüz giriş yok.</li>";

        document.getElementById('silo-kanallari-inputlari').style.display = "none"; document.getElementById('firin-hedef-inputu').style.display = "none";
        document.getElementById('silo-ozel-bilgiler').style.display = "none"; document.getElementById('ek-besleme-alani').style.display = "none";

        if (tip === "silo") {
            document.getElementById('modal-baslik').innerText = silolar[seciliIndex].isim; document.getElementById('modal-etiket').innerText = "Materyal Açıklaması:"; document.getElementById('modal-input-veri').value = silolar[seciliIndex].materyal;
            document.getElementById('silo-ozel-bilgiler').style.display = "block"; document.getElementById('modal-input-kod').value = silolar[seciliIndex].kod; document.getElementById('modal-input-teknik').value = silolar[seciliIndex].teknik;
            
            document.getElementById('silo-kanallari-inputlari').style.display = "block";
            // YENİ: CHECKBOX LİSTELERİNİ YÜKLE
            for(let i=1; i<=4; i++) {
                document.getElementById(`modal-kanal-${i}`).innerHTML = hedefCheckboxUret(silolar[seciliIndex].kanallar[i-1]);
            }
        } else if (tip === "firin") {
            document.getElementById('modal-baslik').innerText = firinlar[seciliIndex].isim; document.getElementById('modal-etiket').innerText = "Fırın Sıcaklığı:"; document.getElementById('modal-input-veri').value = firinlar[seciliIndex].sicaklik;
            
            document.getElementById('firin-hedef-inputu').style.display = "block";
            document.getElementById('modal-firin-hedef').innerHTML = hedefCheckboxUret(firinlar[seciliIndex].hedef); // Fırın için de seçici yükle
            
            document.getElementById('ek-besleme-alani').style.display = "block"; document.getElementById('modal-ek-tip').value = firinlar[seciliIndex].ekTip; document.getElementById('modal-ek-malzeme').value = firinlar[seciliIndex].ekVeri;
        } else {
            document.getElementById('modal-baslik').innerText = makinalar[seciliIndex].isim; document.getElementById('modal-etiket').innerText = "Üretilen Ürün:"; document.getElementById('modal-input-veri').value = makinalar[seciliIndex].urun;
            document.getElementById('ek-besleme-alani').style.display = "block"; document.getElementById('modal-ek-tip').value = makinalar[seciliIndex].ekTip; document.getElementById('modal-ek-malzeme').value = makinalar[seciliIndex].ekVeri;
        }
        
        document.getElementById('detay-modal').style.display = "flex";
        
        document.getElementById('modal-kaydet').onclick = () => {
            const veri = document.getElementById('modal-input-veri').value;
            if (tip === "silo") {
                silolar[seciliIndex].materyal = veri; silolar[seciliIndex].kod = document.getElementById('modal-input-kod').value; silolar[seciliIndex].teknik = document.getElementById('modal-input-teknik').value;
                // YENİ: CHECKBOX LİSTESİNDEN SEÇİMLERİ KAYDET
                for(let i=1; i<=4; i++) {
                    let secili = [];
                    document.querySelectorAll(`#modal-kanal-${i} input:checked`).forEach(el => secili.push(el.value));
                    silolar[seciliIndex].kanallar[i-1] = secili.length > 0 ? secili.join(', ') : "Boş";
                }
            } else if (tip === "firin") {
                firinlar[seciliIndex].sicaklik = veri; 
                let secili = []; document.querySelectorAll(`#modal-firin-hedef input:checked`).forEach(el => secili.push(el.value));
                firinlar[seciliIndex].hedef = secili.length > 0 ? secili.join(', ') : "Boş";
                firinlar[seciliIndex].ekTip = document.getElementById('modal-ek-tip').value; firinlar[seciliIndex].ekVeri = document.getElementById('modal-ek-malzeme').value;
            } else { 
                makinalar[seciliIndex].urun = veri; 
                makinalar[seciliIndex].ekTip = document.getElementById('modal-ek-tip').value; makinalar[seciliIndex].ekVeri = document.getElementById('modal-ek-malzeme').value;
            }
            verileriKaydet(); document.getElementById('detay-modal').style.display = "none"; ekranlariCiz();
        };
    } else if (!kutu) {
        // Boşluğa tıklanırsa tüm siloları küçült ve yaprak menüleri kapat
        document.querySelectorAll('.kutu.expanded').forEach(el => el.classList.remove('expanded'));
        document.querySelectorAll('.silo-yaprak-menu.acik').forEach(el => el.classList.remove('acik'));
    }

    if (t.id === "modal-kapat" || t.id === "modal-kapat-alt" || t.id === "detay-modal") {
        document.getElementById('detay-modal').style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", () => { 
    ekranlariCiz(); animasyonDongusu(); 
    const btnKilitle = document.getElementById('btn-kilitle');
    btnKilitle.onclick = function() {
        konumlarKilitli = !konumlarKilitli;
        if (konumlarKilitli) { this.className = "kilit-kapali"; this.innerText = "🔒 Konumlar Kilitli"; } 
        else { this.className = "kilit-acik"; this.innerText = "🔓 Konumlar Serbest"; }
    };
});
