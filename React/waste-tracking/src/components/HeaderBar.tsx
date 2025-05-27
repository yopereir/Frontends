import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import supabase from "../supabase";

const HeaderBar = () => {
  const { session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

  const themeRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const applyTheme = (themeValue: string) => {
    localStorage.setItem("theme", themeValue);
    setTheme(themeValue);
    setThemeMenuOpen(false);
  };

  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", isDark);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        themeRef.current &&
        !themeRef.current.contains(event.target as Node)
      ) {
        setThemeMenuOpen(false);
      }

      if (
        userRef.current &&
        !userRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header-bar">
      <div className="header-left" />

      <div className="header-section center-section">
        {session?.user?.email || "Guest"}
      </div>

      <div className="header-section right-section">
        {/* Theme menu */}
        <div className="user-menu" ref={themeRef}>
          <button className="icon-button" onClick={() => setThemeMenuOpen((prev) => !prev)}>
            🌗
          </button>
          {themeMenuOpen && (
            <div className="dropdown-menu">
              <button
                onClick={() => applyTheme("light")}
                className={theme === "light" ? "active" : ""}
              >
                Light
              </button>
              <button
                onClick={() => applyTheme("dark")}
                className={theme === "dark" ? "active" : ""}
              >
                Dark
              </button>
              <button
                onClick={() => applyTheme("system")}
                className={theme === "system" ? "active" : ""}
              >
                System
              </button>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="user-menu" ref={userRef}>
          <button className="icon-button" onClick={() => setMenuOpen((prev) => !prev)}>
            👤
          </button>
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
      </div>
    </header>
  );
};

export default HeaderBar;
