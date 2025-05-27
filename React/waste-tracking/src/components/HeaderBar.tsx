import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import supabase from "../supabase";

const HeaderBar = () => {
  const { session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

  const applyTheme = (themeValue: string) => {
    localStorage.setItem("theme", themeValue);
    setTheme(themeValue);
  };

  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <header className="header-bar">
      {/* Center: User name or placeholder */}
      <div className="header-section center-section">
        {session?.user?.email || "Guest"}
      </div>
      {/* Left: Theme toggle */}
      <div
        className="header-section user-menu"
        onMouseEnter={() => setThemeMenuOpen(true)}
        onMouseLeave={() => setThemeMenuOpen(false)}
      >
        <button className="icon-button">🌗</button>
        {themeMenuOpen && (
          <div className="dropdown-menu">
            <button onClick={() => applyTheme("light")}>Light</button>
            <button onClick={() => applyTheme("dark")}>Dark</button>
            <button onClick={() => applyTheme("system")}>System</button>
          </div>
        )}
      </div>
      {/* Right: User menu */}
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
