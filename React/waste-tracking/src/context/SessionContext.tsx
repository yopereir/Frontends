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
  metadata: {
    status: string;
    boxId?: string | null;
    itemId: string;
    itemName: string;
    imageUrl: string;
    startTime: string; // Stored as ISO string in DB
    holdMinutes: number;
    unit: string;
    quantity_amount: number;
    tags: string[];
  };
}

// Extend BatchData for Box content if needed, or just use BatchData directly
export interface BoxData {
  id: string;
  name: string;
  batches: BatchData[]; // A box contains a list of batches
}

// === Context Shape ===
const SessionContext = createContext<{
  session: Session | null;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  batches: BatchData[];
  setBatches: React.Dispatch<React.SetStateAction<BatchData[]>>;
  boxes: BoxData[]; // Add boxes to context
  setBoxes: React.Dispatch<React.SetStateAction<BoxData[]>>; // Add setBoxes to context
}>({
  session: null,
  theme: "system",
  setTheme: () => {},
  batches: [],
  setBatches: () => {},
  boxes: [], // Default empty array for boxes
  setBoxes: () => {}, // Default empty function for setBoxes
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

  // State for boxes, initialized from localStorage
  const [boxes, setBoxes] = useState<BoxData[]>(() => {
    const stored = localStorage.getItem("boxes");
    return stored ? JSON.parse(stored, (key, value) => {
        // Parse startTime within batches inside boxes
        if (key === "startTime") {
            return new Date(value);
        }
        return value;
    }) : [];
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

  // Effect to save batches to localStorage
  useEffect(() => {
    localStorage.setItem("batches", JSON.stringify(batches));
  }, [batches]);

  // Effect to save boxes to localStorage
  useEffect(() => {
    localStorage.setItem("boxes", JSON.stringify(boxes));
  }, [boxes]);

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
        boxes, // Provide boxes
        setBoxes, // Provide setBoxes
      }}
    >
      {isLoading ? <LoadingPage /> : children}
    </SessionContext.Provider>
  );
};