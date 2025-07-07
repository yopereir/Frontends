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
  onRemoveBatchFromBox: (boxId: string, batchIdToRemove: string) => void; // New prop for removing batch
}

const BoxContentDialog = ({ boxName, batches, onCloseDialog, onCloseBox, boxId, onRemoveBatchFromBox }: BoxContentDialogProps) => {
  const handleCloseBox = () => {
    onCloseBox(boxId); // Pass the boxId up to ItemsPage to remove it
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog" style={{ maxWidth: '600px' }}>
        <h3 style={{ color: "var(--menu-text)", marginBottom: '1rem' }}>Contents of {boxName}</h3>

        {batches.length > 0 ? (
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
            {batches.map(batch => (
              <div
                key={batch.id}
                className="batch-card"
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  display: 'flex', // Use flexbox for layout
                  justifyContent: 'space-between', // Space out content and button
                  alignItems: 'center', // Vertically align items
                  gap: '10px', // Spacing between elements
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexGrow: 1 }}> {/* Content on the left */}
                  <img
                    src={batch.imageUrl}
                    alt={batch.itemName}
                    className="batch-image"
                    style={{ width: '2.5em', height: '2.5em' }}
                  />
                  <div>
                    <h4 className="batch-title" style={{ fontSize: '1em', margin: 0 }}>
                      {batch.itemName}
                    </h4>
                    <p className="batch-subtext" style={{ margin: 0 }}>
                      Quantity: {batch.quantity_amount} {batch.unit}
                    </p>
                    <p className="batch-subtext" style={{ margin: 0 }}>
                      Start: {new Date(batch.startTime).toLocaleTimeString()} | Hold: {batch.holdMinutes} min
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveBatchFromBox(boxId, batch.id)} // Call handler to remove batch
                  style={{
                    backgroundColor: 'var(--error-color)', // Red background
                    color: 'white',
                    padding: '8px 12px', // Smaller padding
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem', // Smaller font
                    minWidth: 'unset', // Override default button width
                    width: 'auto', // Adjust width based on content
                    marginTop: '0', // Remove margin-top
                    height: 'auto', // Allow height to adjust
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'gray', marginBottom: '1rem' }}>This box is empty.</p>
        )}

        <div className="dialog-actions" style={{ flexDirection: 'column' }}>
          <button onClick={handleCloseBox} style={{ backgroundColor: 'var(--error-color)', marginBottom: '10px' }}>
            Close Box
          </button>
          {/* Changed 'Back' button style to match 'Create New Box' button */}
          <button
            onClick={onCloseDialog}
            style={{
              backgroundColor: 'var(--button-color)', // Use primary button color
              color: 'white',
              padding: '15px 20px', // Match padding
              borderRadius: '8px', // Match border-radius
              border: 'none', // Remove border
              cursor: 'pointer',
              fontSize: '1rem', // Match font size
              fontWeight: 'bold', // Match font weight
              width: '100%', // Match width
              // Ensure no margin-top from generic button rule
              marginTop: '0',
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoxContentDialog;