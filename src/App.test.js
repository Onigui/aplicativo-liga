import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Liga do Bem Botucatu title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Liga do Bem Botucatu/i);
  expect(titleElement).toBeInTheDocument();
});
