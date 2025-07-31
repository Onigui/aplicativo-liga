// Controller para usuários
export function getUsers(req, res) {
  // Dados mockados de exemplo
  res.json([
    { id: 1, name: 'Usuário Exemplo 1', email: 'user1@email.com' },
    { id: 2, name: 'Usuário Exemplo 2', email: 'user2@email.com' }
  ]);
}
