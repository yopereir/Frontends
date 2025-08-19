import { useState, useEffect, useMemo, useRef } from "react";
import { subDays } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./ItemsTable/ItemsTable.css";
import DateRange from "./widgets/daterange";
import DownloadPDF from "./widgets/downloadpdf";

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
  metadata: { boxId?: string; itemName?: string; name?: string } | null;
  quantity?: number;
}

// NOTE: Allow optional item_id to support "enriched" item objects where
// id might be the waste_entry.id and item_id is the true items.id.
interface Item {
  id: string;
  name: string;
  restaurant_id?: number;
  item_id?: string | null;
}

const TotalBoxesCard = ({
  boxes,
  wasteEntries,
  items,
}: {
  boxes: Box[];
  wasteEntries: WasteEntry[];
  items: Item[];
}) => {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [filteredBoxes, setFilteredBoxes] = useState<Box[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Filter boxes by created_at
  useEffect(() => {
    const filteredByDate = boxes.filter((box) => {
      const created = new Date(box.created_at);
      return created >= startDate && created <= endDate;
    });
    setFilteredBoxes(filteredByDate);
  }, [boxes, startDate, endDate]);

  // Build a robust map of item_id -> item name.
  // Supports both shapes:
  //  1) items where id === items.id (true item id)
  //  2) items where item_id === items.id (true item id) and id === waste_entry.id
  const itemMap = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((it: Item & { item_id?: string | null }) => {
      if (it.id) map.set(String(it.id), it.name);
      if (it.item_id) map.set(String(it.item_id), it.name);
    });
    return map;
  }, [items]);

  // Attach item names to each box
  const boxesWithItems = useMemo(() => {
    return filteredBoxes.map((box) => {
      const relatedWaste = wasteEntries.filter((we) => {
        const created = new Date(we.created_at);
        const boxIdFromWE = we?.metadata?.boxId;
        return (
          created >= startDate &&
          created <= endDate &&
          boxIdFromWE != null &&
          String(boxIdFromWE) === String(box.id)
        );
      });

      const relatedItemNames = relatedWaste.map((we) => {
        // Try resolving by item_id -> itemMap
        const fromMap =
          we.item_id != null ? itemMap.get(String(we.item_id)) : undefined;

        // Fallbacks from waste entry metadata if available
        const metaName =
          we.metadata?.itemName ||
          we.metadata?.name ||
          (we as any).item_name;

        return fromMap || metaName || "Unknown Item";
      });

      // Deduplicate names while preserving order
      const uniqueNames = Array.from(new Set(relatedItemNames));

      return {
        ...box,
        items: uniqueNames,
      };
    });
  }, [filteredBoxes, wasteEntries, startDate, endDate, itemMap]);

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
      style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}
    >
      {/* Section 1 - Controls */}
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <DateRange onDateRangeChange={handleDateRangeChange} />
          <DownloadPDF onDownload={handleDownloadPDF} />
        </div>
      </div>

      {/* Section 2 - Boxes Table */}
      <div style={{ width: "100%" }} ref={tableRef}>
        <h2>Boxes</h2>
        <div className="items-table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Created At</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {boxesWithItems.map((box) => (
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
              {boxesWithItems.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", color: "#888" }}>
                    No boxes found for selected date range
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

export default TotalBoxesCard;
