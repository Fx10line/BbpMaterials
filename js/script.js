// ==========================================
// 1. VERİ TABANI (Geçici Hafıza)
// ==========================================

// SİLOLAR (14 Adet)
let silolar = [];
for (let i = 1; i <= 14; i++) {
    silolar.push({
        id: i,
        isim: `Silo ${i}`,
        materyal: "Polipropilen (PP)", // Varsayılan malzeme
        aktif: true, // true=ON, false=OFF
        kanallar: ["Boş", "Boş", "Boş", "Boş"] // 4 Çıkış kanalı
    });
}

// FIRINLAR (16 Adet)
let firinlar = [];
for (let i = 1; i <= 16; i++) {
    firinlar.push({
        id: i,
        isim: `Fırın ${i}`,
        sicaklik: "80°C", // Varsayılan sıcaklık
        aktif: false 
    });
}

// MAKİNALAR (19 Adet)
let makinalar = [];
for (let i = 1; i <= 19; i++) {
    makinalar.push({
        id: i,
        isim: `Makina ${i}`,
        urun: "Kapak V2", // Üretilen ürün
        aktif: true,
        umbau: false // true ise lamba yanar
    });
}

// ==========================================
// 2. EKRANA ÇİZME (RENDER) FONKSİYONLARI
// ==========================================

// Siloları ekrana yerleştirir
function silolariCiz() {
    const kutu = document.getElementById('silo-listesi');
    kutu.innerHTML = ""; // İçini temizle
    
    silolar.forEach((silo, index) => {
        const onClass = silo.aktif ? "aktif-buton" : "";
        const offClass = !silo.aktif ? "aktif-buton" : "";
        
        kutu.innerHTML += `
            <div class="kutu" data-tip="silo" data-index="${index}">
                <div class="kutu-baslik">${silo.isim}</div>
                <div class="kutu-bilgi">Mat: ${silo.materyal}</div>
                
                <!-- 4 Kanal Gösterimi -->
                <div class="kanal-bilgileri">
                    <div>Ç1: ${silo.kanallar[0]}</div>
                    <div>Ç2: ${silo.kanallar[1]}</div>
                    <div>Ç3: ${silo.kanallar[2]}</div>
                    <div>Ç4: ${silo.kanallar[3]}</div>
                </div>

                <div class="guc-dugmeleri">
                    <button class="btn-on ${onClass}">ON</button>
                    <button class="btn-off ${offClass}">OFF</button>
                </div>
            </div>
        `;
    });
}

// Fırınları ekrana yerleştirir
function firinlariCiz() {
    const kutu = document.getElementById('firin-listesi');
    kutu.innerHTML = ""; 
    
    firinlar.forEach((firin, index) => {
        const onClass = firin.aktif ? "aktif-buton" : "";
        const offClass = !firin.aktif ? "aktif-buton" : "";
        
        kutu.innerHTML += `
            <div class="kutu" data-tip="firin" data-index="${index}">
                <div class="kutu-baslik">${firin.isim}</div>
                <div class="kutu-bilgi">Sıcaklık: ${firin.sicaklik}</div>
                <div class="guc-dugmeleri">
                    <button class="btn-on ${onClass}">ON</button>
                    <button class="btn-off ${offClass}">OFF</button>
                </div>
            </div>
        `;
    });
}

// Makinaları ekrana yerleştirir
function makinalariCiz() {
    const kutu = document.getElementById('makina-listesi');
    kutu.innerHTML = ""; 
    
    makinalar.forEach((makina, index) => {
        const onClass = makina.aktif ? "aktif-buton" : "";
        const offClass = !makina.aktif ? "aktif-buton" : "";
        const umbauClass = makina.umbau ? "umbau-aktif" : "";
        
        kutu.innerHTML += `
            <div class="kutu" data-tip="makina" data-index="${index}">
                <!-- Umbau Lambası -->
                <div class="umbau-lambasi ${umbauClass}" title="Umbau Değiştir"></div>
                
                <div class="kutu-baslik">${makina.isim}</div>
                <div class="kutu-bilgi">Ürün: ${makina.urun}</div>
                
                <div class="guc-dugmeleri">
                    <button class="btn-on ${onClass}">ON</button>
                    <button class="btn-off ${offClass}">OFF</button>
                </div>
            </div>
        `;
    });
}

// Tüm ekranı baştan çizer
function tumEkraniGuncelle() {
    silolariCiz();
    firinlariCiz();
    makinalariCiz();
}

// ==========================================
// 3. TIKLAMA OLAYLARI VE MODAL (PENCERE) YÖNETİMİ
// ==========================================

// Modal için hafızada tutacağımız geçici değişkenler
let seciliTip = ""; // silo, firin veya makina
let seciliIndex = null; // Tıklanan elemanın sırası

document.addEventListener('click', (e) => {
    const tiklanan = e.target;

    // --- A. GÜÇ DÜĞMELERİ (ON/OFF) TIKLANMASI ---
    if (tiklanan.classList.contains('btn-on') || tiklanan.classList.contains('btn-off')) {
        const kutu = tiklanan.closest('.kutu');
        const tip = kutu.dataset.tip;
        const index = parseInt(kutu.dataset.index);
        const onBasildi = tiklanan.classList.contains('btn-on');

        if (tip === "silo") silolar[index].aktif = onBasildi;
        if (tip === "firin") firinlar[index].aktif = onBasildi;
        if (tip === "makina") makinalar[index].aktif = onBasildi;
        
        tumEkraniGuncelle();
        return; // İşlem bitince alttaki kodlara geçmesini engelle
    }

    // --- B. UMBAU LAMBASINA TIKLANMASI ---
    if (tiklanan.classList.contains('umbau-lambasi')) {
        const kutu = tiklanan.closest('.kutu');
        const index = parseInt(kutu.dataset.index);
        
        // Umbau durumunu tersine çevir (True ise False, False ise True yap)
        makinalar[index].umbau = !makinalar[index].umbau;
        tumEkraniGuncelle();
        return;
    }

    // --- C. KUTUYA TIKLANMASI (MODAL AÇMA) ---
    const kutu = tiklanan.closest('.kutu');
    if (kutu && !tiklanan.matches('button') && !tiklanan.matches('.umbau-lambasi')) {
        seciliTip = kutu.dataset.tip;
        seciliIndex = parseInt(kutu.dataset.index);
        
        const modal = document.getElementById('detay-modal');
        const kanalAlani = document.getElementById('modal-kanallar-alani');
        const anaVeriInput = document.getElementById('modal-input-veri');

        // Hangi tipe tıklandıysa modalı ona göre doldur
        if (seciliTip === "silo") {
            const silo = silolar[seciliIndex];
            document.getElementById('modal-baslik').innerText = silo.isim + " Ayarları";
            document.getElementById('modal-etiket').innerText = "İçindeki Materyal:";
            anaVeriInput.value = silo.materyal;
            
            // Silo için 4 kanalı da ekrana getir
            kanalAlani.style.display = "block";
            document.getElementById('modal-kanal-1').value = silo.kanallar[0];
            document.getElementById('modal-kanal-2').value = silo.kanallar[1];
            document.getElementById('modal-kanal-3').value = silo.kanallar[2];
            document.getElementById('modal-kanal-4').value = silo.kanallar[3];
        } 
        else if (seciliTip === "firin") {
            const firin = firinlar[seciliIndex];
            document.getElementById('modal-baslik').innerText = firin.isim + " Ayarları";
            document.getElementById('modal-etiket').innerText = "Fırın Sıcaklığı:";
            anaVeriInput.value = firin.sicaklik;
            kanalAlani.style.display = "none"; // Fırında kanal gizli
        }
        else if (seciliTip === "makina") {
            const makina = makinalar[seciliIndex];
            document.getElementById('modal-baslik').innerText = makina.isim + " Ayarları";
            document.getElementById('modal-etiket').innerText = "Üretilen Ürün / Plan:";
            anaVeriInput.value = makina.urun;
            kanalAlani.style.display = "none"; // Makinada kanal gizli
        }

        modal.style.display = "block";
    }

    // --- D. MODALI KAPATMA ---
    if (tiklanan.id === "modal-kapat") {
        document.getElementById('detay-modal').style.display = "none";
    }

    // --- E. MODALDAKİ KAYDET BUTONUNA BASILMASI ---
    if (tiklanan.id === "modal-kaydet") {
        const anaVeri = document.getElementById('modal-input-veri').value;
        
        if (seciliTip === "silo") {
            silolar[seciliIndex].materyal = anaVeri;
            silolar[seciliIndex].kanallar[0] = document.getElementById('modal-kanal-1').value;
            silolar[seciliIndex].kanallar[1] = document.getElementById('modal-kanal-2').value;
            silolar[seciliIndex].kanallar[2] = document.getElementById('modal-kanal-3').value;
            silolar[seciliIndex].kanallar[3] = document.getElementById('modal-kanal-4').value;
        } 
        else if (seciliTip === "firin") {
            firinlar[seciliIndex].sicaklik = anaVeri;
        } 
        else if (seciliTip === "makina") {
            makinalar[seciliIndex].urun = anaVeri;
        }

        document.getElementById('detay-modal').style.display = "none"; // Kapat
        tumEkraniGuncelle(); // Yeni verilerle ekranı yeniden çiz
    }
});

// Sayfa ilk yüklendiğinde çizimi başlat
document.addEventListener("DOMContentLoaded", tumEkraniGuncelle);
