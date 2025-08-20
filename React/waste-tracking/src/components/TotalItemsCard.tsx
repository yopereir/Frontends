import { useState, useEffect, useMemo, useRef } from "react";
import { subDays } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./ItemsTable/ItemsTable.css";
import DateRange from "./widgets/daterange";
import DownloadPDF from "./widgets/downloadpdf";
import ItemSelectMultiple from "./widgets/itemselectmultiple";
import supabase from "../supabase"; // ✅ Import the supabase client

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

// ✅ Removed the items prop, as the component will now fetch its own data
const TotalItemsCard = () => {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [items, setItems] = useState<Item[]>([]); // ✅ New state for fetched data
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedItemNames, setSelectedItemNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); // ✅ New loading state
  const tableRef = useRef<HTMLDivElement>(null);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  // ✅ New useEffect hook to fetch data
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);

      const { data: wasteData, error: wasteError } = await supabase
        .from("waste_entries")
        .select("id, created_at, quantity, item_id, metadata")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (!wasteError && wasteData) {
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
            };
          })
        );
        setItems(fetchedItems);
      } else {
        console.warn("Supabase fetch failed:", wasteError);
        setItems([]);
      }
      setLoading(false);
    };

    fetchItems();
  }, [startDate, endDate]); // Re-fetch data whenever the date range changes

  // ✅ The existing useEffect now filters the data that was fetched by the new hook
  useEffect(() => {
    const filteredByDateAndName =
      selectedItemNames.length === 0
        ? items
        : items.filter((item) => selectedItemNames.includes(item.name));

    setFilteredItems(filteredByDateAndName);
  }, [items, selectedItemNames]);

  // Derive all unique item names from the fetched items
  const allItemNames = useMemo(() => {
    const names = new Set<string>();
    items.forEach((item) => names.add(item.name));
    return Array.from(names).sort();
  }, [items]);

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

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, { quantity, unit }]) => ({
        name,
        quantity,
        unit,
      }));
  }, [filteredItems]);

  const handleDownloadPDF = async () => {
    if (tableRef.current) {
      const tableElement = tableRef.current.querySelector(".items-table");
      if (tableElement) {
        tableElement.querySelectorAll("th, td").forEach((el) => {
          (el as HTMLElement).style.color = "#000";
        });
      }

      const canvas = await html2canvas(tableRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth * 0.9; // 90% of the PDF width
      const imgX = (pdfWidth - imgWidth) / 2; // Center the image
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10; // Initial position for content

      // Add title
      pdf.setFontSize(22);
      pdf.setTextColor(0, 0, 0); // Black color 
      pdf.text('Total Items', imgX, position); // x, y coordinates, centered
      position += 10; // Adjust position for the next line

      // Add subheading for date range and filtered items
      pdf.setFontSize(12);
      const formattedStartDate = startDate.toLocaleDateString();
      const formattedEndDate = endDate.toLocaleDateString();
      const dateRangeText = `Date Range: ${formattedStartDate} - ${formattedEndDate}`;
      pdf.text(dateRangeText, imgX, position);
      position += 7; // Adjust position for the next line

      const itemsFilteredText = selectedItemNames.length > 0 
        ? `Filtered Items: ${selectedItemNames.join(', ')}`
        : 'All Items';
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
      pdf.save("items-table.pdf");

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
      {/* Section 1 - Totals */}
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <DateRange onDateRangeChange={handleDateRangeChange} />
          <DownloadPDF onDownload={handleDownloadPDF} />
        </div>
        {/* Item Filter */}
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <ItemSelectMultiple
            itemNames={allItemNames}
            selectedNames={selectedItemNames}
            onSelectionChange={setSelectedItemNames}
          />
        </div>
      </div>

      {/* Section 2 - Grouped Items Table */}
      <div style={{ width: "100%" }} ref={tableRef}>
        <div className="items-table-container">
          {loading ? (
            <p style={{ textAlign: "center", color: "#888" }}>Loading...</p>
          ) : (
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
                {groupedItems.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", color: "#888" }}>
                      No items found for selected date range
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

export default TotalItemsCard;
