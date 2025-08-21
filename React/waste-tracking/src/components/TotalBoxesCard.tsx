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
  metadata?: { unit?: string };
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
            .select("id, name, restaurant_id, metadata")
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

  // Map of item_id -> item name and unit for quick lookup
  const itemMap = useMemo(() => {
    const map = new Map<string, { name: string; unit?: string }>();
    items.forEach((it) => {
      map.set(it.id, { name: it.name, unit: it.metadata?.unit });
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

      const relatedItemEntries: { name: string; quantity: number; unit?: string }[] = [];
      relatedWaste.forEach((we) => {
        if (we.item_id) {
          const itemInfo = itemMap.get(we.item_id);
          const itemName = itemInfo?.name || "Unknown Item";
          const itemUnit = itemInfo?.unit;
          const existingEntry = relatedItemEntries.find(
            (entry) => entry.name === itemName
          );
          if (existingEntry) {
            existingEntry.quantity += we.quantity || 0;
          } else {
            relatedItemEntries.push({ name: itemName, quantity: we.quantity || 0, unit: itemUnit });
          }
        }
      });

      const itemsForBox = relatedItemEntries.map(
        (entry) => ({
          name: entry.name,
          formatted: `${entry.name}, ${formatQuantity(entry.quantity, entry.unit || "")}`
        })
      );

      return {
        ...box,
        items: itemsForBox, // Now an array of objects
      };
    });
  }, [filteredBoxes, wasteEntries, startDate, endDate, itemMap]);

  // Apply item filter together with date filter
  const finalBoxes = useMemo(() => {
    if (selectedItems.length === 0) return boxesWithItems;
        return boxesWithItems.filter((box) =>
      box.items.some((itemEntry: { name: string; formatted: string }) => {
        return selectedItems.includes(itemEntry.name);
      })
    );
  }, [boxesWithItems, selectedItems]);

  // Deduplicated list of all possible item names for filter options
  const allItemNames = useMemo(() => {
    const names = new Set<string>();
    boxesWithItems.forEach((box) => {
      box.items.forEach((itemEntry: { name: string; formatted: string }) => {
        names.add(itemEntry.name);
      });
    });
    return Array.from(names).sort();
  }, [boxesWithItems]);

  const handleDownloadPDF = async () => {
    if (tableRef.current) {
      if (tableRef.current) {
        tableRef.current.querySelectorAll('h2, th, td').forEach((el) => {
          (el as HTMLElement).style.color = '#000'; // Set text color to black
        });
      }

      const canvas = await html2canvas(tableRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth * 0.9; // 90% of the PDF width
      const imgX = (pdfWidth - imgWidth) / 2; // Center the image
      const pageHeight = 297;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 10; // Initial position for content

      // Add title
      pdf.setFontSize(22);
      pdf.setTextColor(0, 0, 0); // Black color 
      pdf.text('Total Boxes', imgX, position); // x, y coordinates, centered
      position += 10; // Adjust position for the next line

      // Add subheading for date range and filtered items
      pdf.setFontSize(12);
      const formattedStartDate = startDate.toLocaleDateString();
      const formattedEndDate = endDate.toLocaleDateString();
      const dateRangeText = `Date Range: ${formattedStartDate} - ${formattedEndDate}`;
      pdf.text(dateRangeText, imgX, position);
      position += 7; // Adjust position for the next line

      const itemsFilteredText = selectedItems.length > 0 
        ? `Filtered by Items: ${selectedItems.join(', ')}`
        : 'All Items Included';
      pdf.text(itemsFilteredText, imgX, position);
      position += 10; // Adjust position for the table image

      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save("boxes-table.pdf");

      // Revert styles after PDF generation
      if (tableRef.current) {
        tableRef.current.querySelectorAll('h2, th, td').forEach((el) => {
          (el as HTMLElement).style.color = ''; // Remove inline style
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
                    <td
                      dangerouslySetInnerHTML={{
                        __html:
                          box.items.length > 0
                            ? box.items.map(item => item.formatted).join("<br />")
                            : "No items in this box",
                      }}
                    ></td>
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
