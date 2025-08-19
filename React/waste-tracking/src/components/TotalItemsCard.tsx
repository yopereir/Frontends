import { useState, useEffect, useMemo } from "react";
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
  if (lowerUnit === "pounds/ounces") {
    const pounds = Math.floor(quantity);
    const ounces = Math.round((quantity % 1) * 16);
    return `${pounds} pounds ${ounces} ounces`;
  } else if (lowerUnit === "gallons/quarts") {
    const gallons = Math.floor(quantity);
    const quarts = Math.round((quantity % 1) * 4);
    return `${gallons} gallons ${quarts} quarts`;
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
    const filtered = items.filter(
      (item) => new Date(item.created_at) >= startDate
    );
    setFilteredItems(filtered);

    const total = filtered.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
    setTotalCount(total);
  }, [items, range]);

  // Group items by name and sum their quantities
  const groupedItems = useMemo(() => {
    const map = new Map<string, { quantity: number; unit: string }>();

    filteredItems.forEach((item) => {
      const unit = item.metadata?.unit ?? "";
      const existing = map.get(item.name);
      if (existing) {
        existing.quantity += item.quantity ?? 1;
      } else {
        map.set(item.name, { quantity: item.quantity ?? 1, unit });
      }
    });

    // Sort alphabetically by item name
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, { quantity, unit }]) => ({
        name,
        quantity,
        unit,
      }));
  }, [filteredItems]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Row 1 - Totals */}
      <div>
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

      {/* Row 2 - Grouped Items Table */}
      <div>
        <h2>Items</h2>
        <div className="items-table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Total Quantity</th>
              </tr>
            </thead>
            <tbody>
              {groupedItems.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{formatQuantity(item.quantity, item.unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TotalItemsCard;
