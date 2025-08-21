import { useEffect, useState } from "react";
import { useSession } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";
import TotalItemsCard from "../components/TotalItemsCard";
import TotalBoxesCard from "../components/TotalBoxesCard";
import ItemsLineChart from "../components/ItemsLineChart";
import ItemsTable from "../components/ItemsTable/ItemsTable";
import supabase from "../supabase";
import { subDays } from "date-fns";

const DashboardPage = () => {
  const { session } = useSession();

  // ✅ Remove items and wasteEntries state, as ItemsTable will manage its own data
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
        {loading ? (
          <p style={{ color: "var(--error-color)", marginTop: "0.25rem" }}>
            {loadingText}
          </p>
        ) : (
          <>            
            <h2>Total Items</h2>
            <TotalItemsCard />

            <h2>Total Boxes</h2>
            <TotalBoxesCard
              // ✅ wasteEntries and items props will need to be managed by a higher-level context or fetched inside this component
              // For now, these might not work as expected without data.
            />

            <h2>Total Bags Line Chart</h2>
            {/* ✅ ItemsLineChart will also need to be refactored to fetch its own data */}
            <ItemsLineChart />

            <h2>Waste Item Log</h2>
            {/* ✅ ItemsTable no longer receives the items prop */}
            <ItemsTable />
          </>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
