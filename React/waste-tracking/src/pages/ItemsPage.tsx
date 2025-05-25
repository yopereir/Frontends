import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";

const ItemsPage = () => {
  const { session } = useSession();
  return (
    <main>
      <HeaderBar />
      <Link className="home-link" to="/">
        ◄ Home
      </Link>
      <section className="main-container">
        <h1 className="header-text">This is a Items Page</h1>
        <p>Current User : {session?.user.email || "None"}</p>
      </section>
    </main>
  );
};

export default ItemsPage;
