#!/bin/bash
# Script para fazer deploy das regras do Firestore

echo "🚀 Fazendo deploy das regras do Firestore para o banco 'appdb'..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
  echo "✅ Regras deployadas com sucesso!"
else
  echo "❌ Erro ao fazer deploy das regras."
  echo "💡 Certifique-se de estar autenticado: firebase login"
  exit 1
fi



