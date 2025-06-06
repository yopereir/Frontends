import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";
import ItemsLineChart from "../components/ItemsLineChart";

const DashboardPage = () => {
  const { session } = useSession();

  return (
    <main>
      <HeaderBar />
      <Link className="home-link" to="/">◄ Home</Link>
      <section className="main-container" style={{ flexDirection: "column", gap: "2rem" }}>
        <h1 className="header-text">Items Dashboard</h1>
        <p>Current User: {session?.user.email || "None"}</p>
        <ItemsLineChart />
      </section>
    </main>
  );
};

export default DashboardPage;
