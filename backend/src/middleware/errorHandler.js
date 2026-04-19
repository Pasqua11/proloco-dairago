function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Valore duplicato: il record esiste già' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record non trovato' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: 'Errore interno del server' });
}

module.exports = { errorHandler };
