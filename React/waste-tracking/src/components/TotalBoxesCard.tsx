import { useState, useEffect, useMemo, useRef } from "react";
import { subDays } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./ItemsTable/ItemsTable.css";
import DateRange from "./widgets/daterange";
import DownloadPDF from "./widgets/downloadpdf";
import ItemSelectMultiple from "./widgets/itemselectmultiple";
import supabase from "../supabase";

interface Box {
  id: string;
  name: string | null;
  created_at: string;
  user_id: string;
}

interface WasteEntry {
  id: string;
  created_at: string;
  item_id: string | null;
  metadata: { boxId?: string } | null;
  quantity?: number;
}

interface Item {
  id: string;
  name: string;
  restaurant_id: number;
}

// ✅ No longer accepts props, as it will now fetch its own data
const TotalBoxesCard = () => {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [boxes, setBoxes] = useState<Box[]>([]); // ✅ New state for boxes
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([]); // ✅ New state for waste entries
  const [items, setItems] = useState<Item[]>([]); // ✅ New state for items
  const [filteredBoxes, setFilteredBoxes] = useState<Box[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); // ✅ New loading state
  const tableRef = useRef<HTMLDivElement>(null);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  // ✅ New useEffect hook to fetch all necessary data for the component
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);

      // Fetch all boxes
      const { data: boxData, error: boxError } = await supabase
        .from("boxes")
        .select("*");
      if (boxData) {
        setBoxes(boxData);
      } else {
        console.error("Failed to fetch boxes:", boxError);
        setBoxes([]);
      }

      // Fetch waste entries for the current date range
      const { data: wasteData, error: wasteError } = await supabase
        .from("waste_entries")
        .select("id, created_at, item_id, metadata, quantity")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (wasteData) {
        setWasteEntries(wasteData);

        // Fetch only the items associated with the fetched waste entries
        const uniqueItemIds = [
          ...new Set(wasteData.map((we) => we.item_id).filter(Boolean)),
        ];
        if (uniqueItemIds.length > 0) {
          const { data: itemData, error: itemError } = await supabase
            .from("items")
            .select("id, name, restaurant_id")
            .in("id", uniqueItemIds);
          if (itemData) {
            setItems(itemData);
          } else {
            console.error("Failed to fetch items:", itemError);
            setItems([]);
          }
        } else {
          setItems([]);
        }
      } else {
        console.error("Failed to fetch waste entries:", wasteError);
        setWasteEntries([]);
      }

      setLoading(false);
    };

    fetchAllData();
  }, [startDate, endDate]); // Re-run when the date range changes

  // Filter boxes by created_at (now using the local state)
  useEffect(() => {
    const filteredByDate = boxes.filter((box) => {
      const created = new Date(box.created_at);
      return created >= startDate && created <= endDate;
    });
    setFilteredBoxes(filteredByDate);
  }, [boxes, startDate, endDate]);

  // Map of item_id -> item name for quick lookup
  const itemMap = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((it) => {
      map.set(it.id, it.name);
    });
    return map;
  }, [items]);

  // Attach items to each box
  const boxesWithItems = useMemo(() => {
    return filteredBoxes.map((box) => {
      const relatedWaste = wasteEntries.filter((we) => {
        const created = new Date(we.created_at);
        return (
          created >= startDate &&
          created <= endDate &&
          we.metadata?.boxId === box.id
        );
      });

      const relatedItemNames = relatedWaste
        .map((we) =>
          we.item_id ? itemMap.get(we.item_id) || "Unknown Item" : "Unknown Item"
        )
        .filter((name, idx, arr) => arr.indexOf(name) === idx); // deduplicate

      return {
        ...box,
        items: relatedItemNames,
      };
    });
  }, [filteredBoxes, wasteEntries, startDate, endDate, itemMap]);

  // Apply item filter together with date filter
  const finalBoxes = useMemo(() => {
    if (selectedItems.length === 0) return boxesWithItems;
    return boxesWithItems.filter((box) =>
      box.items.some((itemName) => selectedItems.includes(itemName))
    );
  }, [boxesWithItems, selectedItems]);

  // Deduplicated list of all possible item names for filter options
  const allItemNames = useMemo(() => {
    const names = new Set<string>();
    boxesWithItems.forEach((box) => {
      box.items.forEach((name: string) => names.add(name));
    });
    return Array.from(names);
  }, [boxesWithItems]);

  const handleDownloadPDF = async () => {
    if (tableRef.current) {
      const tableElement = tableRef.current.querySelector(".items-table");
      if (tableElement) {
        tableElement.querySelectorAll("th, td").forEach((el) => {
          (el as HTMLElement).style.color = "#000";
        });
      }

      const canvas = await html2canvas(tableRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save("boxes-table.pdf");

      if (tableElement) {
        tableElement.querySelectorAll("th, td").forEach((el) => {
          (el as HTMLElement).style.color = "";
        });
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        width: "100%",
      }}
    >
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <DateRange onDateRangeChange={handleDateRangeChange} />
            <DownloadPDF onDownload={handleDownloadPDF} />
          </div>
          <ItemSelectMultiple
            itemNames={allItemNames}
            selectedNames={selectedItems}
            onSelectionChange={setSelectedItems}
          />
        </div>
      </div>

      <div style={{ width: "100%" }} ref={tableRef}>
        <h2>Boxes</h2>
        <div className="items-table-container">
          {loading ? (
            <p style={{ textAlign: "center", color: "#888" }}>Loading...</p>
          ) : (
            <table className="items-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Created At</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {finalBoxes.map((box) => (
                  <tr key={box.id}>
                    <td>{box.name || "Unnamed Box"}</td>
                    <td>{new Date(box.created_at).toLocaleString()}</td>
                    <td>
                      {box.items.length > 0
                        ? box.items.join(", ")
                        : "No items in this box"}
                    </td>
                  </tr>
                ))}
                {finalBoxes.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", color: "#888" }}>
                      No boxes found for selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TotalBoxesCard;
