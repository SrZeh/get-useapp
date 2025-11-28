# Troubleshooting: Help Request não está criando

## Problema
O botão "Criar Pedido" está travando ao tentar criar um pedido de ajuda. O `addDoc` não retorna erro nem sucesso.

## Diagnóstico

### 1. Verificar se as regras foram deployadas

Execute:
```bash
firebase deploy --only firestore:rules
```

Verifique se o deploy foi bem-sucedido.

### 2. Verificar as regras no Firebase Console

1. Acesse: https://console.firebase.google.com/project/upperreggae/firestore/rules
2. **IMPORTANTE**: Verifique se você está visualizando o database **"appdb"** (não "(default)")
3. Procure por `helpRequests` nas regras
4. As regras devem incluir:

```javascript
match /helpRequests/{requestId} {
  allow read: if true;
  allow create: if isAuthed() && request.resource.data.requesterUid == uid();
  allow update: if isAuthed() && resource.data.requesterUid == uid();
  allow delete: if false;
}
```

### 3. Verificar se o database "appdb" existe

1. Acesse: https://console.firebase.google.com/project/upperreggae/firestore/databases
2. Verifique se existe um database chamado **"appdb"**
3. Se não existir, você precisa criá-lo:
   - Clique em "Add database"
   - Escolha "Start in production mode" ou "Start in test mode"
   - **IMPORTANTE**: Nomeie como **"appdb"** (não "(default)")

### 4. Verificar se as regras estão no database correto

As regras em `firestore.appdb.rules` devem ser deployadas para o database "appdb", não para "(default)".

Verifique o `firebase.json`:
```json
{
  "firestore": [
    {
      "database": "appdb",
      "rules": "firestore.appdb.rules",
      "indexes": "firestore.appdb.indexes.json"
    }
  ]
}
```

### 5. Testar manualmente no Firebase Console

1. Acesse: https://console.firebase.google.com/project/upperreggae/firestore/databases/appdb/data
2. Tente criar um documento manualmente na coleção `helpRequests`
3. Se der erro de permissão, as regras estão bloqueando

### 6. Verificar logs do Firestore

1. Acesse: https://console.firebase.google.com/project/upperreggae/firestore/databases/appdb/usage
2. Verifique se há tentativas de escrita sendo bloqueadas

## Solução Rápida (Temporária)

Se precisar testar rapidamente, você pode temporariamente permitir todas as operações na coleção `helpRequests`:

```javascript
match /helpRequests/{requestId} {
  allow read, write: if true; // ⚠️ TEMPORÁRIO - apenas para teste!
}
```

**⚠️ ATENÇÃO**: Isso permite que qualquer pessoa crie/leia/atualize pedidos. Use apenas para teste e depois remova!

## Solução Definitiva

1. Certifique-se de que o database "appdb" existe
2. Deploy das regras:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. Verifique se o deploy foi para o database correto ("appdb")
4. Teste novamente

## Se ainda não funcionar

1. Verifique os logs do console do navegador para erros de rede
2. Verifique se há problemas de CORS ou conexão
3. Tente criar um item normal (que funciona) para confirmar que o problema é específico de `helpRequests`
4. Verifique se há algum problema com o `serverTimestamp()` ou `Timestamp.fromDate()`

## Comparação com outros serviços

Os outros serviços (items, reservations) usam exatamente o mesmo padrão:

```typescript
const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
```

Se eles funcionam e `helpRequests` não funciona, o problema é definitivamente nas regras de segurança ou na existência da coleção/database.

