import { useEffect, useState } from "react";
import { useSession } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";
import TotalItemsCard from "../components/TotalItemsCard";
import ItemsLineChart from "../components/ItemsLineChart";
import ItemsTable from "../components/ItemsTable/ItemsTable";
import supabase from "../supabase";
import { subDays } from "date-fns";

const DashboardPage = () => {
  const { session } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  let loadingText = "Loading items...";

  useEffect(() => {
    const fetchItems = async () => {
      loadingText = "Loading items...";
      setLoading(true);
      const { data, error } = await supabase.from("waste_entries").select("*");

      if (!error && data && data.length > 0) {
        setLoading(false);
        const fetchedItems = async () => {
          const updatedItems = await Promise.all(
            data.map(async (wasteEntry) => {
              const { data:itemData } = await supabase.from("items").select("name, restaurant_id").eq("id",wasteEntry.item_id).single();
              return ({
                id: wasteEntry.id,
                name: itemData?.name || "Unknown Item",
                created_at: wasteEntry.created_at,
                quantity: wasteEntry.quantity,
                restaurant_id: itemData?.restaurant_id,
                metadata: wasteEntry.metadata || {},
              })
            })
          )
          setItems(updatedItems)
        }
        await fetchedItems();
      } else {
        loadingText = error?.message || "Failed to load items";
        console.warn("Supabase fetch failed, using fallback data:", error);
        setLoading(false); // TODO: REMOVE THIS LINE FOR PRODUCTION

        const fallbackItems = [
          {
            id: 1,
            name: "Chicken Sandwich",
            created_at: subDays(new Date(), 35).toISOString(),
            restaurant_id: 1,
          },
          {
            id: 2,
            name: "Waffle Fries",
            created_at: subDays(new Date(), 1).toISOString(),
            restaurant_id: 1,
          },
          {
            id: 3,
            name: "Chicken Sandwich",
            created_at: subDays(new Date(), 1).toISOString(),
            restaurant_id: 1,
          },
          {
            id: 4,
            name: "Lemonade",
            created_at: new Date().toISOString(),
            restaurant_id: 1,
          },
          {
            id: 5,
            name: "Lemonade",
            created_at: subDays(new Date(), 70).toISOString(),
            restaurant_id: 1,
          },
        ];
        setItems(fallbackItems);
      }
    };

    fetchItems();
  }, []);

  return (
    <main>
      <HeaderBar />
      <section className="main-container" style={{ flexDirection: "column", gap: "2rem" }}>
        <h1 className="header-text">Items Dashboard</h1>
        <p>Current User: {session?.user.email || "None"}</p>
        { loading ? (
          <p style={{ color: "var(--error-color)", marginTop: "0.25rem" }}>{loadingText}</p>
        ) : (
          <>
            <h2>Total Items</h2>
            <TotalItemsCard items={items} />
            <h2>Total Bags Line Chart</h2>
            <ItemsLineChart items={items} />
            <h2>Waste Item Log</h2>
            <ItemsTable items={items} />
          </>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
