import { useState, useCallback, useRef } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const SITES = [
  { id: "antuyo",        name: "Antuyo",          code: "ANT" },
  { id: "chumille",      name: "Chumille",         code: "CHU" },
  { id: "pitic",         name: "Pitic",            code: "PIT" },
  { id: "agosto",        name: "8 de Agosto",      code: "AGO" },
  { id: "capacmarca",    name: "Capacmarca",       code: "CAP" },
  { id: "huninquiri",    name: "Huninquiri",       code: "HUN" },
  { id: "wincho",        name: "Wincho – Idiopa",  code: "WIN" },
  { id: "carpaiva",      name: "Carpaiva",         code: "CAR" },
  { id: "tuntuma",       name: "Tuntuma",          code: "TUN" },
  { id: "velille",       name: "Velille",          code: "VEL" },
];

const SITE_ALERTS = {
  capacmarca: "⚠ Verificar NVR reinstalado. Confirmar operatividad completa desde 03/10/25.",
  huninquiri: "⚠ Confirmar transmisión en COLOR de forma estable tras ajuste de configuración.",
  wincho:     "🔴 Cámara INHIBIDA. Requiere intervención física: escalera + llave torque + parrillero.",
  carpaiva:   "🔴 Primer mantenimiento del site. Sin datos previos. Inspección completa desde cero.",
  pitic:      "⚠ Verificar NVR reinstalado remotamente el 18/09/25.",
  velille:    "ℹ Series de cámara e infrarrojo pendientes (N/A). Registrar en esta visita.",
};

const SITE_EQUIPMENT = {
  antuyo:     ["Cámara VIVOTEK · S/N: 0002D19F1CE2","Infrarrojo VIVOTEK · S/N: CBA1221061002","Mini PC NVR · S/N: D83ADD18487D","Radio 53 Ubiquity · S/N: 602232D0FD10","Radio 54 Ubiquity · S/N: 602232D20A9A","Switch TRENDnet · S/N: P12DP51100133"],
  chumille:   ["Cámara VIVOTEK · S/N: 0002D19F1CDF","Infrarrojo VIVOTEK · S/N: CBA122205104","Mini PC NVR · S/N: D83ADD184714","Radio 53 Ubiquity · S/N: 602232D21EA3","Radio 54 Ubiquity · S/N: 602232D20A89","Switch TRENDnet · S/N: P12DP51100065"],
  pitic:      ["Cámara VIVOTEK · S/N: 0002D19F1C26","Infrarrojo VIVOTEK · S/N: CBA1222050171","Mini PC NVR · S/N: ⚠ PENDIENTE","Radio 53 Ubiquity · S/N: 602232D22611","Radio 54 Ubiquity · S/N: 602232D20E9F","Switch TRENDnet · S/N: P12DP51100150"],
  agosto:     ["Cámara VIVOTEK · S/N: 0002D19F1C24","Infrarrojo VIVOTEK · S/N: CBA1222050138","Mini PC NVR · S/N: D83ADD18487D","Switch TRENDnet · S/N: P12SP51100134"],
  capacmarca: ["Cámara VIVOTEK · S/N: 0002D19F1CE1","Infrarrojo VIVOTEK · S/N: CBA122205010","Mini PC NVR · S/N: ⚠ PENDIENTE (Reinstalado 03/10/25)","Switch TRENDnet · S/N: P12DP51100148"],
  huninquiri: ["Cámara VIVOTEK · S/N: 0002D19F1CDD","Infrarrojo VIVOTEK · S/N: CBA1222050046","Mini PC NVR · S/N: D83ADD18487E","Switch TRENDnet · S/N: P12DP51100064"],
  wincho:     ["Cámara VIVOTEK · S/N: 0002D19F1CDE ⚠ INHIBIDA","Infrarrojo VIVOTEK · S/N: CBA1222050093","Mini PC NVR · S/N: D83ADD184835","Switch TRENDnet · S/N: P12DP51100059"],
  carpaiva:   ["Cámara VIVOTEK · S/N: 0002D19F1CDB","Infrarrojo VIVOTEK · S/N: CBA1221061001","Mini PC NVR · S/N: ⚠ PENDIENTE","Switch TRENDnet · S/N: P12DP51100149"],
  tuntuma:    ["Cámara VIVOTEK · S/N: 002D19F1DDC","Infrarrojo VIVOTEK · S/N: CBA1222050045","Mini PC NVR · S/N: E45F01704ED3","Switch TRENDnet · S/N: P12DP51100075"],
  velille:    ["Cámara VIVOTEK · S/N: ⚠ PENDIENTE","Infrarrojo VIVOTEK · S/N: ⚠ PENDIENTE","Mini PC NVR · S/N: D83ADD1846AC","Switch TRENDnet · S/N: P12DP51100074"],
};

const PHASES = [
  { id:"inspeccion",    label:"F1",  title:"Inspección Física",       icon:"🔍", color:"#2d8fc4",
    tests:[
      {id:"f1_01",text:"Estado general del tablero y gabinete sin golpes ni humedad visible"},
      {id:"f1_02",text:"Cables sin sueltos ni pelados, bien organizados y sujetos"},
      {id:"f1_03",text:"Borneras y puntos de conexión sin signos de calor o desgaste"},
      {id:"f1_04",text:"Sin corrosión, humedad ni polvo excesivo dentro del tablero"},
      {id:"f1_05",text:"Tapas, puertas y cerraduras del tablero cierran correctamente"},
      {id:"f1_06",text:"Estructura metálica del poste sin óxido ni deformaciones visibles"},
      {id:"f1_07",text:"Cámara e infrarrojo sin golpes ni daños físicos aparentes"},
    ]},
  { id:"mantenimiento", label:"F2",  title:"Mantenimiento Físico",    icon:"🔧", color:"#c4a12d",
    tests:[
      {id:"f2_01",text:"Bloqueo de fuente de energía realizado antes de la intervención"},
      {id:"f2_02",text:"Retiro de polvo con brocha y franela limpia en interior del tablero"},
      {id:"f2_03",text:"Limpieza de borneras, relés, protecciones y cableado"},
      {id:"f2_04",text:"Reajuste de pernos en dispositivos eléctricos y electrónicos"},
      {id:"f2_05",text:"Limpieza externa del tablero con productos compatibles"},
      {id:"f2_06",text:"Limpieza de cámara e infrarrojo con paño de microfibra"},
      {id:"f2_07",text:"Tratamiento de óxido en estructura metálica (lija + pintura epóxica) si aplica"},
    ]},
  { id:"electrico",     label:"F3",  title:"Pruebas Eléctricas",      icon:"⚡", color:"#c4842d",
    tests:[
      {id:"f3_01",text:"Tensión AC en acometida dentro del rango esperado"},
      {id:"f3_02",text:"Tensión DC fuente 48 VDC correcta"},
      {id:"f3_03",text:"Tensión DC fuente 24 VDC correcta"},
      {id:"f3_04",text:"Consumo de corriente normal (pinza amperimétrica)"},
    ]},
  { id:"red",           label:"F4A", title:"Conectividad de Red",     icon:"🌐", color:"#2dc46e",
    tests:[
      {id:"f4_01",text:"Ping → Cámara 192.168.1.51 — 0% pérdida de paquetes"},
      {id:"f4_02",text:"Ping → NVR / Mini PC 192.168.1.52 — 0% pérdida de paquetes"},
      {id:"f4_03",text:"Ping → Radio Enlace 53 (192.168.1.53) — 0% pérdida"},
      {id:"f4_04",text:"Ping → Radio Enlace 54 (192.168.1.54) — 0% pérdida"},
      {id:"f4_05",text:"Ping → Gateway 192.168.1.1 — responde correctamente"},
      {id:"f4_06",text:"Ping → DNS Primario 200.108.96.212 — responde"},
      {id:"f4_07",text:"Ping → DNS Secundario 200.108.96.213 — responde"},
    ]},
  { id:"configuracion", label:"F4B", title:"Configuración del Sistema",icon:"⚙️", color:"#8b2dc4",
    tests:[
      {id:"f5_01",text:"IP estática de cámara configurada correctamente en interfaz VIVOTEK"},
      {id:"f5_02",text:"Máscara de subred 255.255.255.0 configurada"},
      {id:"f5_03",text:"Gateway y DNS primario/secundario configurados en la cámara"},
      {id:"f5_04",text:"NTP habilitado (si MMG habilitó puerto UDP 123 en firewall)"},
      {id:"f5_05",text:"Fecha y hora de la cámara coinciden con el equipo del técnico"},
      {id:"f5_06",text:"Fecha y hora del NVR coinciden con el equipo del técnico"},
      {id:"f5_07",text:"Puertos de comunicación entre dispositivos abiertos y funcionando"},
      {id:"f5_08",text:"Licencias del sistema vigentes y correctamente aplicadas"},
      {id:"f5_09",text:"Logs del sistema registrando eventos correctamente"},
      {id:"f5_10",text:"Guardado remoto WinSCP: acceso y escritura en ruta de destino verificados"},
    ]},
  { id:"nvr",           label:"F4C", title:"Grabación y NVR",         icon:"📹", color:"#c42d2d",
    tests:[
      {id:"f6_01",text:"NVR responde a ping en 192.168.1.52"},
      {id:"f6_02",text:"NVR recibe señal de video de la cámara en tiempo real"},
      {id:"f6_03",text:"Grabaciones guardándose correctamente en el NVR"},
      {id:"f6_04",text:"Rutas de almacenamiento configuradas y accesibles"},
      {id:"f6_05",text:"Espacio disponible en SD 128 GB verificado (>20% libre)"},
    ]},
  { id:"operatividad",  label:"F5",  title:"Operatividad con ALS",    icon:"✅", color:"#2d8fc4",
    tests:[
      {id:"f7_01",text:"Transmisión de imagen en tiempo real activa (verificado con ALS)"},
      {id:"f7_02",text:"Imagen transmitida en COLOR — no en blanco y negro"},
      {id:"f7_03",text:"Motor LPR activo y leyendo placas correctamente"},
      {id:"f7_04",text:"Evidencias fotográficas registradas con timestamp correcto"},
      {id:"f7_05",text:"Placas detectadas corresponden a la lista blanca de MMG"},
      {id:"f7_06",text:"N° de serie de Cámara registrado en inventario"},
      {id:"f7_07",text:"N° de serie de Infrarrojo registrado en inventario"},
      {id:"f7_08",text:"N° de serie de Mini PC NVR registrado en inventario"},
      {id:"f7_09",text:"N° de serie de Switch registrado en inventario"},
    ]},
];

const ALL_TEST_IDS   = PHASES.flatMap(p => p.tests.map(t => t.id));
const STATUS_CYCLE   = ["pending","ok","fail","na"];
const STATUS_META    = {
  pending:{ label:"Pendiente", icon:"○", color:"#444",    bg:"#111"    },
  ok:     { label:"OK",        icon:"✓", color:"#4ade80", bg:"#071a0f" },
  fail:   { label:"Fallo",     icon:"✗", color:"#f87171", bg:"#1a0707" },
  na:     { label:"N/A",       icon:"—", color:"#64748b", bg:"#0f1117" },
};

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const STORE_KEY = "vf_corredor_v2";
const loadStore = () => { try { const r = localStorage.getItem(STORE_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; } };
const saveStore = (d)  => { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch {} };
const initSite  = ()   => ({ technician:"", date: new Date().toISOString().split("T")[0], results:{}, phaseNotes:{}, testImages:{}, phaseImages:{}, generalNote:"", startedAt:null });

// ─── UTILS ────────────────────────────────────────────────────────────────────
const getSiteStats  = (d) => { const r=d?.results||{}; const ok=ALL_TEST_IDS.filter(id=>r[id]==="ok").length; const fail=ALL_TEST_IDS.filter(id=>r[id]==="fail").length; const na=ALL_TEST_IDS.filter(id=>r[id]==="na").length; const done=ok+fail+na; return {ok,fail,na,done,total:ALL_TEST_IDS.length,pending:ALL_TEST_IDS.length-done}; };
const getSiteStatus = (d) => { const {fail,done,total}=getSiteStats(d); if(!d?.startedAt) return {key:"idle",label:"Sin iniciar",color:"#333",dot:"#333"}; if(fail>0) return {key:"fail",label:"Con fallos",color:"#f87171",dot:"#f87171"}; if(done===total) return {key:"done",label:"Completado",color:"#4ade80",dot:"#4ade80"}; return {key:"active",label:"En progreso",color:"#fbbf24",dot:"#fbbf24"}; };
const getPhaseStats = (phase,results) => { const ids=phase.tests.map(t=>t.id); const ok=ids.filter(id=>results[id]==="ok").length; const fail=ids.filter(id=>results[id]==="fail").length; const na=ids.filter(id=>results[id]==="na").length; return {total:ids.length,done:ok+fail+na,ok,fail,na}; };
const resizeImage   = (file, maxW=1200) => new Promise(resolve => { const img=new Image(); const url=URL.createObjectURL(file); img.onload=()=>{ const scale=Math.min(1,maxW/img.width); const c=document.createElement("canvas"); c.width=img.width*scale; c.height=img.height*scale; c.getContext("2d").drawImage(img,0,0,c.width,c.height); resolve(c.toDataURL("image/jpeg",0.75)); URL.revokeObjectURL(url); }; img.src=url; });

// ─── IMAGE UPLOADER COMPONENT ─────────────────────────────────────────────────
function ImageUploader({ images=[], onAdd, onRemove, label="Adjuntar foto", compact=false }) {
  const ref = useRef();
  const handleFiles = async (files) => {
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      const b64 = await resizeImage(f);
      onAdd({ src: b64, name: f.name, ts: new Date().toLocaleString("es-PE") });
    }
  };
  return (
    <div style={{ marginTop: compact ? 4 : 8 }}>
      {/* Thumbnails */}
      {images.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:6 }}>
          {images.map((img, i) => (
            <div key={i} style={{ position:"relative", width: compact ? 52 : 72, height: compact ? 52 : 72 }}>
              <img
                src={img.src}
                alt={img.name}
                style={{ width:"100%", height:"100%", objectFit:"cover", border:"1px solid #2a2a2a", display:"block", cursor:"pointer" }}
                onClick={() => window.open(img.src)}
                title={`${img.name} · ${img.ts}`}
              />
              <button
                onClick={() => onRemove(i)}
                style={{ position:"absolute", top:1, right:1, background:"#c00000", border:"none", color:"#fff", fontSize:9, width:14, height:14, cursor:"pointer", padding:0, display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}
              >✕</button>
              {!compact && <div style={{ color:"#333", fontSize:8, marginTop:2, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{img.ts}</div>}
            </div>
          ))}
        </div>
      )}
      {/* Upload button */}
      <button
        onClick={() => ref.current?.click()}
        style={{ background:"transparent", border:"1px dashed #2a2a2a", color:"#444", padding: compact ? "4px 8px" : "5px 10px", fontSize:10, cursor:"pointer", fontFamily:"inherit", letterSpacing:1, display:"flex", alignItems:"center", gap:5 }}
      >
        <span style={{ fontSize:12 }}>📎</span>
        <span>{label}{images.length > 0 ? ` (${images.length})` : ""}</span>
      </button>
      <input ref={ref} type="file" accept="image/*" multiple capture="environment" style={{ display:"none" }}
        onChange={e => { handleFiles(e.target.files); e.target.value=""; }}
      />
    </div>
  );
}

// ─── LIGHTBOX ────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }) {
  if (!src) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.92)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, cursor:"zoom-out" }}>
      <img src={src} alt="" style={{ maxWidth:"95vw", maxHeight:"90vh", objectFit:"contain", border:"1px solid #222" }} onClick={e=>e.stopPropagation()} />
      <button onClick={onClose} style={{ position:"absolute", top:12, right:16, background:"transparent", border:"none", color:"#fff", fontSize:22, cursor:"pointer" }}>✕</button>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]       = useState("dashboard");
  const [store, setStore]         = useState(() => loadStore());
  const [activeSiteId, setActive] = useState(null);
  const [activePhase, setPhase]   = useState(0);
  const [showEq, setShowEq]       = useState(false);
  const [lightbox, setLightbox]   = useState(null);

  const persist = useCallback((ns) => { setStore(ns); saveStore(ns); }, []);
  const getSite = useCallback((id) => store[id] || initSite(), [store]);
  const updateSite = useCallback((id, updater) => {
    const prev = store[id] || initSite();
    const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
    persist({ ...store, [id]: next });
  }, [store, persist]);

  const openSite = (id) => {
    updateSite(id, prev => ({ ...prev, startedAt: prev.startedAt || new Date().toISOString() }));
    setActive(id); setPhase(0); setShowEq(false); setScreen("testing");
  };

  const cycleTest = (siteId, testId) => {
    const cur = (store[siteId]?.results||{})[testId] || "pending";
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(cur)+1) % STATUS_CYCLE.length];
    updateSite(siteId, prev => ({ ...prev, results:{ ...prev.results, [testId]:next } }));
  };
  const setTestStatus = (siteId, testId, status) => updateSite(siteId, prev => ({ ...prev, results:{ ...prev.results, [testId]:status } }));

  // Image helpers
  const addTestImage   = (siteId, testId, img)   => updateSite(siteId, prev => ({ ...prev, testImages:{ ...prev.testImages, [testId]:[...(prev.testImages?.[testId]||[]), img] } }));
  const removeTestImage= (siteId, testId, idx)   => updateSite(siteId, prev => { const imgs=[...(prev.testImages?.[testId]||[])]; imgs.splice(idx,1); return { ...prev, testImages:{ ...prev.testImages, [testId]:imgs } }; });
  const addPhaseImage  = (siteId, phaseId, img)  => updateSite(siteId, prev => ({ ...prev, phaseImages:{ ...prev.phaseImages, [phaseId]:[...(prev.phaseImages?.[phaseId]||[]), img] } }));
  const removePhaseImage=(siteId,phaseId,idx)    => updateSite(siteId, prev => { const imgs=[...(prev.phaseImages?.[phaseId]||[])]; imgs.splice(idx,1); return { ...prev, phaseImages:{ ...prev.phaseImages, [phaseId]:imgs } }; });

  const siteData  = activeSiteId ? getSite(activeSiteId) : null;
  const siteMeta  = activeSiteId ? SITES.find(s=>s.id===activeSiteId) : null;
  const siteStatus= activeSiteId ? getSiteStatus(siteData) : null;
  const phase     = PHASES[activePhase];

  // ── DASHBOARD ───────────────────────────────────────────────────────────────
  if (screen === "dashboard") {
    const done  = SITES.filter(s=>getSiteStatus(getSite(s.id)).key==="done").length;
    const fails = SITES.filter(s=>getSiteStatus(getSite(s.id)).key==="fail").length;
    const active= SITES.filter(s=>getSiteStatus(getSite(s.id)).key==="active").length;
    return (
      <div style={S.root}>
        <div style={S.dashWrap}>
          <div style={S.dashHeader}>
            <div style={S.brand}><span style={S.brandMMG}>MMG</span><span style={{color:"#333"}}>·</span><span style={S.brandAGIA}>AGIA Solutions</span></div>
            <div style={S.dashTitle}>Sistema de Verificación</div>
            <div style={S.dashSub}>Video Forense · Corredor Minero Sur</div>
          </div>
          <div style={S.globalStats}>
            {[{v:SITES.length,l:"Sites totales",c:"#64748b"},{v:done,l:"Completados",c:"#4ade80"},{v:active,l:"En progreso",c:"#fbbf24"},{v:fails,l:"Con fallos",c:"#f87171"}].map(s=>(
              <div key={s.l} style={{...S.gStatBox,borderColor:s.c+"44"}}>
                <span style={{color:s.c,fontSize:24,fontWeight:900}}>{s.v}</span>
                <span style={{color:"#444",fontSize:9,letterSpacing:2}}>{s.l.toUpperCase()}</span>
              </div>
            ))}
          </div>
          <div style={S.siteGrid}>
            {SITES.map(site => {
              const data=getSite(site.id); const st=getSiteStatus(data); const stats=getSiteStats(data);
              const pct=stats.total>0?Math.round((stats.done/stats.total)*100):0;
              const alert=SITE_ALERTS[site.id];
              const totalImgs = Object.values(data.testImages||{}).reduce((a,v)=>a+v.length,0) + Object.values(data.phaseImages||{}).reduce((a,v)=>a+v.length,0);
              return (
                <div key={site.id} style={{...S.siteCard,borderColor:st.dot+"55"}}>
                  <div style={S.cardTop}>
                    <div style={{...S.siteCode,color:st.dot,borderColor:st.dot+"44"}}>{site.code}</div>
                    <div style={{flex:1}}>
                      <div style={S.siteName}>{site.name}</div>
                      <div style={{...S.statusPill,color:st.color}}><span style={{...S.statusDot,background:st.dot}}/>{st.label}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                      {alert && <div style={S.warnBadge}>!</div>}
                      {totalImgs > 0 && <div style={{color:"#64748b",fontSize:9,letterSpacing:1}}>📷 {totalImgs}</div>}
                    </div>
                  </div>
                  <div style={S.progressTrack}><div style={{...S.progressFill,width:`${pct}%`,background:st.key==="fail"?"#f87171":st.key==="done"?"#4ade80":"#fbbf24"}}/></div>
                  {data.startedAt && <div style={S.miniStats}><span style={{color:"#4ade80"}}>✓{stats.ok}</span><span style={{color:"#555"}}>/</span><span style={{color:stats.fail>0?"#f87171":"#555"}}>✗{stats.fail}</span><span style={{color:"#555"}}>/</span><span style={{color:"#64748b"}}>—{stats.na}</span><span style={{color:"#444",marginLeft:"auto"}}>{pct}%</span></div>}
                  {data.technician && <div style={S.techLine}>{data.technician} · {data.date}</div>}
                  {alert && <div style={S.cardAlert}>{alert}</div>}
                  <div style={S.cardActions}>
                    <button style={S.btnOpen} onClick={()=>openSite(site.id)}>{data.startedAt?"CONTINUAR →":"INICIAR →"}</button>
                    {data.startedAt && <>
                      <button style={S.btnReport} onClick={()=>{setActive(site.id);setScreen("report");}}>INFORME</button>
                      <button style={S.btnReset} onClick={()=>{if(confirm(`¿Resetear datos de ${site.name}?`)) persist({...store,[site.id]:initSite()});}}>↺</button>
                    </>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Lightbox src={lightbox} onClose={()=>setLightbox(null)}/>
      </div>
    );
  }

  // ── TESTING ─────────────────────────────────────────────────────────────────
  if (screen==="testing" && siteData && siteMeta) {
    const results     = siteData.results||{};
    const phaseNotes  = siteData.phaseNotes||{};
    const testImages  = siteData.testImages||{};
    const phaseImages = siteData.phaseImages||{};
    const pStats      = getPhaseStats(phase, results);
    const totalStats  = getSiteStats(siteData);
    const pct         = totalStats.total>0?Math.round((totalStats.done/totalStats.total)*100):0;

    return (
      <div style={S.root}>
        <div style={S.testWrap}>
          {/* Top bar */}
          <div style={S.testTopBar}>
            <button style={S.backBtn} onClick={()=>setScreen("dashboard")}>← Dashboard</button>
            <div style={S.testSiteName}>{siteMeta.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:siteStatus.color,fontSize:10,letterSpacing:2}}>{totalStats.done}/{totalStats.total} · {pct}%</span>
              <button style={S.btnReport2} onClick={()=>setScreen("report")}>INFORME</button>
            </div>
          </div>

          {/* Progress strip */}
          <div style={{...S.progressTrack,borderRadius:0,height:3}}>
            <div style={{...S.progressFill,width:`${pct}%`,background:totalStats.fail>0?"#f87171":"#4ade80",transition:"width 0.4s"}}/>
          </div>

          {/* Technician */}
          <div style={S.techBar}>
            <input style={S.techInput} placeholder="Técnico responsable" value={siteData.technician}
              onChange={e=>updateSite(siteMeta.id,{...siteData,technician:e.target.value})}/>
            <input style={{...S.techInput,maxWidth:130}} type="date" value={siteData.date}
              onChange={e=>updateSite(siteMeta.id,{...siteData,date:e.target.value})}/>
          </div>

          {SITE_ALERTS[siteMeta.id] && <div style={S.alertBanner}>{SITE_ALERTS[siteMeta.id]}</div>}

          {/* Equipment */}
          <button style={S.equipToggle} onClick={()=>setShowEq(v=>!v)}>
            {showEq?"▲ Ocultar equipos":"▼ Ver inventario de equipos"}
          </button>
          {showEq && (
            <div style={S.equipList}>
              {(SITE_EQUIPMENT[siteMeta.id]||[]).map((eq,i)=>(
                <div key={i} style={{...S.equipRow,color:eq.includes("PENDIENTE")||eq.includes("INHIBIDA")?"#fbbf24":"#666"}}>{eq}</div>
              ))}
            </div>
          )}

          {/* Phase tabs */}
          <div style={S.phaseTabs}>
            {PHASES.map((p,i)=>{
              const ps=getPhaseStats(p,results); const done=ps.done===ps.total; const hasFail=ps.fail>0;
              const hasImgs=(phaseImages[p.id]||[]).length>0 || p.tests.some(t=>(testImages[t.id]||[]).length>0);
              return (
                <button key={p.id} style={{...S.phaseTab,borderBottom:`2px solid ${activePhase===i?p.color:"transparent"}`,color:activePhase===i?p.color:hasFail?"#f87171":done?"#4ade80":"#444"}}
                  onClick={()=>setPhase(i)}>
                  <span style={{fontSize:11}}>{p.icon}</span>
                  <span style={{fontSize:9,letterSpacing:1}}>{p.label}</span>
                  {hasImgs && <span style={{fontSize:8,color:"#64748b"}}>📷</span>}
                  {hasFail && <span style={phaseDotStyle("#f87171")}/>}
                  {!hasFail && done && <span style={phaseDotStyle("#4ade80")}/>}
                </button>
              );
            })}
          </div>

          {/* Phase header */}
          <div style={{...S.phaseHdr,borderLeft:`3px solid ${phase.color}`}}>
            <div>
              <div style={{color:phase.color,fontSize:11,fontWeight:700,letterSpacing:2}}>{phase.icon} {phase.label} · {phase.title.toUpperCase()}</div>
              <div style={{color:"#444",fontSize:10,marginTop:2}}>{pStats.done}/{pStats.total} · {pStats.ok} OK{pStats.fail>0&&<span style={{color:"#f87171"}}> · {pStats.fail} FALLOS</span>}</div>
            </div>
            <div style={{...S.progressTrack,width:80,height:3}}><div style={{...S.progressFill,width:`${(pStats.done/pStats.total)*100}%`,background:pStats.fail>0?"#f87171":phase.color}}/></div>
          </div>

          {/* Tests list */}
          <div style={S.testsList}>
            {phase.tests.map(test => {
              const s=results[test.id]||"pending"; const m=STATUS_META[s];
              const imgs=testImages[test.id]||[];
              return (
                <div key={test.id} style={{...S.testRow,background:m.bg,flexDirection:"column",alignItems:"stretch",gap:6}}>
                  {/* Row top */}
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <button style={{...S.circleBtn,borderColor:m.color,color:m.color}} onClick={()=>cycleTest(siteMeta.id,test.id)}>{m.icon}</button>
                    <div style={{...S.testText(s),flex:1}}>{test.text}</div>
                    <div style={S.quickBtns}>
                      {STATUS_CYCLE.map(key=>{
                        const mm=STATUS_META[key];
                        return <button key={key} style={{...S.qBtn,background:s===key?mm.color:"transparent",color:s===key?"#000":mm.color,borderColor:mm.color+"88"}}
                          onClick={()=>setTestStatus(siteMeta.id,test.id,key)} title={mm.label}>{mm.icon}</button>;
                      })}
                    </div>
                  </div>
                  {/* Image uploader per test */}
                  <div style={{paddingLeft:36}}>
                    <ImageUploader
                      images={imgs}
                      compact
                      label="Foto de evidencia"
                      onAdd={img=>addTestImage(siteMeta.id,test.id,img)}
                      onRemove={idx=>removeTestImage(siteMeta.id,test.id,idx)}
                    />
                    {imgs.length>0 && (
                      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>
                        {imgs.map((img,i)=>(
                          <img key={i} src={img.src} alt="" style={{width:52,height:52,objectFit:"cover",border:"1px solid #2a2a2a",cursor:"zoom-in"}}
                            onClick={()=>setLightbox(img.src)} title={img.ts}/>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Phase images + notes */}
            <div style={S.phaseNoteBox}>
              <div style={{color:"#333",fontSize:9,letterSpacing:2,marginBottom:6}}>OBSERVACIONES · {phase.title.toUpperCase()}</div>
              <textarea style={S.textarea} placeholder={`Notas para ${phase.title}...`}
                value={phaseNotes[phase.id]||""} onChange={e=>updateSite(siteMeta.id,prev=>({...prev,phaseNotes:{...prev.phaseNotes,[phase.id]:e.target.value}}))}/>

              <div style={{marginTop:10}}>
                <div style={{color:"#333",fontSize:9,letterSpacing:2,marginBottom:6}}>FOTOS DE LA FASE · {phase.title.toUpperCase()}</div>
                <ImageUploader
                  images={phaseImages[phase.id]||[]}
                  label={`Adjuntar foto de ${phase.title}`}
                  onAdd={img=>addPhaseImage(siteMeta.id,phase.id,img)}
                  onRemove={idx=>removePhaseImage(siteMeta.id,phase.id,idx)}
                />
                {(phaseImages[phase.id]||[]).length>0 && (
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                    {(phaseImages[phase.id]||[]).map((img,i)=>(
                      <div key={i} style={{position:"relative"}}>
                        <img src={img.src} alt="" style={{width:80,height:80,objectFit:"cover",border:"1px solid #2a2a2a",cursor:"zoom-in",display:"block"}}
                          onClick={()=>setLightbox(img.src)} title={img.ts}/>
                        <div style={{color:"#333",fontSize:8,marginTop:2}}>{img.ts}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom nav */}
          <div style={S.bottomNav}>
            <button style={{...S.navBtn,opacity:activePhase===0?0.3:1}} onClick={()=>setPhase(p=>Math.max(0,p-1))} disabled={activePhase===0}>← ANT</button>
            <div style={{color:"#333",fontSize:10,letterSpacing:1}}>{activePhase+1}/{PHASES.length}</div>
            {activePhase<PHASES.length-1
              ? <button style={S.navBtn} onClick={()=>setPhase(p=>p+1)}>SIG →</button>
              : <button style={{...S.navBtn,color:"#4ade80",borderColor:"#4ade80"}} onClick={()=>{updateSite(siteMeta.id,prev=>({...prev,completedAt:new Date().toISOString()}));setScreen("report");}}>FINALIZAR ✓</button>}
          </div>

          {/* General note */}
          <div style={S.genNoteBox}>
            <div style={{color:"#333",fontSize:9,letterSpacing:2,marginBottom:4}}>NOTA GENERAL DEL SITE</div>
            <textarea style={{...S.textarea,minHeight:44}} placeholder="Observaciones generales del site..."
              value={siteData.generalNote||""} onChange={e=>updateSite(siteMeta.id,{...siteData,generalNote:e.target.value})}/>
          </div>
        </div>
        <Lightbox src={lightbox} onClose={()=>setLightbox(null)}/>
      </div>
    );
  }

  // ── REPORT ──────────────────────────────────────────────────────────────────
  if (screen==="report" && siteData && siteMeta) {
    const results    =siteData.results||{};
    const phaseNotes =siteData.phaseNotes||{};
    const testImages =siteData.testImages||{};
    const phaseImages=siteData.phaseImages||{};
    const stats      =getSiteStats(siteData);
    const st         =getSiteStatus(siteData);
    const now        =new Date().toLocaleString("es-PE");
    const totalImgs  =Object.values(testImages).reduce((a,v)=>a+v.length,0)+Object.values(phaseImages).reduce((a,v)=>a+v.length,0);

    return (
      <div style={S.root}>
        <div style={S.reportWrap}>
          {/* Header */}
          <div style={{...S.reportHdr,borderColor:st.color}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{color:st.color,fontSize:12,fontWeight:700,letterSpacing:3}}>INFORME · {st.label.toUpperCase()}</div>
                <div style={{color:"#f1f5f9",fontSize:18,fontWeight:900,marginTop:6}}>{siteMeta.name}</div>
                <div style={{color:"#555",fontSize:10,marginTop:4}}>{siteData.technician||"—"} · {siteData.date} · {now}</div>
                {totalImgs>0 && <div style={{color:"#64748b",fontSize:10,marginTop:4}}>📷 {totalImgs} fotos adjuntas</div>}
              </div>
              <div style={{...S.siteCode,color:st.dot,borderColor:st.dot+"44",fontSize:16,padding:"6px 12px"}}>{siteMeta.code}</div>
            </div>
          </div>

          {/* Stats */}
          <div style={S.reportStats}>
            {[{v:stats.total,l:"Total",c:"#64748b"},{v:stats.ok,l:"OK",c:"#4ade80"},{v:stats.fail,l:"Fallos",c:"#f87171"},{v:stats.na,l:"N/A",c:"#64748b"},{v:stats.pending,l:"Pendientes",c:"#fbbf24"}].map(s=>(
              <div key={s.l} style={{...S.statBox,borderColor:s.c+"44"}}>
                <span style={{color:s.c,fontSize:22,fontWeight:900}}>{s.v}</span>
                <span style={{color:"#444",fontSize:9,letterSpacing:1}}>{s.l.toUpperCase()}</span>
              </div>
            ))}
          </div>

          {siteData.generalNote && <div style={S.reportGenNote}><span style={{color:"#fbbf24",fontSize:10,letterSpacing:2}}>NOTA GENERAL · </span><span style={{color:"#aaa",fontSize:11}}>{siteData.generalNote}</span></div>}

          {/* Equipment */}
          <div style={S.reportSection}>
            <div style={S.reportSectionTitle}>INVENTARIO DE EQUIPOS</div>
            {(SITE_EQUIPMENT[siteMeta.id]||[]).map((eq,i)=>(
              <div key={i} style={{fontSize:11,lineHeight:1.8,color:eq.includes("PENDIENTE")||eq.includes("INHIBIDA")?"#fbbf24":"#555"}}>· {eq}</div>
            ))}
          </div>

          {/* Phases */}
          {PHASES.map(p=>{
            const ps=getPhaseStats(p,results);
            const pImgs=phaseImages[p.id]||[];
            const phaseTestImgs=p.tests.flatMap(t=>(testImages[t.id]||[]).map(img=>({...img,test:t.text})));
            const allPhaseImgs=[...phaseTestImgs,...pImgs];
            return (
              <div key={p.id} style={S.reportPhaseBlock}>
                <div style={{...S.reportPhaseHdr,borderLeft:`3px solid ${p.color}`}}>
                  <span style={{color:p.color,fontWeight:700,fontSize:11,letterSpacing:2}}>{p.icon} {p.label} · {p.title.toUpperCase()}</span>
                  <span style={{color:"#444",fontSize:10}}>✓{ps.ok} {ps.fail>0&&<span style={{color:"#f87171"}}>✗{ps.fail} </span>}—{ps.na} {allPhaseImgs.length>0&&<span style={{color:"#64748b"}}>📷{allPhaseImgs.length}</span>}</span>
                </div>
                {p.tests.map(test=>{
                  const s=results[test.id]||"pending"; const m=STATUS_META[s];
                  const imgs=testImages[test.id]||[];
                  return (
                    <div key={test.id}>
                      <div style={{...S.reportRow,background:m.bg}}>
                        <span style={{color:m.color,width:18,textAlign:"center",fontSize:12,flexShrink:0}}>{m.icon}</span>
                        <span style={{color:s==="fail"?"#f87171":s==="ok"?"#cbd5e1":"#555",fontSize:11,flex:1}}>{test.text}</span>
                        {imgs.length>0 && <span style={{color:"#64748b",fontSize:10,flexShrink:0}}>📷{imgs.length}</span>}
                      </div>
                      {imgs.length>0 && (
                        <div style={{display:"flex",flexWrap:"wrap",gap:4,padding:"6px 12px",background:"#090909",borderBottom:"1px solid #0f0f0f"}}>
                          {imgs.map((img,i)=>(
                            <img key={i} src={img.src} alt="" style={{width:60,height:60,objectFit:"cover",border:"1px solid #222",cursor:"zoom-in"}}
                              onClick={()=>setLightbox(img.src)} title={img.ts}/>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {phaseNotes[p.id] && <div style={S.reportPhaseNote}>📝 <span style={{color:"#aaa",fontSize:11}}>{phaseNotes[p.id]}</span></div>}
                {pImgs.length>0 && (
                  <div style={{padding:"8px 12px",background:"#090909",borderTop:"1px solid #0f0f0f"}}>
                    <div style={{color:"#333",fontSize:9,letterSpacing:2,marginBottom:6}}>FOTOS DE LA FASE</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {pImgs.map((img,i)=>(
                        <div key={i}>
                          <img src={img.src} alt="" style={{width:72,height:72,objectFit:"cover",border:"1px solid #222",cursor:"zoom-in",display:"block"}}
                            onClick={()=>setLightbox(img.src)} title={img.ts}/>
                          <div style={{color:"#333",fontSize:8,marginTop:2}}>{img.ts}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Footer */}
          <div style={S.reportFooter}>
            <button style={S.navBtn} onClick={()=>setScreen("testing")}>← VOLVER</button>
            <button style={S.navBtn} onClick={()=>setScreen("dashboard")}>↩ DASHBOARD</button>
          </div>
        </div>
        <Lightbox src={lightbox} onClose={()=>setLightbox(null)}/>
      </div>
    );
  }
  return null;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const phaseDotStyle = c => ({width:5,height:5,borderRadius:"50%",background:c,position:"absolute",top:5,right:5});
const S = {
  root:{minHeight:"100vh",background:"#080808",fontFamily:"'Courier New',Courier,monospace",color:"#e2e8f0"},
  dashWrap:{maxWidth:720,margin:"0 auto",padding:"24px 16px 40px"},
  dashHeader:{marginBottom:24},
  brand:{display:"flex",alignItems:"center",gap:8,marginBottom:12},
  brandMMG:{background:"#c00000",color:"#fff",fontWeight:900,fontSize:13,padding:"3px 8px",letterSpacing:2},
  brandAGIA:{color:"#444",fontSize:11,letterSpacing:4},
  dashTitle:{fontSize:24,fontWeight:900,color:"#f1f5f9",letterSpacing:1},
  dashSub:{color:"#333",fontSize:10,letterSpacing:4,marginTop:4},
  globalStats:{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"},
  gStatBox:{flex:1,minWidth:70,background:"#0f0f0f",border:"1px solid",padding:"12px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:3},
  siteGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12},
  siteCard:{background:"#0d0d0d",border:"1px solid",padding:14,display:"flex",flexDirection:"column",gap:8},
  cardTop:{display:"flex",alignItems:"flex-start",gap:10},
  siteCode:{border:"1px solid",padding:"4px 8px",fontSize:13,fontWeight:900,letterSpacing:2,flexShrink:0},
  siteName:{fontSize:14,fontWeight:700,color:"#e2e8f0",letterSpacing:.5},
  statusPill:{display:"flex",alignItems:"center",gap:5,fontSize:10,marginTop:3,letterSpacing:1},
  statusDot:{width:6,height:6,borderRadius:"50%",display:"inline-block"},
  warnBadge:{background:"#c00000",color:"#fff",fontSize:10,width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,flexShrink:0},
  progressTrack:{height:4,background:"#1a1a1a",width:"100%",overflow:"hidden"},
  progressFill:{height:"100%",transition:"width 0.4s",minWidth:2},
  miniStats:{display:"flex",gap:6,fontSize:11,alignItems:"center"},
  techLine:{color:"#333",fontSize:9,letterSpacing:1},
  cardAlert:{background:"#120d00",border:"1px solid #3a2500",color:"#fbbf24",fontSize:10,padding:"6px 8px",lineHeight:1.5},
  cardActions:{display:"flex",gap:6,marginTop:4},
  btnOpen:{flex:1,background:"#c00000",border:"none",color:"#fff",padding:"8px",fontSize:10,fontWeight:700,letterSpacing:2,cursor:"pointer",fontFamily:"inherit"},
  btnReport:{background:"transparent",border:"1px solid #333",color:"#666",padding:"8px 10px",fontSize:10,cursor:"pointer",fontFamily:"inherit",letterSpacing:1},
  btnReset:{background:"transparent",border:"1px solid #2a2a2a",color:"#333",padding:"8px 10px",fontSize:12,cursor:"pointer",fontFamily:"inherit"},
  testWrap:{maxWidth:680,margin:"0 auto",display:"flex",flexDirection:"column",minHeight:"100vh"},
  testTopBar:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#0d0d0d",borderBottom:"1px solid #1a1a1a",position:"sticky",top:0,zIndex:20},
  backBtn:{background:"transparent",border:"none",color:"#444",fontSize:11,cursor:"pointer",fontFamily:"inherit",letterSpacing:1},
  testSiteName:{fontSize:14,fontWeight:900,color:"#f1f5f9",letterSpacing:1},
  btnReport2:{background:"#c00000",border:"none",color:"#fff",padding:"5px 10px",fontSize:9,fontWeight:700,letterSpacing:2,cursor:"pointer",fontFamily:"inherit"},
  techBar:{display:"flex",gap:8,padding:"8px 14px",background:"#0a0a0a",borderBottom:"1px solid #141414"},
  techInput:{flex:1,background:"#0d0d0d",border:"1px solid #1e1e1e",color:"#888",padding:"6px 10px",fontSize:11,fontFamily:"inherit",outline:"none"},
  alertBanner:{background:"#110a00",borderLeft:"3px solid #c47a2d",color:"#fbbf24",fontSize:11,padding:"8px 14px",lineHeight:1.5},
  equipToggle:{background:"transparent",border:"none",color:"#333",padding:"6px 14px",fontSize:10,cursor:"pointer",fontFamily:"inherit",letterSpacing:2,textAlign:"left",borderBottom:"1px solid #141414",width:"100%"},
  equipList:{background:"#0a0a0a",padding:"8px 14px",borderBottom:"1px solid #141414"},
  equipRow:{fontSize:10,lineHeight:1.8},
  phaseTabs:{display:"flex",overflowX:"auto",background:"#0b0b0b",borderBottom:"1px solid #141414",padding:"0 6px",scrollbarWidth:"none"},
  phaseTab:{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"7px 8px",background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",minWidth:44,transition:"all 0.15s",position:"relative"},
  phaseHdr:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#0d0d0d",borderBottom:"1px solid #141414"},
  testsList:{flex:1,overflowY:"auto"},
  testRow:{display:"flex",padding:"10px 14px",borderBottom:"1px solid #0f0f0f"},
  circleBtn:{width:26,height:26,borderRadius:"50%",border:"2px solid",background:"transparent",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"inherit"},
  testText:(s)=>({flex:1,fontSize:11,lineHeight:1.4,color:s==="fail"?"#f87171":s==="ok"?"#e2e8f0":"#666"}),
  quickBtns:{display:"flex",gap:2,flexShrink:0},
  qBtn:{width:18,height:18,border:"1px solid",background:"transparent",cursor:"pointer",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"},
  phaseNoteBox:{margin:"10px 14px",padding:"10px",background:"#0a0a0a",border:"1px solid #141414"},
  textarea:{width:"100%",background:"#070707",border:"1px solid #1a1a1a",color:"#666",padding:"7px 10px",fontSize:11,fontFamily:"inherit",resize:"vertical",minHeight:56,outline:"none",boxSizing:"border-box"},
  bottomNav:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#0d0d0d",borderTop:"1px solid #1a1a1a",position:"sticky",bottom:0,zIndex:10},
  navBtn:{background:"transparent",border:"1px solid #222",color:"#555",padding:"7px 14px",fontSize:10,letterSpacing:2,cursor:"pointer",fontFamily:"inherit"},
  genNoteBox:{padding:"8px 14px 20px",background:"#080808",borderTop:"1px solid #111"},
  reportWrap:{maxWidth:680,margin:"0 auto",padding:"16px",display:"flex",flexDirection:"column",gap:12},
  reportHdr:{background:"#0d0d0d",border:"1px solid",padding:16},
  reportStats:{display:"flex",gap:8,flexWrap:"wrap"},
  statBox:{flex:1,minWidth:60,background:"#0d0d0d",border:"1px solid",padding:"10px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:3},
  reportGenNote:{background:"#0d0900",border:"1px solid #2a1e00",padding:"10px 12px"},
  reportSection:{background:"#0d0d0d",border:"1px solid #1a1a1a",padding:"10px 14px"},
  reportSectionTitle:{color:"#333",fontSize:9,letterSpacing:3,marginBottom:8},
  reportPhaseBlock:{background:"#0b0b0b",border:"1px solid #141414",overflow:"hidden"},
  reportPhaseHdr:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:"#0f0f0f",borderBottom:"1px solid #141414"},
  reportRow:{display:"flex",gap:8,padding:"6px 12px",borderBottom:"1px solid #0a0a0a",alignItems:"center"},
  reportPhaseNote:{padding:"7px 12px",background:"#0a0800",color:"#fbbf24",fontSize:11,display:"flex",gap:6},
  reportFooter:{display:"flex",gap:12,justifyContent:"space-between",paddingBottom:32},
};