import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Users, Plus, Trash2, Download, Shuffle, Eye, Edit3, AlertCircle, Check, X, RotateCcw, Calendar, Sun, Moon, Copy, CalendarDays, LogOut } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import api from './api/client';

// ========== COSTANTI ==========
const DEFAULT_CONFIG = {
  fileAttive: ['A', 'B', 'C', 'D', 'E', 'F'],
  tavoliPerFila: { A: 8, B: 8, C: 8, D: 8, E: 8, F: 5 },
  postiPerTavolo: 8,
  menu: [], // lista piatti disponibili per questa sessione: [{ id, nome }]
};

const FASCE = [
  { id: 'pranzo', label: 'Pranzo', icon: Sun, colore: 'amber' },
  { id: 'cena', label: 'Cena', icon: Moon, colore: 'indigo' },
];

const MAX_DATE = 7;

const coloriFila = {
  A: 'bg-amber-100 border-amber-600',
  B: 'bg-orange-100 border-orange-600',
  C: 'bg-rose-100 border-rose-600',
  D: 'bg-emerald-100 border-emerald-600',
  E: 'bg-sky-100 border-sky-600',
  F: 'bg-violet-100 border-violet-600',
};

// Logo Proloco Dairago (incorporato in Base64 per renderlo autosufficiente nei PDF)
// Dimensione: 256x256 JPEG, ~16 KB
const LOGO_BASE64 = "data:image/jpeg;base64,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";

// ========== COMPONENTE PRINCIPALE ==========
export default function GestioneTavoliSagra() {
  const { user, logout } = useAuth();
  const solaLettura = user?.role === 'operator';
  const noConfig = solaLettura || user?.role === 'prenotazioni';

  const [date, setDate] = useState([]);
  // Mappa { dataIso: { pranzo: boolean, cena: boolean } } - quali fasce sono abilitate per ciascuna data
  const [fasceAttivePerData, setFasceAttivePerData] = useState({});
  const [sessioni, setSessioni] = useState({});
  const [sessioneAttiva, setSessioneAttiva] = useState(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [historyAssegnazioni, setHistoryAssegnazioni] = useState([]);
  const [statoSalvataggio, setStatoSalvataggio] = useState(null); // null | 'saving' | 'saved' | 'error'
  const [syncToast, setSyncToast] = useState(false);
  const knownVersion = useRef(null);
  const syncToastTimer = useRef(null);
  const saveTimer = useRef(null);
  const savedTimer = useRef(null);

  // Carica stato dal server al mount e acquisisce la versione iniziale
  useEffect(() => {
    api.get('/state').then(res => {
      const d = res.data;
      if (d.date) setDate(d.date);
      if (d.fasceAttivePerData) setFasceAttivePerData(d.fasceAttivePerData);
      if (d.sessioni) setSessioni(d.sessioni);
      if (d.sessioneAttiva) setSessioneAttiva(d.sessioneAttiva);
      return api.get('/state/version');
    }).then(res => {
      if (res?.data?.version) knownVersion.current = res.data.version;
    }).catch(() => {}).finally(() => setApiLoaded(true));
  }, []);

  // Salva stato sul server con debounce 1s
  useEffect(() => {
    if (!apiLoaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setStatoSalvataggio('saving');
    saveTimer.current = setTimeout(() => {
      api.put('/state', { date, fasceAttivePerData, sessioni, sessioneAttiva })
        .then((res) => {
          if (res.data.version) knownVersion.current = res.data.version;
          setStatoSalvataggio('saved');
          if (savedTimer.current) clearTimeout(savedTimer.current);
          savedTimer.current = setTimeout(() => setStatoSalvataggio(null), 2000);
        })
        .catch(() => setStatoSalvataggio('error'));
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [date, fasceAttivePerData, sessioni, sessioneAttiva, apiLoaded]);

  // Polling real-time: ogni 5 secondi controlla se altri utenti hanno modificato lo stato
  useEffect(() => {
    if (!apiLoaded) return;
    const interval = setInterval(() => {
      if (statoSalvataggio === 'saving') return;
      api.get('/state/version').then(res => {
        const serverVersion = res.data.version;
        if (!serverVersion) return;
        if (knownVersion.current === null) {
          knownVersion.current = serverVersion;
          return;
        }
        if (serverVersion !== knownVersion.current) {
          knownVersion.current = serverVersion;
          api.get('/state').then(r => {
            const d = r.data;
            if (d.date) setDate(d.date);
            if (d.fasceAttivePerData) setFasceAttivePerData(d.fasceAttivePerData);
            if (d.sessioni) setSessioni(d.sessioni);
            if (d.sessioneAttiva) setSessioneAttiva(d.sessioneAttiva);
            setSyncToast(true);
            if (syncToastTimer.current) clearTimeout(syncToastTimer.current);
            syncToastTimer.current = setTimeout(() => setSyncToast(false), 3000);
          }).catch(() => {});
        }
      }).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [apiLoaded, statoSalvataggio]);

  const [tab, setTab] = useState('gruppi');
  const [gruppoSelezionato, setGruppoSelezionato] = useState(null);
  const [modalConferma, setModalConferma] = useState(null);
  const [editingGruppo, setEditingGruppo] = useState(null);
  const [nuovoGruppo, setNuovoGruppo] = useState({ cognome: '', persone: '', telefono: '', note: '', piatti: {} });
  const [nuovaData, setNuovaData] = useState('');
  const [modalCopia, setModalCopia] = useState(false);
  const [copiaDestinazione, setCopiaDestinazione] = useState('');
  const [dettaglioTavolo, setDettaglioTavolo] = useState(null);
  const [feedbackAssegnazione, setFeedbackAssegnazione] = useState(null);
  const [nuovoPiatto, setNuovoPiatto] = useState('');
  const [sceltaPosti, setSceltaPosti] = useState(null); // { tavoloId, groupId, disp, daAss, valore }
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [cercaGruppo, setCercaGruppo] = useState('');
  const [cercaLayout, setCercaLayout] = useState('');
  const [ordinamento, setOrdinamento] = useState({ colonna: null, direzione: 'asc' });

  const toggleOrdinamento = (colonna) => {
    setOrdinamento(prev =>
      prev.colonna === colonna
        ? { colonna, direzione: prev.direzione === 'asc' ? 'desc' : 'asc' }
        : { colonna, direzione: 'asc' }
    );
  };
  const [modalAdmin, setModalAdmin] = useState(null); // { pendingAction: fn, errore: string, input: string }

  // Gate delle azioni admin: admin e tavoli eseguono direttamente, altri inseriscono PIN
  const richiediAdmin = (azione) => {
    if (adminUnlocked || user?.role === 'admin' || user?.role === 'tavoli') { azione(); return; }
    setModalAdmin({ pendingAction: azione, errore: '', input: '' });
  };

  const confermaAdmin = async () => {
    if (!modalAdmin) return;
    try {
      const res = await api.post('/auth/verify-pin', { pin: modalAdmin.input });
      if (res.data.valid) {
        setAdminUnlocked(true);
        const azione = modalAdmin.pendingAction;
        setModalAdmin(null);
        if (azione) azione();
      }
    } catch {
      setModalAdmin({ ...modalAdmin, errore: 'PIN non valido', input: '' });
    }
  };

  const bloccaAdmin = () => {
    setAdminUnlocked(false);
    // Se era attivo il tab Configurazione, lo chiudo
    if (tab === 'config') setTab('gruppi');
  };

  // ========== HELPER ==========
  const sessionId = (data, fascia) => `${data}_${fascia}`;
  
  const getSessione = (sid) => {
    if (!sid) return { config: { ...DEFAULT_CONFIG }, gruppi: [], assegnazioni: {} };
    const s = sessioni[sid] || { config: { ...DEFAULT_CONFIG }, gruppi: [], assegnazioni: {} };
    // Retrocompat: garantisco che il campo menu esista
    if (!s.config.menu) s.config = { ...s.config, menu: [] };
    return s;
  };

  const updateSessione = (sid, updates) => {
    if (!sid) return;
    setSessioni(prev => ({
      ...prev,
      [sid]: { ...getSessione(sid), ...updates }
    }));
  };

  const sessione = getSessione(sessioneAttiva);
  const config = sessione.config;
  const gruppi = sessione.gruppi;
  const assegnazioni = sessione.assegnazioni;

  const formatData = (dataIso) => {
    if (!dataIso) return '';
    const d = new Date(dataIso + 'T12:00:00');
    return d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
  };
  
  const formatDataLunga = (dataIso) => {
    if (!dataIso) return '';
    const d = new Date(dataIso + 'T12:00:00');
    return d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getSessioneInfo = (sid) => {
    if (!sid) return null;
    const [dataIso, fasciaId] = sid.split('_');
    const fascia = FASCE.find(f => f.id === fasciaId);
    return { dataIso, fasciaId, fascia, label: `${formatData(dataIso)} - ${fascia?.label}` };
  };

  // Helper: una fascia è attiva per una data? (retrocompat: se non c'è il record,
  // assumo entrambe attive come nel comportamento legacy)
  const isFasciaAttiva = (dataIso, fasciaId) => {
    const rec = fasceAttivePerData[dataIso];
    if (!rec) return true;
    return rec[fasciaId] === true;
  };

  // ========== GESTIONE DATE ==========
  const aggiungiData = () => {
    if (!nuovaData) return;
    if (date.includes(nuovaData)) { alert('Data già inserita'); return; }
    if (date.length >= MAX_DATE) { alert(`Massimo ${MAX_DATE} date`); return; }
    const nuoveDate = [...date, nuovaData].sort();
    setDate(nuoveDate);
    // Default: solo cena attiva
    setFasceAttivePerData(prev => ({
      ...prev,
      [nuovaData]: { pranzo: false, cena: true },
    }));
    setNuovaData('');
    // Prima sessione attiva: la cena della nuova data
    if (date.length === 0) {
      setSessioneAttiva(sessionId(nuovaData, 'cena'));
    }
  };

  const rimuoviData = (dataDaRimuovere) => {
    const nuoveDate = date.filter(d => d !== dataDaRimuovere);
    setDate(nuoveDate);
    const nuoveSess = { ...sessioni };
    delete nuoveSess[sessionId(dataDaRimuovere, 'pranzo')];
    delete nuoveSess[sessionId(dataDaRimuovere, 'cena')];
    setSessioni(nuoveSess);
    setFasceAttivePerData(prev => {
      const copia = { ...prev };
      delete copia[dataDaRimuovere];
      return copia;
    });
    if (sessioneAttiva && sessioneAttiva.startsWith(dataDaRimuovere)) {
      // Trovo una sessione attiva successiva valida
      const prossima = nuoveDate.find(d => isFasciaAttiva(d, 'pranzo') || isFasciaAttiva(d, 'cena'));
      if (prossima) {
        const fasciaPref = isFasciaAttiva(prossima, 'cena') ? 'cena' : 'pranzo';
        setSessioneAttiva(sessionId(prossima, fasciaPref));
      } else {
        setSessioneAttiva(null);
      }
    }
  };

  // Toggle di una fascia oraria per una data.
  // Se sta per essere disattivata e ci sono gruppi, apre un modal di conferma.
  const toggleFascia = (dataIso, fasciaId) => {
    const correntemente = isFasciaAttiva(dataIso, fasciaId);
    if (correntemente) {
      // Sto disattivando
      const sid = sessionId(dataIso, fasciaId);
      const sess = sessioni[sid];
      const numGruppi = sess ? sess.gruppi.length : 0;
      if (numGruppi > 0) {
        // Chiedo conferma
        const fasciaLabel = FASCE.find(f => f.id === fasciaId)?.label || fasciaId;
        setModalConferma({
          tipo: 'disattiva-fascia',
          dataIso,
          fasciaId,
          numGruppi,
          dataLabel: formatDataLunga(dataIso),
          fasciaLabel,
        });
        return;
      }
      // Controllo: non posso disattivare entrambe le fasce di una data
      const altraFascia = fasciaId === 'pranzo' ? 'cena' : 'pranzo';
      if (!isFasciaAttiva(dataIso, altraFascia)) {
        mostraFeedback('warn', `Non puoi disattivare entrambe le fasce. Attiva prima l'altra o elimina la data.`);
        return;
      }
      // Nessun gruppo: disattivo direttamente e pulisco la sessione vuota
      applicaDisattivaFascia(dataIso, fasciaId);
    } else {
      // Sto attivando
      setFasceAttivePerData(prev => ({
        ...prev,
        [dataIso]: { ...(prev[dataIso] || { pranzo: false, cena: false }), [fasciaId]: true },
      }));
    }
  };

  // Applica la disattivazione (usata sia per il caso senza gruppi sia dopo conferma)
  const applicaDisattivaFascia = (dataIso, fasciaId) => {
    const sid = sessionId(dataIso, fasciaId);
    setFasceAttivePerData(prev => ({
      ...prev,
      [dataIso]: { ...(prev[dataIso] || { pranzo: true, cena: true }), [fasciaId]: false },
    }));
    setSessioni(prev => {
      const copia = { ...prev };
      delete copia[sid];
      return copia;
    });
    // Se era la sessione attiva, sposto su un'altra sessione valida
    if (sessioneAttiva === sid) {
      const altraFascia = fasciaId === 'pranzo' ? 'cena' : 'pranzo';
      if (isFasciaAttiva(dataIso, altraFascia)) {
        setSessioneAttiva(sessionId(dataIso, altraFascia));
      } else {
        const prossima = date.find(d => d !== dataIso && (isFasciaAttiva(d, 'pranzo') || isFasciaAttiva(d, 'cena')));
        if (prossima) {
          const fasciaPref = isFasciaAttiva(prossima, 'cena') ? 'cena' : 'pranzo';
          setSessioneAttiva(sessionId(prossima, fasciaPref));
        } else {
          setSessioneAttiva(null);
        }
      }
    }
  };

  // ========== GESTIONE GRUPPI ==========
  const aggiungiGruppo = () => {
    if (!nuovoGruppo.cognome || !nuovoGruppo.persone || !sessioneAttiva) return;
    // Pulisco i piatti con quantità 0 o vuote
    const piattiPuliti = {};
    Object.entries(nuovoGruppo.piatti || {}).forEach(([pid, qta]) => {
      const n = Number(qta);
      if (n > 0) piattiPuliti[pid] = n;
    });
    const newG = {
      id: Date.now(),
      cognome: nuovoGruppo.cognome,
      persone: Number(nuovoGruppo.persone),
      telefono: nuovoGruppo.telefono,
      note: nuovoGruppo.note,
      piatti: piattiPuliti,
    };
    updateSessione(sessioneAttiva, { gruppi: [...gruppi, newG] });
    setNuovoGruppo({ cognome: '', persone: '', telefono: '', note: '', piatti: {} });
  };

  // Helper: ritorna la quantità di un piatto prenotata da un gruppo (0 se assente)
  const getPiattoGruppo = (gruppo, piattoId) => {
    if (!gruppo.piatti) return 0;
    return Number(gruppo.piatti[piattoId] || 0);
  };

  // Aggiorna la quantità di un piatto per un gruppo esistente
  const aggiornaPiattoGruppo = (gruppoId, piattoId, quantita) => {
    const n = Math.max(0, Number(quantita) || 0);
    const nuoviGruppi = gruppi.map(g => {
      if (g.id !== gruppoId) return g;
      const piatti = { ...(g.piatti || {}) };
      if (n === 0) delete piatti[piattoId];
      else piatti[piattoId] = n;
      return { ...g, piatti };
    });
    updateSessione(sessioneAttiva, { gruppi: nuoviGruppi });
  };

  // ========== GESTIONE MENU ==========
  const aggiungiPiatto = () => {
    if (!nuovoPiatto.trim() || !sessioneAttiva) return;
    const menu = config.menu || [];
    const piatto = { id: `piatto_${Date.now()}`, nome: nuovoPiatto.trim() };
    updateSessione(sessioneAttiva, {
      config: { ...config, menu: [...menu, piatto] }
    });
    setNuovoPiatto('');
  };

  const rimuoviPiatto = (piattoId) => {
    const menu = (config.menu || []).filter(p => p.id !== piattoId);
    // Rimuovo il piatto anche da tutti i gruppi che lo avevano prenotato
    const nuoviGruppi = gruppi.map(g => {
      if (!g.piatti || !g.piatti[piattoId]) return g;
      const piatti = { ...g.piatti };
      delete piatti[piattoId];
      return { ...g, piatti };
    });
    updateSessione(sessioneAttiva, {
      config: { ...config, menu },
      gruppi: nuoviGruppi,
    });
  };

  const rinominaPiatto = (piattoId, nuovoNome) => {
    const menu = (config.menu || []).map(p =>
      p.id === piattoId ? { ...p, nome: nuovoNome } : p
    );
    updateSessione(sessioneAttiva, { config: { ...config, menu } });
  };

  // Totali piatti per la sessione (quante porzioni in totale per ogni piatto)
  const totaliPiatti = useMemo(() => {
    const totali = {};
    (config.menu || []).forEach(p => { totali[p.id] = 0; });
    gruppi.forEach(g => {
      Object.entries(g.piatti || {}).forEach(([pid, qta]) => {
        if (totali[pid] !== undefined) totali[pid] += Number(qta);
      });
    });
    return totali;
  }, [gruppi, config.menu]);

  const rimuoviGruppo = (id) => {
    if (user?.role === 'prenotazioni') return;
    const nuoviGruppi = gruppi.filter(g => g.id !== id);
    const nuoveAss = {};
    Object.entries(assegnazioni).forEach(([tav, arr]) => {
      const filtered = arr.filter(a => a.groupId !== id);
      if (filtered.length > 0) nuoveAss[tav] = filtered;
    });
    updateSessione(sessioneAttiva, { gruppi: nuoviGruppi, assegnazioni: nuoveAss });
  };

  const aggiornaGruppo = (id, field, value) => {
    const nuoviGruppi = gruppi.map(g => g.id === id ? { ...g, [field]: field === 'persone' ? Number(value) : value } : g);
    updateSessione(sessioneAttiva, { gruppi: nuoviGruppi });
  };

  // ========== TAVOLI ==========
  const tavoli = useMemo(() => {
    const list = [];
    config.fileAttive.forEach(fila => {
      const n = config.tavoliPerFila[fila];
      if (!n || n <= 0) return;
      for (let i = 1; i <= n; i++) {
        list.push({ id: `${fila}-${i}`, fila, numero: i });
      }
    });
    return list;
  }, [config]);

  const postiOccupati = (tavoloId) => {
    const ass = assegnazioni[tavoloId] || [];
    return ass.reduce((sum, a) => sum + a.posti, 0);
  };

  const personeAssegnate = (groupId) => {
    let tot = 0;
    Object.values(assegnazioni).forEach(arr => {
      arr.forEach(a => { if (a.groupId === groupId) tot += a.posti; });
    });
    return tot;
  };

  const stats = useMemo(() => {
    const totalePosti = tavoli.length * config.postiPerTavolo;
    const postiAssegnati = Object.values(assegnazioni).reduce(
      (sum, arr) => sum + arr.reduce((s, a) => s + a.posti, 0), 0
    );
    const totalePersone = gruppi.reduce((sum, g) => sum + Number(g.persone), 0);
    const gruppiAssegnati = gruppi.filter(g => personeAssegnate(g.id) === g.persone).length;
    return { totalePosti, postiAssegnati, totalePersone, gruppiAssegnati, gruppiNonAssegnati: gruppi.length - gruppiAssegnati };
  }, [assegnazioni, gruppi, tavoli, config]);

  // ========== ASSEGNAZIONE AUTOMATICA ==========
  // Strategia: COMPATTA con gruppi uniti + PRESERVAZIONE delle assegnazioni manuali.
  // - Le assegnazioni già esistenti NON vengono toccate.
  // - Per ogni gruppo si considerano solo i posti ancora da collocare
  //   (persone totali - posti già assegnati manualmente).
  // - Gruppi ordinati: prima quelli con più posti RESIDUI da collocare
  //   (i piccoli riempiono i residui per ultimi).
  // - Per ogni gruppo si scorre la lista delle file nell'ordine (A, B, C, ...)
  // - Su ogni fila: si cerca un tavolo singolo che contenga tutti i posti residui;
  //   se manca, si distribuisce il gruppo su più tavoli della STESSA fila.
  //   Solo se la fila non ha spazio sufficiente si passa alla fila successiva.
  // - Come ultima risorsa (sala quasi piena) il gruppo può essere distribuito
  //   su più file.
  const assegnazioneAutomatica = () => {
    salvaHistory();
    const nuoveAss = {};
    Object.entries(assegnazioni).forEach(([tid, arr]) => {
      nuoveAss[tid] = arr.map(a => ({ ...a }));
    });

    // Calcolo i posti già occupati tavolo per tavolo (partendo dalle assegnazioni esistenti).
    const tavoliDisp = tavoli.map((t, idx) => {
      const occ = (nuoveAss[t.id] || []).reduce((s, a) => s + a.posti, 0);
      return { ...t, occupati: occ, indice: idx };
    });

    // Calcolo i posti residui da assegnare per ciascun gruppo.
    const gruppiDaAssegnare = gruppi
      .map(g => ({ gruppo: g, residui: g.persone - personeAssegnate(g.id) }))
      .filter(x => x.residui > 0)
      .sort((a, b) => b.residui - a.residui);

    if (gruppiDaAssegnare.length === 0) {
      mostraFeedback('info', 'Tutti i gruppi sono già completamente assegnati. Nulla da fare.');
      return;
    }

    const tavoliPerFila = () => {
      const map = {};
      tavoliDisp.forEach(t => {
        if (!map[t.fila]) map[t.fila] = [];
        map[t.fila].push(t);
      });
      return map;
    };

    // Prova a piazzare `persone` su una SINGOLA fila, rispettando l'unità del gruppo
    // (prima cerca un tavolo che contenga tutti, altrimenti distribuisce sui tavoli
    // della stessa fila). Ritorna null se la fila non ha spazio sufficiente.
    const piazzaSuFila = (tavoliFila, persone) => {
      const singolo = tavoliFila.find(t => (config.postiPerTavolo - t.occupati) >= persone);
      if (singolo) return [{ tavolo: singolo, posti: persone }];
      const spazioTot = tavoliFila.reduce((s, t) => s + (config.postiPerTavolo - t.occupati), 0);
      if (spazioTot < persone) return null;
      const ass = [];
      let rimasti = persone;
      for (const t of tavoliFila) {
        if (rimasti <= 0) break;
        const disp = config.postiPerTavolo - t.occupati;
        if (disp > 0) {
          const qty = Math.min(disp, rimasti);
          ass.push({ tavolo: t, posti: qty });
          rimasti -= qty;
        }
      }
      return rimasti === 0 ? ass : null;
    };

    // Aggiunge posti al tavolo: se il gruppo è già presente (assegnazione parziale
    // manuale sullo stesso tavolo), somma i posti invece di creare una riga duplicata.
    const applica = (gruppo, ass) => {
      ass.forEach(({ tavolo, posti }) => {
        if (!nuoveAss[tavolo.id]) nuoveAss[tavolo.id] = [];
        const existing = nuoveAss[tavolo.id].find(a => a.groupId === gruppo.id);
        if (existing) existing.posti += posti;
        else nuoveAss[tavolo.id].push({ groupId: gruppo.id, posti });
        tavolo.occupati += posti;
      });
    };

    const mappaFile = tavoliPerFila();
    const fileOrdinate = Object.keys(mappaFile);

    let gruppiPiazzati = 0;
    let gruppiSpezzatiSuPiuFile = 0;
    let gruppiNonPiazzati = 0;

    for (const { gruppo, residui } of gruppiDaAssegnare) {
      let piazzato = false;
      let spezzato = false;
      // Tenta fila per fila, in ordine (A, B, C, ...): se il gruppo sta intero
      // su una fila (anche distribuito su più tavoli adiacenti) si ferma lì.
      for (const fila of fileOrdinate) {
        const assFila = piazzaSuFila(mappaFile[fila], residui);
        if (assFila) {
          applica(gruppo, assFila);
          piazzato = true;
          if (assFila.length > 1) spezzato = true;
          break;
        }
      }
      // Fallback: nessuna fila ha abbastanza spazio da sola → si distribuisce
      // su più file (sala quasi satura).
      if (!piazzato) {
        let rim = residui;
        for (const t of tavoliDisp) {
          if (rim <= 0) break;
          const disp = config.postiPerTavolo - t.occupati;
          if (disp > 0) {
            const qty = Math.min(disp, rim);
            if (!nuoveAss[t.id]) nuoveAss[t.id] = [];
            const existing = nuoveAss[t.id].find(a => a.groupId === gruppo.id);
            if (existing) existing.posti += qty;
            else nuoveAss[t.id].push({ groupId: gruppo.id, posti: qty });
            t.occupati += qty;
            rim -= qty;
          }
        }
        if (rim === 0) { piazzato = true; spezzato = true; gruppiSpezzatiSuPiuFile++; }
        else gruppiNonPiazzati++;
      }
      if (piazzato) gruppiPiazzati++;
    }

    updateSessione(sessioneAttiva, { assegnazioni: nuoveAss });

    // Feedback di riepilogo
    const parts = [`${gruppiPiazzati} ${gruppiPiazzati === 1 ? 'gruppo piazzato' : 'gruppi piazzati'}`];
    if (gruppiSpezzatiSuPiuFile > 0) parts.push(`${gruppiSpezzatiSuPiuFile} su più file (sala quasi piena)`);
    if (gruppiNonPiazzati > 0) parts.push(`⚠️ ${gruppiNonPiazzati} NON piazzati (spazio insufficiente)`);
    mostraFeedback(
      gruppiNonPiazzati > 0 ? 'warn' : 'success',
      `Assegnazione automatica completata. ${parts.join(' · ')}. Le assegnazioni manuali sono state preservate.`
    );
  };

  const salvaHistory = () => {
    setHistoryAssegnazioni(prev => [...prev.slice(-19), JSON.parse(JSON.stringify(assegnazioni))]);
  };

  const annullaUltimaOperazione = () => {
    if (historyAssegnazioni.length === 0) return;
    const precedente = historyAssegnazioni[historyAssegnazioni.length - 1];
    setHistoryAssegnazioni(prev => prev.slice(0, -1));
    updateSessione(sessioneAttiva, { assegnazioni: precedente });
  };

  const resetAssegnazioni = () => {
    salvaHistory();
    updateSessione(sessioneAttiva, { assegnazioni: {} });
    setModalConferma(null);
  };

  const mostraFeedback = (tipo, messaggio) => {
    setFeedbackAssegnazione({ tipo, messaggio });
    // auto-dismiss dopo 4 secondi
    setTimeout(() => {
      setFeedbackAssegnazione(prev => (prev && prev.messaggio === messaggio ? null : prev));
    }, 4000);
  };

  // Esegue effettivamente l'assegnazione di `qty` posti del gruppo al tavolo.
  // Gestisce anche il feedback finale.
  const eseguiAssegnazione = (tavoloId, groupId, qty) => {
    const gruppo = gruppi.find(g => g.id === groupId);
    if (!gruppo || qty <= 0) return;
    const giaAss = personeAssegnate(groupId);
    const daAss = gruppo.persone - giaAss;
    salvaHistory();
    const newAss = { ...assegnazioni };
    if (!newAss[tavoloId]) newAss[tavoloId] = [];
    const existing = newAss[tavoloId].find(a => a.groupId === groupId);
    if (existing) existing.posti += qty;
    else newAss[tavoloId] = [...newAss[tavoloId], { groupId, posti: qty }];
    updateSessione(sessioneAttiva, { assegnazioni: newAss });

    const rimasti = daAss - qty;
    if (rimasti === 0) {
      mostraFeedback('success', `✅ ${gruppo.cognome} completamente assegnato (${qty} ${qty === 1 ? 'posto' : 'posti'} su tavolo ${tavoloId}).`);
    } else {
      mostraFeedback('info', `➕ ${qty} ${qty === 1 ? 'posto' : 'posti'} di ${gruppo.cognome} su tavolo ${tavoloId}. Restano ${rimasti} ${rimasti === 1 ? 'persona' : 'persone'} da collocare — clicca un altro tavolo.`);
    }
  };

  const handleSessioneChange = (sid) => {
    setSessioneAttiva(sid);
    setHistoryAssegnazioni([]);
    setCercaGruppo('');
    setCercaLayout('');
  };

  const handleTavoloClick = (tavoloId) => {
    if (noConfig) {
      setDettaglioTavolo(tavoloId);
      return;
    }
    if (!gruppoSelezionato) {
      // Nessun gruppo selezionato → apro popup dettagli
      setDettaglioTavolo(tavoloId);
      return;
    }
    const gruppo = gruppi.find(g => g.id === gruppoSelezionato);
    if (!gruppo) return;
    const giaAss = personeAssegnate(gruppoSelezionato);
    const daAss = gruppo.persone - giaAss;
    if (daAss <= 0) {
      mostraFeedback('warn', `Il gruppo ${gruppo.cognome} è già completamente assegnato.`);
      return;
    }
    const occ = postiOccupati(tavoloId);
    const disp = config.postiPerTavolo - occ;
    if (disp <= 0) {
      mostraFeedback('warn', `Tavolo ${tavoloId} pieno. Scegli un altro tavolo con posti liberi.`);
      return;
    }
    // Se il gruppo entra TUTTO nel tavolo (disp >= daAss) → assegnazione diretta
    if (disp >= daAss) {
      eseguiAssegnazione(tavoloId, gruppoSelezionato, daAss);
      return;
    }
    // Altrimenti c'è ambiguità: disp < daAss. Il massimo è disp.
    // Chiedo quanti posti mettere qui.
    setSceltaPosti({
      tavoloId,
      groupId: gruppoSelezionato,
      disp,         // max posti liberi su questo tavolo
      daAss,        // persone ancora da collocare del gruppo
      valore: disp, // default: riempi il tavolo
    });
  };

  const rimuoviAssegnazione = (tavoloId, groupId) => {
    salvaHistory();
    const newAss = { ...assegnazioni };
    newAss[tavoloId] = newAss[tavoloId].filter(a => a.groupId !== groupId);
    if (newAss[tavoloId].length === 0) delete newAss[tavoloId];
    updateSessione(sessioneAttiva, { assegnazioni: newAss });
  };

  // ========== CONFIG ==========
  const updateTavoliPerFila = (fila, numero) => {
    const n = Math.max(0, Math.min(20, Number(numero) || 0));
    updateSessione(sessioneAttiva, {
      config: { ...config, tavoliPerFila: { ...config.tavoliPerFila, [fila]: n } }
    });
  };

  // ========== COPIA SESSIONE ==========
  const copiaSessione = () => {
    if (!copiaDestinazione || !sessioneAttiva) return;
    const src = getSessione(sessioneAttiva);
    // Copia config + gruppi (nuovi ID) + assegnazioni (aggiornate con nuovi ID)
    const mapIds = {};
    const nuoviGruppi = src.gruppi.map(g => {
      const newId = Date.now() + Math.random();
      mapIds[g.id] = newId;
      return { ...g, id: newId, piatti: { ...(g.piatti || {}) } };
    });
    const nuoveAss = {};
    Object.entries(src.assegnazioni).forEach(([tav, arr]) => {
      nuoveAss[tav] = arr.map(a => ({ ...a, groupId: mapIds[a.groupId] }));
    });
    setSessioni(prev => ({
      ...prev,
      [copiaDestinazione]: {
        config: JSON.parse(JSON.stringify(src.config)),
        gruppi: nuoviGruppi,
        assegnazioni: nuoveAss,
      }
    }));
    setModalCopia(false);
    setCopiaDestinazione('');
    setSessioneAttiva(copiaDestinazione);
  };

  // ========== EXPORT PDF ==========
  const esportaPDF = () => {
    if (!sessioneAttiva) return;
    const info = getSessioneInfo(sessioneAttiva);
    const printWindow = window.open('', '_blank');
    
    let htmlTavoli = '';
    const tavoliConPersone = tavoli.filter(t => assegnazioni[t.id] && assegnazioni[t.id].length > 0);
    
    tavoliConPersone.forEach(t => {
      const ass = assegnazioni[t.id];
      const righe = ass.map(a => {
        const g = gruppi.find(gr => gr.id === a.groupId);
        if (!g) return '';
        const piattiG = Object.entries(g.piatti || {}).filter(([, q]) => Number(q) > 0);
        const piattiStr = piattiG.length === 0 ? '-' : piattiG.map(([pid, q]) => {
          const p = (config.menu || []).find(x => x.id === pid);
          return `${q}× ${p ? p.nome : '?'}`;
        }).join(', ');
        return `<tr>
          <td>${g.cognome}</td>
          <td style="text-align:center">${a.posti}</td>
          <td>${g.telefono || '-'}</td>
          <td>${g.note || '-'}</td>
          <td>${piattiStr}</td>
        </tr>`;
      }).join('');
      const totPosti = ass.reduce((s, a) => s + a.posti, 0);
      htmlTavoli += `
        <div class="tavolo-box">
          <h3>Tavolo ${t.id} <span class="posti-info">(${totPosti}/${config.postiPerTavolo} posti)</span></h3>
          <table>
            <thead><tr><th>Cognome</th><th>N°</th><th>Telefono</th><th>Note</th><th>Piatti</th></tr></thead>
            <tbody>${righe}</tbody>
          </table>
        </div>
      `;
    });

    // Riepilogo totali piatti (per la cucina)
    let htmlRiepilogoPiatti = '';
    const menu = config.menu || [];
    if (menu.length > 0) {
      const righePiatti = menu.map(p => {
        const tot = totaliPiatti[p.id] || 0;
        return `<tr><td>${p.nome}</td><td style="text-align:center;font-weight:bold">${tot}</td></tr>`;
      }).join('');
      const totGenerale = menu.reduce((s, p) => s + (totaliPiatti[p.id] || 0), 0);
      htmlRiepilogoPiatti = `
        <div class="tavolo-box">
          <h3>🍽️ Riepilogo Piatti (per la cucina)</h3>
          <table>
            <thead><tr><th>Piatto</th><th style="text-align:center">Porzioni</th></tr></thead>
            <tbody>${righePiatti}<tr style="background:#fdf6e3;font-weight:bold"><td>TOTALE</td><td style="text-align:center">${totGenerale}</td></tr></tbody>
          </table>
        </div>
      `;
    }

    let piantaHTML = '<div class="pianta">';
    config.fileAttive.forEach(fila => {
      const n = config.tavoliPerFila[fila];
      piantaHTML += `<div class="fila"><div class="fila-label">Fila ${fila}</div>`;
      for (let i = 1; i <= n; i++) {
        const tid = `${fila}-${i}`;
        const ass = assegnazioni[tid] || [];
        const occ = ass.reduce((s, a) => s + a.posti, 0);
        const nomi = ass.map(a => gruppi.find(g => g.id === a.groupId)?.cognome).filter(Boolean).join(', ');
        const classe = occ === config.postiPerTavolo ? 'pieno' : occ > 0 ? 'parziale' : 'vuoto';
        piantaHTML += `
          <div class="tavolo ${classe}">
            <div class="tavolo-id">${tid}</div>
            <div class="tavolo-nomi">${nomi || '<em>vuoto</em>'}</div>
            <div class="tavolo-posti">${occ}/${config.postiPerTavolo}</div>
          </div>
        `;
      }
      piantaHTML += '</div>';
    });
    piantaHTML += '</div>';

    const html = `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>Proloco Dairago - ${info.label}</title>
      <style>
        @page { size: A4 portrait; margin: 1cm; }
        body { font-family: Georgia, serif; color: #2a1810; margin: 0; padding: 0; font-size: 13px; }
        h1 { text-align: center; border-bottom: 3px double #8b4513; padding-bottom: 10px; color: #8b4513; font-size: 22px; }
        h2 { color: #8b4513; border-bottom: 1px solid #d4a574; padding-bottom: 5px; margin-top: 25px; font-size: 17px; }
        .header-info { text-align: center; color: #666; margin-bottom: 15px; font-style: italic; font-size: 15px; }
        .stats { display: flex; justify-content: space-around; background: #fdf6e3; padding: 12px; border: 1px solid #d4a574; margin-bottom: 15px; }
        .stat { text-align: center; }
        .stat-num { font-size: 26px; font-weight: bold; color: #8b4513; }
        .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #8b4513; color: white; padding: 7px 8px; text-align: left; font-size: 13px; }
        td { border-bottom: 1px solid #ddd; padding: 6px 8px; font-size: 13px; }
        .tavolo-box { margin-bottom: 15px; page-break-inside: avoid; }
        .tavolo-box h3 { background: #fdf6e3; padding: 7px 12px; margin: 0 0 5px 0; border-left: 4px solid #8b4513; font-size: 15px; }
        .posti-info { font-weight: normal; color: #666; font-size: 13px; }
        .pianta { margin-top: 15px; }
        .fila { display: flex; align-items: stretch; gap: 5px; margin-bottom: 8px; }
        .fila-label { font-weight: bold; width: 55px; color: #8b4513; display:flex; align-items:center; justify-content:center; font-size: 16px; }
        .tavolo { flex: 1; border: 2px solid #8b4513; padding: 5px 3px; min-height: 70px; font-size: 11px; text-align: center; border-radius: 4px; display:flex; flex-direction:column; justify-content:center; gap:2px; }
        .tavolo.pieno { background: #d4a574; }
        .tavolo.parziale { background: #fdf6e3; }
        .tavolo.vuoto { background: #fff; color: #999; }
        .tavolo-id { font-weight: bold; font-size: 12px; }
        .tavolo-nomi { font-size: 11px; margin: 2px 0; line-height: 1.3; word-break: break-word; }
        .tavolo-posti { font-size: 11px; color: #555; font-weight: bold; }
        .palco { background: #2a1810; color: #fdf6e3; text-align: center; padding: 10px; margin-top: 10px; font-weight: bold; letter-spacing: 3px; }
        .page-break { page-break-after: always; }
        @media print { .no-print { display: none; } }
      </style></head>
      <body>
        <h1 style="display:flex;align-items:center;justify-content:center;gap:15px;">
          <img src="${LOGO_BASE64}" alt="Proloco Dairago" style="width:60px;height:60px;border-radius:6px;" />
          <span>Proloco Dairago</span>
        </h1>
        <div class="header-info">${formatDataLunga(info.dataIso)} — ${info.fascia.label}</div>
        <div class="stats">
          <div class="stat"><div class="stat-num">${stats.totalePersone}</div><div class="stat-label">Persone</div></div>
          <div class="stat"><div class="stat-num">${gruppi.length}</div><div class="stat-label">Gruppi</div></div>
          <div class="stat"><div class="stat-num">${tavoli.length}</div><div class="stat-label">Tavoli</div></div>
          <div class="stat"><div class="stat-num">${stats.postiAssegnati}/${stats.totalePosti}</div><div class="stat-label">Posti usati</div></div>
        </div>
        <h2>📋 Pianta dei Tavoli</h2>
        ${piantaHTML}
        <div class="page-break"></div>
        <h2>📝 Elenco per Tavolo</h2>
        ${htmlTavoli || '<p><em>Nessun tavolo ancora assegnato.</em></p>'}
        ${htmlRiepilogoPiatti ? `<div class="page-break"></div><h2>🍽️ Totali Piatti</h2>${htmlRiepilogoPiatti}` : ''}
        <div class="no-print" style="text-align:center; margin-top:30px;">
          <button onclick="window.print()" style="padding:10px 30px; font-size:16px; cursor:pointer; background:#8b4513; color:white; border:none; border-radius:4px;">🖨️ Stampa / Salva PDF</button>
        </div>
      </body></html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Export PDF TUTTE le sessioni
  const esportaPDFTutte = () => {
    if (date.length === 0) return;
    const printWindow = window.open('', '_blank');
    let contenuto = '';
    
    date.forEach(dataIso => {
      FASCE.forEach(fascia => {
        if (!isFasciaAttiva(dataIso, fascia.id)) return;
        const sid = sessionId(dataIso, fascia.id);
        const sess = sessioni[sid];
        if (!sess || (sess.gruppi.length === 0)) return;
        
        const tavoliSess = [];
        sess.config.fileAttive.forEach(f => {
          for (let i = 1; i <= sess.config.tavoliPerFila[f]; i++) tavoliSess.push({ id: `${f}-${i}`, fila: f, numero: i });
        });
        
        const pers = sess.gruppi.reduce((s, g) => s + Number(g.persone), 0);
        
        let piantaHTML = '<div class="pianta">';
        sess.config.fileAttive.forEach(f => {
          piantaHTML += `<div class="fila"><div class="fila-label">Fila ${f}</div>`;
          for (let i = 1; i <= sess.config.tavoliPerFila[f]; i++) {
            const tid = `${f}-${i}`;
            const ass = sess.assegnazioni[tid] || [];
            const occ = ass.reduce((s, a) => s + a.posti, 0);
            const nomi = ass.map(a => sess.gruppi.find(g => g.id === a.groupId)?.cognome).filter(Boolean).join(', ');
            const classe = occ === sess.config.postiPerTavolo ? 'pieno' : occ > 0 ? 'parziale' : 'vuoto';
            piantaHTML += `<div class="tavolo ${classe}"><div class="tavolo-id">${tid}</div><div class="tavolo-nomi">${nomi || '<em>vuoto</em>'}</div><div class="tavolo-posti">${occ}/${sess.config.postiPerTavolo}</div></div>`;
          }
          piantaHTML += '</div>';
        });
        piantaHTML += '</div>';
        
        let htmlTavoli = '';
        const menuSess = sess.config.menu || [];
        tavoliSess.filter(t => sess.assegnazioni[t.id]).forEach(t => {
          const ass = sess.assegnazioni[t.id];
          const righe = ass.map(a => {
            const g = sess.gruppi.find(gr => gr.id === a.groupId);
            if (!g) return '';
            const piattiG = Object.entries(g.piatti || {}).filter(([, q]) => Number(q) > 0);
            const piattiStr = piattiG.length === 0 ? '-' : piattiG.map(([pid, q]) => {
              const p = menuSess.find(x => x.id === pid);
              return `${q}× ${p ? p.nome : '?'}`;
            }).join(', ');
            return `<tr><td>${g.cognome}</td><td style="text-align:center">${a.posti}</td><td>${g.telefono || '-'}</td><td>${g.note || '-'}</td><td>${piattiStr}</td></tr>`;
          }).join('');
          const tot = ass.reduce((s, a) => s + a.posti, 0);
          htmlTavoli += `<div class="tavolo-box"><h3>Tavolo ${t.id} <span class="posti-info">(${tot}/${sess.config.postiPerTavolo})</span></h3><table><thead><tr><th>Cognome</th><th>N°</th><th>Telefono</th><th>Note</th><th>Piatti</th></tr></thead><tbody>${righe}</tbody></table></div>`;
        });

        // Riepilogo piatti per questa sessione
        let htmlRiepilogoPiattiSess = '';
        if (menuSess.length > 0) {
          const totaliSess = {};
          menuSess.forEach(p => { totaliSess[p.id] = 0; });
          sess.gruppi.forEach(g => {
            Object.entries(g.piatti || {}).forEach(([pid, q]) => {
              if (totaliSess[pid] !== undefined) totaliSess[pid] += Number(q);
            });
          });
          const righePiatti = menuSess.map(p => `<tr><td>${p.nome}</td><td style="text-align:center;font-weight:bold">${totaliSess[p.id] || 0}</td></tr>`).join('');
          const totGenerale = menuSess.reduce((s, p) => s + (totaliSess[p.id] || 0), 0);
          htmlRiepilogoPiattiSess = `<div class="tavolo-box"><h3>🍽️ Riepilogo Piatti (per la cucina)</h3><table><thead><tr><th>Piatto</th><th style="text-align:center">Porzioni</th></tr></thead><tbody>${righePiatti}<tr style="background:#fdf6e3;font-weight:bold"><td>TOTALE</td><td style="text-align:center">${totGenerale}</td></tr></tbody></table></div>`;
        }

        contenuto += `
          <h1 style="display:flex;align-items:center;justify-content:center;gap:15px;">
            <img src="${LOGO_BASE64}" alt="Proloco Dairago" style="width:50px;height:50px;border-radius:5px;" />
            <span>${formatDataLunga(dataIso)} — ${fascia.label}</span>
          </h1>
          <div class="header-info">${sess.gruppi.length} gruppi - ${pers} persone</div>
          <h2>📋 Pianta</h2>${piantaHTML}
          <div class="page-break"></div>
          <h2>📝 Elenco per Tavolo</h2>${htmlTavoli || '<p><em>Nessun tavolo assegnato.</em></p>'}
          ${htmlRiepilogoPiattiSess ? `<h2>🍽️ Totali Piatti</h2>${htmlRiepilogoPiattiSess}` : ''}
          <div class="page-break"></div>
        `;
      });
    });

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Proloco Dairago - Tutte le sessioni</title>
      <style>
        @page { size: A4; margin: 1.5cm; }
        body { font-family: Georgia, serif; color: #2a1810; margin: 0; padding: 0; }
        h1 { text-align: center; border-bottom: 3px double #8b4513; padding-bottom: 10px; color: #8b4513; margin-top: 0; }
        h2 { color: #8b4513; border-bottom: 1px solid #d4a574; padding-bottom: 5px; margin-top: 20px; }
        .header-info { text-align: center; color: #666; margin-bottom: 20px; font-style: italic; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #8b4513; color: white; padding: 6px; text-align: left; }
        td { border-bottom: 1px solid #ddd; padding: 5px 6px; }
        .tavolo-box { margin-bottom: 15px; page-break-inside: avoid; }
        .tavolo-box h3 { background: #fdf6e3; padding: 6px 10px; margin: 0 0 5px 0; border-left: 4px solid #8b4513; font-size: 14px; }
        .posti-info { font-weight: normal; color: #666; font-size: 12px; }
        .pianta { margin-top: 20px; }
        .fila { display: flex; align-items: center; gap: 4px; margin-bottom: 8px; }
        .fila-label { font-weight: bold; width: 60px; color: #8b4513; }
        .tavolo { flex: 1; border: 1.5px solid #8b4513; padding: 4px; min-height: 50px; font-size: 9px; text-align: center; border-radius: 4px; }
        .tavolo.pieno { background: #d4a574; }
        .tavolo.parziale { background: #fdf6e3; }
        .tavolo.vuoto { background: #fff; color: #999; }
        .tavolo-id { font-weight: bold; font-size: 10px; }
        .tavolo-nomi { font-size: 8px; margin: 2px 0; }
        .tavolo-posti { font-size: 8px; color: #666; }
        .palco { background: #2a1810; color: #fdf6e3; text-align: center; padding: 10px; margin-top: 10px; font-weight: bold; letter-spacing: 3px; }
        .page-break { page-break-after: always; }
        @media print { .no-print { display: none; } }
      </style></head><body>
      ${contenuto || '<p>Nessuna sessione con prenotazioni.</p>'}
      <div class="no-print" style="text-align:center; margin-top:30px;">
        <button onclick="window.print()" style="padding:10px 30px; font-size:16px; cursor:pointer; background:#8b4513; color:white; border:none; border-radius:4px;">🖨️ Stampa / Salva PDF</button>
      </div></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Statistica generale per cruscotto date
  const statPerSessione = (sid) => {
    const s = sessioni[sid];
    if (!s) return { gruppi: 0, persone: 0 };
    return {
      gruppi: s.gruppi.length,
      persone: s.gruppi.reduce((sum, g) => sum + Number(g.persone), 0),
    };
  };

  // ========== RENDER ==========
  const tuttiSIds = date
    .flatMap(d => FASCE.filter(f => isFasciaAttiva(d, f.id)).map(f => sessionId(d, f.id)))
    .filter(s => s !== sessioneAttiva);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-6" style={{ fontFamily: 'Georgia, serif' }}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 text-center relative">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-2 flex items-center justify-center gap-3 flex-wrap">
            <img src={LOGO_BASE64} alt="Proloco Dairago" className="w-12 h-12 md:w-16 md:h-16 rounded-lg shadow-sm" />
            <span>Proloco Dairago</span>
          </h1>
          <p className="text-amber-700 italic">Gestione Tavoli e Prenotazioni</p>
          <p className="text-amber-600 text-xs mt-1">Creato da Trentarossi Luca</p>
          {/* Indicatore salvataggio */}
          {(statoSalvataggio || syncToast) && (
            <div className="absolute top-0 left-0 flex flex-col gap-1">
              {statoSalvataggio === 'saving' && (
                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="animate-spin inline-block w-3 h-3 border border-amber-600 border-t-transparent rounded-full"></span>
                  Salvataggio...
                </span>
              )}
              {statoSalvataggio === 'saved' && (
                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full flex items-center gap-1">
                  <Check size={12} /> Salvato
                </span>
              )}
              {statoSalvataggio === 'error' && (
                <span className="text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-full flex items-center gap-1">
                  <X size={12} /> Errore salvataggio
                </span>
              )}
              {syncToast && (
                <span className="text-xs text-sky-700 bg-sky-50 border border-sky-200 px-2 py-1 rounded-full flex items-center gap-1">
                  <RotateCcw size={12} /> Aggiornato da un altro utente
                </span>
              )}
            </div>
          )}

          {/* Indicatore modalità admin + utente loggato */}
          <div className="absolute top-0 right-0 flex flex-col items-end gap-1">
            {adminUnlocked ? (
              <button
                onClick={bloccaAdmin}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 shadow"
                title="Clicca per bloccare modalità admin"
              >
                🔓 Admin attivo · Blocca
              </button>
            ) : (
              <button
                onClick={() => setModalAdmin({ pendingAction: null, errore: '', input: '' })}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1"
                title="Accedi come admin"
              >
                🔒 Admin
              </button>
            )}
            <button
              onClick={logout}
              className="bg-red-100 hover:bg-red-200 text-red-700 text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1"
              title="Esci"
            >
              <LogOut size={12} />
              {user?.username}
            </button>
          </div>
        </header>

        {/* SELETTORE DATE */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-2 border-amber-300">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="text-amber-800" size={22} />
            <h2 className="text-lg font-bold text-amber-900">Date della Sagra ({date.length}/{MAX_DATE})</h2>
          </div>
          
          {/* Input nuova data */}
          {user?.role === 'admin' && (
          <div className="flex flex-wrap gap-2 mb-3">
            <input
              type="date"
              value={nuovaData}
              onChange={(e) => setNuovaData(e.target.value)}
              className="px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={() => richiediAdmin(aggiungiData)}
              disabled={!nuovaData || date.length >= MAX_DATE}
              className="bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white px-4 py-2 rounded font-semibold flex items-center gap-2"
            >
              <Plus size={18} /> Aggiungi Data
            </button>
          </div>
          )}

          {/* Lista date con fasce */}
          {date.length === 0 ? (
            <div className="text-center text-gray-500 italic py-4 bg-amber-50 rounded border border-dashed border-amber-300">
              Aggiungi una data per iniziare
            </div>
          ) : (
            <div className="space-y-2">
              {date.map(d => {
                const isPassata = new Date(d + 'T23:59:59') < new Date();
                const isOggi = new Date(d + 'T00:00:00').toDateString() === new Date().toDateString();
                return (
                <div key={d} className={`rounded-lg p-3 border ${
                  isOggi ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300' :
                  isPassata ? 'bg-gray-50 border-gray-200 opacity-60' :
                  'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className={isPassata && !isOggi ? 'text-gray-400' : 'text-amber-800'} />
                      <span className={`font-bold capitalize ${isPassata && !isOggi ? 'text-gray-400' : 'text-amber-900'}`}>
                        {formatDataLunga(d)}
                      </span>
                      {isOggi && <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">OGGI</span>}
                      {isPassata && !isOggi && <span className="text-xs bg-gray-300 text-gray-500 px-2 py-0.5 rounded-full">passata</span>}
                    </div>
                    {user?.role === 'admin' && (
                    <button
                      onClick={() => richiediAdmin(() => setModalConferma({ tipo: 'elimina-data', data: d }))}
                      className="text-red-600 hover:bg-red-100 p-1 rounded text-sm"
                      title="Elimina data"
                    >
                      <Trash2 size={16} />
                    </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {FASCE.map(f => {
                      const sid = sessionId(d, f.id);
                      const stat = statPerSessione(sid);
                      const attivaSessione = sessioneAttiva === sid;
                      const fasciaOn = isFasciaAttiva(d, f.id);
                      const Icon = f.icon;

                      if (!fasciaOn) {
                        // Fascia disattivata: mostro card "spenta" con pulsante attiva
                        return (
                          <div
                            key={f.id}
                            className="p-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <Icon size={16} />
                              <span className="font-medium text-sm">{f.label}</span>
                              <span className="text-[10px] uppercase tracking-wide">disattiva</span>
                            </div>
                            {user?.role === 'admin' && (
                            <button
                              onClick={() => richiediAdmin(() => toggleFascia(d, f.id))}
                              className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded font-semibold"
                              title={`Attiva ${f.label}`}
                            >
                              + Attiva
                            </button>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={f.id}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            attivaSessione
                              ? 'bg-amber-800 text-white border-amber-900 shadow-md'
                              : 'bg-white border-amber-300 text-amber-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon size={16} />
                            <button
                              onClick={() => handleSessioneChange(sid)}
                              className="flex-1 text-left font-bold"
                            >
                              {f.label}
                            </button>
                            {attivaSessione && <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 rounded">ATTIVA</span>}
                            {user?.role === 'admin' && (
                            <button
                              onClick={() => richiediAdmin(() => toggleFascia(d, f.id))}
                              className={`p-1 rounded hover:bg-red-100 ${attivaSessione ? 'text-red-200 hover:text-red-700' : 'text-red-500 hover:text-red-700'}`}
                              title={`Disattiva ${f.label}`}
                            >
                              <X size={14} />
                            </button>
                            )}
                          </div>
                          <button
                            onClick={() => handleSessioneChange(sid)}
                            className={`w-full text-left text-xs ${attivaSessione ? 'text-amber-100' : 'text-amber-700'}`}
                          >
                            {stat.gruppi} gruppi · {stat.persone} persone
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
              })}
            </div>
          )}

          {/* Export totale */}
          {date.length > 0 && (
            <div className="mt-3 pt-3 border-t border-amber-200">
              <button
                onClick={esportaPDFTutte}
                className="bg-amber-900 hover:bg-amber-950 text-white px-4 py-2 rounded font-semibold flex items-center gap-2 text-sm"
              >
                <Download size={16} /> Esporta PDF - Tutte le Sessioni
              </button>
            </div>
          )}
        </div>

        {/* GESTIONE SESSIONE ATTIVA */}
        {sessioneAttiva ? (
          <>
            {/* Header sessione */}
            <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white rounded-lg p-3 mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-wide opacity-80">Stai gestendo:</div>
                <div className="text-xl font-bold capitalize">
                  {getSessioneInfo(sessioneAttiva)?.label}
                </div>
              </div>
              {!noConfig && (
              <button
                onClick={() => { setModalCopia(true); setCopiaDestinazione(''); }}
                disabled={tuttiSIds.length === 0 || gruppi.length === 0}
                className="bg-amber-700 hover:bg-amber-600 disabled:bg-gray-500 text-white px-3 py-2 rounded flex items-center gap-2 text-sm"
                title="Copia prenotazioni in un'altra sessione"
              >
                <Copy size={16} /> Copia in altra sessione
              </button>
              )}
            </div>

            {/* Statistiche */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <StatCard label="Persone" value={stats.totalePersone} color="amber" />
              <StatCard label="Gruppi" value={gruppi.length} color="orange" />
              <StatCard label="Tavoli" value={tavoli.length} color="rose" />
              <StatCard label="Posti" value={`${stats.postiAssegnati}/${stats.totalePosti}`} color="emerald" />
              <StatCard label="Non assegnati" value={stats.gruppiNonAssegnati} color={stats.gruppiNonAssegnati > 0 ? 'red' : 'emerald'} />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b-2 border-amber-300 overflow-x-auto">
              <TabButton active={tab === 'gruppi'} onClick={() => setTab('gruppi')} icon={Users}>Gruppi</TabButton>
              <TabButton active={tab === 'layout'} onClick={() => setTab('layout')} icon={Eye}>Layout Tavoli</TabButton>
              {!noConfig && (
                <TabButton
                  active={tab === 'config'}
                  onClick={() => (user?.role === 'tavoli' || user?.role === 'admin') ? setTab('config') : richiediAdmin(() => setTab('config'))}
                  icon={Edit3}>
                  Configurazione {(!adminUnlocked && user?.role !== 'tavoli' && user?.role !== 'admin') && <span className="text-[10px]">🔒</span>}
                </TabButton>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 border border-amber-200">
              {tab === 'gruppi' && (
                <div>
                  <h2 className="text-2xl font-bold text-amber-900 mb-4">Gestione Gruppi</h2>

                  {/* Riepilogo piatti da preparare per la cucina */}
                  {(config.menu || []).length > 0 && (() => {
                    const totGenerale = (config.menu || []).reduce((s, p) => s + (totaliPiatti[p.id] || 0), 0);
                    const info = getSessioneInfo(sessioneAttiva);
                    return (
                      <div className="bg-gradient-to-br from-rose-50 to-amber-50 p-4 rounded-lg mb-4 border-2 border-rose-300 shadow-sm">
                        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                          <h3 className="font-bold text-rose-900 flex items-center gap-2 flex-wrap">
                            🍽️ Piatti da preparare
                            <span className="bg-rose-700 text-white text-xs px-2 py-0.5 rounded capitalize font-normal">
                              {formatDataLunga(info?.dataIso)} — {info?.fascia.label}
                            </span>
                          </h3>
                          <span className="bg-rose-700 text-white px-3 py-1 rounded-full text-sm font-bold shadow">
                            Totale porzioni: {totGenerale}
                          </span>
                        </div>
                        {totGenerale === 0 ? (
                          <p className="text-sm text-gray-500 italic bg-white p-2 rounded border border-dashed border-rose-200 text-center">
                            Nessun piatto prenotato finora. I totali si aggiorneranno man mano che aggiungi gruppi con i loro piatti.
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                            {(config.menu || []).map(p => {
                              const n = totaliPiatti[p.id] || 0;
                              return (
                                <div
                                  key={p.id}
                                  className={`p-2 rounded border-2 text-center ${
                                    n === 0
                                      ? 'bg-white border-gray-200 text-gray-400'
                                      : 'bg-white border-rose-400 text-rose-900'
                                  }`}
                                >
                                  <div className={`text-2xl font-bold ${n === 0 ? 'text-gray-300' : 'text-rose-700'}`}>
                                    {n}
                                  </div>
                                  <div className="text-xs font-medium truncate" title={p.nome}>
                                    {p.nome}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {!solaLettura && <div className="bg-amber-50 p-4 rounded-lg mb-4 border border-amber-200">
                    <h3 className="font-semibold text-amber-800 mb-3">➕ Nuovo Gruppo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                      <input type="text" placeholder="Cognome *" value={nuovoGruppo.cognome}
                        onChange={(e) => setNuovoGruppo({ ...nuovoGruppo, cognome: e.target.value })}
                        className="px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500" />
                      <input type="number" placeholder="N° persone *" value={nuovoGruppo.persone}
                        onChange={(e) => setNuovoGruppo({ ...nuovoGruppo, persone: e.target.value })}
                        className="px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500" min="1" />
                      <input type="text" placeholder="Telefono" value={nuovoGruppo.telefono}
                        onChange={(e) => setNuovoGruppo({ ...nuovoGruppo, telefono: e.target.value })}
                        className="px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500" />
                      <input type="text" placeholder="Note" value={nuovoGruppo.note}
                        onChange={(e) => setNuovoGruppo({ ...nuovoGruppo, note: e.target.value })}
                        className="px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>

                    {/* Prenotazione piatti (solo se c'è un menu) */}
                    {(config.menu || []).length > 0 ? (
                      <div className="bg-white rounded-lg p-3 border border-rose-200 mb-3">
                        <div className="text-xs font-semibold text-rose-800 mb-2 flex items-center gap-1 flex-wrap">
                          🍽️ Piatti di <span className="bg-rose-100 text-rose-900 px-1.5 rounded capitalize">{getSessioneInfo(sessioneAttiva)?.fascia.label} {formatData(getSessioneInfo(sessioneAttiva)?.dataIso)}</span> (opzionale)
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {(config.menu || []).map(p => (
                            <div key={p.id} className="flex items-center gap-2">
                              <label className="text-sm text-gray-700 flex-1 truncate" title={p.nome}>{p.nome}</label>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={nuovoGruppo.piatti?.[p.id] || ''}
                                onChange={(e) => setNuovoGruppo({
                                  ...nuovoGruppo,
                                  piatti: { ...(nuovoGruppo.piatti || {}), [p.id]: e.target.value }
                                })}
                                className="w-16 px-2 py-1 border border-rose-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-rose-400"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic bg-white p-2 rounded border border-dashed border-gray-300 mb-3">
                        💡 Nessun piatto nel menu. Aggiungi piatti nella tab <strong>Configurazione</strong> per poter prenotare le pietanze con ogni gruppo.
                      </div>
                    )}

                    <button onClick={aggiungiGruppo}
                      className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 w-full md:w-auto">
                      <Plus size={18} /> Aggiungi Gruppo
                    </button>
                  </div>}

                  {/* Barra di ricerca */}
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="🔍 Cerca per cognome, telefono o note..."
                      value={cercaGruppo}
                      onChange={e => setCercaGruppo(e.target.value)}
                      className="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    {cercaGruppo && (
                      <button onClick={() => setCercaGruppo('')}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm text-gray-600 font-medium">
                        ✕ Cancella
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-amber-800 text-white">
                          {[
                            { key: 'cognome', label: 'Cognome', align: 'text-left' },
                            { key: 'persone', label: 'N°', align: 'text-center' },
                            { key: null, label: 'Telefono', align: 'text-left' },
                            { key: null, label: 'Note', align: 'text-left' },
                            { key: null, label: 'Piatti', align: 'text-left' },
                            { key: 'stato', label: 'Stato', align: 'text-center' },
                            { key: null, label: 'Azioni', align: 'text-center' },
                          ].map(({ key, label, align }) => (
                            <th key={label} className={`p-2 ${align} ${key ? 'cursor-pointer hover:bg-amber-700 select-none' : ''}`}
                              onClick={() => key && toggleOrdinamento(key)}>
                              {label}
                              {key && ordinamento.colonna === key && (
                                <span className="ml-1">{ordinamento.direzione === 'asc' ? '▲' : '▼'}</span>
                              )}
                              {key && ordinamento.colonna !== key && <span className="ml-1 opacity-30">⇅</span>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {gruppi.filter(g => {
                          if (!cercaGruppo) return true;
                          const q = cercaGruppo.toLowerCase();
                          return (g.cognome || '').toLowerCase().includes(q) ||
                                 (g.telefono || '').toLowerCase().includes(q) ||
                                 (g.note || '').toLowerCase().includes(q);
                        }).sort((a, b) => {
                          if (!ordinamento.colonna) return 0;
                          const dir = ordinamento.direzione === 'asc' ? 1 : -1;
                          if (ordinamento.colonna === 'cognome')
                            return dir * (a.cognome || '').localeCompare(b.cognome || '');
                          if (ordinamento.colonna === 'persone')
                            return dir * (Number(a.persone) - Number(b.persone));
                          if (ordinamento.colonna === 'stato') {
                            const assA = personeAssegnate(a.id);
                            const assB = personeAssegnate(b.id);
                            return dir * (assA / a.persone - assB / b.persone);
                          }
                          return 0;
                        }).map((g, idx) => {
                          const ass = personeAssegnate(g.id);
                          const completo = ass === g.persone;
                          const parziale = ass > 0 && ass < g.persone;
                          const piattiGruppo = Object.entries(g.piatti || {}).filter(([, q]) => Number(q) > 0);
                          const totPiatti = piattiGruppo.reduce((s, [, q]) => s + Number(q), 0);
                          return (
                            <tr key={g.id} className={idx % 2 === 0 ? 'bg-amber-50' : 'bg-white'}>
                              <td className="p-2">
                                {editingGruppo === g.id ? (
                                  <input type="text" value={g.cognome} onChange={(e) => aggiornaGruppo(g.id, 'cognome', e.target.value)}
                                    className="px-2 py-1 border border-amber-300 rounded w-full" />
                                ) : <span className="font-semibold">{g.cognome}</span>}
                              </td>
                              <td className="p-2 text-center">
                                {editingGruppo === g.id ? (
                                  <input type="number" value={g.persone} onChange={(e) => aggiornaGruppo(g.id, 'persone', e.target.value)}
                                    className="px-2 py-1 border border-amber-300 rounded w-16 text-center" min="1" />
                                ) : g.persone}
                              </td>
                              <td className="p-2">
                                {editingGruppo === g.id ? (
                                  <input type="text" value={g.telefono} onChange={(e) => aggiornaGruppo(g.id, 'telefono', e.target.value)}
                                    className="px-2 py-1 border border-amber-300 rounded w-full" />
                                ) : (g.telefono || <span className="text-gray-400">—</span>)}
                              </td>
                              <td className="p-2">
                                {editingGruppo === g.id ? (
                                  <input type="text" value={g.note} onChange={(e) => aggiornaGruppo(g.id, 'note', e.target.value)}
                                    className="px-2 py-1 border border-amber-300 rounded w-full" />
                                ) : (g.note || <span className="text-gray-400">—</span>)}
                              </td>
                              <td className="p-2 min-w-[180px]">
                                {editingGruppo === g.id ? (
                                  (config.menu || []).length === 0 ? (
                                    <span className="text-xs text-gray-400 italic">Menu vuoto</span>
                                  ) : (
                                    <div className="space-y-1">
                                      {(config.menu || []).map(p => (
                                        <div key={p.id} className="flex items-center gap-1">
                                          <label className="text-xs text-gray-700 flex-1 truncate" title={p.nome}>{p.nome}</label>
                                          <input
                                            type="number"
                                            min="0"
                                            value={getPiattoGruppo(g, p.id) || ''}
                                            placeholder="0"
                                            onChange={(e) => aggiornaPiattoGruppo(g.id, p.id, e.target.value)}
                                            className="w-14 px-1 py-0.5 border border-rose-200 rounded text-center text-xs"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )
                                ) : piattiGruppo.length === 0 ? (
                                  <span className="text-gray-400 text-xs">—</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {piattiGruppo.map(([pid, q]) => {
                                      const p = (config.menu || []).find(x => x.id === pid);
                                      const nomePiatto = p ? p.nome : '?';
                                      return (
                                        <span key={pid} className="inline-flex items-center bg-rose-100 text-rose-800 rounded px-1.5 py-0.5 text-xs font-medium">
                                          {q}× {nomePiatto}
                                        </span>
                                      );
                                    })}
                                    <span className="text-xs text-gray-500 italic">(tot {totPiatti})</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-2 text-center">
                                {completo ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-semibold">
                                    <Check size={12} /> Assegnato
                                  </span>
                                ) : parziale ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                                    <AlertCircle size={12} /> {ass}/{g.persone}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                    Da assegnare
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-center">
                                <div className="flex gap-1 justify-center">
                                  {!solaLettura && <button onClick={() => setEditingGruppo(editingGruppo === g.id ? null : g.id)}
                                    className="p-1 text-amber-700 hover:bg-amber-100 rounded" title="Modifica">
                                    {editingGruppo === g.id ? <Check size={16} /> : <Edit3 size={16} />}
                                  </button>}
                                  {!solaLettura && user?.role !== 'prenotazioni' && (
                                    <button onClick={() => setModalConferma({ tipo: 'elimina-gruppo', id: g.id, nome: g.cognome })}
                                      className="p-1 text-red-600 hover:bg-red-100 rounded" title="Elimina">
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {gruppi.length === 0 && (
                          <tr><td colSpan="7" className="p-6 text-center text-gray-500 italic">Nessun gruppo inserito per questa sessione</td></tr>
                        )}
                        {gruppi.length > 0 && cercaGruppo && gruppi.filter(g => {
                          const q = cercaGruppo.toLowerCase();
                          return (g.cognome || '').toLowerCase().includes(q) || (g.telefono || '').toLowerCase().includes(q) || (g.note || '').toLowerCase().includes(q);
                        }).length === 0 && (
                          <tr><td colSpan="7" className="p-6 text-center text-gray-400 italic">Nessun gruppo trovato per "{cercaGruppo}"</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {!noConfig && <button onClick={assegnazioneAutomatica}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded font-semibold flex items-center gap-2"
                      disabled={gruppi.length === 0}>
                      <Shuffle size={18} /> Assegnazione Automatica
                    </button>}
                    {!noConfig && <button onClick={() => setModalConferma({ tipo: 'reset-assegnazioni' })}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-semibold flex items-center gap-2"
                      disabled={Object.keys(assegnazioni).length === 0}>
                      <RotateCcw size={18} /> Reset Assegnazioni
                    </button>}
                    {!noConfig && <button onClick={annullaUltimaOperazione}
                      className="bg-gray-600 hover:bg-gray-700 disabled:opacity-40 text-white px-4 py-2 rounded font-semibold flex items-center gap-2"
                      disabled={historyAssegnazioni.length === 0}
                      title="Annulla l'ultima operazione sui tavoli">
                      <RotateCcw size={18} /> Annulla ultima operazione
                    </button>}
                    <button onClick={esportaPDF}
                      className="bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 rounded font-semibold flex items-center gap-2">
                      <Download size={18} /> Esporta PDF Sessione
                    </button>
                  </div>
                </div>
              )}

              {tab === 'layout' && (
                <div>
                  <h2 className="text-2xl font-bold text-amber-900 mb-4">Layout Tavoli</h2>
                  <div className="bg-amber-50 p-4 rounded-lg mb-4 border border-amber-200">
                    <h3 className="font-semibold text-amber-800 mb-2">🎯 Seleziona un gruppo, poi clicca su un tavolo:</h3>
                    {gruppi.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Aggiungi prima dei gruppi nel tab "Gruppi"</p>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {gruppi.map(g => {
                            const ass = personeAssegnate(g.id);
                            const completo = ass === g.persone;
                            return (
                              <button key={g.id}
                                onClick={() => setGruppoSelezionato(gruppoSelezionato === g.id ? null : g.id)}
                                className={`px-3 py-1.5 rounded font-semibold text-sm transition-all ${
                                  gruppoSelezionato === g.id
                                    ? 'bg-amber-800 text-white ring-2 ring-amber-900 ring-offset-1'
                                    : completo
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                                }`}
                                disabled={completo && gruppoSelezionato !== g.id}
                              >
                                {g.cognome} ({ass}/{g.persone}){completo && ' ✓'}
                              </button>
                            );
                          })}
                        </div>
                        {gruppoSelezionato && (() => {
                          const gSel = gruppi.find(g => g.id === gruppoSelezionato);
                          if (!gSel) return null;
                          const assSel = personeAssegnate(gruppoSelezionato);
                          const daAssSel = gSel.persone - assSel;
                          return (
                            <p className="text-sm text-amber-800 mt-2 italic">
                              Selezionato: <strong>{gSel.cognome}</strong>
                              {daAssSel > 0
                                ? ` — ${daAssSel} ${daAssSel === 1 ? 'persona' : 'persone'} da collocare. Clicca un tavolo (anche se parzialmente occupato: verranno usati solo i posti liberi).`
                                : ` — già completo (${gSel.persone}/${gSel.persone}).`}
                            </p>
                          );
                        })()}
                      </>
                    )}
                  </div>

                  {/* Banda di feedback sulle assegnazioni manuali */}
                  {feedbackAssegnazione && (
                    <div className={`mb-4 p-3 rounded-lg border-2 text-sm font-medium flex items-start justify-between gap-2 ${
                      feedbackAssegnazione.tipo === 'success' ? 'bg-emerald-50 border-emerald-400 text-emerald-900' :
                      feedbackAssegnazione.tipo === 'warn' ? 'bg-orange-50 border-orange-400 text-orange-900' :
                      'bg-sky-50 border-sky-400 text-sky-900'
                    }`}>
                      <span className="flex-1">{feedbackAssegnazione.messaggio}</span>
                      <button
                        onClick={() => setFeedbackAssegnazione(null)}
                        className="shrink-0 opacity-60 hover:opacity-100"
                        aria-label="Chiudi notifica"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Ricerca prenotazione nel layout */}
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="🔍 Cerca prenotazione per trovare il tavolo..."
                      value={cercaLayout}
                      onChange={e => setCercaLayout(e.target.value)}
                      className="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    {cercaLayout && (
                      <button onClick={() => setCercaLayout('')}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm text-gray-600 font-medium">
                        ✕
                      </button>
                    )}
                  </div>
                  {cercaLayout && (() => {
                    const q = cercaLayout.toLowerCase();
                    const gruppiTrovati = gruppi.filter(g => (g.cognome || '').toLowerCase().includes(q));
                    const tavoliTrovati = Object.entries(assegnazioni)
                      .filter(([, arr]) => arr.some(a => gruppiTrovati.find(g => g.id === a.groupId)))
                      .map(([tid]) => tid);
                    if (gruppiTrovati.length === 0) return (
                      <p className="text-sm text-gray-400 italic mb-3">Nessuna prenotazione trovata per "{cercaLayout}"</p>
                    );
                    return (
                      <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-2 mb-3 text-sm text-amber-900">
                        {gruppiTrovati.map(g => {
                          const tav = Object.entries(assegnazioni)
                            .filter(([, arr]) => arr.some(a => a.groupId === g.id))
                            .map(([tid, arr]) => `${tid} (${arr.find(a => a.groupId === g.id)?.posti} posti)`)
                            .join(', ');
                          return (
                            <div key={g.id} className="flex items-center gap-2 py-0.5">
                              <strong>{g.cognome}</strong>
                              <span className="text-amber-700">→</span>
                              <span>{tav || <em className="text-gray-400">non assegnato</em>}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  <div className="bg-gradient-to-b from-amber-50 to-orange-100 p-3 md:p-4 rounded-lg border-2 border-amber-300">
                    <p className="text-xs text-amber-700 italic mb-2 md:hidden">← scorri le file in orizzontale →</p>
                    <div className="space-y-3">
                      {config.fileAttive.map(fila => {
                        const n = config.tavoliPerFila[fila];
                        return (
                          <div key={fila} className="flex items-stretch gap-2 bg-white/50 rounded-lg p-1">
                            {/* Etichetta fila sticky a sinistra */}
                            <div className={`sticky left-0 z-10 w-12 md:w-16 flex items-center justify-center font-bold text-lg rounded ${coloriFila[fila]} border-2 shrink-0`}>
                              {fila}
                            </div>
                            {/* Container scrollabile orizzontale */}
                            <div
                              className="flex-1 overflow-x-auto overflow-y-hidden"
                              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
                            >
                              <div className="flex gap-2 pb-1" style={{ width: 'max-content' }}>
                                {Array.from({ length: n }, (_, i) => {
                                  const tid = `${fila}-${i + 1}`;
                                  const ass = assegnazioni[tid] || [];
                                  const occ = ass.reduce((s, a) => s + a.posti, 0);
                                  const pieno = occ >= config.postiPerTavolo;
                                  const vuoto = occ === 0;
                                  const libero = config.postiPerTavolo - occ;
                                  const hasSelected = gruppoSelezionato && ass.some(a => a.groupId === gruppoSelezionato);
                                  const assegnabile = gruppoSelezionato && !pieno;
                                  const cercaQ = cercaLayout.toLowerCase();
                                  const isEvidenziato = cercaLayout && ass.some(a => {
                                    const g = gruppi.find(gr => gr.id === a.groupId);
                                    return g && (g.cognome || '').toLowerCase().includes(cercaQ);
                                  });
                                  return (
                                    <button key={tid}
                                      onClick={() => handleTavoloClick(tid)}
                                      disabled={gruppoSelezionato && pieno}
                                      style={{ width: '72px', minHeight: '88px' }}
                                      className={`relative shrink-0 p-1.5 rounded-lg border-2 text-xs transition-all flex flex-col cursor-pointer active:scale-95
                                        ${isEvidenziato ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-400 ring-offset-1' : pieno ? 'bg-red-100 border-red-400' : vuoto ? 'bg-white border-gray-300 hover:border-amber-500' : 'bg-yellow-50 border-yellow-400'}
                                        ${hasSelected ? 'ring-2 ring-amber-600 ring-offset-1' : ''}
                                        ${assegnabile ? 'hover:bg-amber-100 ring-1 ring-amber-400/60' : ''}
                                        ${gruppoSelezionato && pieno ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                      {/* Badge posti liberi visibile se c'è un gruppo selezionato e il tavolo non è pieno */}
                                      {assegnabile && libero > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 shadow z-10 pointer-events-none">
                                          +{libero}
                                        </span>
                                      )}
                                      <div className="font-bold text-sm leading-tight">{tid}</div>
                                      <div className="text-[10px] text-gray-600 mb-1">{occ}/{config.postiPerTavolo}</div>
                                      <div className="space-y-0.5 overflow-hidden pointer-events-none">
                                        {ass.map((a, idx) => {
                                          const g = gruppi.find(gr => gr.id === a.groupId);
                                          if (!g) return null;
                                          return (
                                            <div key={idx} className="bg-amber-200 rounded px-1 py-0.5">
                                              <span className="truncate font-semibold text-[10px] block">{g.cognome} ({a.posti})</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1"><div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div> Vuoto</div>
                    <div className="flex items-center gap-1"><div className="w-4 h-4 bg-yellow-50 border-2 border-yellow-400 rounded"></div> Parziale</div>
                    <div className="flex items-center gap-1"><div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded"></div> Pieno</div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {!noConfig && <button onClick={assegnazioneAutomatica}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded font-semibold flex items-center gap-2"
                      disabled={gruppi.length === 0}>
                      <Shuffle size={18} /> Assegnazione Automatica
                    </button>}
                    {!noConfig && <button onClick={() => setModalConferma({ tipo: 'reset-assegnazioni' })}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-semibold flex items-center gap-2"
                      disabled={Object.keys(assegnazioni).length === 0}>
                      <RotateCcw size={18} /> Reset Assegnazioni
                    </button>}
                    {!noConfig && <button onClick={annullaUltimaOperazione}
                      className="bg-gray-600 hover:bg-gray-700 disabled:opacity-40 text-white px-4 py-2 rounded font-semibold flex items-center gap-2"
                      disabled={historyAssegnazioni.length === 0}
                      title="Annulla l'ultima operazione sui tavoli">
                      <RotateCcw size={18} /> Annulla ultima operazione
                    </button>}
                    <button onClick={esportaPDF}
                      className="bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 rounded font-semibold flex items-center gap-2">
                      <Download size={18} /> Esporta PDF Sessione
                    </button>
                  </div>
                </div>
              )}

              {tab === 'config' && (
                <div>
                  <h2 className="text-2xl font-bold text-amber-900 mb-2">Configurazione Tavoli</h2>
                  <p className="text-sm text-gray-600 mb-4 italic">
                    ⚙️ Questa configurazione vale solo per la sessione attiva. Le altre sessioni mantengono le loro impostazioni (di default: 5 file × 8 tavoli).
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h3 className="font-semibold text-amber-800 mb-3">File di tavoli</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {config.fileAttive.map(fila => (
                          <div key={fila} className="bg-white p-3 rounded border border-amber-200">
                            <label className="block font-bold text-amber-900 mb-1">Fila {fila}</label>
                            <label className="text-xs text-gray-600">Numero tavoli:</label>
                            <input type="number" value={config.tavoliPerFila[fila] ?? 1}
                              onChange={(e) => updateTavoliPerFila(fila, e.target.value)}
                              className="w-full px-2 py-1 border border-amber-300 rounded mt-1" min="1" max="20" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Menu piatti della sessione */}
                    <div className="bg-rose-50 p-4 rounded-lg border-2 border-rose-300">
                      <h3 className="font-semibold text-rose-800 mb-1 flex items-center gap-2 flex-wrap">
                        🍽️ Menu di
                        <span className="bg-rose-700 text-white text-sm px-2 py-0.5 rounded capitalize">
                          {formatDataLunga(getSessioneInfo(sessioneAttiva)?.dataIso)} — {getSessioneInfo(sessioneAttiva)?.fascia.label}
                        </span>
                      </h3>
                      <p className="text-xs text-rose-700 mb-3 italic">
                        ⚠️ Questo menu vale SOLO per questa data e fascia oraria. Ogni sessione (pranzo/cena, giorno per giorno) ha il proprio menu indipendente.
                      </p>

                      {/* Input nuovo piatto */}
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Nome piatto (es. Lasagne al forno)"
                          value={nuovoPiatto}
                          onChange={(e) => setNuovoPiatto(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') aggiungiPiatto(); }}
                          className="flex-1 px-3 py-2 border border-rose-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                        <button
                          onClick={aggiungiPiatto}
                          disabled={!nuovoPiatto.trim()}
                          className="bg-rose-700 hover:bg-rose-800 disabled:bg-gray-400 text-white px-4 py-2 rounded font-semibold flex items-center gap-1"
                        >
                          <Plus size={18} /> Aggiungi
                        </button>
                      </div>

                      {/* Lista piatti */}
                      {(config.menu || []).length === 0 ? (
                        <p className="text-sm text-gray-500 italic bg-white p-3 rounded border border-dashed border-rose-300 text-center">
                          Nessun piatto nel menu. Aggiungi il primo piatto sopra.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {(config.menu || []).map(p => (
                            <div key={p.id} className="bg-white p-2 rounded border border-rose-200 flex items-center gap-2">
                              <input
                                type="text"
                                value={p.nome}
                                onChange={(e) => rinominaPiatto(p.id, e.target.value)}
                                className="flex-1 px-2 py-1 border border-rose-200 rounded focus:outline-none focus:ring-1 focus:ring-rose-400"
                              />
                              <span className="text-xs text-gray-600 bg-rose-50 px-2 py-1 rounded whitespace-nowrap">
                                Prenotati: <strong className="text-rose-800">{totaliPiatti[p.id] || 0}</strong>
                              </span>
                              <button
                                onClick={() => setModalConferma({ tipo: 'elimina-piatto', id: p.id, nome: p.nome })}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Elimina piatto"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <h3 className="font-semibold text-emerald-800 mb-2">Riepilogo configurazione</h3>
                      <ul className="text-sm space-y-1 text-emerald-900">
                        <li>• File attive: <strong>{config.fileAttive.length}</strong></li>
                        <li>• Tavoli totali: <strong>{tavoli.length}</strong></li>
                        <li>• Posti per tavolo: <strong>{config.postiPerTavolo}</strong></li>
                        <li>• Capienza totale: <strong>{tavoli.length * config.postiPerTavolo} persone</strong></li>
                        <li>• Piatti nel menu: <strong>{(config.menu || []).length}</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center border border-amber-200">
            <CalendarDays className="mx-auto text-amber-400 mb-3" size={48} />
            <h2 className="text-xl font-bold text-amber-900 mb-2">Nessuna sessione attiva</h2>
            <p className="text-gray-600">Aggiungi una data e seleziona una fascia (Pranzo o Cena) per iniziare.</p>
          </div>
        )}

        <footer className="text-center mt-6 text-amber-700 text-sm italic">
          🎉 Buona sagra! 🎉
        </footer>

        {/* Modal login admin */}
        {modalAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setModalAdmin(null)}>
            <div className="bg-white rounded-lg p-5 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-amber-900 mb-2 flex items-center gap-2">
                🔒 Accesso Admin
              </h3>
              <p className="text-sm text-gray-600 mb-4 italic">
                {modalAdmin.pendingAction
                  ? 'Questa operazione è riservata all\'amministratore. Inserisci la password per procedere.'
                  : 'Inserisci la password amministratore per sbloccare le funzioni di configurazione.'}
              </p>

              <label className="block text-xs font-semibold text-amber-800 mb-1">Password:</label>
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                value={modalAdmin.input}
                onChange={(e) => setModalAdmin({ ...modalAdmin, input: e.target.value, errore: '' })}
                onKeyDown={(e) => { if (e.key === 'Enter') confermaAdmin(); }}
                placeholder="••••"
                className={`w-full px-3 py-2 border-2 rounded text-center text-lg tracking-widest focus:outline-none focus:ring-2 ${
                  modalAdmin.errore
                    ? 'border-red-400 focus:ring-red-400 bg-red-50'
                    : 'border-amber-300 focus:ring-amber-500'
                }`}
              />

              {modalAdmin.errore && (
                <p className="text-sm text-red-600 mt-2 font-medium">❌ {modalAdmin.errore}</p>
              )}

              <p className="text-[11px] text-gray-500 mt-3 italic">
                ℹ️ Una volta sbloccato, l'accesso resta attivo fino al ricaricamento della pagina.
              </p>

              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={() => setModalAdmin(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Annulla
                </button>
                <button
                  onClick={confermaAdmin}
                  disabled={!modalAdmin.input}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white rounded font-semibold"
                >
                  Conferma
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal conferma */}
        {modalConferma && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-amber-900 mb-3">⚠️ Conferma</h3>
              {modalConferma.tipo === 'elimina-gruppo' && (
                <p className="mb-4">Eliminare il gruppo <strong>{modalConferma.nome}</strong> da questa sessione?</p>
              )}
              {modalConferma.tipo === 'reset-assegnazioni' && (
                <p className="mb-4">Vuoi davvero resettare tutte le assegnazioni di questa sessione? I gruppi resteranno, ma saranno tutti da riassegnare.</p>
              )}
              {modalConferma.tipo === 'elimina-data' && (
                <p className="mb-4">Eliminare la data <strong>{formatDataLunga(modalConferma.data)}</strong>? Verranno cancellate <strong>entrambe le sessioni</strong> (pranzo e cena) con tutte le prenotazioni.</p>
              )}
              {modalConferma.tipo === 'elimina-piatto' && (
                <p className="mb-4">Eliminare il piatto <strong>{modalConferma.nome}</strong> dal menu? Verrà rimosso anche da tutti i gruppi che lo avevano prenotato.</p>
              )}
              {modalConferma.tipo === 'disattiva-fascia' && (
                <p className="mb-4">
                  Vuoi disattivare la fascia <strong>{modalConferma.fasciaLabel}</strong> del <strong>{modalConferma.dataLabel}</strong>?
                  <br /><br />
                  <span className="text-red-700 font-semibold">⚠️ Attenzione: perderai {modalConferma.numGruppi} {modalConferma.numGruppi === 1 ? 'gruppo prenotato' : 'gruppi prenotati'}</span> con le relative assegnazioni e i piatti ordinati.
                  <br /><br />
                  <span className="text-sm text-gray-600 italic">Potrai riattivare la fascia in qualsiasi momento, ma i dati saranno persi.</span>
                </p>
              )}
              <div className="flex gap-2 justify-end">
                <button onClick={() => setModalConferma(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">Annulla</button>
                <button onClick={() => {
                  if (modalConferma.tipo === 'elimina-gruppo') rimuoviGruppo(modalConferma.id);
                  if (modalConferma.tipo === 'reset-assegnazioni') resetAssegnazioni();
                  if (modalConferma.tipo === 'elimina-data') rimuoviData(modalConferma.data);
                  if (modalConferma.tipo === 'elimina-piatto') rimuoviPiatto(modalConferma.id);
                  if (modalConferma.tipo === 'disattiva-fascia') applicaDisattivaFascia(modalConferma.dataIso, modalConferma.fasciaId);
                  setModalConferma(null);
                }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold">
                  Conferma
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal copia sessione */}
        {modalCopia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-amber-900 mb-3">📋 Copia sessione</h3>
              <p className="text-sm text-gray-600 mb-3">
                Copia gruppi e assegnazioni della sessione attiva in un'altra sessione. <strong>Attenzione:</strong> i dati della destinazione verranno sovrascritti.
              </p>
              <label className="block text-sm font-semibold text-amber-800 mb-1">Sessione destinazione:</label>
              <select value={copiaDestinazione} onChange={(e) => setCopiaDestinazione(e.target.value)}
                className="w-full px-3 py-2 border border-amber-300 rounded mb-4">
                <option value="">-- Seleziona --</option>
                {tuttiSIds.map(sid => {
                  const info = getSessioneInfo(sid);
                  const stat = statPerSessione(sid);
                  return (
                    <option key={sid} value={sid}>
                      {info.label} {stat.gruppi > 0 ? `(⚠️ ${stat.gruppi} gruppi verranno sovrascritti)` : ''}
                    </option>
                  );
                })}
              </select>
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setModalCopia(false); setCopiaDestinazione(''); }} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">Annulla</button>
                <button onClick={copiaSessione} disabled={!copiaDestinazione}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white rounded font-semibold">
                  Copia
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Popup scelta quantità posti per assegnazione ambigua */}
        {sceltaPosti && (() => {
          const gruppo = gruppi.find(g => g.id === sceltaPosti.groupId);
          if (!gruppo) return null;
          const v = Number(sceltaPosti.valore) || 0;
          const max = Math.min(sceltaPosti.disp, sceltaPosti.daAss);
          const valido = v >= 1 && v <= max;
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSceltaPosti(null)}>
              <div className="bg-white rounded-lg p-5 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-amber-900 mb-2 flex items-center gap-2">
                  🪑 Quanti posti su questo tavolo?
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Il gruppo <strong>{gruppo.cognome}</strong> ha <strong>{sceltaPosti.daAss}</strong> {sceltaPosti.daAss === 1 ? 'persona' : 'persone'} da collocare, ma il tavolo <strong>{sceltaPosti.tavoloId}</strong> ha solo <strong>{sceltaPosti.disp}</strong> {sceltaPosti.disp === 1 ? 'posto libero' : 'posti liberi'}.
                </p>
                <p className="text-sm text-gray-600 mb-4 italic">
                  Quanti posti vuoi assegnare qui? Il resto potrai metterlo su un altro tavolo.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                  <label className="block text-xs font-semibold text-amber-800 mb-2">
                    Posti da assegnare al tavolo {sceltaPosti.tavoloId}:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSceltaPosti({ ...sceltaPosti, valore: Math.max(1, v - 1) })}
                      className="w-10 h-10 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-xl disabled:bg-gray-300"
                      disabled={v <= 1}
                    >−</button>
                    <input
                      type="number"
                      min="1"
                      max={max}
                      value={sceltaPosti.valore}
                      onChange={(e) => setSceltaPosti({ ...sceltaPosti, valore: e.target.value })}
                      className="flex-1 text-center text-2xl font-bold py-2 border-2 border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={() => setSceltaPosti({ ...sceltaPosti, valore: Math.min(max, v + 1) })}
                      className="w-10 h-10 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-xl disabled:bg-gray-300"
                      disabled={v >= max}
                    >+</button>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-amber-700">
                    <span>min: 1</span>
                    <button
                      onClick={() => setSceltaPosti({ ...sceltaPosti, valore: max })}
                      className="underline hover:text-amber-900"
                    >
                      Riempi tavolo ({max})
                    </button>
                    <span>max: {max}</span>
                  </div>
                </div>

                {valido && (
                  <div className="text-sm text-gray-700 mb-4 bg-emerald-50 border border-emerald-200 rounded p-2">
                    ➡️ Assegnerai <strong>{v}</strong> {v === 1 ? 'persona' : 'persone'} al tavolo {sceltaPosti.tavoloId}.
                    Dopo questa operazione resteranno da collocare <strong>{sceltaPosti.daAss - v}</strong> {(sceltaPosti.daAss - v) === 1 ? 'persona' : 'persone'} del gruppo {gruppo.cognome}.
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setSceltaPosti(null)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={() => {
                      eseguiAssegnazione(sceltaPosti.tavoloId, sceltaPosti.groupId, v);
                      setSceltaPosti(null);
                    }}
                    disabled={!valido}
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white rounded font-semibold"
                  >
                    Conferma
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Popup dettagli tavolo */}
        {dettaglioTavolo && (() => {
          const ass = assegnazioni[dettaglioTavolo] || [];
          const occ = ass.reduce((s, a) => s + a.posti, 0);
          const libero = config.postiPerTavolo - occ;
          const pieno = libero <= 0;
          const vuoto = occ === 0;
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setDettaglioTavolo(null)}>
              <div className="bg-white rounded-lg p-5 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-amber-900">
                    🪑 Tavolo {dettaglioTavolo}
                  </h3>
                  <button
                    onClick={() => setDettaglioTavolo(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                    aria-label="Chiudi"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Stato */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-amber-50 border border-amber-200 rounded p-2 text-center">
                    <div className="text-lg font-bold text-amber-900">{occ}</div>
                    <div className="text-[10px] uppercase text-amber-700">Occupati</div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-center">
                    <div className="text-lg font-bold text-emerald-900">{libero}</div>
                    <div className="text-[10px] uppercase text-emerald-700">Liberi</div>
                  </div>
                  <div className={`border rounded p-2 text-center ${pieno ? 'bg-red-50 border-red-200' : vuoto ? 'bg-gray-50 border-gray-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className={`text-xs font-bold ${pieno ? 'text-red-800' : vuoto ? 'text-gray-700' : 'text-yellow-800'}`}>
                      {pieno ? 'PIENO' : vuoto ? 'VUOTO' : 'PARZIALE'}
                    </div>
                    <div className="text-[10px] uppercase text-gray-600 mt-1">Stato</div>
                  </div>
                </div>

                {/* Lista assegnazioni */}
                <div className="mb-4">
                  <h4 className="font-semibold text-amber-800 mb-2 text-sm">Prenotazioni al tavolo:</h4>
                  {ass.length === 0 ? (
                    <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded text-center">
                      Nessuna prenotazione assegnata a questo tavolo.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {ass.map((a, idx) => {
                        const g = gruppi.find(gr => gr.id === a.groupId);
                        if (!g) return null;
                        const piattiG = Object.entries(g.piatti || {}).filter(([, q]) => Number(q) > 0);
                        return (
                          <div key={idx} className="bg-amber-50 border border-amber-200 rounded p-2 flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-amber-900">{g.cognome} <span className="text-sm font-normal text-amber-700">({a.posti} {a.posti === 1 ? 'posto' : 'posti'})</span></div>
                              {g.telefono && <div className="text-xs text-gray-600 mt-0.5">📞 {g.telefono}</div>}
                              {g.note && <div className="text-xs text-gray-600 italic mt-0.5">📝 {g.note}</div>}
                              {piattiG.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {piattiG.map(([pid, q]) => {
                                    const p = (config.menu || []).find(x => x.id === pid);
                                    const nomePiatto = p ? p.nome : '?';
                                    return (
                                      <span key={pid} className="inline-flex items-center bg-rose-100 text-rose-800 rounded px-1.5 py-0.5 text-[11px] font-medium">
                                        🍽️ {q}× {nomePiatto}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            {!noConfig && <button
                              onClick={() => rimuoviAssegnazione(dettaglioTavolo, a.groupId)}
                              className="shrink-0 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-semibold flex items-center gap-1"
                              title="Rimuovi dal tavolo"
                            >
                              <Trash2 size={14} /> Rimuovi
                            </button>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-200">
                  <button
                    onClick={() => setDettaglioTavolo(null)}
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded font-semibold"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    amber: 'bg-amber-100 border-amber-400 text-amber-900',
    orange: 'bg-orange-100 border-orange-400 text-orange-900',
    rose: 'bg-rose-100 border-rose-400 text-rose-900',
    emerald: 'bg-emerald-100 border-emerald-400 text-emerald-900',
    red: 'bg-red-100 border-red-400 text-red-900',
  };
  return (
    <div className={`${colors[color]} border-2 rounded-lg p-3 text-center shadow-sm`}>
      <div className="text-2xl md:text-3xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wide font-semibold opacity-75">{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 font-semibold flex items-center gap-2 whitespace-nowrap rounded-t transition-all ${
        active ? 'bg-white text-amber-900 border-2 border-b-0 border-amber-300 shadow-sm' : 'text-amber-700 hover:bg-amber-100'
      }`}>
      <Icon size={18} />
      {children}
    </button>
  );
}
