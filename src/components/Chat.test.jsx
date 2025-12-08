import { render, screen } from '@testing-library/react';
import Chat from '../components/Chat';
import { expect, test } from 'vitest';

test('renders chat component', () => {
  render(<Chat />);
  
  const input = screen.getByPlaceholderText('Type a message...');
  expect(input).toBeInTheDocument();
});
