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
import ItemSelectMultiple from "./widgets/itemselectmultiple";
import supabase from "../supabase";

interface Item {
  id: number;
  name: string;
  created_at: string;
  restaurant_id: number;
}

// ✅ No longer accepts items as a prop
const ItemsLineChart = () => {
  const [items, setItems] = useState<Item[]>([]); // ✅ New state for fetched data
  const [itemNames, setItemNames] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [groupedData, setGroupedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // ✅ New loading state
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  // ✅ The main data fetching useEffect
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);

      // Fetch waste entries for the given date range
      const { data: wasteData, error: wasteError } = await supabase
        .from("waste_entries")
        .select("id, created_at, item_id")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (!wasteError && wasteData) {
        // Fetch only the items associated with the waste entries
        const uniqueItemIds = [
          ...new Set(wasteData.map((we) => we.item_id).filter(Boolean)),
        ];

        const { data: itemData, error: itemError } = await supabase
          .from("items")
          .select("id, name, restaurant_id")
          .in("id", uniqueItemIds);

        if (!itemError && itemData) {
          const fetchedItems = wasteData.map((wasteEntry) => {
            const relatedItem = itemData.find(
              (item) => item.id === wasteEntry.item_id
            );
            return {
              id: relatedItem?.id || wasteEntry.item_id,
              name: relatedItem?.name || "Unknown Item",
              created_at: wasteEntry.created_at,
              restaurant_id: relatedItem?.restaurant_id,
            };
          });
          setItems(fetchedItems);
        } else {
          console.warn("Supabase item fetch failed:", itemError);
          setItems([]);
        }
      } else {
        console.warn("Supabase waste entry fetch failed:", wasteError);
        setItems([]);
      }
      setLoading(false);
    };

    fetchItems();
  }, [startDate, endDate]); // Re-run fetch when dates change

  // ✅ The existing useEffect, now a useMemo, which processes the local `items` state
  useEffect(() => {
    const allNames = [...new Set(items.map((item) => item.name))];
    setItemNames(allNames);

    const filtered = items.filter((item) =>
      selectedNames.length === 0 || selectedNames.includes(item.name)
    );

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

    setGroupedData(
      dataPoints.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    );
  }, [items, selectedNames, startDate, endDate]);

  const handleDownloadPDF = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
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
      pdf.save("items-line-chart.pdf");
    }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <DateRange onDateRangeChange={handleDateRangeChange} />
        <DownloadPDF onDownload={handleDownloadPDF} />
      </div>

      <ItemSelectMultiple
        itemNames={itemNames}
        selectedNames={selectedNames}
        onSelectionChange={setSelectedNames}
      />

      <div ref={chartRef} style={{ width: "100%", height: "300px" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#888" }}>Loading...</p>
        ) : (
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
        )}
      </div>
    </>
  );
};

export default ItemsLineChart;
