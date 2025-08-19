import { useState, useEffect, useMemo, useRef } from "react";
import { subDays } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./ItemsTable/ItemsTable.css";
import DateRange from "./widgets/daterange";
import DownloadPDF from "./widgets/downloadpdf";
import ItemSelectMultiple from "./widgets/itemselectmultiple"; // Reuse this for selecting box names

interface Box {
  id: string;
  name: string | null;
  created_at: string;
  user_id: string;
}

const TotalBoxesCard = ({ boxes }: { boxes: Box[] }) => {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [filteredBoxes, setFilteredBoxes] = useState<Box[]>([]);
  const [selectedBoxNames, setSelectedBoxNames] = useState<string[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Derive all unique box names
  const allBoxNames = useMemo(() => {
    const names = new Set<string>();
    boxes.forEach((box) => {
      if (box.name) names.add(box.name);
    });
    return Array.from(names).sort();
  }, [boxes]);

  useEffect(() => {
    const filteredByDate = boxes.filter((box) => {
      const created = new Date(box.created_at);
      return created >= startDate && created <= endDate;
    });

    // Further filter by selected box names
    const filteredByDateAndName =
      selectedBoxNames.length === 0
        ? filteredByDate
        : filteredByDate.filter((box) =>
            box.name ? selectedBoxNames.includes(box.name) : false
          );

    setFilteredBoxes(filteredByDateAndName);
  }, [boxes, startDate, endDate, selectedBoxNames]);

  // Group boxes by name and count them
  const groupedBoxes = useMemo(() => {
    const map = new Map<string, number>();

    filteredBoxes.forEach((box) => {
      const key = box.name || "Unnamed Box";
      map.set(key, (map.get(key) ?? 0) + 1);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, count]) => ({
        name,
        count,
      }));
  }, [filteredBoxes]);

  const handleDownloadPDF = async () => {
    if (tableRef.current) {
      const tableElement =
        tableRef.current.querySelector(".items-table");
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
        {/* Box Filter */}
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <ItemSelectMultiple
            itemNames={allBoxNames}
            selectedNames={selectedBoxNames}
            onSelectionChange={setSelectedBoxNames}
          />
        </div>
      </div>

      {/* Section 2 - Grouped Boxes Table */}
      <div style={{ width: "100%" }} ref={tableRef}>
        <h2>Boxes</h2>
        <div className="items-table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Total Count</th>
              </tr>
            </thead>
            <tbody>
              {groupedBoxes.map((box) => (
                <tr key={box.name}>
                  <td>{box.name}</td>
                  <td>{box.count}</td>
                </tr>
              ))}
              {groupedBoxes.length === 0 && (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center", color: "#888" }}>
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
