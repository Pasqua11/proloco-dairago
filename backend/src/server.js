const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server avviato su porta ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
