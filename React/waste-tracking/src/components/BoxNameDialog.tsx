import { useState } from 'react';

interface BoxNameDialogProps {
  onClose: () => void;
  onSubmit: (boxName: string) => void;
}

const BoxNameDialog = ({ onClose, onSubmit }: BoxNameDialogProps) => {
  const [boxName, setBoxName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Trim whitespace from the name
    const trimmedBoxName = boxName.trim();

    // Check for empty string
    if (trimmedBoxName === '') {
      setError('Box name cannot be empty.');
      return;
    }

    // Check for special characters (allowing letters, numbers, spaces, hyphens, and underscores)
    const specialCharsRegex = /[^a-zA-Z0-9\s-_]/;
    if (specialCharsRegex.test(trimmedBoxName)) {
      setError('Box name contains invalid characters. Use letters, numbers, spaces, hyphens, or underscores.');
      return;
    }

    // If validation passes, submit and close
    onSubmit(trimmedBoxName);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoxName(e.target.value);
    // Clear error when user starts typing again
    if (error) setError('');
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3 style={{ color: "var(--menu-text)" }}>Enter Box Name</h3>

        <input
          type="text"
          value={boxName}
          onChange={handleInputChange}
          placeholder="e.g., Lunch Box 1"
          className={error ? 'input-error' : ''} // Add class for styling if needed
          style={{ width: '100%' }} // Ensure it takes full width of the dialog
        />
        {error && (
          <p style={{ color: 'var(--error-color)', fontSize: '0.85em', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
            {error}
          </p>
        )}

        <div className="dialog-actions">
          <button onClick={handleSubmit}>Create</button>
          <button onClick={onClose} style={{ background: 'gray' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default BoxNameDialog;