import { Link } from "react-router-dom";
import supabase from "../supabase";
import { useSession } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";

const HomePage = () => {
  const { session } = useSession();

  return (
    <div className="home-page">
      <HeaderBar />
      <main className="main-container">
        <h1 className="header-text">Waste Tracking</h1>
        <p>Current User : {session?.user.email || "None"}</p>
        {session ? (
          <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/settings">Settings</Link>
          <div id="divider"></div>
          <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
          </>
        ) : (
          <Link to="/auth/sign-in">Sign In</Link>
        )}
      </main>
    </div>
  );
};

export default HomePage;
