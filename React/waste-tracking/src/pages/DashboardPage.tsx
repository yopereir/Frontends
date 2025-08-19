import { useEffect, useState } from "react";
import { useSession } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";
import TotalItemsCard from "../components/TotalItemsCard";
import TotalBoxesCard from "../components/TotalBoxesCard"; // ✅ new import
import ItemsLineChart from "../components/ItemsLineChart";
import ItemsTable from "../components/ItemsTable/ItemsTable";
import supabase from "../supabase";
import { subDays } from "date-fns";

const DashboardPage = () => {
  const { session } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [boxes, setBoxes] = useState<any[]>([]); // ✅ new state for boxes
  const [loading, setLoading] = useState(true);
  let loadingText = "Loading items & boxes...";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      loadingText = "Loading items & boxes...";

      // ✅ Fetch waste entries + items
      const { data: wasteData, error: wasteError } = await supabase
        .from("waste_entries")
        .select("*");

      // ✅ Fetch boxes
      const { data: boxData, error: boxError } = await supabase
        .from("boxes")
        .select("*");

      if (!wasteError && wasteData && wasteData.length > 0) {
        const fetchedItems = async () => {
          const updatedItems = await Promise.all(
            wasteData.map(async (wasteEntry) => {
              const { data: itemData } = await supabase
                .from("items")
                .select("name, restaurant_id")
                .eq("id", wasteEntry.item_id)
                .single();

              return {
                id: wasteEntry.id,
                name: itemData?.name || "Unknown Item",
                created_at: wasteEntry.created_at,
                quantity: wasteEntry.quantity,
                restaurant_id: itemData?.restaurant_id,
                metadata: wasteEntry.metadata || {},
              };
            })
          );
          setItems(updatedItems);
        };
        await fetchedItems();
      } else {
        console.warn("Supabase fetch failed for items:", wasteError);
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

      if (!boxError && boxData) {
        setBoxes(boxData);
      } else {
        console.warn("Supabase fetch failed for boxes:", boxError);
        // ✅ simple fallback boxes
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
            <TotalItemsCard items={items} />

            <h2>Total Boxes</h2>
            <TotalBoxesCard boxes={boxes} />

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
