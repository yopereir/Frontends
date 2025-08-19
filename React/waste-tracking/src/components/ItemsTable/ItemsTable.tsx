import { useState, useMemo, useRef } from "react";
import { format, isWithinInterval } from "date-fns";
import { subDays } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./ItemsTable.css";
import ItemSelectMultiple from "../widgets/itemselectmultiple";
import DateRange from "../widgets/daterange";
import DownloadPDF from "../widgets/downloadpdf";

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

type Props = {
  items: Item[];
};

const ItemsTable = ({ items }: Props) => {
  const [sortAsc, setSortAsc] = useState(true);
  const [sortKey, setSortKey] = useState<"created_at" | "name">("created_at");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const tableRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadPdf = async () => {
    if (tableRef.current) {
      // Temporarily apply styles for PDF generation
      const tableElement = tableRef.current.querySelector('.items-table');
      if (tableElement) {
        tableElement.querySelectorAll('th, td').forEach((el) => {
          (el as HTMLElement).style.color = '#000'; // Set text color to black
        });
      }

      const canvas = await html2canvas(tableRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
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
      pdf.save("items-table.pdf");
      // Revert styles after PDF generation
      if (tableElement) {
        tableElement.querySelectorAll('th, td').forEach((el) => {
          (el as HTMLElement).style.color = ''; // Remove inline style
        });
      }
    }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <DateRange onDateRangeChange={handleDateRangeChange} />
        <DownloadPDF onDownload={handleDownloadPdf} />
      </div>
      <ItemSelectMultiple
        itemNames={itemNames}
        selectedNames={selectedNames}
        onSelectionChange={setSelectedNames}
      />

      <div className="items-table-container" ref={tableRef}>
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
          {filteredItems.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{format(new Date(item.created_at), "yyyy-MM-dd HH:mm")}</td>
              <td>{item.quantity ? formatQuantity(item.quantity, item.metadata?.unit ?? '') : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
};

export default ItemsTable;
