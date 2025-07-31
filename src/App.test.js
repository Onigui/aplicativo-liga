import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Liga do Bem app', () => {
  render(<App />);
  
  // Verificar se o app renderiza elementos básicos
  const loginButton = screen.getByText(/Fazer Login/i);
  expect(loginButton).toBeInTheDocument();

  const createAccountButton = screen.getByText(/Criar Conta/i);
  expect(createAccountButton).toBeInTheDocument();
});
