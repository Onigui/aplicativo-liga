// Controller para pagamentos
export function getPayments(req, res) {
  // Dados mockados de exemplo
  res.json([
    { id: 1, user: 'Usuário Exemplo 1', value: 100, status: 'pago' },
    { id: 2, user: 'Usuário Exemplo 2', value: 200, status: 'pendente' }
  ]);
}
