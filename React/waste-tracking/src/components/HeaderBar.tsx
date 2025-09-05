import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import supabase from "../supabase";

const HeaderBar = () => {
  const { session, theme, setTheme } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [concurrentSessions, setConcurrentSessions] = useState(1);

  const themeRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const fetchConcurrentSessions = async () => {
      try {
        // Assuming a 'user_sessions' table with an 'is_active' column
        // This is a placeholder and might need adjustment based on actual Supabase schema
        const { count, error } = await supabase
          .from('user_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (error) {
          console.error("Error fetching concurrent sessions:", error.message);
          // Fallback to 1 if there's an error, assuming current user is 1 session
          setConcurrentSessions(1);
        } else {
          setConcurrentSessions(count || 1);
        }
      } catch (error) {
        console.error("Unexpected error fetching concurrent sessions:", error);
        setConcurrentSessions(1);
      }
    };

    fetchConcurrentSessions();

    // Optionally, refetch every now and then
    const intervalId = setInterval(fetchConcurrentSessions, 60000); // Refetch every minute
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="header-bar">
      <div className="header-left" />

      <Link className="home-link" to="/">
        Home
      </Link>

      <div className="header-section right-section">
        {/* Concurrent Sessions Button */}
        <button className="icon-button" title="Currently active sessions">
          {concurrentSessions}
        </button>

        {/* Theme menu */}
        <div className="user-menu" ref={themeRef}>
          <button className="icon-button" onClick={() => setThemeMenuOpen((prev) => !prev)}>
            🌗
          </button>
          {themeMenuOpen && (
            <div className="dropdown-menu">
              <button
                onClick={() => {setTheme("light");setThemeMenuOpen((prev)=>!prev);}}
                className={theme === "light" ? "active" : ""}
              >
                Light
              </button>
              <button
                onClick={() => {setTheme("dark");setThemeMenuOpen((prev)=>!prev);}}
                className={theme === "dark" ? "active" : ""}
              >
                Dark
              </button>
              <button
                onClick={() => {setTheme("system");setThemeMenuOpen((prev)=>!prev);}}
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
