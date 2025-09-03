import { useState, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { format, subDays } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./ItemsTable.css";
import ItemSelectMultiple from "../widgets/itemselectmultiple";
import DateRange from "../widgets/daterange";
import DownloadPDF from "../widgets/downloadpdf";
import TagFilters from "../widgets/tagfilters";
import supabase from "../../supabase"; // ✅ Import supabase
import EditWasteEntryDialog from "../EditWasteEntryDialog";

interface Item {
  id: number;
  name: string;
  created_at: string;
  restaurant_id: number;
  quantity?: number;
  metadata?: any;
  waste_entry_id: string;
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

export interface ItemsTableHandle {
  generatePdf: () => Promise<HTMLCanvasElement | null>;
  getDates: () => { startDate: Date; endDate: Date; };
}

const ItemsTable = forwardRef<ItemsTableHandle>((_props, ref) => {
  const [sortAsc, setSortAsc] = useState(true);
  const [sortKey, setSortKey] = useState<"created_at" | "name">("created_at");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [items, setItems] = useState<Item[]>([]);
  const [isDonationFilterActive, setIsDonationFilterActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEditingWasteEntry, setCurrentEditingWasteEntry] = useState<Item | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);

      let wasteQuery = supabase
        .from("waste_entries")
        .select("id, created_at, quantity, item_id, metadata")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (isDonationFilterActive) {
        wasteQuery = wasteQuery.filter("metadata->>tags", 'like', '%"donation"%');
      }

      const { data: wasteData, error: wasteError } = await wasteQuery;

      if (!wasteError && wasteData) {
        const fetchedItems = await Promise.all(
          wasteData.map(async (wasteEntry) => {
            const { data: itemData } = await supabase
              .from("items")
              .select("id, name, restaurant_id")
              .eq("id", wasteEntry.item_id)
              .single();

            return {
              id: itemData?.id || wasteEntry.item_id,
              name: itemData?.name || "Unknown Item",
              created_at: wasteEntry.created_at,
              quantity: wasteEntry.quantity,
              restaurant_id: itemData?.restaurant_id,
              metadata: {
                ...wasteEntry.metadata,
                boxId: wasteEntry.metadata?.boxId,
              },
              waste_entry_id: wasteEntry.id,
            };
          })
        );
        setItems(fetchedItems);
      } else {
        console.warn("Supabase fetch failed for waste_entries:", wasteError);
        setItems([]);
      }
      setLoading(false);
    };

    fetchItems();
  }, [startDate, endDate, isDonationFilterActive]);

  const filteredAndSortedItems = useMemo(() => {
    const filteredByName =
      selectedNames.length === 0
        ? items
        : items.filter((item) => selectedNames.includes(item.name));

    return [...filteredByName].sort((a, b) => {
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
  }, [items, selectedNames, sortKey, sortAsc]);

  const itemNames = useMemo(
    () => [...new Set(items.map((item) => item.name))],
    [items]
  );

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

  const handleDonationFilterChange = (isChecked: boolean) => {
    setIsDonationFilterActive(isChecked);
  };

  const generatePdf = async () => {
    if (tableRef.current) {
      if (tableRef.current) {
        tableRef.current.querySelectorAll('h2, th, td').forEach((el) => {
          (el as HTMLElement).style.color = '#000';
        });
      }

      const canvas = await html2canvas(tableRef.current, { scale: 2 });

      if (tableRef.current) {
        tableRef.current.querySelectorAll('h2, th, td').forEach((el) => {
          (el as HTMLElement).style.color = '';
        });
      }
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
      let yOffset = 10; // Initial Y offset for content

      // Add title for the component
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Waste Item Log", pageWidth / 2, yOffset, { align: 'center' });
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
      pdf.save("Waste_Item_Log.pdf");
    }
  };

  const handleUpdateWasteEntry = async (wasteEntryId: string, newCreatedAt: string, newQuantity: number) => {
    setLoading(true);
    const { error } = await supabase
      .from('waste_entries')
      .update({ created_at: newCreatedAt, quantity: newQuantity })
      .eq('id', wasteEntryId);

    if (error) {
      console.error('Error updating waste entry:', error);
    } else {
      // Refresh items after update
      const fetchItems = async () => {
        let wasteQuery = supabase
          .from("waste_entries")
          .select("id, created_at, quantity, item_id, metadata")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
  
        if (isDonationFilterActive) {
          wasteQuery = wasteQuery.filter("metadata->>tags", 'like', '%"donation"%');
        }
  
        const { data: wasteData, error: wasteError } = await wasteQuery;
  
        if (!wasteError && wasteData) {
          const fetchedItems = await Promise.all(
            wasteData.map(async (wasteEntry) => {
              const { data: itemData } = await supabase
                .from("items")
                .select("id, name, restaurant_id")
                .eq("id", wasteEntry.item_id)
                .single();
  
              return {
                id: itemData?.id || wasteEntry.item_id,
                name: itemData?.name || "Unknown Item",
                created_at: wasteEntry.created_at,
                quantity: wasteEntry.quantity,
                restaurant_id: itemData?.restaurant_id,
                metadata: {
                  ...wasteEntry.metadata,
                  boxId: wasteEntry.metadata?.boxId,
                },
                waste_entry_id: wasteEntry.id,
              };
            })
          );
          setItems(fetchedItems);
        } else {
          console.warn("Supabase fetch failed for waste_entries:", wasteError);
          setItems([]);
        }
        setLoading(false);
      };
      fetchItems();
    }
    setLoading(false);
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <EditWasteEntryDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleUpdateWasteEntry}
        wasteEntry={currentEditingWasteEntry}
      />
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

      <div className="items-table-container" ref={tableRef}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#888" }}>Loading...</p>
        ) : (
          <table className="items-table">
            <thead>
              <tr><th className="edit-column"></th><th>Name{" "}<button onClick={() => toggleSort("name")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    {sortKey === "name" ? (sortAsc ? "▲" : "▼") : "↕"}
                  </button></th><th>Created At{" "}<button onClick={() => toggleSort("created_at")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    {sortKey === "created_at" ? (sortAsc ? "▲" : "▼") : "↕"}
                  </button></th><th>Quantity</th></tr>
            </thead>
            <tbody>
              {filteredAndSortedItems.map((item) => (
                <tr key={item.waste_entry_id}><td className="edit-column"><button
                      onClick={() => {
                        setCurrentEditingWasteEntry(item);
                        setIsEditDialogOpen(true);
                      }}
                      className="batch-button edit-button"
                    >
                      Edit
                    </button></td><td>{item.name}</td><td>{format(new Date(item.created_at), "yyyy-MM-dd HH:mm")}</td><td>
                    {item.quantity
                      ? formatQuantity(item.quantity, item.metadata?.unit ?? "")
                      : "N/A"}
                  </td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
});

export default ItemsTable;