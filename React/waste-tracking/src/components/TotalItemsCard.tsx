import { useState, useEffect } from "react";
import { subHours, subDays, subMonths, subYears } from "date-fns";
import './ItemsTable/ItemsTable.css';

interface Item {
  id: number;
  name: string;
  created_at: string;
  restaurant_id: number;
  quantity?: number;
  metadata?: any;
}

function formatQuantity(quantity: number, unit: string): string {
  const lowerUnit = unit.toLowerCase();
  if (lowerUnit === 'pounds/ounces') {
    return Math.floor(quantity) + " pounds " + quantity % 1 * 16 + " ounces";
  } else if (lowerUnit === 'gallons/quarts') {
    return Math.floor(quantity) + " gallons " + quantity % 1 * 4 + " quarts";
  }
  return String(quantity);
}

const TotalItemsCard = ({ items }: { items: Item[] }) => {
  const [range, setRange] = useState<"1d" | "30d" | "6m" | "1y" | "all">("30d");
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);

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
    console.log(filtered);
    setFilteredItems(filtered);

    const total = filtered.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
    setTotalCount(total);
  }, [items, range]);

  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      
      {/* Left Column - Items Table */}
      <div style={{ flex: 2 }}>
        <h2>Items</h2>
        <div className="items-table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>
                    {formatQuantity(
                      item.quantity ?? 0,
                      item.metadata?.unit ?? ""
                    )}
                  </td>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column - Totals */}
      <div style={{ flex: 1 }}>
        <h2>Total Items</h2>

        <div>
          <label htmlFor="dateRange">Date Range:</label>
          <select
            id="dateRange"
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

        <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{totalCount}</p>
      </div>
    </div>
  );
};

export default TotalItemsCard;
