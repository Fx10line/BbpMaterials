// --- 6. SVG ÇİZİM MOTORU (A SEÇENEĞİ: AKILLI DİRSEK / TESİSAT BORUSU) ---
const kanalRenkleri = ["#f1c40f", "#3498db", "#e74c3c", "#bdc3c7"]; 
const svgAlan = document.getElementById('cizim-alani');
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
        
        // Başlangıç (Kırmızı noktanın tam ortası)
        const sX = (rC.left - rS.left + rC.width / 2) / scale; 
        const sY = (rC.top - rS.top + rC.height / 2) / scale;
        
        // Hedef (Yeşil noktanın tam ortası)
        const eX = (rG.left - rS.left + rG.width / 2) / scale; 
        const eY = (rG.top - rS.top + rG.height / 2) / scale;
        
        // A SEÇENEĞİ: AKILLI DİRSEK MANTIĞI (Piping/Boru Tesisatı Yöntemi)
        // 1. Kutudan çıkışta (yatay) 40 piksel DÜZ git
        const p1X = sX + 40; const p1Y = sY;
        // 2. Hedefe girmeden önce (yatay) 40 piksel DÜZ gir
        const p2X = eX - 40; const p2Y = eY;

        // Çizgiyi inşa et: Başlangıç -> İlk düzlük -> Boru dirseği kavis -> Son düzlük -> Bitiş
        // Bu yapı CPU için en hafif ve göz için en "tesisat benzeri" yapıdır.
        const pathData = `M ${sX} ${sY} L ${p1X} ${p1Y} C ${(p1X+p2X)/2} ${p1Y}, ${(p1X+p2X)/2} ${p2Y}, ${p2X} ${p2Y} L ${eX} ${eY}`;
        
        bag.path.setAttribute("d", pathData);
    });
}

function svgDinamikTakip() {
    if(!motorCalisiyor) return;
    statikSVGZorlaCiz();
    svgAnimasyonFrame = requestAnimationFrame(svgDinamikTakip);
}
