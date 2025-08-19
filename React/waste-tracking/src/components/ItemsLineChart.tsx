import { useState, useEffect } from "react";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
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
import DateRange from "./widgets/daterange";

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
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    setItemNames([...new Set(items.map((item) => item.name))]);
  }, [items]);

  useEffect(() => {
    const filtered = items.filter((item) => {
      const created = new Date(item.created_at);
      return created >= startDate && created <= endDate &&
        (selectedNames.length === 0 || selectedNames.includes(item.name));
    });
    setFilteredItems(filtered);

    const counts: Record<string, number> = {};

    const dateFormat = "yyyy-MM-dd";

    filtered.forEach((item) => {
      const dateKey = format(new Date(item.created_at), dateFormat);
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });

    const startOfRange = startOfDay(startDate);
    const endOfRange = startOfDay(endDate);

    const daysInInterval = eachDayOfInterval({
      start: startOfRange,
      end: endOfRange,
    });

    const dataPoints = daysInInterval.map((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      return { date: format(day, "MMM d"), count: counts[dateKey] || 0 };
    });

    setGroupedData(dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  }, [items, startDate, endDate, selectedNames]);

  return (
    <>
      <DateRange onDateRangeChange={handleDateRangeChange} />

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
