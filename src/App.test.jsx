/* global test, expect */
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders headline', { timeout: 15000 }, () => {
  render(<App />);
  const headline = screen.getByRole('heading', { name: /TalkStudio/i });
  expect(headline).toBeInTheDocument();
});
