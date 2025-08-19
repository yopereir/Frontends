import { useState, useEffect, useRef } from "react";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import DateRange from "./widgets/daterange";
import DownloadPDF from "./widgets/downloadpdf";

interface Item {
  id: number;
  name: string;
  created_at: string;
  restaurant_id: number;
}

const ItemsLineChart = ({ items }: { items: Item[] }) => {
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [groupedData, setGroupedData] = useState<any[]>([]);
  const [itemNames, setItemNames] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    setItemNames([...new Set(items.map((item) => item.name))]);
  }, [items]);

  useEffect(() => {
    const filtered = items.filter((item) => {
      const created = new Date(item.created_at);
      return created >= startDate && created <= endDate &&
        (selectedNames.length === 0 || selectedNames.includes(item.name));
    });
    setFilteredItems(filtered);

    const counts: Record<string, number> = {};

    const dateFormat = "yyyy-MM-dd";

    filtered.forEach((item) => {
      const dateKey = format(new Date(item.created_at), dateFormat);
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });

    const startOfRange = startOfDay(startDate);
    const endOfRange = startOfDay(endDate);

    const daysInInterval = eachDayOfInterval({
      start: startOfRange,
      end: endOfRange,
    });

    const dataPoints = daysInInterval.map((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      return { date: format(day, "MMM d"), count: counts[dateKey] || 0 };
    });

    setGroupedData(dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  }, [items, startDate, endDate, selectedNames]);

  const handleDownloadPDF = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
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
      pdf.save('items-line-chart.pdf');
    }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <DateRange onDateRangeChange={handleDateRangeChange} />
        <DownloadPDF onDownload={handleDownloadPDF} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <button
          className="batch-button"
          style={{
            backgroundColor:
              selectedNames.length === 0
                ? "var(--button-color)"
                : "var(--error-color)",
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

      <div ref={chartRef} style={{ width: "100%", height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={groupedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3ecf8e"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default ItemsLineChart;
