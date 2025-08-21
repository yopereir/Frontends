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
  metadata?: { unit?: string }; // Add metadata to Item interface
}

interface WasteEntry {
  id: string;
  created_at: string;
  item_id: string | null;
  quantity?: number; // Add quantity to WasteEntry interface
  metadata?: { boxId?: string } | null; // Add metadata to WasteEntry interface
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
  const [lineConfigs, setLineConfigs] = useState<{ dataKey: string; stroke: string; yAxisId: string }[]>([]);
  const [yAxisConfigs, setYAxisConfigs] = useState<{ yAxisId: string; orientation: string; label: string }[]>([]);
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
        .select("id, created_at, item_id, quantity, metadata") // Select quantity and metadata
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (!wasteError && wasteData) {
        // Fetch only the items associated with the waste entries
        const uniqueItemIds = [
          ...new Set(wasteData.map((we) => we.item_id).filter(Boolean)),
        ];

        const { data: itemData, error: itemError } = await supabase
          .from("items")
          .select("id, name, restaurant_id, metadata") // Select metadata from items
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
              metadata: relatedItem?.metadata, // Include item metadata
              quantity: wasteEntry.quantity, // Include waste entry quantity
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

    const dailyQuantities: Record<string, Record<string, number>> = {};
    const uniqueUnits = new Set<string>();
    const dateFormat = "yyyy-MM-dd";

    filtered.forEach((item) => {
      const dateKey = format(new Date(item.created_at), dateFormat);
      const unit = item.metadata?.unit || "units";
      uniqueUnits.add(unit);

      if (!dailyQuantities[dateKey]) {
        dailyQuantities[dateKey] = {};
      }
      const dataKey = `${item.name}_${unit}`;
      dailyQuantities[dateKey][dataKey] = (dailyQuantities[dateKey][dataKey] || 0) + (item.quantity || 0);
    });

    const startOfRange = startOfDay(startDate);
    const endOfRange = startOfDay(endDate);

    const daysInInterval = eachDayOfInterval({
      start: startOfRange,
      end: endOfRange,
    });

    const dataPoints = daysInInterval.map((day) => {
      const dateKey = format(day, dateFormat);
      const dayData: { date: string; [key: string]: any } = { date: format(day, "MMM d") };
      Object.entries(dailyQuantities[dateKey] || {}).forEach(([key, value]) => {
        dayData[key] = value;
      });
      return dayData;
    });

    setGroupedData(
      dataPoints.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    );

    // Generate line configurations and Y-axis configurations
    const colors = [
      "#8884d8",
      "#82ca9d",
      "#ffc658",
      "#ff7300",
      "#0088fe",
      "#00c49f",
      "#ffbb28",
      "#a4de6c",
      "#d0ed57",
      "#83a6ed",
    ]; // Example colors
    let colorIndex = 0;
    const generatedLineConfigs: { dataKey: string; stroke: string; yAxisId: string }[] = [];
    const generatedYAxisConfigs: { yAxisId: string; orientation: string; label: string }[] = [];
    const usedUnits = new Set<string>();

    // Collect all unique dataKeys (item_name_unit) from the processed data
    const allDataKeys = new Set<string>();
    dataPoints.forEach(dp => {
      Object.keys(dp).forEach(key => {
        if (key !== 'date') {
          allDataKeys.add(key);
        }
      });
    });

    Array.from(allDataKeys).sort().forEach(dataKey => {
      const parts = dataKey.split('_');
      const unit = parts[parts.length - 1]; // Last part is the unit
      const yAxisId = `yAxis_${unit}`;

      if (!usedUnits.has(unit)) {
        generatedYAxisConfigs.push({
          yAxisId: yAxisId,
          orientation: usedUnits.size % 2 === 0 ? "left" : "right",
          label: unit,
        });
        usedUnits.add(unit);
      }

      generatedLineConfigs.push({
        dataKey: dataKey,
        stroke: colors[colorIndex % colors.length],
        yAxisId: yAxisId,
      });
      colorIndex++;
    });

    setLineConfigs(generatedLineConfigs);
    setYAxisConfigs(generatedYAxisConfigs);

  }, [items, selectedNames, startDate, endDate]);

  const handleDownloadPDF = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current, { scale: 2 });
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
      pdf.text('Items Line Chart', imgX, position); // x, y coordinates, centered
      position += 10; // Adjust position for the next line

      // Add subheading for date range and filtered items
      pdf.setFontSize(12);
      const formattedStartDate = startDate.toLocaleDateString();
      const formattedEndDate = endDate.toLocaleDateString();
      const dateRangeText = `Date Range: ${formattedStartDate} - ${formattedEndDate}`;
      pdf.text(dateRangeText, imgX, position);
      position += 7; // Adjust position for the next line

      const itemsFilteredText = selectedNames.length > 0 
        ? `Filtered Items: ${selectedNames.join(', ')}`
        : 'All Items';
      pdf.text(itemsFilteredText, imgX, position);
      position += 10; // Adjust position for the chart image

      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth, imgHeight);
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
              {yAxisConfigs.map((config) => (
                <YAxis
                  key={config.yAxisId}
                  yAxisId={config.yAxisId}
                  orientation={config.orientation}
                  label={{ value: config.label, angle: -90, position: 'insideLeft' }}
                  allowDecimals={false}
                />
              ))}
              <Tooltip />
              <Legend />
              {lineConfigs.map((config) => (
                <Line
                  key={config.dataKey}
                  type="monotone"
                  dataKey={config.dataKey}
                  stroke={config.stroke}
                  yAxisId={config.yAxisId}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
};

export default ItemsLineChart;
