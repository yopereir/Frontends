import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import supabase from "../supabase";

const HeaderBar = () => {
  const { session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("system");

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === "dark" ? "light" : prev === "light" ? "system" : "dark"
    );
  };

  useEffect(() => {
    const root = document.documentElement;
    if (
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <header className="header-bar">
      {/* Left: User menu */}

      {/* Right: Theme toggle */}
      <div className="header-section">
        <button className="icon-button" onClick={toggleTheme}>
          🌗
        </button>
      </div>
      {/* Center: User name or placeholder */}
      <div className="header-section center-section">
        {session?.user?.email || "Guest"}
      </div>
      <div
        className="user-menu header-section"
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <button className="icon-button">👤</button>
        {menuOpen && (
          <div className="dropdown-menu">
            {session ? (
              <>
                <Link to="/settings">Settings</Link>
                <button onClick={() => supabase.auth.signOut()}>Log Out</button>
              </>
            ) : (
              <Link to="/auth/sign-in">Login</Link>
            )}
          </div>
        )}
      </div>

    </header>
  );
};

export default HeaderBar;
