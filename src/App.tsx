import './App.css';
import { useState } from 'react';

const Phase = {
  Main: 'Main',
  End: 'End',
} as const;
type Phase = (typeof Phase)[keyof typeof Phase];

export function App() {
  const [phase, setPhase] = useState<Phase>(Phase.Main);
  const setNextPhase = () =>
    setPhase(p => (p === Phase.End ? Phase.Main : Phase.End));
  return (
    <>
      <h1>Wartide</h1>
      <h4 id="phase">Phase</h4>
      <p aria-labelledby="phase">{phase}</p>
      <button onClick={setNextPhase}>Next phase</button>
    </>
  );
}
