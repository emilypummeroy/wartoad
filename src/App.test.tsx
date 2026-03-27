import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App.tsx';

describe('the dom test environment', () => {
  it('should have a defined document', () => {
    expect(typeof document).not.toBe('undefined');
  });
});

describe(App, () => {
  beforeEach(() => render(<App />));

  it("should have the wartide heading", async () => {
    const heading = await screen.findByRole('heading', { level: 1 });

    expect(heading).toHaveTextContent('Wartide');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Wartide');
  });

  describe('Phase', () => {
    it("should start in the main phase", async () => {
      expect(await screen.findByLabelText('Phase')).toHaveTextContent('Main');
    });

    it("should advance to the end phase when the button is clicked", async () => {
      fireEvent.click(await screen.findByText('Next phase'));

      expect(screen.getByLabelText('Phase')).toHaveTextContent('End');
    });

    it("should cycle between main and end phase when the button is clicked", async () => {
      for await (let _ of Array(3)) {
        fireEvent.click(await screen.findByText('Next phase'));

        expect(screen.getByLabelText('Phase')).toHaveTextContent('End');

        fireEvent.click(await screen.findByText('Next phase'));

        expect(screen.getByLabelText('Phase')).toHaveTextContent('Main');
      }
    });
  });
});
  