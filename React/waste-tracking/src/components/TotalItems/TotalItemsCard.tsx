import { useState, useEffect } from "react";
import { subHours, subDays, subMonths, subYears } from "date-fns";
import "./TotalItemsCard.css"; // 👈 local styles

interface Item {
  id: number;
  name: string;
  created_at: string;
  restaurant_id: number;
  quantity?: number;
}

const TotalItemsCard = ({ items }: { items: Item[] }) => {
  const [range, setRange] = useState<"1d" | "30d" | "6m" | "1y" | "all">("30d");
  const [totalCount, setTotalCount] = useState<number>(0);

  const getStartDate = () => {
    const now = new Date();
    if (range === "1d") return subHours(now, 24);
    if (range === "30d") return subDays(now, 30);
    if (range === "6m") return subMonths(now, 6);
    if (range === "1y") return subYears(now, 1);
    return new Date("2000-01-01");
  };

  useEffect(() => {
    const startDate = getStartDate();
    const filtered = items.filter((item) => new Date(item.created_at) >= startDate);

    const total = filtered.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
    setTotalCount(total);
  }, [items, range]);

  return (
    <div className="total-items-card">
      <h2 className="card-title">Total Items</h2>

      <div className="card-controls">
        <label htmlFor="dateRange">Date Range:</label>
        <select
          id="dateRange"
          className="unit-select"
          value={range}
          onChange={(e) => setRange(e.target.value as any)}
        >
          <option value="1d">Past 1 Day</option>
          <option value="30d">Past 30 Days</option>
          <option value="6m">Past 6 Months</option>
          <option value="1y">Past 1 Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <p className="total-count">{totalCount}</p>
    </div>
  );
};

export default TotalItemsCard;
