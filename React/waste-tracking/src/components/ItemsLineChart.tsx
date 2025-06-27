import { useState, useEffect } from "react";
import { format, subHours, subDays, subMonths, subYears, startOfHour, startOfDay, eachHourOfInterval, eachDayOfInterval } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Item {
  id: number;
  name: string;
  created_at: string;
  restaurant_id: number;
}

const ItemsLineChart = ({ items }: { items: Item[] }) => {
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [groupedData, setGroupedData] = useState<any[]>([]);
  const [itemNames, setItemNames] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [range, setRange] = useState<"1d" | "30d" | "6m" | "1y" | "all">("30d");

  const getStartDate = () => {
    const now = new Date();
    if (range === "1d") return subHours(now, 24);
    if (range === "30d") return subDays(now, 30);
    if (range === "6m") return subMonths(now, 6);
    if (range === "1y") return subYears(now, 1);
    return new Date("2000-01-01");
  };

  useEffect(() => {
    setItemNames([...new Set(items.map((item) => item.name))]);
  }, [items]);

  useEffect(() => {
    const startDate = getStartDate();
    const filtered = items.filter((item) => {
      const created = new Date(item.created_at);
      return created >= startDate &&
        (selectedNames.length === 0 || selectedNames.includes(item.name));
    });
    setFilteredItems(filtered);

    const counts: Record<string, number> = {};

    // Determine the format based on the selected range
    const dateFormat = range === "1d" ? "yyyy-MM-dd HH:00" : "yyyy-MM-dd";

    filtered.forEach((item) => {
      const dateKey = format(new Date(item.created_at), dateFormat);
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });

    let dataPoints: any[] = [];
    if (range === "1d") {
      const now = new Date();
      const startOf24HoursAgo = startOfHour(subHours(now, 24));
      const endOfNow = startOfHour(now); // This will include the current hour if not exactly 24 hours
      
      const hoursInInterval = eachHourOfInterval({
        start: startOf24HoursAgo,
        end: endOfNow,
      });

      dataPoints = hoursInInterval.map((hour) => {
        const dateKey = format(hour, "yyyy-MM-dd HH:00");
        return { date: format(hour, "MMM d, h a"), count: counts[dateKey] || 0 };
      });

    } else {
      // For ranges other than "1d", fill in missing days with 0 counts
      const startOfRange = startOfDay(getStartDate());
      const endOfToday = startOfDay(new Date());

      const daysInInterval = eachDayOfInterval({
        start: startOfRange,
        end: endOfToday,
      });

      dataPoints = daysInInterval.map((day) => {
        const dateKey = format(day, "yyyy-MM-dd");
        return { date: format(day, "MMM d"), count: counts[dateKey] || 0 };
      });
    }

    setGroupedData(dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  }, [items, range, selectedNames]);

  return (
    <>
      <div>
        <label style={{ marginRight: "1em" }}>Date Range:</label>
        <select value={range} onChange={(e) => setRange(e.target.value as any)}>
          <option value="1d">Past 1 Day</option>
          <option value="30d">Past 30 Days</option>
          <option value="6m">Past 6 Months</option>
          <option value="1y">Past 1 Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <button
          className="batch-button"
          style={{
            backgroundColor:
              selectedNames.length === 0
                ? "var(--button-color)"
                : "var(--error-color)",
          }}
          onClick={() => setSelectedNames([])}
        >
          All
        </button>
        {itemNames.map((name) => (
          <button
            key={name}
            className="batch-button"
            style={{
              backgroundColor: selectedNames.includes(name)
                ? "var(--button-color)"
                : "var(--error-color)",
            }}
            onClick={() =>
              setSelectedNames((prev) =>
                prev.includes(name)
                  ? prev.filter((n) => n !== name)
                  : [...prev, name]
              )
            }
          >
            {name}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={groupedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3ecf8e"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default ItemsLineChart;
