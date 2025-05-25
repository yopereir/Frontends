import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import supabase from "../supabase";
import { useSession } from "../context/SessionContext";
import HeaderBar from "../components/HeaderBar";

const HomePage = () => {
  const { session } = useSession();
  const [theme, setTheme] = useState("system");

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

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === "dark" ? "light" : prev === "light" ? "system" : "dark"
    );
  };

  return (
    <main>
      <HeaderBar toggleTheme={toggleTheme} />
      <section className="main-container">
        <h1 className="header-text">React Supabase Auth Template</h1>
        <p>Current User : {session?.user.email || "None"}</p>
        {session ? (
          <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
        ) : (
          <Link to="/auth/sign-in">Sign In</Link>
        )}
        <Link to="/protected">Protected Page 🛡️</Link>
        <div id="divider"></div>
        <Link
          to="https://github.com/mmvergara/react-supabase-auth-template"
          target="_blank"
          rel="noreferrer noopener"
          id="github-repo-link"
        >
          Star us on Github 🌟
        </Link>
      </section>
    </main>
  );
};

export default HomePage;
