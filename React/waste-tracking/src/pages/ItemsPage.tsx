import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";
import Batch from "../components/Batch";
import QuantityDialog from "../components/QuantityDialog";

interface Item {
  id: string;
  name: string;
  imageUrl: string;
  holdMinutes: number;
  quantity_type: string,
}

// Replace with Supabase fetch if needed
const items: Item[] = [
  {
    id: "1",
    name: "Chicken Sandwich",
    imageUrl: "/images/chicken-sandwich.jpg",
    holdMinutes: 20,
    quantity_type: "Pounds",
  },
  {
    id: "2",
    name: "Nuggets",
    imageUrl: "/images/nuggets.jpg",
    holdMinutes: 15,
    quantity_type: "Count",
  },
  {
    id: "3",
    name: "Fries",
    imageUrl: "/images/fries.jpg",
    holdMinutes: 7,
    quantity_type: "Pounds",
  },
];

const ItemsPage = () => {
  const { batches, setBatches } = useSession();
  const [now, setNow] = useState(new Date());
  const [view, setView] = useState<'batches' | 'items'>('batches');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleAddWithQuantity = (item: Item) => {
    setSelectedItem(item);
    setShowDialog(true);
  };

  const handleQuantitySubmit = (quantity: number) => {
    if (!selectedItem) return;
    const newBatch = {
      id: crypto.randomUUID(),
      itemName: selectedItem.name,
      imageUrl: selectedItem.imageUrl,
      startTime: new Date(),
      holdMinutes: selectedItem.holdMinutes,
      quantity_type: selectedItem.quantity_type,
      quantity_amount: quantity,
    };
    setBatches((prev) => [...prev, newBatch]);
    setShowDialog(false);
    setSelectedItem(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddBatch = (item: Item) => {
    const newBatch = {
      id: crypto.randomUUID(),
      itemName: item.name,
      imageUrl: item.imageUrl,
      startTime: new Date(),
      holdMinutes: item.holdMinutes,
      quantity_type: item.quantity_type,
      quantity_amount: 1,
    };
    setBatches((prev) => [...prev, newBatch]);
  };

  const toggleView = () => {
    setView(prev => (prev === 'batches' ? 'items' : 'batches'));
  };

  const itemsContainer = (
    <>
      <h2 className="header-text">Items</h2>
      <div className="grid-container">
        {items.map((item) => (
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
              <p className="batch-subtext">Hold time: {item.holdMinutes} min</p>
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
            id={batch.id}
            itemName={batch.itemName}
            imageUrl={batch.imageUrl}
            startTime={batch.startTime}
            holdMinutes={batch.holdMinutes}
            quantity_type={batch.quantity_type}
            quantity_amount={batch.quantity_amount}
          />
      ))}
    </div>
  </>

  return (
    <main>
      <HeaderBar />
      <Link className="home-link" to="/">
        ◄ Home
      </Link>
      <section className="main-container">
        <button onClick={toggleView}>{view === 'batches'?'Items':'Batches'}</button>
        {view === 'batches' ? batchesContainer : itemsContainer}
      </section>
      {showDialog && selectedItem && (
        <QuantityDialog
          initialQuantity={1}
          onClose={() => setShowDialog(false)}
          onSubmit={handleQuantitySubmit}
        />
      )}
    </main>
  );
};

export default ItemsPage;
