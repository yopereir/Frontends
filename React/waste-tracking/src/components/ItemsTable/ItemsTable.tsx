import { useState, useMemo } from "react";
import { format } from "date-fns";
import "./ItemsTable.css";

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
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  const itemNames = useMemo(() => [...new Set(items.map((item) => item.name))], [items]);

  const filteredItems = useMemo(() => {
    const visible = selectedNames.length === 0
      ? items
      : items.filter((item) => selectedNames.includes(item.name));

    return [...visible].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
  }, [items, selectedNames, sortAsc]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <button
          className="batch-button"
          style={{
            backgroundColor:
              selectedNames.length === 0 ? "var(--button-color)" : "var(--error-color)",
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

      <table className="items-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>
              Created At{" "}
              <button
                onClick={() => setSortAsc(!sortAsc)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                {sortAsc ? "▲" : "▼"}
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
  );
};

export default ItemsTable;
