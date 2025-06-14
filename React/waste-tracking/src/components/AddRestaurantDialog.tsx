// AddRestaurantDialog.tsx
import React, { useState } from 'react';
import supabase from '../supabase'; // Ensure supabase is correctly imported

interface AddRestaurantDialogProps {
  onClose: () => void;
  onRestaurantAdded: () => void; // A callback to refresh the restaurant list on the settings page
  subscriptionId: string;
}

const AddRestaurantDialog: React.FC<AddRestaurantDialogProps> = ({ onClose, onRestaurantAdded, subscriptionId }) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [location, setLocation] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    // Basic validation
    if (!restaurantName || !location) {
      setError("Restaurant name and location are required.");
      return;
    }

    setIsCreating(true);
    setError(null);

    console.log("subscriptionId:", subscriptionId);
    const { error: insertError } = await supabase
      .from('restaurants')
      .insert([{
        name: restaurantName,
        location: location,
        subscription_id: subscriptionId,
      }]);

    setIsCreating(false);

    if (insertError) {
      console.error("Error creating restaurant:", insertError);
      setError(`Failed to create restaurant: ${insertError.message}`);
    } else {
      onRestaurantAdded(); // Trigger data refresh on parent
      onClose();     // Close the dialog
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3 style={{ color: "var(--menu-text)" }}>Add New Restaurant</h3>
        <div className="dialog-content">
          <input
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="Restaurant Name (e.g., Yo Mamas house)"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (e.g., 1 Main St, City, State, Zipcode)"
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

export default AddRestaurantDialog;