import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import supabase from "../supabase";
import LoadingPage from "../pages/LoadingPage";
import { Session } from "@supabase/supabase-js";

// === Types ===
export type Theme = "light" | "dark" | "system";

export interface BatchData {
  id: string;
  itemId: string;
  itemName: string;
  imageUrl: string;
  startTime: Date;
  holdMinutes: number;
  unit: string;
  quantity_amount: number;
}

// === Context Shape ===
const SessionContext = createContext<{
  session: Session | null;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  batches: BatchData[];
  setBatches: React.Dispatch<React.SetStateAction<BatchData[]>>;
}>({
  session: null,
  theme: "system",
  setTheme: () => {},
  batches: [],
  setBatches: () => {},
});

// === Hook ===
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

// === Provider ===
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "system"
  );

  const [batches, setBatches] = useState<BatchData[]>(() => {
    const stored = localStorage.getItem("batches");
    return stored ? JSON.parse(stored, (key, value) =>
      key === "startTime" ? new Date(value) : value
    ) : [];
  });

  // Theme toggle logic
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    const isDark =
      newTheme === "dark" ||
      (newTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  };

  useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("batches", JSON.stringify(batches));
  }, [batches]);

  // Auth state handling
  useEffect(() => {
    const authStateListener = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);
        setIsLoading(false);
      }
    );
    return () => {
      authStateListener.data.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider
      value={{
        session,
        theme,
        setTheme,
        batches,
        setBatches,
      }}
    >
      {isLoading ? <LoadingPage /> : children}
    </SessionContext.Provider>
  );
};
