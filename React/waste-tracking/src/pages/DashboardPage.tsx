import { useEffect, useState, useRef } from "react";
import { useSession } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";
import TotalItemsCard, { TotalItemsCardHandle } from "../components/TotalItemsCard";
import TotalBoxesCard, { TotalBoxesCardHandle } from "../components/TotalBoxesCard";
import ItemsLineChart, { ItemsLineChartHandle } from "../components/ItemsLineChart";
import ItemsTable, { ItemsTableHandle } from "../components/ItemsTable/ItemsTable";
import supabase from "../supabase";
import { subDays } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const DashboardPage = () => {
  const { session } = useSession();

  // ✅ Remove items and wasteEntries state, as ItemsTable will manage its own data
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const totalItemsCardRef = useRef<TotalItemsCardHandle>(null);
  const totalBoxesCardRef = useRef<TotalBoxesCardHandle>(null);
  const itemsLineChartRef = useRef<ItemsLineChartHandle>(null);
  const itemsTableRef = useRef<ItemsTableHandle>(null);

  const handleDownloadReport = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    let yOffset = 10; // Initial Y offset for content
    const margin = 10; // Margin from the edge of the PDF
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const addContentToPdf = (imgData: string, imgWidth: number, imgHeight: number, title: string) => {
      // Add title for the current component
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(title, pageWidth / 2, yOffset, { align: 'center' });
      yOffset += 10; // Space after title

      const availableHeight = pageHeight - yOffset - margin;

      if (imgHeight > availableHeight) {
        // Image is too tall for the remaining space, add a new page
        doc.addPage();
        yOffset = margin; // Reset yOffset for new page
      }

      const imgX = (pageWidth - imgWidth) / 2; // Center the image
      doc.addImage(imgData, 'PNG', imgX, yOffset, imgWidth, imgHeight);
      yOffset += imgHeight + 20; // Space after image
    };

    // Helper to get canvas and add to PDF
    const processComponent = async (ref: any, title: string) => {
      if (ref.current && ref.current.generatePdf) {
        const canvas = await ref.current.generatePdf();
        if (canvas) {
          const imgData = canvas.toDataURL('image/png');
          const imgProps = doc.getImageProperties(imgData);
          const imgWidth = pageWidth * 0.9; // 90% of PDF width
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          addContentToPdf(imgData, imgWidth, imgHeight, title);
        }
      }
    };

    // Add a main title for the entire report
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text('Waste Tracking Report', pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 20;

    // Process each component
    await processComponent(totalItemsCardRef, "Total Items Summary");
    await processComponent(totalBoxesCardRef, "Total Boxes Summary");
    await processComponent(itemsLineChartRef, "Items Line Chart");
    await processComponent(itemsTableRef, "Waste Item Log");

    doc.save("Waste_Tracking_Report.pdf");
  };

  let loadingText = "Loading items & boxes...";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      loadingText = "Loading items & boxes...";

      // ✅ Fetch only boxes here
      const { data: boxData, error: boxError } = await supabase
        .from("boxes")
        .select("*");

      if (!boxError && boxData) {
        setBoxes(boxData);
      } else {
        console.warn("Supabase fetch failed for boxes:", boxError);
        const fallbackBoxes = [
          {
            id: "box1",
            name: "Freezer Box",
            created_at: subDays(new Date(), 20).toISOString(),
            user_id: "test-user",
          },
          {
            id: "box2",
            name: "Pantry Box",
            created_at: subDays(new Date(), 5).toISOString(),
            user_id: "test-user",
          },
          {
            id: "box3",
            name: "Cooler Box",
            created_at: new Date().toISOString(),
            user_id: "test-user",
          },
        ];
        setBoxes(fallbackBoxes);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <main>
      <HeaderBar />
      <section
        className="main-container"
        style={{ flexDirection: "column", gap: "2rem" }}
      >
        <h1 className="header-text">Items Dashboard</h1>
        <p>Current User: {session?.user.email || "None"}</p>
        <button onClick={handleDownloadReport} className="batch-button" style={{ marginBottom: "1rem" }}>
          Download Report
        </button>
        {loading ? (
          <p style={{ color: "var(--error-color)", marginTop: "0.25rem" }}>
            {loadingText}
          </p>
        ) : (
          <>            
            <h2>Total Items</h2>
            <TotalItemsCard ref={totalItemsCardRef} />

            <h2>Total Boxes</h2>
            <TotalBoxesCard ref={totalBoxesCardRef} />

            <h2>Total Bags Line Chart</h2>
            <ItemsLineChart ref={itemsLineChartRef} />

            <h2>Waste Item Log</h2>
            <ItemsTable ref={itemsTableRef} />
          </>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
