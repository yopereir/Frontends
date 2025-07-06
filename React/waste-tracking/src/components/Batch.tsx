import { useEffect, useState } from "react";
import { useSession, BatchData } from "../context/SessionContext";
import QuantityDialog from './QuantityDialog';
import supabase from "../supabase";

const Batch = ({ id, itemName, imageUrl, startTime, holdMinutes, unit, quantity_amount }: BatchData) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [timeColor, setTimeColor] = useState("#3ecf8e");
  const [showDialog, setShowDialog] = useState(false);
  const { batches, setBatches } = useSession();
  const { session } = useSession();

    const handleUpdateQuantity = (newQuantity: number) => {
    const updated = batches.map(batch =>
      batch.id === id ? { ...batch, quantity_amount: newQuantity } : batch
    );
    setBatches(updated);
    setShowDialog(false);
  };

  const handleClear = async () => {
    const updated = batches.filter(batch => batch.id !== id);
    setBatches(updated);
    // Save waste entry
    const removedBatch = batches.filter(batch => batch.id === id)[0];
    const { error } = await supabase.from('waste_entries').insert({item_id: removedBatch.itemId, user_id: session?.user.id, quantity: removedBatch.quantity_amount, metadata: {}});
    if (error) {
      console.error("Error logging waste entry:", error);
      alert("Failed to log waste entry. "+error.message);
    } else {
      console.log("Waste entry logged successfully");
    }
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
        <div className="batch-subtext">{quantity_amount} {unit}</div>
        {holdMinutes > 0 && (<div className="batch-timer" style={{ color: timeColor }}>{timeLeft}</div>)}
        <button className="batch-button" onClick={handleClear}>Done</button>
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
