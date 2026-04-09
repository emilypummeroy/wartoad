import { Replace, Pyramid } from 'lucide-react';
import { useId, type ReactNode } from 'react';

function NorthFacedownCard() {
  const id = useId();
  return (
    <section aria-labelledby={id} className="facedown card north">
      <Pyramid>
        <title id={id}>North controlled empty field</title>
      </Pyramid>
    </section>
  );
}

function SouthFacedownCard() {
  const id = useId();
  return (
    <section aria-labelledby={id} className="facedown card south">
      <Pyramid>
        <title id={id}>South controlled empty field</title>
      </Pyramid>
    </section>
  );
}
type ZoneProps = Readonly<{
  children: ReactNode;
  isPlaced: boolean;
  isDropzone: boolean;
  onPlace: () => void;
}>;

export function NorthZone({
  children,
  isPlaced,
  isDropzone: isPlacing,
  onPlace,
}: ZoneProps) {
  const buttonId = useId();
  const isDropzone = isPlacing && !isPlaced;
  return (
    <button className="placeable-zone" disabled={!isDropzone} onClick={onPlace}>
      <div className="zone north" role="gridcell">
        {isDropzone && (
          <div className="overlay-container">
            <Replace id={buttonId}>
              <title>Place on</title>
            </Replace>
          </div>
        )}
        {isPlaced ? children : <NorthFacedownCard />}
      </div>
    </button>
  );
}

export function SouthZone({
  children,
  isPlaced,
  isDropzone: isPlacing,
  onPlace,
}: ZoneProps) {
  const buttonId = useId();
  const isDropzone = isPlacing && !isPlaced;
  return (
    <button className="placeable-zone" disabled={!isDropzone} onClick={onPlace}>
      <div className="zone south" role="gridcell">
        {isDropzone && (
          <div className="overlay-container">
            <Replace id={buttonId}>
              <title>Place on</title>
            </Replace>
          </div>
        )}
        {isPlaced ? children : <SouthFacedownCard />}
      </div>
    </button>
  );
}
