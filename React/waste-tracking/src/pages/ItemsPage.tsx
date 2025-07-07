import { useEffect, useState } from "react";
import { useSession } from "../context/SessionContext"; // Assuming session provides user.id
import HeaderBar from "../components/HeaderBar";
import Batch from "../components/Batch";
import QuantityDialog from "../components/QuantityDialog";
import CreateBoxDialog from "../components/CreateBoxDialog"; // New component
import BoxDetailsDialog from "../components/BoxDetailsDialog"; // New component
import supabase from "../supabase";

interface Item {
  id: string;
  name: string;
  imageUrl: string;
  holdMinutes: number;
  unit: string;
  tags: string[];
}

// Updated Box interface to match your provided schema
interface Box {
  id: string;
  created_at: string; // ISO string
  name: string | null;
  user_id: string | null; // Changed from restaurant_id to user_id
}

const ItemsPage = () => {
  const { batches, setBatches, session } = useSession(); // Get session to access user.id
  const [now, setNow] = useState(new Date()); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [view, setView] = useState<'batches' | 'items'>('batches');
  const [showDialog, setShowDialog] = useState(false); // For QuantityDialog
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedTab, setSelectedTab] = useState<'lunch' | 'breakfast' | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]); // State for boxes
  const [showCreateBoxDialog, setShowCreateBoxDialog] = useState(false); // For CreateBoxDialog
  const [selectedBox, setSelectedBox] = useState<Box | null>(null); // For BoxDetailsDialog

  const handleTabClick = (tab: 'lunch' | 'breakfast') => {
    setSelectedTab(prev => (prev === tab ? null : tab));
  };

  const filteredItems = selectedTab ? items.filter(item => item.tags.includes(selectedTab)) : items;

  const handleAddWithQuantity = (item: Item) => {
    setSelectedItem(item);
    setShowDialog(true);
  };

  const handleQuantitySubmit = (
    quantity: number | { pounds: number; ounces: number } | { gallons: number; quarts: number }
  ) => {
    if (!selectedItem) return;

    // Determine total quantity based on unit type
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
        // Update existing batch
        const updatedBatches = [...prevBatches];
        updatedBatches[existingBatchIndex] = {
          ...updatedBatches[existingBatchIndex],
          quantity_amount:
            updatedBatches[existingBatchIndex].quantity_amount + totalQuantity,
        };
        return updatedBatches;
      } else {
        // Create new batch
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

    setShowDialog(false);
    setSelectedItem(null);
  };

  // Function to create a new box
  const handleCreateBox = async (boxName: string) => {
    if (!boxName.trim()) {
      alert("Box name cannot be empty.");
      return;
    }

    // Get the current user's ID from the session
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      alert("You must be logged in to create a box.");
      console.error("User ID not available from session.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('boxes')
        .insert({
          name: boxName,
          user_id: currentUserId // Use the current user's ID
        })
        .select(); // Use .select() to get the newly inserted row

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setBoxes(prevBoxes => [...prevBoxes, data[0]]); // Add the new box to state
        console.log("Box created successfully:", data[0]);
      }
    } catch (error: any) {
      console.error("Error creating box:", error.message);
      alert("Failed to create box: " + error.message);
    } finally {
      setShowCreateBoxDialog(false);
    }
  };

  // Function to handle clicking on a box to show details
  const handleBoxClick = (box: Box) => {
    setSelectedBox(box);
  };

  useEffect(() => {
    const fetchItemsAndBoxes = async () => {
      // Fetch Items
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

      // Fetch Boxes - Filter by current user_id
      const currentUserId = session?.user?.id;
      if (currentUserId) { // Only fetch boxes if user is logged in
        const { data: boxesData, error: boxesError } = await supabase
          .from('boxes')
          .select(`*`)
          .eq('user_id', currentUserId); // Filter boxes by the current user's ID

        console.log("Fetched boxes:", boxesData, boxesError);
        if (boxesError || !boxesData) {
          console.error("Failed to fetch boxes", boxesError);
        } else {
          // Map fetched box data to the Box interface
          const parsedBoxes: Box[] = boxesData.map((box: any) => ({
            id: box.id,
            created_at: box.created_at,
            name: box.name,
            user_id: box.user_id, // Map user_id
          }));
          setBoxes(parsedBoxes);
        }
      } else {
        setBoxes([]); // Clear boxes if no user is logged in
      }
    };
    fetchItemsAndBoxes();
  }, [session]); // Add session to dependency array so it re-fetches when session changes

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
    <div className="batches-column">
      <h2 className="header-text mt-10">Active Batches</h2>
      <div className="grid-container scrollable-container">
        {batches.length > 0 ? (
          batches.map((batch) => (
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
          ))
        ) : (
          <p className="no-items-message">No active batches. Add an item to create a batch.</p>
        )}
      </div>
    </div>
  );

  const boxesContainer = (
    <div className="boxes-column">
      <h2 className="header-text">Open Boxes</h2>
      <div className="grid-container scrollable-container">
        {boxes.length > 0 ? (
          boxes.map((box) => (
            <div className="box-card" key={box.id} onClick={() => handleBoxClick(box)}>
              <div className="box-card-content">
                {/* SVG for an open box */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF69B4" /* Pink color for boxes as in image */
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="box-icon"
                >
                  <path d="M21 8V5c0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1v3m18 0v8c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1v-8m18 0H3m14 4h-5" />
                </svg>
                <h2 className="box-title">{box.name}</h2>
              </div>
            </div>
          ))
        ) : (
          <p className="no-items-message">No open boxes. Create a new box to get started.</p>
        )}
      </div>
      <button className="create-box-button" onClick={() => setShowCreateBoxDialog(true)}>
        Create New Box
      </button>
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
            Batches & Boxes
          </button>
        </div>
        {view === 'batches' && (
          <div className="two-column-layout">
            {batchesContainer}
            {boxesContainer}
          </div>
        )}
        {view === 'items' && itemsContainer}
      </section>
      {showDialog && selectedItem && (
        <QuantityDialog
          initialQuantity={1}
          unit={selectedItem.unit}
          onClose={() => setShowDialog(false)}
          onSubmit={handleQuantitySubmit}
        />
      )}
      {showCreateBoxDialog && (
        <CreateBoxDialog
          onClose={() => setShowCreateBoxDialog(false)}
          onSubmit={handleCreateBox}
        />
      )}
      {selectedBox && (
        <BoxDetailsDialog
          box={selectedBox}
          onClose={() => setSelectedBox(null)}
        />
      )}
    </main>
  );
};

export default ItemsPage;