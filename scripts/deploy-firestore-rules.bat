@echo off
REM Script para fazer deploy das regras do Firestore (Windows)

echo 🚀 Fazendo deploy das regras do Firestore para o banco 'appdb'...
firebase deploy --only firestore:rules

if %ERRORLEVEL% EQU 0 (
  echo ✅ Regras deployadas com sucesso!
) else (
  echo ❌ Erro ao fazer deploy das regras.
  echo 💡 Certifique-se de estar autenticado: firebase login
  exit /b 1
)



