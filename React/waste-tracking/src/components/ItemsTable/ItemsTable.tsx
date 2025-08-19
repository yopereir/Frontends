import { useState, useMemo } from "react";
import { format, isWithinInterval } from "date-fns";
import { subDays } from "date-fns";
import "./ItemsTable.css";
import ItemSelectMultiple from "../widgets/itemselectmultiple";
import DateRange from "../widgets/daterange";

type Item = {
  id: number;
  name: string;
  created_at: string;
  restaurant_id: number;
};

type Props = {
  items: Item[];
};

const ItemsTable = ({ items }: Props) => {
  const [sortAsc, setSortAsc] = useState(true);
  const [sortKey, setSortKey] = useState<"created_at" | "name">("created_at");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const itemNames = useMemo(() => [...new Set(items.map((item) => item.name))], [items]);

  const filteredItems = useMemo(() => {
    const visible = selectedNames.length === 0
      ? items
      : items.filter((item) => selectedNames.includes(item.name));

    const dateFiltered = visible.filter((item) =>
      isWithinInterval(new Date(item.created_at), { start: startDate, end: endDate })
    );

    return [...dateFiltered].sort((a, b) => {
      const valA = sortKey === "created_at"
        ? new Date(a.created_at).getTime()
        : a.name.toLowerCase();
      const valB = sortKey === "created_at"
        ? new Date(b.created_at).getTime()
        : b.name.toLowerCase();

      if (typeof valA === "string" && typeof valB === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [items, selectedNames, sortAsc, sortKey, startDate, endDate]);

  const toggleSort = (key: "created_at" | "name") => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <DateRange onDateRangeChange={handleDateRangeChange} />
      <ItemSelectMultiple
        itemNames={itemNames}
        selectedNames={selectedNames}
        onSelectionChange={setSelectedNames}
      />

      <div className="items-table-container">
      <table className="items-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>
              Name{" "}
              <button
                onClick={() => toggleSort("name")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                {sortKey === "name" ? (sortAsc ? "▲" : "▼") : "↕"}
              </button>
            </th>
            <th>
              Created At{" "}
              <button
                onClick={() => toggleSort("created_at")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                {sortKey === "created_at" ? (sortAsc ? "▲" : "▼") : "↕"}
              </button>
            </th>
            <th>Restaurant ID</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: "0.5rem" }}>{item.id}</td>
              <td>{item.name}</td>
              <td>{format(new Date(item.created_at), "yyyy-MM-dd HH:mm")}</td>
              <td>{item.restaurant_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default ItemsTable;
