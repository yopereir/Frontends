import { useEffect, useState } from 'react';

interface QuantityDialogProps {
  initialQuantity: number;
  unit: string;
  onClose: () => void;
  onSubmit: (
    quantity: number | { pounds: number; ounces: number } | { gallons: number; quarts: number },
    isDonation: boolean
  ) => void;
}

const QuantityDialog = ({ initialQuantity, unit, onClose, onSubmit }: QuantityDialogProps) => {
  const isWeight = unit.toLowerCase() === 'pounds/ounces';
  const isVolume = unit.toLowerCase() === 'gallons/quarts';

  const [quantity, setQuantity] = useState(initialQuantity);
  const [pounds, setPounds] = useState(0);
  const [ounces, setOunces] = useState(0);
  const [gallons, setGallons] = useState(0);
  const [quarts, setQuarts] = useState(0);
  const [isDonation, setIsDonation] = useState(false);

  useEffect(() => {
    if (isWeight) {
      setPounds(Math.floor(initialQuantity / 16));
      setOunces(initialQuantity % 16);
    } else if (isVolume) {
      setGallons(Math.floor(initialQuantity / 4));
      setQuarts(initialQuantity % 4);
    } else {
      setQuantity(initialQuantity);
    }
  }, [initialQuantity, isWeight, isVolume]);

  const handleSubmit = () => {
    if (isWeight) {
      const totalOunces = pounds * 16 + ounces;
      if (totalOunces === 0) {
        onClose();
        return;
      }
      onSubmit({ pounds, ounces }, isDonation);
    } else if (isVolume) {
      const totalQuarts = gallons * 4 + quarts;
      if (totalQuarts === 0) return onClose();
      onSubmit({ gallons, quarts }, isDonation);
    } else {
      if (quantity === 0) {
        onClose();
        return;
      }
      onSubmit(quantity, isDonation);
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
              onChange={(e) => setPounds(Number(e.target.value))}
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
              onChange={(e) => setOunces(Number(e.target.value))}
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
            <input type="number" value={gallons} min={0} placeholder="Gallons" onChange={(e) => setGallons(Number(e.target.value))} style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              height: '45px',
            }} />
            <input type="number" value={quarts} min={0} max={3} placeholder="Quarts" onChange={(e) => setQuarts(Number(e.target.value))} style={{
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
            min={1}
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
