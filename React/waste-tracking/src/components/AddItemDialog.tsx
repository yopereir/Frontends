// AddItemDialog.tsx
import React, { useState, useEffect } from 'react';
import supabase from '../supabase'; // Ensure supabase is correctly imported

interface AddItemDialogProps {
  onClose: () => void;
  onItemAdded: () => void; // A callback to refresh the items list on the settings page
  restaurantId: string;
}

// Define the unit options outside the component for reusability
export const unitOptions: string[] = [
  'kg/grams',
  'pounds/ounces',
  'gallons/quarts',
  'liters/ml',
  'pieces',
  // Add more units as needed
];

const AddItemDialog: React.FC<AddItemDialogProps> = ({ onClose, onItemAdded, restaurantId }) => {
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState(unitOptions[0]);
  const [holdingTime, setHoldingTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isDonation, setIsDonation] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDonation && !tags.includes("donation")) {
      setTags(prevTags => [...prevTags, "donation"]);
    } else if (!isDonation && tags.includes("donation")) {
      setTags(prevTags => prevTags.filter(tag => tag !== "donation"));
    }
  }, [isDonation, tags]);

  const handleCreate = async () => {
    // Basic validation
    if (!itemName || !unit) {
      setError("Item name and unit are required.");
      return;
    }

    // Validate Holding Time
    const parsedHoldingTime = parseInt(holdingTime);
    if (holdingTime !== '' && (isNaN(parsedHoldingTime) || parsedHoldingTime < 0)) {
      setError("Holding Time must be 0 or a positive number.");
      return;
    }

    setIsCreating(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('items')
      .insert([{
        name: itemName,
        restaurant_id: restaurantId,
        metadata: {
          unit,
          holdMinutes: holdingTime === '' ? null : parsedHoldingTime, // Store as null if empty, otherwise as number
          imageUrl,
          tags,
        },
      }]);

    setIsCreating(false);

    if (insertError) {
      console.error("Error creating item:", insertError);
      setError(`Failed to create item: ${insertError.message}`);
    } else {
      onItemAdded(); // Trigger data refresh on parent
      onClose();     // Close the dialog
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3 style={{ color: "var(--menu-text)" }}>Add New Item</h3>
        <div className="dialog-content">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item Name (e.g., Sliced Tomatoes)"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="unit-select" // You might want to add some styling
          >
            {unitOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={holdingTime}
            onChange={(e) => setHoldingTime(e.target.value)}
            placeholder="HoldingTime in multi minutes (e.g., 30)"
          />
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
          />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '300px',
            marginTop: '7px',
            marginBottom: '0.5rem',
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
        </div>
        {error && <p style={{ color: "var(--error-color)", marginTop: "0.25rem", textAlign: 'center', width: '100%' }}>{error}</p>}
        <div className="header-text">
          <button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create'}
          </button>
          <button onClick={onClose} className="cancel-button" disabled={isCreating}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemDialog;