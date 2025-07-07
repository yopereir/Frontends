import React, { useState } from 'react';

interface CreateBoxDialogProps {
  onClose: () => void;
  onSubmit: (boxName: string) => void;
}

const CreateBoxDialog: React.FC<CreateBoxDialogProps> = ({ onClose, onSubmit }) => {
  const [boxName, setBoxName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    onSubmit(boxName);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3 style={{ color: "var(--menu-text)" }}>Create New Box</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter box name"
            value={boxName}
            onChange={(e) => setBoxName(e.target.value)}
            required
            autoFocus // Automatically focus the input field
          />
          <div className="dialog-actions">
            <button type="button" onClick={onClose} style={{ background: 'gray' }}>
              Cancel
            </button>
            <button type="submit">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoxDialog;