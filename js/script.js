:root {
  --bg: #1e1e1e; --card: #2c3e50; --text: #ecf0f1;
  --accent: #3498db; --danger: #e74c3c; --success: #2ecc71;
  font-family: system-ui, sans-serif;
}
* { box-sizing: border-box; touch-action: none; }
body { margin: 0; background: var(--bg); color: var(--text); overflow: hidden; user-select: none; -webkit-user-select: none; }

/* --- AÇILIR KAPANIR KONTROL PANELİ --- */
#kontrol-paneli { 
  position: fixed; top: 10px; left: 10px; z-index: 2000; 
  background: rgba(30, 30, 30, 0.9); backdrop-filter: blur(5px); 
  padding: 10px; border-radius: 8px; border: 1px solid #444; 
  box-shadow: 0 4px 10px rgba(0,0,0,0.5); 
  width: 140px; /* Kapalıyken küçük */
  transition: all 0.3s ease; 
  overflow: hidden; 
}
#panel-baslik { margin: 0; font-size: 14px; color: #3498db; text-align: center; cursor: pointer; }
#panel-icerik { max-height: 0; opacity: 0; transition: all 0.3s ease; }

/* Fareyle üzerine gelince (PC) veya aktif class'ı eklenince (Mobil) büyür */
#kontrol-paneli:hover, #kontrol-paneli.acik { width: 180px; }
#kontrol-paneli:hover #panel-icerik, #kontrol-paneli.acik #panel-icerik {
  max-height: 200px; opacity: 1; margin-top: 15px;
}

.mod-secici { display: flex; gap: 5px; margin-bottom: 10px; }
.mod-secici button { flex:1; background: #333; color: #fff; border: 1px solid #555; padding: 8px 5px; border-radius: 4px; font-size: 11px; font-weight:bold; cursor:pointer;}
.mod-secici button.mod-aktif { background: var(--success); border-color: var(--success); }
.zoom-araclari { display: flex; align-items: center; justify-content: space-between; gap: 5px; }
.zoom-araclari button { background: #333; color: #fff; border: 1px solid #555; padding: 8px 12px; border-radius: 4px; font-weight:bold; font-size: 14px; cursor:pointer;}
#zoom-seviyesi { font-size: 12px; font-weight: bold; width: 40px; text-align: center; }

#fabrika-sahasi { width: 100vw; height: 100vh; position: relative; background: #111; }
#sahne { width: 3000px; height: 3000px; position: absolute; top: 0; left: 0; background-image: radial-gradient(#444 1px, transparent 1px); background-size: 40px 40px; transform-origin: 0 0; }
#cizim-alani { position: absolute; top: 0; left: 0; pointer-events: none; z-index: 1; }
#cihazlar-kapsayici { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; }

/* KUTULAR VE BUTONLAR */
.kutu { background: var(--card); padding: 10px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); position: absolute; width: 160px; border: 2px solid transparent; cursor: grab; }
.kutu-ikon { font-size: 30px; text-align: center; margin-bottom: 5px; background: rgba(255,255,255,0.1); border-radius: 6px; padding: 2px; pointer-events: none;}
.kutu-baslik { font-weight: bold; font-size: 14px; text-align: center; border-bottom: 1px solid #444; padding-bottom: 3px; margin-bottom: 5px; pointer-events: none;}
.kutu-bilgi { font-size: 11px; text-align: center; color: #bdc3c7; pointer-events: none; line-height: 1.3;}
.guc-dugmeleri { display: flex; margin-top: 8px; width: 100%; }
.btn-toggle { width: 100%; border: none; padding: 8px; font-weight: bold; border-radius: 4px; font-size: 11px; cursor: pointer; color: white; transition: 0.2s;}
.btn-toggle.btn-on { background: var(--success); box-shadow: 0 0 8px rgba(46, 204, 113, 0.5); }
.btn-toggle.btn-off { background: var(--danger); box-shadow: 0 0 8px rgba(231, 76, 60, 0.5); }

/* NODES VE LAMBALAR */
.node-in, .node-out { width: 24px; height: 24px; border-radius: 50%; position: absolute; border: 3px solid #111; z-index: 10; cursor: crosshair;}
.node-in { background: var(--success); left: -12px; top: 50%; margin-top: -12px; }
.node-out.tekli { top: 50%; margin-top: -12px; background: #f1c40f; right: -12px; }
.silo-nodes { position: absolute; right: -12px; top: 15px; bottom: 15px; display: flex; flex-direction: column; justify-content: space-around; }
.silo-nodes .node-out { position: relative; right: 0; border: 2px solid #111; width: 20px; height: 20px;}
.node-ch1 { background: #f1c40f !important; } .node-ch2 { background: #3498db !important; } .node-ch3 { background: #e74c3c !important; } .node-ch4 { background: #bdc3c7 !important; }
.umbau-lambasi { width: 15px; height: 15px; border-radius: 50%; position: absolute; right: 10px; top: 10px; background: #555; border: 2px solid #222; }
.umbau-aktif { background: #ff9800; animation: flash 1s infinite; }
@keyframes flash { 0% { box-shadow: 0 0 5px #ff9800; } 50% { box-shadow: 0 0 15px #f00; background: #f00;} 100% { box-shadow: 0 0 5px #ff9800; } }

/* MODAL */
.modal { position: fixed; z-index: 3000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center;}
.modal-icerik { background: #ecf0f1; color: #2c3e50; padding: 15px; border-radius: 8px; width: 90%; max-width: 320px; position: relative; max-height:90vh; overflow-y:auto;}
.kapat-btn { position: absolute; right: 15px; top: 5px; font-size: 28px; padding:10px; cursor: pointer; }
.modal-input { width: 100%; padding: 10px; margin: 3px 0 10px 0; border: 1px solid #bdc3c7; border-radius:4px; font-size:14px; }
textarea.modal-input { resize: vertical; font-family: inherit; }
.kaydet-btn { background: var(--accent); color: white; width: 100%; padding: 12px; border: none; border-radius:4px; font-weight:bold; font-size:15px; margin-top:5px; cursor:pointer;}
