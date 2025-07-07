import { useEffect, useState } from "react";
import { useSession } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";
import Batch from "../components/Batch";
import QuantityDialog from "../components/QuantityDialog";
import BoxNameDialog from "../components/BoxNameDialog";
import BoxContentDialog from "../components/BoxContentDialog"; // Import the new BoxContentDialog
import supabase from "../supabase";

// Extend the Batch interface for consistent typing in Box
interface BatchInBox {
  id: string;
  itemId: string;
  itemName: string;
  imageUrl: string;
  startTime: Date;
  holdMinutes: number;
  unit: string;
  quantity_amount: number;
}

// Define the Box component with its own batches
interface BoxProps {
  id: string;
  name: string;
  batches: BatchInBox[]; // Box still holds a list of batches, but doesn't display them directly
  onDropBatch: (batchId: string, targetBoxId: string) => void;
  onBoxClick: (boxId: string) => void; // New prop to handle click on the box
}

const Box = ({ id, name, batches, onDropBatch, onBoxClick }: BoxProps) => {
  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Essential to allow dropping
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const batchId = e.dataTransfer.getData("batchId");
    if (batchId) {
      onDropBatch(batchId, id); // Pass batchId and the target box's ID
    }
  };

  return (
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
        justifyContent: 'center', // Keep center for display
        cursor: 'pointer',
        minHeight: '10vh',
        width: '100%',
        marginBottom: '10px',
        color: 'var(--text-color)',
        position: 'relative',
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onBoxClick(id)} // Handle click to open dialog
    >
      <h4 style={{ margin: '0', color: 'var(--menu-text)' }}>{name}</h4> {/* Display box name */}
      {/* No direct display of batches here anymore */}
      {batches.length > 0 && (
        <p style={{ fontSize: '0.8em', color: 'gray', marginTop: '5px' }}>({batches.length} item{batches.length !== 1 ? 's' : ''})</p>
      )}
    </button>
  );
};


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
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [showBoxNameDialog, setShowBoxNameDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedTab, setSelectedTab] = useState<'lunch' | 'breakfast' | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  // Box state now includes an array of batches
  const [boxes, setBoxes] = useState<{ id: string; name: string; batches: BatchInBox[] }[]>([]);
  // State for the BoxContentDialog
  const [showBoxContentDialog, setShowBoxContentDialog] = useState(false);
  const [selectedBoxForContent, setSelectedBoxForContent] = useState<{ id: string; name: string; batches: BatchInBox[] } | null>(null);

  const handleAddBoxClick = () => {
    setShowBoxNameDialog(true);
  };

  const handleBoxNameSubmit = (boxName: string) => {
    setBoxes(prevBoxes => [...prevBoxes, { id: crypto.randomUUID(), name: boxName, batches: [] }]);
    setShowBoxNameDialog(false);
  };

  const handleTabClick = (tab: 'lunch' | 'breakfast') => {
    setSelectedTab(prev => (prev === tab ? null : tab));
  };

  const filteredItems = selectedTab ? items.filter(item => item.tags.includes(selectedTab)) : items;

  const handleAddWithQuantity = (item: Item) => {
    setSelectedItem(item);
    setShowQuantityDialog(true);
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
        totalQuantity = quantity.gallons * 4 + quarts;
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

    setShowQuantityDialog(false);
    setSelectedItem(null);
  };

  // DRAG AND DROP HANDLERS
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, batchId: string) => {
    e.dataTransfer.setData("batchId", batchId);
  };

  const handleDropBatch = (batchId: string, targetBoxId: string) => {
    const droppedBatch = batches.find(batch => batch.id === batchId);

    if (!droppedBatch) {
      console.warn("Dropped batch not found:", batchId);
      return;
    }

    setBoxes(prevBoxes => prevBoxes.map(box => {
      if (box.id === targetBoxId) {
        return {
          ...box,
          batches: [...box.batches, droppedBatch]
        };
      }
      return box;
    }));

    setBatches(prevBatches => prevBatches.filter(batch => batch.id !== batchId));
  };

  // BOX CONTENT DIALOG HANDLERS
  const handleBoxClick = (boxId: string) => {
    const box = boxes.find(b => b.id === boxId);
    if (box) {
      setSelectedBoxForContent(box);
      setShowBoxContentDialog(true);
    }
  };

  const handleCloseBoxDialog = () => {
    setShowBoxContentDialog(false);
    setSelectedBoxForContent(null);
  };

  const handleCloseBoxAndRemove = (boxId: string) => {
    setBoxes(prevBoxes => prevBoxes.filter(box => box.id !== boxId));
    setShowBoxContentDialog(false);
    setSelectedBoxForContent(null);
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
            <div
              key={batch.id}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, batch.id)}
              style={{ width: '100%' }}
            >
              <Batch
                id={batch.id}
                itemId={batch.itemId}
                itemName={batch.itemName}
                imageUrl={batch.imageUrl}
                startTime={batch.startTime}
                holdMinutes={batch.holdMinutes}
                unit={batch.unit}
                quantity_amount={batch.quantity_amount}
              />
            </div>
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
                <Box
                    key={box.id}
                    id={box.id}
                    name={box.name}
                    batches={box.batches}
                    onDropBatch={handleDropBatch}
                    onBoxClick={handleBoxClick} // Pass the click handler
                />
            ))}
        </div>
        {/* Button to add a new box, always at the bottom */}
        <button
            onClick={handleAddBoxClick}
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
      {showQuantityDialog && selectedItem && (
        <QuantityDialog
          initialQuantity={1}
          unit={selectedItem.unit}
          onClose={() => setShowQuantityDialog(false)}
          onSubmit={handleQuantitySubmit}
        />
      )}
      {showBoxNameDialog && (
        <BoxNameDialog
          onClose={() => setShowBoxNameDialog(false)}
          onSubmit={handleBoxNameSubmit}
        />
      )}
      {/* Render BoxContentDialog */}
      {showBoxContentDialog && selectedBoxForContent && (
        <BoxContentDialog
          boxId={selectedBoxForContent.id}
          boxName={selectedBoxForContent.name}
          batches={selectedBoxForContent.batches}
          onCloseDialog={handleCloseBoxDialog} // 'Back' button
          onCloseBox={handleCloseBoxAndRemove} // 'Close Box' button
        />
      )}
    </main>
  );
};

export default ItemsPage;