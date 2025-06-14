import { useState } from 'react';

interface QuantityDialogProps {
  initialQuantity: number;
  onClose: () => void;
  onSubmit: (quantity: number) => void;
}

const QuantityDialog = ({ initialQuantity, onClose, onSubmit }: QuantityDialogProps) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3 style={{color: "var(--menu-text)"}}>Set Quantity</h3>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <div className="dialog-actions">
          <button onClick={() => onSubmit(quantity)}>Done</button>
          <button onClick={onClose} style={{ background: 'gray' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default QuantityDialog;
