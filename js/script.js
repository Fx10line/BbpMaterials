// Basit etkileşim: ON/OFF butonları ve umbau lambası toggle
document.addEventListener('click', (e)=>{
  const t = e.target;
  // ON/OFF butonuna basılınca: onu aktif yap, diğerini pasif yap ve aria-pressed güncelle
  if(t.matches('.btn-on') || t.matches('.btn-off')){
    const container = t.closest('.silo-kutusu, .firin-kutusu, .makina-kutusu');
    if(!container) return;
    const on = container.querySelector('.btn-on');
    const off = container.querySelector('.btn-off');
    if(t === on){
      on.classList.add('aktif-buton');
      off.classList.remove('aktif-buton');
      on.setAttribute('aria-pressed','true');
      off.setAttribute('aria-pressed','false');
      container.dataset.state = 'on';
    } else {
      off.classList.add('aktif-buton');
      on.classList.remove('aktif-buton');
      off.setAttribute('aria-pressed','true');
      on.setAttribute('aria-pressed','false');
      container.dataset.state = 'off';
    }
  }

  // Makina içindeki umbau lamba tıklama toggles
  if(t.matches('.umbau-lambasi')){
    t.classList.toggle('umbau-aktif');
    const active = t.classList.contains('umbau-aktif');
    t.title = active ? 'Kalıp Değişimi (Umbau) Yapılıyor' : 'Umbau Kapalı';
    t.setAttribute('aria-checked', active ? 'true' : 'false');
  }
});
