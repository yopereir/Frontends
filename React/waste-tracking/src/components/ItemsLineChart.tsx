import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, differenceInDays, eachHourOfInterval } from "date-fns";
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
  quantity?: number;
  metadata?: { boxId?: string } | null;
}

interface DailyWasteData {
  date: string | number;
  [key: string]: string | number;
}

export interface ItemsLineChartHandle {
  generatePdf: () => Promise<HTMLCanvasElement | null>;
  getDates: () => { startDate: Date; endDate: Date; };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    let time = '';
    if (typeof label === 'number') {
      time = format(new Date(label), 'HH:mm');
    } else if (typeof label === 'string' && label.includes(':')) {
      time = label;
    }

    return (
      <div className="custom-tooltip" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '10px', border: '1px solid #ccc' }}>
        {payload.map((pld: any) => {
          const parts = pld.dataKey.split('_');
          parts.pop(); // remove unit
          const itemName = parts.join('_');
          
          const entryLabel = `${itemName}_count: ${pld.value}`;

          return (
            <p key={pld.dataKey} style={{ color: pld.stroke }}>
              {time ? `${entryLabel}, time: ${time}` : entryLabel}
            </p>
          );
        })}
      </div>
    );
  }

  return null;
};

// ✅ No longer accepts items as a prop
const ItemsLineChart = forwardRef<ItemsLineChartHandle>((_props, ref) => {
  const [items, setItems] = useState<Item[]>([]); // ✅ New state for fetched data
  const [itemNames, setItemNames] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isDonationFilterActive, setIsDonationFilterActive] = useState(false); // New state for donation filter
  const [groupedData, setGroupedData] = useState<DailyWasteData[]>([]);
  const [loading, setLoading] = useState(false); // ✅ New loading state
  const [lineConfigs, setLineConfigs] = useState<{ dataKey: string; stroke: string; yAxisId: string }[]>([]);
  const [yAxisConfigs, setYAxisConfigs] = useState<{ yAxisId: string; orientation: "left" | "right"; label: string }[]>([]);
  const [xAxisProps, setXAxisProps] = useState({ dataKey: "date" });
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
        .gte("created_at", startOfDay(startDate).toISOString())
        .lte("created_at", endOfDay(endDate).toISOString());

      if (isDonationFilterActive) {
        wasteQuery = wasteQuery.filter("metadata->>tags", 'like', '%"donation"%');
      }

      const { data: wasteData, error: wasteError } = await wasteQuery as { data: WasteEntry[] | null, error: unknown };

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

    const startOfRange = startOfDay(startDate);
    const endOfRange = endOfDay(endDate);
    const durationInDays = differenceInDays(endOfRange, startOfRange);

    let dataPoints: DailyWasteData[] = [];

    if (durationInDays === 0) {
      // Single day view: group by hour
      const hourlyQuantities: Record<string, Record<string, number>> = {};
      const dateFormat = "yyyy-MM-dd HH";

      filtered.forEach((item) => {
        const dateKey = format(new Date(item.created_at), dateFormat);
        const unit = item.metadata?.unit || "units";
        if (!hourlyQuantities[dateKey]) {
          hourlyQuantities[dateKey] = {};
        }
        const dataKey = `${item.name}_${unit}`;
        hourlyQuantities[dateKey][dataKey] = (hourlyQuantities[dateKey][dataKey] || 0) + (item.quantity || 0);
      });

      const hours = eachHourOfInterval({ start: startOfRange, end: endOfRange });
      dataPoints = hours.map(hour => {
        const dateKey = format(hour, dateFormat);
        const hourData: DailyWasteData = { date: format(hour, 'HH:00') };
        Object.entries(hourlyQuantities[dateKey] || {}).forEach(([key, value]) => {
          hourData[key] = value;
        });
        return hourData;
      });

      setXAxisProps({ dataKey: "date" });

    } else if (durationInDays < 10) {
      // Less than 10 days view: group by minute, show days on x-axis
      const minuteQuantities: Record<string, Record<string, number>> = {};
      const dateFormat = "yyyy-MM-dd HH:mm";

      filtered.forEach((item) => {
        const dateKey = format(new Date(item.created_at), dateFormat);
        const unit = item.metadata?.unit || "units";
        if (!minuteQuantities[dateKey]) {
          minuteQuantities[dateKey] = {};
        }
        const dataKey = `${item.name}_${unit}`;
        minuteQuantities[dateKey][dataKey] = (minuteQuantities[dateKey][dataKey] || 0) + (item.quantity || 0);
      });

      dataPoints = Object.entries(minuteQuantities).map(([dateKey, quantities]) => {
        const dataPoint: DailyWasteData = {
          date: new Date(dateKey).getTime(),
        };
        Object.entries(quantities).forEach(([key, value]) => {
          dataPoint[key] = value;
        });
        return dataPoint;
      });

      const days = eachDayOfInterval({ start: startOfRange, end: endOfRange });
      const dailyTicks = days.map(day => startOfDay(day).getTime());

      setXAxisProps({
        dataKey: "date",
        type: "number",
        domain: ['dataMin', 'dataMax'],
        ticks: dailyTicks,
        tickFormatter: (unixTime: number) => format(new Date(unixTime), 'MMM d'),
      } as any);

    } else {
      // Default view: 10 days or more, group by day
      const dailyQuantities: Record<string, Record<string, number>> = {};
      const dateFormat = "yyyy-MM-dd";

      filtered.forEach((item) => {
        const dateKey = format(new Date(item.created_at), dateFormat);
        const unit = item.metadata?.unit || "units";
        if (!dailyQuantities[dateKey]) {
          dailyQuantities[dateKey] = {};
        }
        const dataKey = `${item.name}_${unit}`;
        dailyQuantities[dateKey][dataKey] = (dailyQuantities[dateKey][dataKey] || 0) + (item.quantity || 0);
      });

      const days = eachDayOfInterval({ start: startOfRange, end: endOfRange });
      dataPoints = days.map((day) => {
        const dateKey = format(day, dateFormat);
        const dayData: DailyWasteData = { date: format(day, "MMM d") };
        Object.entries(dailyQuantities[dateKey] || {}).forEach(([key, value]) => {
          dayData[key] = value;
        });
        return dayData;
      });

      setXAxisProps({ dataKey: "date" });
    }

    setGroupedData(
      dataPoints.sort((a, b) => {
        if (typeof a.date === 'number' && typeof b.date === 'number') {
          return a.date - b.date;
        }
        // For string-based dates, you might need a different sorting logic if they are not naturally sortable
        return 0;
      })
    );

    // Generate line configurations and Y-axis configurations
    const colors = [
      "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe",
      "#00c49f", "#ffbb28", "#a4de6c", "#d0ed57", "#83a6ed",
    ];
    let colorIndex = 0;
    const generatedLineConfigs: { dataKey: string; stroke: string; yAxisId: string }[] = [];
    const generatedYAxisConfigs: { yAxisId: string; orientation: "left" | "right"; label: string }[] = [];
    const usedUnits = new Set<string>();

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
      const unit = parts[parts.length - 1];
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
      return canvas;
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
      let yOffset = 10;

      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Items Line Chart", pageWidth / 2, yOffset, { align: 'center' });
      yOffset += 7;

      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, pageWidth / 2, yOffset, { align: 'center' });
      yOffset += 13;

      const imgWidth = pageWidth * 0.9;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      const imgX = (pageWidth - imgWidth) / 2;

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
              <XAxis {...xAxisProps} />
              {yAxisConfigs.map((config) => (
                <YAxis
                  key={config.yAxisId}
                  yAxisId={config.yAxisId}
                  orientation={config.orientation}
                  label={{
                    value: config.label,
                    angle: -90,
                    position: config.orientation === "left" ? 'outerLeft' : 'outerRight',
                    dx: config.orientation === "right" ? 5 : -5,
                    dy: 0,
                  }}
                  allowDecimals={false}
                />
              ))}
              <Tooltip content={<CustomTooltip />} />
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
