import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LOGO_SRC = '/Logo.jpg';
const APP_VERSION = '2026.04.21-v1';

const UTENTI = [
  { username: 'admin',        label: 'Amministratore', emoji: '👑', desc: 'Accesso completo',      passwordless: false },
  { username: 'tavoli',       label: 'Tavoli',         emoji: '🪑', desc: 'Gestione tavoli',        passwordless: false },
  { username: 'prenotazioni', label: 'Prenotazioni',   emoji: '📋', desc: 'Inserimento e modifica', passwordless: false },
  { username: 'operator1',    label: 'Operatore',      emoji: '👁️',  desc: 'Solo lettura',           passwordless: true  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);

  const selezionaUtente = async (utente) => {
    setUsername(utente.username);
    setErrore('');
    if (utente.passwordless) {
      setLoading(true);
      try {
        await login(utente.username, '');
        navigate('/');
      } catch (err) {
        setErrore(err.response?.data?.error || 'Errore di accesso');
        setLoading(false);
      }
      return;
    }
    setTimeout(() => passwordRef.current?.focus(), 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrore('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setErrore(err.response?.data?.error || 'Credenziali non valide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4" style={{ fontFamily: 'Georgia, serif' }}>
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <img src={LOGO_SRC} alt="Logo Proloco Dairago" className="w-32 object-contain mb-3 drop-shadow-md" />
          <h1 className="text-3xl font-bold text-amber-900">Proloco Dairago</h1>
          <p className="text-amber-700 italic text-sm">Gestione Tavoli e Prenotazioni</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border-2 border-amber-200 p-6">

          {/* Selezione utente */}
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-3">Seleziona utente</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {UTENTI.map(u => (
              <button
                key={u.username}
                type="button"
                disabled={loading}
                onClick={() => selezionaUtente(u)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center
                  ${username === u.username
                    ? 'border-amber-500 bg-amber-50 shadow-md'
                    : 'border-amber-200 hover:border-amber-400 hover:bg-amber-50'}`}
              >
                <span className="text-2xl mb-1">{u.emoji}</span>
                <span className="text-xs font-bold text-amber-900 leading-tight">{u.label}</span>
                <span className="text-xs text-amber-600 leading-tight mt-0.5">{u.desc}</span>
              </button>
            ))}
          </div>

          {/* Form password */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">
                Utente selezionato
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full border-2 border-amber-200 rounded-lg px-3 py-2 text-sm bg-amber-50 focus:outline-none focus:border-amber-500 text-amber-900 font-semibold"
                placeholder="oppure digita username..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">Password</label>
              <input
                ref={passwordRef}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border-2 border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                placeholder="••••••••"
                required
              />
            </div>

            {errore && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                {errore}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username}
              className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white font-bold rounded-xl px-4 py-2.5 transition-colors shadow"
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>
        </div>

        <div className="flex justify-between text-xs text-amber-600 mt-4 italic px-1">
          <span>Creato da Trentarossi Luca</span>
          <span>v {APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
}
