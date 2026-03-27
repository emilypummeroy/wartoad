import { fireEvent, render, screen } from '@testing-library/react';

import App from './App.tsx';

const FEW = 3;

describe('the dom test environment', () => {
  it('should have a defined document', () => {
    expectTypeOf(document).not.toBeUndefined();
  });
});

describe(App, () => {
  beforeEach(() => render(<App />));

  it('should have the wartide heading', async () => {
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Wartide');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Wartide',
    );
  });

  describe('Phase', () => {
    it('should start in the main phase', async () => {
      expect(await screen.findByLabelText('Phase')).toHaveTextContent('Main');
    });

    it('should advance to the end phase when the button is clicked', async () => {
      fireEvent.click(await screen.findByText('Next phase'));
      expect(screen.getByLabelText('Phase')).toHaveTextContent('End');
    });

    it('should cycle between main and end phase when the button is clicked', async () => {
      for (let x = 0; x < FEW; x += 1) {
        fireEvent.click(await screen.findByText('Next phase'));
        expect(screen.getByLabelText('Phase')).toHaveTextContent('End');
        fireEvent.click(await screen.findByText('Next phase'));
        expect(screen.getByLabelText('Phase')).toHaveTextContent('Main');
      }
    });
  });
});
