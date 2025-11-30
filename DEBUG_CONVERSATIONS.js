/**
 * Debug Script - Conversations Database Connection
 * 
 * Execute este script no console do navegador para debugar a conexão
 * Abrir: http://localhost:3000/dashboard/conversations
 * Ctrl + Shift + J (Console)
 * Cole este código e execute
 */

// 1. Testar conexão com API
console.log('=== 1. Testando API /api/conversations ===');
fetch('/api/conversations')
  .then(res => {
    console.log('Status:', res.status);
    console.log('OK:', res.ok);
    return res.json();
  })
  .then(data => {
    console.log('Resposta:', data);
    console.log('Quantidade:', Array.isArray(data) ? data.length : 'não é array');
    if (Array.isArray(data) && data.length > 0) {
      console.log('Primeira conversa:', data[0]);
    }
  })
  .catch(err => console.error('Erro:', err));

// 2. Verificar autenticação
console.log('\n=== 2. Verificando autenticação ===');
console.log('Cookies:', document.cookie);
localStorage.getItem('sb-auth-token') 
  ? console.log('✅ Token de auth encontrado')
  : console.log('❌ Nenhum token de auth');

// 3. Verificar headers
console.log('\n=== 3. Fazendo requisição com debug de headers ===');
fetch('/api/conversations', {
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('Resposta da API:', data);
  });
