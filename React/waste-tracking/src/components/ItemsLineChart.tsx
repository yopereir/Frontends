import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
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
import TagFilters from "./widgets/tagfilters";
import supabase from "../supabase";

interface Item {
  id: number;
  name: string;
  created_at: string;
  restaurant_id: number;
  metadata?: { unit?: string }; // Add metadata to Item interface
  quantity?: number; // Add quantity to Item interface
}

interface WasteEntry {
  id: string;
  created_at: string;
  item_id: string | null;
  quantity?: number; // Add quantity to WasteEntry interface
  metadata?: { boxId?: string } | null; // Add metadata to WasteEntry interface
}

export interface ItemsLineChartHandle {
  generatePdf: () => Promise<HTMLCanvasElement | null>;
  getDates: () => { startDate: Date; endDate: Date; };
}

// ✅ No longer accepts items as a prop
const ItemsLineChart = forwardRef<ItemsLineChartHandle>((_props, ref) => {
  const [items, setItems] = useState<Item[]>([]); // ✅ New state for fetched data
  const [itemNames, setItemNames] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isDonationFilterActive, setIsDonationFilterActive] = useState(false); // New state for donation filter
  const [groupedData, setGroupedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // ✅ New loading state
  const [lineConfigs, setLineConfigs] = useState<{ dataKey: string; stroke: string; yAxisId: string }[]>([]);
  const [yAxisConfigs, setYAxisConfigs] = useState<{ yAxisId: string; orientation: "left" | "right"; label: string }[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleDonationFilterChange = (isChecked: boolean) => {
    setIsDonationFilterActive(isChecked);
  };

  // ✅ The main data fetching useEffect
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);

      // Fetch waste entries for the given date range
      let wasteQuery = supabase
        .from("waste_entries")
        .select("id, created_at, item_id, quantity, metadata") // Select quantity and metadata
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (isDonationFilterActive) {
        wasteQuery = wasteQuery.filter("metadata->>tags", 'like', '%"donation"%');
      }

      const { data: wasteData, error: wasteError } = await wasteQuery;

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
  }, [startDate, endDate, isDonationFilterActive]); // Re-run fetch when dates or donation filter changes

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
    const generatedYAxisConfigs: { yAxisId: string; orientation: "left" | "right"; label: string }[] = [];
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
          orientation: (usedUnits.size % 2 === 0 ? "left" : "right"),
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

  const generatePdf = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current, { scale: 2 });
      return canvas; // Return the canvas object
    }
    return null;
  };

  useImperativeHandle(ref, () => ({
    generatePdf: generatePdf,
    getDates: () => ({ startDate, endDate }),
  }));

  const handleIndividualDownload = async () => {
    const canvas = await generatePdf();
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yOffset = 10; // Initial Y offset for content

      // Add title for the component
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Items Line Chart", pageWidth / 2, yOffset, { align: 'center' });
      yOffset += 7; // Space after title

      // Add date range subheading
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, pageWidth / 2, yOffset, { align: 'center' });
      yOffset += 13; // Space after subheading

      const imgWidth = pageWidth * 0.9; // 90% of PDF width
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      const imgX = (pageWidth - imgWidth) / 2; // Center the image

      pdf.addImage(imgData, 'PNG', imgX, yOffset, imgWidth, imgHeight);
      pdf.save("Items_Line_Chart.pdf");
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
          <DateRange onDateRangeChange={handleDateRangeChange} />
          <TagFilters onDonationFilterChange={handleDonationFilterChange} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <DownloadPDF onDownload={handleIndividualDownload} className="batch-button" />
        </div>
        <ItemSelectMultiple
          itemNames={itemNames}
          selectedNames={selectedNames}
          onSelectionChange={setSelectedNames}
        />
      </div>

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
                  label={{
                    value: config.label,
                    angle: -90,
                    position: config.orientation === "left" ? 'outerLeft' : 'outerRight',
                    dx: config.orientation === "right" ? 5 : -5, // Increased horizontal adjustment
                    dy: 0, // Keep vertical position at 0, let position handle it
                  }}
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
                  connectNulls={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
});

export default ItemsLineChart;
