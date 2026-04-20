# Guida all'utilizzo — Gestione Tavoli Sagra
### Proloco Dairago

---

## Indice

1. [Accesso al sistema](#1-accesso-al-sistema)
2. [Ruoli utente](#2-ruoli-utente)
3. [Pannello principale](#3-pannello-principale)
4. [Gestione date eventi](#4-gestione-date-eventi)
5. [Gestione gruppi e prenotazioni](#5-gestione-gruppi-e-prenotazioni)
6. [Assegnazione tavoli](#6-assegnazione-tavoli)
7. [Menu](#7-menu)
8. [Esportazione e stampa](#8-esportazione-e-stampa)
9. [Funzioni amministratore](#9-funzioni-amministratore)
10. [Log di audit](#10-log-di-audit)
11. [Avvio dell'applicazione](#11-avvio-dellapplicazione)

---

## 1. Accesso al sistema

Aprire il browser e navigare all'indirizzo dell'applicazione (es. `http://localhost:5173` in locale).

Nella schermata di login inserire **nome utente** e **password**. Nella pagina di login sono presenti dei pulsanti di accesso rapido per i ruoli preconfigurati (utili in fase di test).

> **Sessione:** il token di accesso ha una durata di 8 ore. Allo scadere sarà necessario effettuare nuovamente il login.

---

## 2. Ruoli utente

| Ruolo | Cosa può fare |
|---|---|
| **admin** | Accesso completo: gestione utenti, configurazione, sblocco PIN, log audit |
| **tavoli** | Gestione tavoli e assegnazioni, creazione gruppi |
| **prenotazioni** | Inserimento e modifica prenotazioni / gruppi |
| **operator** | Solo visualizzazione, nessuna modifica |

Le funzionalità visibili nell'interfaccia si adattano automaticamente al ruolo dell'utente connesso.

---

## 3. Pannello principale

Dopo il login si accede al pannello di gestione. La struttura è la seguente:

- **Barra superiore** — mostra il titolo dell'evento, l'utente connesso e il pulsante di logout.
- **Selettore data/turno** — permette di scegliere la data evento e il turno (Pranzo / Cena) su cui lavorare.
- **Schede principali:**
  - `Gruppi` — elenco delle prenotazioni / gruppi
  - `Tavoli` — visualizzazione e assegnazione dei posti
  - `Menu` — gestione piatti
  - `Impostazioni` (solo admin/tavoli) — configurazione sessione e tavoli

Lo stato dell'applicazione viene salvato automaticamente nel database con un ritardo di 1 secondo dall'ultima modifica. Un indicatore in alto mostra lo stato del salvataggio (*Salvando…* / *Salvato* / *Errore*).

---

## 4. Gestione date eventi

Accessibile dalla scheda **Impostazioni** o dal pannello di selezione data.

### Aggiungere una data

1. Fare clic su **Aggiungi data**.
2. Selezionare la data dal calendario.
3. Inserire un'etichetta descrittiva (es. `Sabato sera`).
4. Confermare.

> Sono supportate fino a **7 date** per evento.

### Attivare i turni (Pranzo / Cena)

Per ogni data è possibile abilitare o disabilitare i singoli turni con gli appositi toggle. Se un turno contiene già dei gruppi assegnati, il sistema chiederà conferma prima di disabilitarlo.

### Eliminare una data

Fare clic sull'icona del cestino accanto alla data. L'operazione richiede conferma ed elimina tutti i dati associati alla data (gruppi, assegnazioni, configurazione tavoli).

---

## 5. Gestione gruppi e prenotazioni

### Aggiungere un gruppo

1. Andare nella scheda **Gruppi**.
2. Fare clic su **Aggiungi gruppo**.
3. Compilare il modulo:
   - **Cognome / Nome gruppo** *(obbligatorio)*
   - **N° persone** *(obbligatorio)*
   - Nome referente e telefono
   - Note (es. allergie, esigenze particolari)
   - Selezione piatti dal menu (con quantità per ogni voce)
4. Fare clic su **Salva**.

### Modificare un gruppo

Fare clic sull'icona della matita a fianco del gruppo nell'elenco. Si aprirà lo stesso modulo di inserimento con i dati precompilati.

### Eliminare un gruppo

Fare clic sull'icona del cestino. L'operazione richiede conferma. Se il gruppo ha un tavolo assegnato, l'assegnazione viene rimossa automaticamente.

### Ricerca e ordinamento

- Usare la **barra di ricerca** per filtrare per nome, telefono o note.
- Fare clic sulle intestazioni delle colonne per **ordinare** l'elenco (nome, persone, telefono, note, tavolo assegnato).

---

## 6. Assegnazione tavoli

### Configurazione tavoli (scheda Impostazioni)

Prima di assegnare i gruppi, configurare la disposizione fisica dei tavoli:

1. Attivare le **file** da usare (A, B, C, D, E, F — fino a 6).
2. Per ogni fila impostare:
   - **Numero di tavoli** nella fila
   - **Posti per tavolo**

Le file sono visualizzate con colori distinti per facilitare l'identificazione.

### Assegnazione manuale

Nella scheda **Tavoli**:

1. Selezionare il gruppo dall'elenco (o cercarlo).
2. Fare clic sul tavolo di destinazione nella mappa visiva.
3. Specificare i posti da occupare in quel tavolo se il gruppo occupa più tavoli.

### Assegnazione automatica

Fare clic sul pulsante **Assegna automaticamente** (o **Shuffle**). Il sistema distribuisce i gruppi tra i tavoli disponibili ottimizzando l'occupazione. È possibile rieseguire l'operazione più volte per ottenere configurazioni diverse.

### Visualizzazione occupazione

Ogni tavolo mostra in tempo reale:
- Posti occupati / posti totali
- Nome del/dei gruppo/i assegnati
- Colore della fila di appartenenza

I tavoli completamente occupati vengono evidenziati visivamente.

### Copiare la configurazione su un'altra data

Dal pannello impostazioni è disponibile la funzione **Copia sessione** per duplicare gruppi e assegnazioni su un'altra data/turno.

---

## 7. Menu

Accessibile dalla scheda **Menu**.

### Aggiungere una voce

1. Fare clic su **Aggiungi voce**.
2. Compilare: nome, categoria, prezzo, disponibilità.
3. Impostare l'ordine di visualizzazione.
4. Salvare.

### Gestire le voci

- Modificare le voci con l'icona matita.
- Abilitare/disabilitare una voce con il toggle **Disponibile**.
- Eliminare voci non più necessarie.

Le voci del menu sono associate alla sessione corrente (data + turno) e vengono visualizzate durante l'inserimento/modifica di un gruppo per la selezione dei piatti.

---

## 8. Esportazione e stampa

### Esportazione PDF

Fare clic sul pulsante **Esporta PDF** (disponibile nella scheda Tavoli o Gruppi). Il file generato include:

- Il logo della Proloco Dairago
- Elenco gruppi con dettagli
- Mappa assegnazione tavoli
- Data e turno selezionati

### Stampa

Usare il pulsante **Stampa** per ottenere una versione ottimizzata per la stampa della disposizione dei tavoli.

---

## 9. Funzioni amministratore

### Sblocco PIN

Alcune operazioni sensibili (es. eliminazione massiva, reset configurazione) richiedono l'inserimento di un **PIN amministratore**. Il pannello di sblocco appare automaticamente quando richiesto. Il PIN è configurato dall'amministratore di sistema.

### Gestione utenti

Accessibile solo con ruolo **admin**:

1. Aprire il menu **Utenti** (icona o voce nel menu admin).
2. Da qui è possibile:
   - Creare nuovi utenti con nome, password e ruolo
   - Modificare password e ruolo di utenti esistenti
   - Disattivare account

### Configurazione generale

L'admin può modificare le impostazioni globali dell'applicazione, incluse le configurazioni di default per nuove sessioni.

---

## 10. Log di audit

Accessibile solo con ruolo **admin** dalla voce **Audit** nel pannello di controllo.

Il log mostra tutte le operazioni effettuate sul sistema:

| Campo | Descrizione |
|---|---|
| Data/ora | Timestamp dell'operazione |
| Utente | Chi ha eseguito l'azione |
| Azione | Tipo: creazione, modifica, eliminazione |
| Entità | Tabella/elemento modificato |
| Vecchi valori | Dati prima della modifica |
| Nuovi valori | Dati dopo la modifica |
| IP | Indirizzo IP del client |

È possibile filtrare il log per **tipo di entità** o **utente** e navigare tra le pagine dei risultati.

---

## 11. Avvio dell'applicazione

### Avvio locale (Windows)

Fare doppio clic sul file **`avvia.bat`** nella cartella principale del progetto. Il batch avvia sia il backend (porta 3001) che il frontend (porta 5173).

In alternativa, aprire due terminali separati:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Aprire il browser su `http://localhost:5173`.

### Prerequisiti

- Node.js installato
- PostgreSQL in esecuzione con il database configurato
- File `.env` nel backend con le variabili d'ambiente corrette (`DATABASE_URL`, `JWT_SECRET`, ecc.)

### Ambiente di produzione

In produzione l'applicazione è servita tramite **Nginx** come reverse proxy. Fare riferimento alla configurazione nella cartella `nginx/` del progetto.

---

## Note operative

- **Backup:** eseguire regolarmente un backup del database PostgreSQL prima di ogni evento.
- **Più operatori contemporanei:** l'app supporta più utenti connessi in simultanea. Le modifiche vengono salvate nel database condiviso ma la sincronizzazione in tempo reale tra browser diversi non è automatica — ricaricare la pagina per vedere le modifiche altrui.
- **Recupero dati:** in caso di errore accidentale, contattare l'amministratore per consultare il log di audit e ripristinare i valori precedenti.

---

*Applicazione sviluppata da Luca Trentarossi per la Proloco di Dairago.*
