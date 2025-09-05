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

  const handleBoxNameSubmit = async (boxName: string) => {
    if (!session?.user?.id) {
      console.error("User not authenticated for creating a box.");
      alert("You must be logged in to create a box.");
      setShowBoxNameDialog(false);
      return;
    }

    const { data: newBoxData, error: boxInsertError } = await supabase
      .from('boxes')
      .insert({
        name: boxName,
        user_id: session.user.id,
        metadata: { status: "open" }, // Set metadata as requested
      })
      .select('id');

    if (boxInsertError || !newBoxData || newBoxData.length === 0) {
      console.error("Error inserting new box into Supabase:", boxInsertError);
      alert(`Failed to create box: ${boxInsertError?.message || "Unknown error"}`);
      setShowBoxNameDialog(false);
      return;
    }

    const newSupabaseBoxId = newBoxData[0].id;

    setBoxes(prevBoxes => [...prevBoxes, { id: newSupabaseBoxId, name: boxName, batches: [] }]); // Use Supabase-generated ID
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

  const handleQuantitySubmit = async (
    quantity: number | { pounds: number; ounces: number } | { gallons: number; quarts: number },
    tags: string[]
  ) => {
    if (!selectedItem || !session?.user?.id) {
      console.error("User not authenticated or no item selected for batch creation/update.");
      alert("You must be logged in and select an item to add/update a batch.");
      setShowQuantityDialog(false);
      setSelectedItem(null);
      return;
    }

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

    // Find if an existing batch for this item and donation status exists
    const existingBatchInSupabaseQuery = supabase
      .from('batches')
      .select('*')
      .eq('metadata->>itemId', selectedItem.id) // Corrected to query metadata->>itemId
      .eq('user_id', session.user.id)
      .eq('metadata->>status', 'open'); // Only consider open batches

    // Add tag filter for donation status
    if (tags.includes("donation")) {
      existingBatchInSupabaseQuery.filter('metadata->>tags', 'like', '%"donation"%');
    } else {
      // Check if the 'tags' array within metadata does NOT contain 'donation'
      existingBatchInSupabaseQuery.not('metadata->tags', 'cs', '["donation"]');
    }

    const { data: existingBatchesData, error: existingBatchesError } = await existingBatchInSupabaseQuery;

    if (existingBatchesError) {
      console.error("Error querying existing batches:", existingBatchesError);
      alert(`Failed to check for existing batches: ${existingBatchesError.message}`);
      setShowQuantityDialog(false);
      setSelectedItem(null);
      return;
    }

    const existingBatch = existingBatchesData?.[0];

    if (totalQuantity === 0) {
      // If quantity is 0, remove the batch if it exists
      if (existingBatch) {
        const { error: deleteError } = await supabase
          .from('batches')
          .delete()
          .eq('id', existingBatch.id);

        if (deleteError) {
          console.error("Error deleting batch:", deleteError);
          alert(`Failed to delete batch: ${deleteError.message}`);
        } else {
          setBatches((prevBatches) =>
            prevBatches.filter((batch) => batch.id !== existingBatch.id)
          );
          console.log("Batch deleted successfully.");
        }
      }
    } else {
      // Add or update batch
      if (existingBatch) {
        // Update existing batch
        const newQuantity = existingBatch.quantity_amount + totalQuantity;
        const { data: updatedBatchData, error: updateError } = await supabase
          .from('batches')
          .update({ metadata: { ...existingBatch.metadata, quantity_amount: newQuantity } })
          .eq('id', existingBatch.id)
          .select('*');

        if (updateError) {
          console.error("Error updating batch:", updateError);
          alert(`Failed to update batch: ${updateError.message}`);
        } else if (updatedBatchData) {
          const updatedBatch = updatedBatchData[0];
          setBatches((prevBatches) =>
            prevBatches.map((batch) =>
              batch.id === updatedBatch.id
                ? {
                    ...batch,
                    metadata: updatedBatch.metadata,
                  }
                : batch
            )
          );
          console.log("Batch updated successfully.");
        }
      } else {
        // Create new batch
        const newBatchData = {
          user_id: session.user.id,
          metadata: {
            status: "open",
            itemId: selectedItem.id,
            itemName: selectedItem.name,
            imageUrl: selectedItem.imageUrl,
            startTime: new Date().toISOString(),
            holdMinutes: selectedItem.holdMinutes,
            unit: selectedItem.unit,
            tags: tags,
            quantity_amount: totalQuantity, // Moved quantity_amount to metadata
          },
        };

        const { data: insertedBatchData, error: insertError } = await supabase
          .from('batches')
          .insert(newBatchData)
          .select('*');

        if (insertError) {
          console.error("Error inserting new batch:", insertError);
          alert(`Failed to create new batch: ${insertError.message}`);
        } else if (insertedBatchData) {
          const insertedBatch = insertedBatchData[0];
          setBatches((prevBatches) => [
            ...prevBatches,
            {
              id: insertedBatch.id,
              metadata: {
                status: insertedBatch.metadata.status,
                boxId: insertedBatch.metadata.boxId,
                itemId: insertedBatch.metadata.itemId,
                itemName: insertedBatch.metadata.itemName,
                imageUrl: insertedBatch.metadata.imageUrl,
                startTime: insertedBatch.metadata.startTime,
                holdMinutes: insertedBatch.metadata.holdMinutes,
                unit: insertedBatch.metadata.unit,
                quantity_amount: insertedBatch.metadata.quantity_amount,
                tags: insertedBatch.metadata.tags,
              },
            },
          ]);
          console.log("New batch created successfully.");
        }
      }
    }

    setShowQuantityDialog(false);
    setSelectedItem(null);
  };

  const handleRemoveBatch = async (batchIdToRemove: string) => {
    if (!session?.user?.id) {
      console.error("User not authenticated for removing a batch.");
      alert("You must be logged in to remove batches.");
      return;
    }

    const { error: deleteError } = await supabase
      .from('batches')
      .delete()
      .eq('id', batchIdToRemove);

    if (deleteError) {
      console.error("Error deleting batch:", deleteError);
      alert(`Failed to delete batch: ${deleteError.message}`);
    } else {
      setBatches(prevBatches => prevBatches.filter(batch => batch.id !== batchIdToRemove));
      console.log("Batch deleted successfully.");
    }
  };

  // DRAG AND DROP HANDLERS
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, batchId: string) => {
    e.dataTransfer.setData("batchId", batchId);
  };

  const handleDropBatch = async (batchId: string, targetBoxId: string) => {
    if (!session?.user?.id) {
      console.error("User not authenticated for dropping a batch.");
      alert("You must be logged in to move batches.");
      return;
    }

    const droppedBatch = batches.find(batch => batch.id === batchId);

    if (!droppedBatch) {
      console.warn("Dropped batch not found:", batchId);
      return;
    }

    // Update Supabase: Set the boxId for the dropped batch
    const { error: updateError } = await supabase
      .from('batches')
      .update({ metadata: { ...droppedBatch.metadata, boxId: targetBoxId } })
      .eq('id', batchId);

    if (updateError) {
      console.error("Error updating batch with new boxId:", updateError);
      alert(`Failed to move batch: ${updateError.message}`);
      return;
    }

    // Update local state after successful Supabase update
    setBoxes(prevBoxes => prevBoxes.map(box => {
      if (box.id === targetBoxId) {
        return {
          ...box,
          batches: [...box.batches, { ...droppedBatch, metadata: { ...droppedBatch.metadata, boxId: targetBoxId } }]
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

  const handleRemoveBatchFromBox = async (boxId: string, batchIdToRemove: string) => {
    if (!session?.user?.id) {
      console.error("User not authenticated for removing a batch from a box.");
      alert("You must be logged in to remove batches from boxes.");
      return;
    }

    let removedBatch: BatchData | undefined;

    // Find the batch to be removed to get its full data for local state update
    setBoxes(prevBoxes => prevBoxes.map(box => {
      if (box.id === boxId) {
        removedBatch = box.batches.find(batch => batch.id === batchIdToRemove);
        return box;
      }
      return box;
    }));

    if (!removedBatch) {
      console.warn("Batch to remove from box not found:", batchIdToRemove);
      return;
    }

    // Update Supabase: Set boxId to null for the removed batch
    const { error: updateError } = await supabase
      .from('batches')
      .update({ metadata: { ...removedBatch.metadata, boxId: null } })
      .eq('id', batchIdToRemove);

    if (updateError) {
      console.error("Error removing batch from box in Supabase:", updateError);
      alert(`Failed to remove batch from box: ${updateError.message}`);
      return;
    }

    // Update local state after successful Supabase update
    setBoxes(prevBoxes => prevBoxes.map(box => {
      if (box.id === boxId) {
        const updatedBatchesInBox = box.batches.filter(batch => batch.id !== batchIdToRemove);
        return {
          ...box,
          batches: updatedBatchesInBox
        };
      }
      return box;
    }));

    // Add the removed batch back to the main batches list with updated metadata
    setBatches(prevBatches => [...prevBatches, { ...removedBatch!, metadata: { ...removedBatch!.metadata, boxId: null } }]);

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
  const handleMoveBatchToFirstBox = async (batchToMove: BatchData): Promise<boolean> => {
    if (!session?.user?.id) {
      console.error("User not authenticated for moving a batch.");
      alert("You must be logged in to move batches.");
      return false;
    }

    if (boxes.length === 0) {
      return false; // No boxes to move to
    }

    const firstBox = boxes[0];

    // Update Supabase: Set the boxId for the batch
    const { error: updateError } = await supabase
      .from('batches')
      .update({ metadata: { ...batchToMove.metadata, boxId: firstBox.id } })
      .eq('id', batchToMove.id);

    if (updateError) {
      console.error("Error moving batch to first box in Supabase:", updateError);
      alert(`Failed to move batch to box: ${updateError.message}`);
      return false;
    }

    // Update local state after successful Supabase update
    setBoxes(prevBoxes => prevBoxes.map(box => {
      if (box.id === firstBox.id) {
        return {
          ...box,
          batches: [...box.batches, { ...batchToMove, metadata: { ...batchToMove.metadata, boxId: firstBox.id } }]
        };
      }
      return box;
    }));

    setBatches(prevBatches => prevBatches.filter(batch => batch.id !== batchToMove.id));
    return true; // Successfully moved
  };

  // Handler to close a box and log its batches as waste
  const handleCloseBoxAndLogWaste = async (boxId: string, batchesInBox: BatchData[]) => {
    if (!session?.user?.id) {
      console.error("User not authenticated for logging waste.");
      alert("You must be logged in to log waste entries.");
      return;
    }

    // --- Step 1: Update the existing box in the public.boxes table to set its status to "closed" ---
    const { error: boxUpdateError } = await supabase
      .from('boxes')
      .update({
        metadata: { status: "closed" }, // Set metadata as requested
      })
      .eq('id', boxId); // Identify the box to update by its Supabase ID

    if (boxUpdateError) {
      console.error("Error updating box in Supabase:", boxUpdateError);
      setCloseBoxSupabaseError(`Failed to close box: ${boxUpdateError?.message || "Unknown error"}`);
      return; // Stop here, do not proceed with waste logging or UI updates
    }

    // --- Step 2: Update all batches within this box to have status "closed" ---
    const batchIdsToUpdate = batchesInBox.map(batch => batch.id);
    if (batchIdsToUpdate.length > 0) {
      const { error: batchesUpdateError } = await supabase
        .from('batches')
        .update({ metadata: { status: "closed", boxId: boxId } }) // Keep boxId for historical reference
        .in('id', batchIdsToUpdate);

      if (batchesUpdateError) {
        console.error("Error updating batches status to closed:", batchesUpdateError);
        alert(`Failed to update status of batches in the closed box: ${batchesUpdateError.message}`);
        // Continue with waste logging, as the box itself is closed
      }
    }

    const newSupabaseBoxId = boxId; // The boxId is already the Supabase ID

    // --- Step 3: Log waste entries for batches in the box using the newSupabaseBoxId ---
    const wasteEntries = batchesInBox.map(batch => {
      let processedQuantity = batch.metadata.quantity_amount; // Get from metadata
      const lowerUnit = batch.metadata.unit.toLowerCase(); // Get from metadata
      if (lowerUnit === 'pounds/ounces') {
        processedQuantity = batch.metadata.quantity_amount / 16; // Convert to pounds for waste logging
      } else if (lowerUnit === 'gallons/quarts') {
        processedQuantity = batch.metadata.quantity_amount / 4; // Convert to gallons for waste logging
      }

      return {
        item_id: batch.metadata.itemId, // Get from metadata
        user_id: session.user.id,
        quantity: processedQuantity,
        metadata: {
          batchId: batch.id,
          itemName: batch.metadata.itemName, // Get from metadata
          unit: batch.metadata.unit, // Get from metadata
          originalQuantity: batch.metadata.quantity_amount, // Get from metadata
          boxId: newSupabaseBoxId, // Store the Supabase-generated box ID
          tags: batch.metadata.tags, // Get from metadata
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

    // --- Step 4: Remove the box from the state and close dialog (only if box insertion was successful) ---
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
    const fetchOpenBoxesAndBatches = async () => {
      if (!session?.user?.id) {
        console.log("User not authenticated, skipping fetching open boxes and batches.");
        setBoxes([]);
        setBatches([]);
        return;
      }

      // Fetch all open boxes
      const { data: openBoxesData, error: openBoxesError } = await supabase
        .from('boxes')
        .select('id, name')
        .eq('user_id', session.user.id)
        .eq('metadata->>status', 'open');

      if (openBoxesError) {
        console.error("Error fetching open boxes:", openBoxesError);
        alert(`Failed to fetch open boxes: ${openBoxesError.message}`);
        setBoxes([]);
        setBatches([]);
        return;
      }

      const loadedBoxes: BoxData[] = openBoxesData ? openBoxesData.map(box => ({
        id: box.id,
        name: box.name,
        batches: [], // Initialize with empty batches, will populate next
      })) : [];

      // Fetch all open batches for the user
      const { data: openBatchesData, error: openBatchesError } = await supabase
        .from('batches')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('metadata->>status', 'open');

      if (openBatchesError) {
        console.error("Error fetching open batches:", openBatchesError);
        alert(`Failed to fetch open batches: ${openBatchesError.message}`);
        setBoxes([]);
        setBatches([]);
        return;
      }

      const unboxedBatches: BatchData[] = [];
      const batchesInBoxes: { [boxId: string]: BatchData[] } = {};

      if (openBatchesData) {
        openBatchesData.forEach((batch: any) => {
          const parsedBatch: BatchData = {
            id: batch.id,
            metadata: {
              status: batch.metadata.status,
              boxId: batch.metadata.boxId,
              itemId: batch.metadata.itemId,
              itemName: batch.metadata.itemName,
              imageUrl: batch.metadata.imageUrl,
              startTime: batch.metadata.startTime,
              holdMinutes: batch.metadata.holdMinutes,
              unit: batch.metadata.unit,
              quantity_amount: batch.metadata.quantity_amount,
              tags: batch.metadata.tags,
            },
          };

          if (batch.metadata?.boxId) {
            if (!batchesInBoxes[batch.metadata.boxId]) {
              batchesInBoxes[batch.metadata.boxId] = [];
            }
            batchesInBoxes[batch.metadata.boxId].push(parsedBatch);
          } else {
            unboxedBatches.push(parsedBatch);
          }
        });
      }

      // Assign batches to their respective boxes
      const finalLoadedBoxes = loadedBoxes.map(box => ({
        ...box,
        batches: batchesInBoxes[box.id] || [],
      }));

      setBoxes(finalLoadedBoxes);
      setBatches(unboxedBatches);
    };

    fetchOpenBoxesAndBatches();
  }, [session?.user?.id, setBoxes, setBatches]);

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
                  src={item.imageUrl || undefined}
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
                metadata={batch.metadata} // Pass the entire metadata object
                onMoveToBox={handleMoveBatchToFirstBox}
                onRemoveBatch={handleRemoveBatch}
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