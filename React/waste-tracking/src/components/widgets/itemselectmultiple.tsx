import React from 'react';

interface ItemSelectMultipleProps {
  itemNames: string[];
  selectedNames: string[];
  onSelectionChange: (names: string[]) => void;
}

const ItemSelectMultiple: React.FC<ItemSelectMultipleProps> = ({
  itemNames,
  selectedNames,
  onSelectionChange,
}) => {
  const handleSelectAll = () => {
    onSelectionChange([]);
  };

  const handleSelectItem = (name: string) => {
    onSelectionChange(
      selectedNames.includes(name)
        ? selectedNames.filter((n) => n !== name)
        : [...selectedNames, name]
    );
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      <button
        className="batch-button"
        style={{
          backgroundColor:
            selectedNames.length === 0
              ? "var(--button-color)"
              : "var(--error-color)",
        }}
        onClick={handleSelectAll}
      >
        All
      </button>
      {itemNames.map((name) => (
        <button
          key={name}
          className="batch-button"
          style={{
            backgroundColor: selectedNames.includes(name)
              ? "var(--button-color)"
              : "var(--error-color)",
          }}
          onClick={() => handleSelectItem(name)}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default ItemSelectMultiple;
