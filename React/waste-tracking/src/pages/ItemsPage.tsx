import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";
import { formatDistanceToNowStrict } from "date-fns";

interface Item {
  id: string;
  name: string;
  imageUrl: string;
  holdMinutes: number;
}

// Replace with Supabase fetch if needed
const items: Item[] = [
  {
    id: "1",
    name: "Chicken Sandwich",
    imageUrl: "/images/chicken-sandwich.jpg",
    holdMinutes: 20,
  },
  {
    id: "2",
    name: "Nuggets",
    imageUrl: "/images/nuggets.jpg",
    holdMinutes: 15,
  },
  {
    id: "3",
    name: "Fries",
    imageUrl: "/images/fries.jpg",
    holdMinutes: 7,
  },
];

const ItemsPage = () => {
  const { batches, setBatches } = useSession();
  const [now, setNow] = useState(new Date());
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
    };
    setBatches((prev) => [...prev, newBatch]);
  };

  const getRemainingTime = (start: Date, holdMinutes: number) => {
    const endTime = new Date(new Date(start).getTime() + holdMinutes * 60000);
    const totalSeconds = Math.floor((endTime.getTime() - now.getTime()) / 1000);
    if (totalSeconds <= 0) return "Expired";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <main>
      <HeaderBar />
      <Link className="home-link" to="/">
        ◄ Home
      </Link>
      <section className="main-container">
        <h1 className="header-text">Items</h1>

        <div className="grid-container">
          {items.map((item) => (
            <div className="batch" key={item.id}>
              <img
                src={item.imageUrl}
                alt={item.name}
                className="batch-image"
              />
              <h2 className="batch-title">{item.name}</h2>
              <p className="batch-subtext">Hold time: {item.holdMinutes} min</p>
              <button className="batch-button" onClick={() => handleAddBatch(item)}>
                Add Batch
              </button>
            </div>
          ))}
        </div>

        <h2 className="header-text mt-10">Active Batches</h2>
        <div className="grid-container">
          {batches.map((batch) => (
            <div className="batch" key={batch.id}>
              <img
                src={batch.imageUrl}
                alt={batch.itemName}
                className="batch-image"
              />
              <h2 className="batch-title">{batch.itemName}</h2>
              <p className="batch-subtext">
                Remaining: {getRemainingTime(batch.startTime, batch.holdMinutes)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ItemsPage;
