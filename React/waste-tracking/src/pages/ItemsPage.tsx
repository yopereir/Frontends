import { useEffect, useState } from "react";
import { useSession } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";
import Batch from "../components/Batch";
import QuantityDialog from "../components/QuantityDialog";
import supabase from "../supabase";

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
  const [showDialog, setShowDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedTab, setSelectedTab] = useState<'lunch' | 'breakfast' | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const handleTabClick = (tab: 'lunch' | 'breakfast') => {
    setSelectedTab(prev => (prev === tab ? null : tab));
  };

  const filteredItems = selectedTab ? items.filter(item => item.tags.includes(selectedTab)): items;

  const handleAddWithQuantity = (item: Item) => {
    setSelectedItem(item);
    setShowDialog(true);
  };

  const handleQuantitySubmit = (
    quantity: number | { pounds: number; ounces: number } | { gallons: number; quarts: number }
  ) => {
    if (!selectedItem) return;

    const isWeight = selectedItem.unit.toLowerCase() === 'pounds/ounces';
    const isVolume = selectedItem.unit.toLowerCase() === 'gallons/quarts';

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

    setShowDialog(false);
    setSelectedItem(null);
  };

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase.from('items').select(`*`);
      console.log("Fetched items:", data, error);
      if (error || !data) {
        console.error("Failed to fetch items", error);
        return;
      }

      const parsedItems: Item[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.metadata?.imageUrl || "",
        holdMinutes: item.metadata?.holdMinutes || 0,
        unit: item.metadata?.unit || "",
        tags: item.metadata?.tags || [],  // Assuming tags might come from metadata
      }));
      setItems(parsedItems);
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleView = () => {
    setView(prev => (prev === 'batches' ? 'items' : 'batches'));
  };

  const itemsContainer = (
    <>
      <h2 className="header-text">Items</h2>
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

  const batchesContainer = <>
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
  </>

  return (
    <main>
      <HeaderBar />
      <section className="main-container">
        <button onClick={toggleView}>{view === 'batches'?'Items':'Batches'}</button>
        {view === 'batches' ? batchesContainer : itemsContainer}
      </section>
      {showDialog && selectedItem && (
        <QuantityDialog
          initialQuantity={1}
          unit={selectedItem.unit}
          onClose={() => setShowDialog(false)}
          onSubmit={handleQuantitySubmit}
        />
      )}
    </main>
  );
};

export default ItemsPage;
