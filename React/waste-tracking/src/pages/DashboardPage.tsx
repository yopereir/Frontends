import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";
import ItemsLineChart from "../components/ItemsLineChart";
import ItemsTable from "../components/ItemsTable/ItemsTable";
import supabase from "../supabase";
import { subDays } from "date-fns";

const DashboardPage = () => {
  const { session } = useSession();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("items")
        .select("id, created_at, name, restaurant_id");

      if (!error && data && data.length > 0) {
        setItems(data);
      } else {
        console.warn("Supabase fetch failed, using fallback data:", error);

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
      <Link className="home-link" to="/">◄ Home</Link>
      <section className="main-container" style={{ flexDirection: "column", gap: "2rem" }}>
        <h1 className="header-text">Items Dashboard</h1>
        <p>Current User: {session?.user.email || "None"}</p>
        <ItemsLineChart items={items} />
        <ItemsTable items={items} />
      </section>
    </main>
  );
};

export default DashboardPage;
