// === Batch.tsx ===
import { useEffect, useState } from "react";
import { useSession, BatchData } from "../context/SessionContext"; // Ensure BatchData is imported
import QuantityDialog from './QuantityDialog';
// supabase import removed as waste logging is no longer its direct responsibility

interface BatchProps extends BatchData {
  // New prop for handling the "Done" button action
  onMoveToBox: (batch: BatchData) => Promise<boolean>; // Function to attempt moving batch to box, returns success status
  onRemoveBatch: (batchId: string) => void; // Function to remove the batch
}

const Batch = ({ id, metadata, onMoveToBox, onRemoveBatch }: BatchProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [timeColor, setTimeColor] = useState("#3ecf8e");
  const [showDialog, setShowDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // New state for error message
  const { batches, setBatches } = useSession();

  const handleUpdateQuantity = (
    newQuantity: number | { pounds?: number; ounces?: number; gallons?: number; quarts?: number },
    newTags: string[]
  ) => {
    const lowerUnit = metadata.unit.toLowerCase(); // Access unit from metadata

    let totalQuantity = 0;
    if (lowerUnit === 'pounds/ounces' && typeof newQuantity === "object") {
      totalQuantity = (newQuantity.pounds ?? 0) * 16 + (newQuantity.ounces ?? 0);
    } else if (lowerUnit === 'gallons/quarts' && typeof newQuantity === "object") {
      totalQuantity = (newQuantity.gallons ?? 0) * 4 + (newQuantity.quarts ?? 0);
    } else {
      totalQuantity = Number(newQuantity);
    }

    const updated = batches.map(batch =>
      batch.id === id ? { ...batch, metadata: { ...batch.metadata, quantity_amount: totalQuantity, tags: newTags } } : batch
    );

    setBatches(updated);
    setShowDialog(false);
  };

  const handleDone = async () => {
    setErrorMessage(""); // Clear previous error messages

    // Find the full batch object from the current active batches list
    const batchToMove = batches.find(b => b.id === id);

    if (batchToMove) {
      const success = await onMoveToBox(batchToMove); // Attempt to move the batch to a box
      if (!success) {
        setErrorMessage("Cannot add Batch since no Box exists");
      }
      // If successful, the batch will be removed from 'batches' state by ItemsPage
      // and added to a box, so no further action is needed here.
    }
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endTime = new Date(new Date(metadata.startTime).getTime() + metadata.holdMinutes * 60000); // Access from metadata
      const diffMs = endTime.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft("EXPIRED");
        setTimeColor('var(--error-color)');
      } else {
        const minutes = Math.floor(diffMs / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        setTimeColor(diffMs/(metadata.holdMinutes * 60000) < .2 ? 'var(--error-color)' : // Access from metadata
         'var(--button-color)'); // Change color if less than 20% of time left
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [metadata.startTime, metadata.holdMinutes]); // Dependencies from metadata


  return (
    <div className="batch-card" style={{ position: 'relative' }}>
      <div className="batch-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setShowDialog(true)}>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the parent div's onClick
            onRemoveBatch(id);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--error-color)',
            fontSize: '1.2em',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1',
            width: 'fit-content',
            height: 'fit-content',
            flexShrink: 0,
          }}
        >
          X
        </button>
        <img src={metadata.imageUrl} alt={metadata.itemName} className="batch-image" />
        <div className="batch-title">{metadata.itemName}</div>
      </div>
      <div className="batch-right">
      <div className="batch-subtext">
        {(() => {
          const lowerUnit = metadata.unit.toLowerCase();
          if (lowerUnit === 'pounds/ounces') {
            const pounds = Math.floor(metadata.quantity_amount / 16);
            const ounces = metadata.quantity_amount % 16;
            return `${pounds} pound${pounds !== 1 ? 's' : ''} ${ounces} ounce${ounces !== 1 ? 's' : ''}`;
          } else if (lowerUnit === 'gallons/quarts') {
            const gallons = Math.floor(metadata.quantity_amount / 4);
            const quarts = metadata.quantity_amount % 4;
            return `${gallons} gallon${gallons !== 1 ? 's' : ''} ${quarts} quart${quarts !== 1 ? 's' : ''}`;
          } else {
            return `${metadata.quantity_amount} ${metadata.unit}`;
          }
        })()}
      </div>
        {metadata.holdMinutes > 0 && (<div className="batch-timer" style={{ color: timeColor }}>{timeLeft}</div>)}
        <button className="batch-button" onClick={handleDone}>Done</button>
        {errorMessage && (
          <p style={{ color: 'var(--error-color)', fontSize: '0.75em', marginTop: '5px' }}>
            {errorMessage}
          </p>
        )}
      </div>
      {showDialog && (
        <QuantityDialog
          initialQuantity={metadata.quantity_amount}
          unit={metadata.unit}
          initialTags={metadata.tags} // Pass the tags to QuantityDialog
          onClose={() => setShowDialog(false)}
          onSubmit={handleUpdateQuantity}
        />
      )}
    </div>
  );
};

export default Batch;