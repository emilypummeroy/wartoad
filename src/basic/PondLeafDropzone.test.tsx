import { screen } from '@testing-library/react';

import { renderWithGameContext } from '../context/GameContext.test-utils';
import { Player } from '../types/gameflow';
import { PondLeafDropzone } from './PondLeafDropzone';

const TEST_LABEL_ID = 'test-label-id';
const TEST_LABEL = 'the Target';
describe(PondLeafDropzone, () => {
  it('should render its children', () => {
    renderWithGameContext()(
      <PondLeafDropzone
        targetLabelId={TEST_LABEL_ID}
        position={{ x: 0, y: 0 }}
        onCardPlaced={() => {}}
        controller={Player.North}
      >
        <div id={TEST_LABEL_ID} aria-label={TEST_LABEL}>
          Hello
        </div>
      </PondLeafDropzone>,
    );
    expect(screen.getByText('Hello')).toBeVisible();
  });
});
