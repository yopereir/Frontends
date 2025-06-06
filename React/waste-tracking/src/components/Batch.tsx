import { useEffect, useState } from "react";
import { useSession, BatchData } from "../context/SessionContext";
import QuantityDialog from './QuantityDialog';

const Batch = ({ id, itemName, imageUrl, startTime, holdMinutes, quantity_type, quantity_amount }: BatchData) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [timeColor, setTimeColor] = useState("#3ecf8e");
  const [showDialog, setShowDialog] = useState(false);
  const { batches, setBatches } = useSession();

    const handleUpdateQuantity = (newQuantity: number) => {
    const updated = batches.map(batch =>
      batch.id === id ? { ...batch, quantity_amount: newQuantity } : batch
    );
    setBatches(updated);
    setShowDialog(false);
  };

  const handleClear = () => {
    const updated = batches.filter(batch => batch.id !== id);
    setBatches(updated);
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endTime = new Date(new Date(startTime).getTime() + holdMinutes * 60000);
      const diffMs = endTime.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft("EXPIRED");
        setTimeColor('var(--error-color)');
      } else {
        const minutes = Math.floor(diffMs / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        setTimeColor(diffMs/(holdMinutes * 60000) < .2 ? 'var(--error-color)' :
         'var(--button-color)'); // Change color if less than 20% of time left
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [startTime, holdMinutes]);


  return (
    <div className="batch-card">
      <div className="batch-left" onClick={() => setShowDialog(true)}>
        <img src={imageUrl} alt={itemName} className="batch-image" />
        <div className="batch-title">{itemName}</div>
      </div>
      <div className="batch-right">
        <div className="batch-subtext">{quantity_amount}: {quantity_type}</div>
        <div className="batch-timer" style={{ color: timeColor }}>{timeLeft}</div>
        <button className="batch-button" onClick={handleClear}>Clear</button>
      </div>
      {showDialog && (
        <QuantityDialog
          initialQuantity={quantity_amount}
          onClose={() => setShowDialog(false)}
          onSubmit={handleUpdateQuantity}
        />
      )}
    </div>
  );
};

export default Batch;
