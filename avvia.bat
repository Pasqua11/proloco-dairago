  @echo off
  echo ========================================
  echo   AVVIO PROLOCO DAIRAGO - LOCALE
  echo ========================================

  echo.
  echo [1/2] Avvio Backend...
  start "Backend" cmd /k "cd C:\progetti\proloco-dairago\backend && node src/server.js"

  echo.
  echo [2/2] Avvio Frontend...
  start "Frontend" cmd /k "cd C:\progetti\proloco-dairago\frontend && npm run dev"

  echo.
  echo ========================================
  echo   App disponibile su:
  echo   http://localhost:5173
  echo ========================================
  pause