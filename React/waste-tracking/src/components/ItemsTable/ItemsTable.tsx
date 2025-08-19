import { useState, useMemo, useRef, useEffect } from "react";
import { format, subDays } from "date-fns";
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
  waste_entry_id: string; // ✅ The new unique identifier
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
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  const itemNames = useMemo(
    () => [...new Set(items.map((item) => item.name))],
    [items]
  );

  useEffect(() => {
    const filteredByDate = items.filter((item) => {
      const created = new Date(item.created_at);
      return created >= startDate && created <= endDate;
    });

    const filteredByDateAndName =
      selectedNames.length === 0
        ? filteredByDate
        : filteredByDate.filter((item) => selectedNames.includes(item.name));

    const sortedItems = [...filteredByDateAndName].sort((a, b) => {
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

    setFilteredItems(sortedItems);
  }, [items, startDate, endDate, selectedNames, sortKey, sortAsc]);

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
      pdf.save("items-table.pdf");

      if (tableElement) {
        tableElement.querySelectorAll("th, td").forEach((el) => {
          (el as HTMLElement).style.color = "";
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
      </div>
    </>
  );
};

export default ItemsTable;
