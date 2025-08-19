import { useState, useEffect, useMemo, useRef } from "react";
import { subDays } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./ItemsTable/ItemsTable.css";
import DateRange from "./widgets/daterange";

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
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    const filtered = items.filter((item) => {
      const created = new Date(item.created_at);
      return created >= startDate && created <= endDate;
    });
    setFilteredItems(filtered);
  }, [items, startDate, endDate]);

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
      // Temporarily apply styles for PDF generation
      const tableElement = tableRef.current.querySelector('.items-table');
      if (tableElement) {
        tableElement.querySelectorAll('th, td').forEach((el) => {
          (el as HTMLElement).style.color = '#000'; // Set text color to black
        });
      }

      const canvas = await html2canvas(tableRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save('items-table.pdf');

      // Revert styles after PDF generation
      if (tableElement) {
        tableElement.querySelectorAll('th, td').forEach((el) => {
          (el as HTMLElement).style.color = ''; // Remove inline style
        });
      }
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}
    >
      {/* Section 1 - Totals */}
      <div style={{ width: "100%" }}>
        <h2>Total Items</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <DateRange onDateRangeChange={handleDateRangeChange} />
          <button onClick={handleDownloadPDF}>Download PDF</button>
        </div>
      </div>

      {/* Section 2 - Grouped Items Table */}
      <div style={{ width: "100%" }} ref={tableRef}>
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
              {groupedItems.length === 0 && (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center", color: "#888" }}>
                    No items found for selected date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TotalItemsCard;
