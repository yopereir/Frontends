import { useState, useRef } from "react";
import { useSession } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";
import TotalItemsCard, { TotalItemsCardHandle } from "../components/TotalItemsCard";
import TotalBoxesCard, { TotalBoxesCardHandle } from "../components/TotalBoxesCard";
import ItemsLineChart, { ItemsLineChartHandle } from "../components/ItemsLineChart";
import ItemsTable, { ItemsTableHandle } from "../components/ItemsTable/ItemsTable";
import jsPDF from "jspdf";


const DashboardPage = () => {
  const { session } = useSession();

  const [activeTab, setActiveTab] = useState("itemsLineChart"); // Default active tab

  const tabs = [
    { id: "itemsLineChart", name: "Items Line Chart" },
    { id: "totalItems", name: "Total Items" },
    { id: "totalBoxes", name: "Total Boxes" },
    { id: "itemsTable", name: "Waste Item Log" },
  ];

  // ✅ Remove items and wasteEntries state, as ItemsTable will manage its own data
  
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

    const addContentToPdf = (imgData: string, imgWidth: number, imgHeight: number, title: string, startDate: Date, endDate: Date) => {
      // Add title for the current component
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(title, pageWidth / 2, yOffset, { align: 'center' });
      yOffset += 7; // Space after title

      // Add date range subheading
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, pageWidth / 2, yOffset, { align: 'center' });
      yOffset += 13; // Space after subheading

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
      if (ref.current && ref.current.generatePdf && ref.current.getDates) {
        const canvas = await ref.current.generatePdf();
        const { startDate, endDate } = ref.current.getDates();
        if (canvas) {
          const imgData = canvas.toDataURL('image/png');
          const imgProps = doc.getImageProperties(imgData);
          const imgWidth = pageWidth * 0.9; // 90% of PDF width
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          addContentToPdf(imgData, imgWidth, imgHeight, title, startDate, endDate);
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

        <div className="view-toggle-buttons">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`toggle-button ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>

                {activeTab === "totalItems" && (
                  <>
                    <h2>Total Items</h2>
                    <TotalItemsCard ref={totalItemsCardRef} />
                  </>
                )}
                {activeTab === "totalBoxes" && (
                  <>
                    <h2>Total Boxes</h2>
                    <TotalBoxesCard ref={totalBoxesCardRef} />
                  </>
                )}
                {activeTab === "itemsLineChart" && (
                  <>
                    <h2>Total Bags Line Chart</h2>
                    <ItemsLineChart ref={itemsLineChartRef} />
                  </>
                )}
                {activeTab === "itemsTable" && (
                  <>
                    <h2>Waste Item Log</h2>
                    <ItemsTable ref={itemsTableRef} />
                  </>
                )}
      </section>
    </main>
  );
};

export default DashboardPage;