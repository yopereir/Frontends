// === ItemsPage.tsx ===
import { useEffect, useState } from "react";
import { useSession, BatchData, BoxData } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";
import Batch from "../components/Batch";
import QuantityDialog from "../components/QuantityDialog";
import BoxNameDialog from "../components/BoxNameDialog";
import BoxContentDialog from "../components/BoxContentDialog"; // Make sure this is imported
import supabase from "../supabase";

// The Box component's props should reflect BoxData from SessionContext
interface BoxProps {
  id: string;
  name: string;
  batches: BatchData[]; // A box contains a list of batches
  onDropBatch: (batchId: string, targetBoxId: string) => void;
  onBoxClick: (boxId: string) => void;
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
        justifyContent: 'center',
        cursor: 'pointer',
        minHeight: '10vh',
        width: '100%',
        marginBottom: '10px',
        color: 'var(--text-color)',
        position: 'relative',
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onBoxClick(id)}
    >
      <h4 style={{ margin: '0', color: 'var(--menu-text)' }}>{name}</h4>
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
  const { batches, setBatches, boxes, setBoxes, session } = useSession(); // Use boxes and setBoxes from context, also session
  const [now, setNow] = useState(new Date());
  const [view, setView] = useState<'batches' | 'items'>('batches');
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [showBoxNameDialog, setShowBoxNameDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedTab, setSelectedTab] = useState<'lunch' | 'breakfast' | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  
  // BoxContentDialog states (local to ItemsPage as they manage UI visibility)
  const [showBoxContentDialog, setShowBoxContentDialog] = useState(false);
  const [selectedBoxForContent, setSelectedBoxForContent] = useState<BoxData | null>(null);
  // New state for handling Supabase insertion errors when closing a box
  const [closeBoxSupabaseError, setCloseBoxSupabaseError] = useState<string | null>(null);

  const handleAddBoxClick = () => {
    setShowBoxNameDialog(true);
  };

  const handleBoxNameSubmit = (boxName: string) => {
    setBoxes(prevBoxes => [...prevBoxes, { id: crypto.randomUUID(), name: boxName, batches: [] }]); // Initialize with empty batches
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
    quantity: number | { pounds: number; ounces: number } | { gallons: number; quarts: number },
    tags: string[]
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
        (batch) => batch.itemId === selectedItem.id && (batch.tags.includes("donation") === tags.includes("donation"))
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
          tags: tags,
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
      setCloseBoxSupabaseError(null); // Reset error when opening a new box dialog
      setShowBoxContentDialog(true);
    }
  };

  const handleCloseBoxDialog = () => {
    setShowBoxContentDialog(false);
    setSelectedBoxForContent(null);
    setCloseBoxSupabaseError(null); // Clear error on dialog close
  };

  const handleRemoveBatchFromBox = (boxId: string, batchIdToRemove: string) => {
    let removedBatch: BatchData | undefined;

    setBoxes(prevBoxes => prevBoxes.map(box => {
      if (box.id === boxId) {
        const updatedBatchesInBox = box.batches.filter(batch => {
            if (batch.id === batchIdToRemove) {
                removedBatch = batch;
                return false;
            }
            return true;
        });
        return {
          ...box,
          batches: updatedBatchesInBox
        };
      }
      return box;
    }));

    if (removedBatch) {
        setBatches(prevBatches => [...prevBatches, removedBatch!]);
    }

    setSelectedBoxForContent(prev => {
        if (prev && prev.id === boxId) {
            return {
                ...prev,
                batches: prev.batches.filter(batch => batch.id !== batchIdToRemove)
            };
        }
        return prev;
    });
  };

  // Handler for moving a batch to the first available box
  const handleMoveBatchToFirstBox = (batchToMove: BatchData): boolean => {
    if (boxes.length === 0) {
      return false; // No boxes to move to
    }

    const firstBox = boxes[0];

    // Add the batch to the first box's batches list
    setBoxes(prevBoxes => prevBoxes.map(box => {
      if (box.id === firstBox.id) {
        return {
          ...box,
          batches: [...box.batches, batchToMove]
        };
      }
      return box;
    }));

    // Remove the batch from the main batches list
    setBatches(prevBatches => prevBatches.filter(batch => batch.id !== batchToMove.id));
    return true; // Successfully moved
  };

  // Handler to close a box and log its batches as waste
  const handleCloseBoxAndLogWaste = async (boxId: string, boxName: string, batchesInBox: BatchData[]) => {
    if (!session?.user?.id) {
      console.error("User not authenticated for logging waste.");
      alert("You must be logged in to log waste entries.");
      return;
    }

    // --- Step 1: Insert the box into the public.boxes table and get its generated ID ---
    const { data: newBoxData, error: boxInsertError } = await supabase
      .from('boxes')
      .insert({
        name: boxName,
        user_id: session.user.id,
      })
      .select('id'); // Request the 'id' of the newly inserted row

    if (boxInsertError || !newBoxData || newBoxData.length === 0) {
      console.error("Error inserting box into Supabase:", boxInsertError);
      setCloseBoxSupabaseError(`Failed to save box: ${boxInsertError?.message || "Unknown error"}`);
      return; // Stop here, do not proceed with waste logging or UI updates
    }

    const newSupabaseBoxId = newBoxData[0].id; // Get the generated ID from Supabase

    // --- Step 2: Log waste entries for batches in the box using the newSupabaseBoxId ---
    const wasteEntries = batchesInBox.map(batch => {
      let processedQuantity = batch.quantity_amount;
      const lowerUnit = batch.unit.toLowerCase();
      if (lowerUnit === 'pounds/ounces') {
        processedQuantity = batch.quantity_amount / 16; // Convert to pounds for waste logging
      } else if (lowerUnit === 'gallons/quarts') {
        processedQuantity = batch.quantity_amount / 4; // Convert to gallons for waste logging
      }

      return {
        item_id: batch.itemId,
        user_id: session.user.id,
        quantity: processedQuantity,
        metadata: {
          batchId: batch.id,
          itemName: batch.itemName,
          unit: batch.unit,
          originalQuantity: batch.quantity_amount,
          boxId: newSupabaseBoxId, // Store the Supabase-generated box ID
          tags: batch.tags,
        }
      };
    });

    if (wasteEntries.length > 0) {
      const { error: wasteInsertError } = await supabase.from('waste_entries').insert(wasteEntries);
      if (wasteInsertError) {
        console.error("Error logging waste entries:", wasteInsertError);
        // Alert the user that waste logging failed, but the box was saved.
        alert("Failed to log all waste entries, but the box was successfully saved. " + wasteInsertError.message);
      } else {
        console.log("Waste entries logged successfully");
      }
    }

    // --- Step 3: Remove the box from the state and close dialog (only if box insertion was successful) ---
    setBoxes(prevBoxes => prevBoxes.filter(box => box.id !== boxId));
    setShowBoxContentDialog(false);
    setSelectedBoxForContent(null);
    setCloseBoxSupabaseError(null); // Clear error after successful operation
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
            color: "var(--menu-text)",
          }}
          onClick={() => handleTabClick('breakfast')}
        >
          Breakfast
        </button>
        <button
          className="tab-button"
          style={{
            backgroundColor: selectedTab === 'lunch' ? 'var(--button-color)' : 'var(--menu-bg)',
            color: "var(--menu-text)",
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
                tags={batch.tags}
                onMoveToBox={handleMoveBatchToFirstBox} // Pass the new handler
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
                    onBoxClick={handleBoxClick}
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
          initialTags={selectedItem.tags} // Pass the tags from the selected item
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
          onCloseDialog={handleCloseBoxDialog}
          onRemoveBatchFromBox={handleRemoveBatchFromBox}
          onCloseBoxAndLogWaste={handleCloseBoxAndLogWaste} // Pass the new handler
          closeBoxError={closeBoxSupabaseError} // Pass the error state
        />
      )}
    </main>
  );
};

export default ItemsPage;