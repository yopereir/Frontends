// AddItemDialog.tsx
import React, { useState } from 'react';
import supabase from '../supabase'; // Ensure supabase is correctly imported

interface AddItemDialogProps {
  onClose: () => void;
  onItemAdded: () => void; // A callback to refresh the items list on the settings page
  restaurantId: string;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({ onClose, onItemAdded, restaurantId }) => {
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    // Basic validation
    if (!itemName || !unit) {
      setError("Item name and unit are required.");
      return;
    }

    setIsCreating(true);
    setError(null);

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    const { error: insertError } = await supabase
      .from('items')
      .insert([{
        name: itemName,
        restaurant_id: restaurantId,
        metadata: {
          unit,
          imageUrl,
          tags: tagsArray,
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
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Unit (e.g., kg, lbs, pieces)"
          />
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma-separated, e.g., vegetable, prep)"
          />
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