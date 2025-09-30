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

  return (
    <main>
      <HeaderBar />
      <section
        className="main-container"
        style={{ flexDirection: "column", gap: "2rem" }}
      >
        <h1 className="header-text">Items Dashboard</h1>
        <p>Current User: {session?.user.email || "None"}</p>

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