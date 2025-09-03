import { useEffect, useState } from 'react';

interface QuantityDialogProps {
  initialQuantity: number;
  unit: string;
  initialTags?: string[]; // New prop for initial tags
  onClose: () => void;
  onSubmit: (
    quantity: number | { pounds: number; ounces: number } | { gallons: number; quarts: number },
    tags: string[]
  ) => void;
}

const QuantityDialog = ({ initialQuantity, unit, initialTags = [], onClose, onSubmit }: QuantityDialogProps) => {
  const isWeight = unit.toLowerCase() === 'pounds/ounces';
  const isVolume = unit.toLowerCase() === 'gallons/quarts';

  const [quantity, setQuantity] = useState<number | string>('');
  const [pounds, setPounds] = useState<number | string>('');
  const [ounces, setOunces] = useState<number | string>('');
  const [gallons, setGallons] = useState<number | string>('');
  const [quarts, setQuarts] = useState<number | string>('');
  const [tags, setTags] = useState<string[]>(initialTags);
  const [isDonation, setIsDonation] = useState(initialTags.includes("donation"));

  useEffect(() => {
    if (isDonation && !tags.includes("donation")) {
      setTags(prevTags => [...prevTags, "donation"]);
    } else if (!isDonation && tags.includes("donation")) {
      setTags(prevTags => prevTags.filter(tag => tag !== "donation"));
    }
  }, [isDonation, tags]); // Depend on tags as well to ensure consistency

  

  const handleSubmit = () => {
    const numPounds = Number(pounds);
    const numOunces = Number(ounces);
    const numGallons = Number(gallons);
    const numQuarts = Number(quarts);

    if (isWeight) {
      const totalOunces = numPounds * 16 + numOunces;
      if (totalOunces === 0) {
        onClose();
        return;
      }
      onSubmit({ pounds: numPounds, ounces: numOunces }, tags);
    } else if (isVolume) {
      const totalQuarts = numGallons * 4 + numQuarts;
      if (totalQuarts === 0) return onClose();
      onSubmit({ gallons: numGallons, quarts: numQuarts }, tags);
    } else {
      if (quantity === 0) {
        onClose();
        return;
      }
      onSubmit(quantity, tags);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3 style={{ color: "var(--menu-text)" }}>Set Quantity</h3>

        {isWeight ? (
          <div style={{ display: "flex", gap: "1rem" }}>
            <input
              type="number"
              value={pounds}
              min={0}
              placeholder="Pounds"
              onChange={(e) => setPounds(e.target.value === '' ? '' : Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                height: '45px',
              }}
            />
            <input
              type="number"
              value={ounces}
              min={0}
              max={15}
              placeholder="Ounces"
              onChange={(e) => setOunces(e.target.value === '' ? '' : Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                height: '45px',
              }}
            />
          </div>
        ) : isVolume ? (
          <div style={{ display: "flex", gap: "1rem" }}>
            <input type="number" value={gallons} min={0} placeholder="Gallons" onChange={(e) => setGallons(e.target.value === '' ? '' : Number(e.target.value))} style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              height: '45px',
            }} />
            <input type="number" value={quarts} min={0} max={3} placeholder="Quarts" onChange={(e) => setQuarts(e.target.value === '' ? '' : Number(e.target.value))} style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              height: '45px',
            }} />
          </div>
          ) : (
          <input
            type="number"
            value={quantity}
            placeholder="0"
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              height: '45px',
            }}
          />
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '1rem',
          justifyContent: 'flex-start',
          width: '100%',
        }}>
          <input
            type="checkbox"
            id="isDonation"
            checked={isDonation}
            onChange={(e) => setIsDonation(e.target.checked)}
            style={{
              width: '20px',
              height: '20px',
              margin: 0,
              accentColor: 'var(--button-color)',
            }}
          />
          <label htmlFor="isDonation" style={{
            fontSize: '1rem',
            color: 'var(--menu-text)',
            marginLeft: 0,
          }}>Donation</label>
        </div>

        

        <div className="dialog-actions">
          <button onClick={handleSubmit}>Done</button>
          <button onClick={onClose} style={{ background: 'gray' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default QuantityDialog;
