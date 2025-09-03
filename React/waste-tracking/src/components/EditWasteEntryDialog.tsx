import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';

interface WasteEntry {
  id: number;
  name: string;
  created_at: string;
  restaurant_id: number;
  quantity?: number;
  metadata?: any;
  waste_entry_id: string;
}

interface EditWasteEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wasteEntryId: string, newCreatedAt: string, newQuantity: number) => void;
  wasteEntry: WasteEntry | null;
}

const EditWasteEntryDialog = ({ isOpen, onClose, onSave, wasteEntry }: EditWasteEntryDialogProps) => {
  const [editedCreatedAt, setEditedCreatedAt] = useState('');
  const [editedQuantity, setEditedQuantity] = useState<number>(0);
  const [pounds, setPounds] = useState(0);
  const [ounces, setOunces] = useState(0);
  const [gallons, setGallons] = useState(0);
  const [quarts, setQuarts] = useState(0);
  const [litres, setLitres] = useState(0);
  const [millilitres, setMillilitres] = useState(0);

  const unit = wasteEntry?.metadata?.unit?.toLowerCase() || '';
  const isWeight = unit === 'pounds/ounces';
  const isGallonsQuarts = unit === 'gallons/quarts';
  const isLitresMl = unit === 'litres/ml';
  const isLiquidVolume = isGallonsQuarts || isLitresMl;

  useEffect(() => {
    if (wasteEntry) {
      // Format created_at for datetime-local input (YYYY-MM-DDTHH:MM)
      setEditedCreatedAt(format(parseISO(wasteEntry.created_at), "yyyy-MM-dd'T'HH:mm"));

      if (wasteEntry.quantity !== undefined) {
        if (isWeight) {
          setPounds(Math.floor(wasteEntry.quantity));
          setOunces(Math.round((wasteEntry.quantity % 1) * 16));
        } else if (isGallonsQuarts) {
          setGallons(Math.floor(wasteEntry.quantity / 4));
          setQuarts(Math.round(wasteEntry.quantity % 4));
        } else if (isLitresMl) {
          setLitres(Math.floor(wasteEntry.quantity));
          setMillilitres(Math.round((wasteEntry.quantity % 1) * 1000));
        } else {
          setEditedQuantity(wasteEntry.quantity);
        }
      }
    }
  }, [wasteEntry, isWeight, isGallonsQuarts, isLitresMl]);

  if (!isOpen || !wasteEntry) {
    return null;
  }

  const handleSubmit = () => {
    let finalQuantity = editedQuantity;
    if (isWeight) {
      finalQuantity = pounds + ounces / 16;
    } else if (isGallonsQuarts) {
      finalQuantity = gallons + quarts / 4;
    } else if (isLitresMl) {
      finalQuantity = litres + millilitres / 1000;
    }

    if (wasteEntry.waste_entry_id) {
      onSave(wasteEntry.waste_entry_id, editedCreatedAt, finalQuantity);
    }
    onClose();
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3 style={{ color: "var(--menu-text)" }}>Edit Waste Entry</h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: "var(--menu-text)", display: 'block', marginBottom: '0.5rem' }}>Created At:</label>
          <input
            type="datetime-local"
            value={editedCreatedAt}
            onChange={(e) => setEditedCreatedAt(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              height: '45px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: "var(--menu-text)", display: 'block', marginBottom: '0.5rem' }}>Quantity ({unit || 'units'}):</label>
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
          ) : isGallonsQuarts ? (
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
          ) : isLitresMl ? (
            <div style={{ display: "flex", gap: "1rem" }}>
              <input type="number" value={litres} min={0} placeholder="Litres" onChange={(e) => setLitres(Number(e.target.value))} style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                height: '45px',
              }} />
              <input type="number" value={millilitres} min={0} max={999} placeholder="Millilitres" onChange={(e) => setMillilitres(Number(e.target.value))} style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                height: '45px',
              }} />
            </div>
          ) : (
            <input
              type="number"
              value={editedQuantity}
              min={0}
              onChange={(e) => setEditedQuantity(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                height: '45px',
              }}
            />
          )}
        </div>

        <div className="dialog-actions">
          <button onClick={handleSubmit}>Save</button>
          <button onClick={onClose} style={{ background: 'gray' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditWasteEntryDialog;
