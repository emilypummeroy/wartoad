import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.tsx';

describe('the dom test environment', () => {
  it('should have a defined document', () => {
    expect(typeof document).not.toBe('undefined');
  });
});

describe(App, () => {
  beforeEach(() => render(<App />));

  it("should have the heading", async () => {
    expect(await screen.findByRole('heading')).toHaveTextContent('Wartide');
  });
});
  