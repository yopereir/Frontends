import React from 'react';

// Re-using the Box interface from ItemsPage for consistency
interface Box {
  id: string;
  created_at: string; // ISO string
  name: string | null;
  user_id: string | null; // Changed to user_id
}

interface BoxDetailsDialogProps {
  box: Box;
  onClose: () => void;
}

const BoxDetailsDialog: React.FC<BoxDetailsDialogProps> = ({ box, onClose }) => {
  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3 style={{ color: "var(--menu-text)" }}>Box Details: {box.name || "N/A"}</h3>

        <div style={{ padding: '1rem', color: 'var(--menu-text)', textAlign: 'left' }}>
          <p><strong>Box ID:</strong> {box.id}</p>
          <p><strong>Created At:</strong> {new Date(box.created_at).toLocaleString()}</p>
          <p><strong>User ID:</strong> {box.user_id || "N/A"}</p> {/* Display user_id */}
          {/* Add more details here as needed from your Box object */}
        </div>

        <div className="dialog-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default BoxDetailsDialog;