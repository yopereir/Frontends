import React from 'react';

// Re-using the BatchInBox interface for consistency
interface BatchInBox {
  id: string;
  itemId: string;
  itemName: string;
  imageUrl: string;
  startTime: Date;
  holdMinutes: number;
  unit: string;
  quantity_amount: number;
}

interface BoxContentDialogProps {
  boxName: string;
  batches: BatchInBox[];
  onCloseDialog: () => void; // For 'Back' button
  onCloseBox: (boxId: string) => void; // For 'Close Box' button, will also pass boxId
  boxId: string; // To identify which box to close
}

const BoxContentDialog = ({ boxName, batches, onCloseDialog, onCloseBox, boxId }: BoxContentDialogProps) => {
  const handleCloseBox = () => {
    onCloseBox(boxId); // Pass the boxId up to ItemsPage to remove it
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog" style={{ maxWidth: '600px' }}> {/* Make dialog wider for batch list */}
        <h3 style={{ color: "var(--menu-text)", marginBottom: '1rem' }}>Contents of {boxName}</h3>

        {batches.length > 0 ? (
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
            {batches.map(batch => (
              <div key={batch.id} className="batch-card" style={{ marginBottom: '10px', padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={batch.imageUrl}
                    alt={batch.itemName}
                    className="batch-image"
                    style={{ width: '2.5em', height: '2.5em' }}
                  />
                  <h4 className="batch-title" style={{ fontSize: '1em', margin: 0 }}>
                    {batch.itemName}
                  </h4>
                </div>
                <p className="batch-subtext" style={{ margin: 0 }}>
                  Quantity: {batch.quantity_amount} {batch.unit}
                </p>
                <p className="batch-subtext" style={{ margin: 0 }}>
                  Start: {new Date(batch.startTime).toLocaleTimeString()} | Hold: {batch.holdMinutes} min
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'gray', marginBottom: '1rem' }}>This box is empty.</p>
        )}

        <div className="dialog-actions" style={{ flexDirection: 'column' }}> {/* Stack buttons */}
          <button onClick={handleCloseBox} style={{ backgroundColor: 'var(--error-color)', marginBottom: '10px' }}>Close Box</button>
          <button onClick={onCloseDialog} style={{ background: 'gray' }}>Back</button>
        </div>
      </div>
    </div>
  );
};

export default BoxContentDialog;