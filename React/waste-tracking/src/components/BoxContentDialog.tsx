// === BoxContentDialog.tsx ===
import { BatchData } from '../context/SessionContext';

interface BoxContentDialogProps {
  boxId: string;
  boxName: string;
  batches: BatchData[]; // Batches currently in this box
  onCloseDialog: () => void; // For closing the dialog without removing the box
  onRemoveBatchFromBox: (boxId: string, batchId: string) => void; // To remove individual batches
  // New prop to handle closing the box and logging its contents as waste
  onCloseBoxAndLogWaste: (boxId: string, batchesInBox: BatchData[]) => void;
}

const BoxContentDialog = ({
  boxId,
  boxName,
  batches,
  onCloseDialog,
  onRemoveBatchFromBox,
  onCloseBoxAndLogWaste,
}: BoxContentDialogProps) => {
  const handleCloseBox = () => {
    // Call the new prop to handle logging waste and then removing the box
    onCloseBoxAndLogWaste(boxId, batches);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3 style={{ color: "var(--menu-text)" }}>Contents of {boxName}</h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px', width: '100%' }}>
          {batches.length === 0 ? (
            <p>No items in this box yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {batches.map((batch) => (
                <li key={batch.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #eee',
                }}>
                  <span style={{color: "var(--menu-text)"}}>
                    {batch.itemName} -{' '}
                    {(() => {
                      const lowerUnit = batch.unit.toLowerCase();
                      if (lowerUnit === 'pounds/ounces') {
                        const pounds = Math.floor(batch.quantity_amount / 16);
                        const ounces = batch.quantity_amount % 16;
                        return `${pounds} lb ${ounces} oz`;
                      } else if (lowerUnit === 'gallons/quarts') {
                        const gallons = Math.floor(batch.quantity_amount / 4);
                        const quarts = batch.quantity_amount % 4;
                        return `${gallons} gal ${quarts} qt`;
                      } else {
                        return `${batch.quantity_amount} ${batch.unit}`;
                      }
                    })()}
                  </span>
                  <button
                    onClick={() => onRemoveBatchFromBox(boxId, batch.id)}
                    style={{
                      backgroundColor: 'var(--error-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="dialog-actions">
          <button onClick={onCloseDialog} style={{ background: 'var(--error-color)' }}>
            Back
          </button>
          <button onClick={handleCloseBox}>Close Box & Log Waste</button> {/* Modified button */}
        </div>
      </div>
    </div>
  );
};

export default BoxContentDialog;