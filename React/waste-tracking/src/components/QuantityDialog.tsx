import { useEffect, useState } from 'react';

interface QuantityDialogProps {
  initialQuantity: number;
  unit: string;
  onClose: () => void;
  onSubmit: (quantity: number | { pounds: number; ounces: number }) => void;
}

const QuantityDialog = ({ initialQuantity, unit, onClose, onSubmit }: QuantityDialogProps) => {
  const isWeight = unit.toLowerCase() === 'pounds/ounces';

  const [quantity, setQuantity] = useState(initialQuantity);
  const [pounds, setPounds] = useState(0);
  const [ounces, setOunces] = useState(0);

  useEffect(() => {
    if (isWeight) {
      setPounds(Math.floor(initialQuantity / 16));
      setOunces(initialQuantity % 16);
    } else {
      setQuantity(initialQuantity);
    }
  }, [initialQuantity, isWeight]);

  const handleSubmit = () => {
    if (isWeight) {
      const totalOunces = pounds * 16 + ounces;
      if (totalOunces === initialQuantity || totalOunces === 0) {
        onClose();
        return;
      }
      onSubmit({ pounds, ounces });
    } else {
      if (quantity === initialQuantity || quantity === 0) {
        onClose();
        return;
      }
      onSubmit(quantity);
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
            />
            <input
              type="number"
              value={ounces}
              min={0}
              max={15}
              placeholder="Ounces"
              onChange={(e) => setOunces(Number(e.target.value))}
            />
          </div>
        ) : (
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        )}

        <div className="dialog-actions">
          <button onClick={handleSubmit}>Done</button>
          <button onClick={onClose} style={{ background: 'gray' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default QuantityDialog;
