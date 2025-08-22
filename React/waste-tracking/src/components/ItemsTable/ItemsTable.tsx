import { useState, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { format, subDays } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./ItemsTable.css";
import ItemSelectMultiple from "../widgets/itemselectmultiple";
import DateRange from "../widgets/daterange";
import DownloadPDF from "../widgets/downloadpdf";
import TagFilters from "../widgets/tagfilters";
import supabase from "../../supabase"; // ✅ Import supabase

interface Item {
  id: number;
  name: string;
  created_at: string;
  restaurant_id: number;
  quantity?: number;
  metadata?: any;
  waste_entry_id: string;
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

export interface ItemsTableHandle {
  generatePdf: () => Promise<HTMLCanvasElement | null>;
}

// ✅ No longer receives items as a prop
const ItemsTable = forwardRef<ItemsTableHandle>((_props, ref) => {
  const [sortAsc, setSortAsc] = useState(true);
  const [sortKey, setSortKey] = useState<"created_at" | "name">("created_at");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [items, setItems] = useState<Item[]>([]); // ✅ New state for fetched data
  const [loading, setLoading] = useState(false); // ✅ New loading state
  const tableRef = useRef<HTMLDivElement>(null);

  // ✅ New useEffect hook to fetch data when dates change
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);

      // Fetch waste entries for the given date range
      const { data: wasteData, error: wasteError } = await supabase
        .from("waste_entries")
        .select("id, created_at, quantity, item_id, metadata")
        .gte("created_at", startDate.toISOString()) // Filter by start date
        .lte("created_at", endDate.toISOString()); // Filter by end date

      if (!wasteError && wasteData) {
        // Build enriched items from waste entries + items lookup
        const fetchedItems = await Promise.all(
          wasteData.map(async (wasteEntry) => {
            const { data: itemData } = await supabase
              .from("items")
              .select("id, name, restaurant_id")
              .eq("id", wasteEntry.item_id)
              .single();

            return {
              id: itemData?.id || wasteEntry.item_id,
              name: itemData?.name || "Unknown Item",
              created_at: wasteEntry.created_at,
              quantity: wasteEntry.quantity,
              restaurant_id: itemData?.restaurant_id,
              metadata: {
                ...wasteEntry.metadata,
                boxId: wasteEntry.metadata?.boxId,
              },
              waste_entry_id: wasteEntry.id,
            };
          })
        );
        setItems(fetchedItems);
      } else {
        console.warn("Supabase fetch failed for waste_entries:", wasteError);
        setItems([]);
      }
      setLoading(false);
    };

    fetchItems();
  }, [startDate, endDate]); // ✅ Re-fetch when startDate or endDate changes

  // Use useMemo to filter and sort the fetched data based on selected names and sorting keys
  const filteredAndSortedItems = useMemo(() => {
    const filteredByName =
      selectedNames.length === 0
        ? items
        : items.filter((item) => selectedNames.includes(item.name));

    return [...filteredByName].sort((a, b) => {
      const valA =
        sortKey === "created_at"
          ? new Date(a.created_at).getTime()
          : a.name.toLowerCase();
      const valB =
        sortKey === "created_at"
          ? new Date(b.created_at).getTime()
          : b.name.toLowerCase();

      if (typeof valA === "string" && typeof valB === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortAsc
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
  }, [items, selectedNames, sortKey, sortAsc]);

  const itemNames = useMemo(
    () => [...new Set(items.map((item) => item.name))],
    [items]
  );

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

  useImperativeHandle(ref, () => ({
    generatePdf: handleDownloadPdf,
  }));

  const handleDownloadPdf = async () => {
    if (tableRef.current) {
      if (tableRef.current) {
        tableRef.current.querySelectorAll('h2, th, td').forEach((el) => {
          (el as HTMLElement).style.color = '#000'; // Set text color to black
        });
      }

      const canvas = await html2canvas(tableRef.current, { scale: 2 });

      // Revert styles after PDF generation
      if (tableRef.current) {
        tableRef.current.querySelectorAll('h2, th, td').forEach((el) => {
          (el as HTMLElement).style.color = ''; // Remove inline style
        });
      }
      return canvas; // Return the canvas object
    }
    return null;
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
          <DateRange onDateRangeChange={handleDateRangeChange} />
          <DownloadPDF onDownload={handleDownloadPdf} />
        </div>
        <TagFilters />
        <ItemSelectMultiple
          itemNames={itemNames}
          selectedNames={selectedNames}
          onSelectionChange={setSelectedNames}
        />
      </div>

      <div className="items-table-container" ref={tableRef}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#888" }}>Loading...</p>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
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
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedItems.map((item) => (
                <tr key={item.waste_entry_id}>
                  <td>{item.name}</td>
                  <td>{format(new Date(item.created_at), "yyyy-MM-dd HH:mm")}</td>
                  <td>
                    {item.quantity
                      ? formatQuantity(item.quantity, item.metadata?.unit ?? "")
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
});

export default ItemsTable;
