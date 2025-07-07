import { useEffect, useState } from "react";
import { useSession } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";
import Batch from "../components/Batch";
import QuantityDialog from "../components/QuantityDialog";
import BoxNameDialog from "../components/BoxNameDialog"; // Import the new dialog
import supabase from "../supabase";

// Define the Box component directly in this file for simplicity
interface BoxProps {
  id: string;
  name: string; // Add name property for the Box component
}

const Box = ({ id, name }: BoxProps) => (
  <button
    className="box-component-button"
    style={{
      background: 'none',
      border: '2px solid var(--button-color)',
      borderRadius: '8px',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      height: '10vh',
      width: '100%', // Take full width of its container
      marginBottom: '10px', // Space between multiple boxes
      color: 'var(--text-color)',
    }}
  >
    {/* Removed SVG here, just keeping the text as per your Box component in the prompt */}
    <span>{name}</span> {/* Display the box name */}
  </button>
);

interface Item {
  id: string;
  name: string;
  imageUrl: string;
  holdMinutes: number;
  unit: string;
  tags: string[];
}

const ItemsPage = () => {
  const { batches, setBatches } = useSession();
  const [now, setNow] = useState(new Date());
  const [view, setView] = useState<'batches' | 'items'>('batches');
  const [showQuantityDialog, setShowQuantityDialog] = useState(false); // Renamed for clarity
  const [showBoxNameDialog, setShowBoxNameDialog] = useState(false); // New state for box name dialog
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedTab, setSelectedTab] = useState<'lunch' | 'breakfast' | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [boxes, setBoxes] = useState<{ id: string; name: string }[]>([]); // Updated state for boxes to include name

  const handleAddBoxClick = () => {
    setShowBoxNameDialog(true);
  };

  const handleBoxNameSubmit = (boxName: string) => {
    setBoxes(prevBoxes => [...prevBoxes, { id: crypto.randomUUID(), name: boxName }]);
    setShowBoxNameDialog(false);
  };

  const handleTabClick = (tab: 'lunch' | 'breakfast') => {
    setSelectedTab(prev => (prev === tab ? null : tab));
  };

  const filteredItems = selectedTab ? items.filter(item => item.tags.includes(selectedTab)) : items;

  const handleAddWithQuantity = (item: Item) => {
    setSelectedItem(item);
    setShowQuantityDialog(true); // Use the new dialog state
  };

  const handleQuantitySubmit = (
    quantity: number | { pounds: number; ounces: number } | { gallons: number; quarts: number }
  ) => {
    if (!selectedItem) return;

    let totalQuantity = 0;
    if (typeof quantity === "object") {
      if ("pounds" in quantity && "ounces" in quantity) {
        totalQuantity = quantity.pounds * 16 + quantity.ounces;
      } else if ("gallons" in quantity && "quarts" in quantity) {
        totalQuantity = quantity.gallons * 4 + quantity.quarts;
      }
    } else {
      totalQuantity = Number(quantity);
    }

    setBatches((prevBatches) => {
      const existingBatchIndex = prevBatches.findIndex(
        (batch) => batch.itemId === selectedItem.id
      );

      if (existingBatchIndex !== -1) {
        const updatedBatches = [...prevBatches];
        updatedBatches[existingBatchIndex] = {
          ...updatedBatches[existingBatchIndex],
          quantity_amount:
            updatedBatches[existingBatchIndex].quantity_amount + totalQuantity,
        };
        return updatedBatches;
      } else {
        const newBatch = {
          id: crypto.randomUUID(),
          itemId: selectedItem.id,
          itemName: selectedItem.name,
          imageUrl: selectedItem.imageUrl,
          startTime: new Date(),
          holdMinutes: selectedItem.holdMinutes,
          unit: selectedItem.unit,
          quantity_amount: totalQuantity,
        };
        return [...prevBatches, newBatch];
      }
    });

    setShowQuantityDialog(false); // Use the new dialog state
    setSelectedItem(null);
  };

  useEffect(() => {
    const fetchItems = async () => {
      const { data: itemsData, error: itemsError } = await supabase.from('items').select(`*`);
      console.log("Fetched items:", itemsData, itemsError);
      if (itemsError || !itemsData) {
        console.error("Failed to fetch items", itemsError);
      } else {
        const parsedItems: Item[] = itemsData.map((item: any) => ({
          id: item.id,
          name: item.name,
          imageUrl: item.metadata?.imageUrl || "",
          holdMinutes: item.metadata?.holdMinutes || 0,
          unit: item.metadata?.unit || "",
          tags: item.metadata?.tags || [],
        }));
        setItems(parsedItems);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const itemsContainer = (
    <>
      <h2 className="header-text">Restaurant Items</h2>
      <div className="tabs-container">
        <button
          className="tab-button"
          style={{
            backgroundColor: selectedTab === 'breakfast' ? 'var(--button-color)' : 'var(--menu-bg)',
          }}
          onClick={() => handleTabClick('breakfast')}
        >
          Breakfast
        </button>
        <button
          className="tab-button"
          style={{
            backgroundColor: selectedTab === 'lunch' ? 'var(--button-color)' : 'var(--menu-bg)',
          }}
          onClick={() => handleTabClick('lunch')}
        >
          Lunch
        </button>
      </div>
      <div className="grid-container">
        {filteredItems.map((item) => (
          <div className="batch-card" key={item.id}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="batch-left" style={{ marginBottom: '.5rem' }}>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="batch-image"
                />
                <h2 className="batch-title">{item.name}</h2>
              </div>
              {item.holdMinutes > 0 && (<p className="batch-subtext">Hold time: {item.holdMinutes} min</p>)}
            </div>
            <button className="batch-button" onClick={() => handleAddWithQuantity(item)}>
              Add Batch
            </button>
          </div>
        ))}
      </div>
    </>
  );

  const batchesContainer = (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}> {/* Flex container for the two columns */}
      <div style={{ flex: '1' }}> {/* Left column takes remaining width */}
        <h2 className="header-text mt-10">Active Batches</h2>
        <div className="grid-container">
          {batches.map((batch) => (
            <Batch
              key={batch.id}
              id={batch.id}
              itemId={batch.itemId}
              itemName={batch.itemName}
              imageUrl={batch.imageUrl}
              startTime={batch.startTime}
              holdMinutes={batch.holdMinutes}
              unit={batch.unit}
              quantity_amount={batch.quantity_amount}
            />
          ))}
        </div>
      </div>
      {/* Right column: 30% width, min-height, and button at bottom */}
      <div style={{
        width: '30%',
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginTop: "0",
      }}>
        <div> {/* Wrapper for the header and boxes, to keep them together at the top */}
            <h2 className="header-text">Open boxes</h2>
            {/* Render existing Box components */}
            {boxes.map(box => (
                <Box key={box.id} id={box.id} name={box.name} />
            ))}
        </div>
        {/* Button to add a new box, always at the bottom */}
        <button
            onClick={handleAddBoxClick} // Changed to open the new dialog
            style={{
                backgroundColor: 'var(--button-color)',
                color: 'white',
                padding: '15px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                width: '100%',
            }}
        >
            Create New Box
        </button>
      </div>
    </div>
  );

  return (
    <main>
      <HeaderBar />
      <section className="main-container">
        <div className="view-toggle-buttons">
          <button
            className={`toggle-button ${view === 'items' ? 'active' : ''}`}
            onClick={() => setView('items')}
          >
            Items
          </button>
          <button
            className={`toggle-button ${view === 'batches' ? 'active' : ''}`}
            onClick={() => setView('batches')}
          >
            Batches
          </button>
        </div>
        {view === 'batches' && batchesContainer}
        {view === 'items' && itemsContainer}
      </section>
      {showQuantityDialog && selectedItem && ( // Render QuantityDialog based on new state
        <QuantityDialog
          initialQuantity={1}
          unit={selectedItem.unit}
          onClose={() => setShowQuantityDialog(false)}
          onSubmit={handleQuantitySubmit}
        />
      )}
      {showBoxNameDialog && ( // Render BoxNameDialog based on its state
        <BoxNameDialog
          onClose={() => setShowBoxNameDialog(false)}
          onSubmit={handleBoxNameSubmit}
        />
      )}
    </main>
  );
};

export default ItemsPage;