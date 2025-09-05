import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  ReactNode,
} from "react";
import supabase from "../supabase";
import LoadingPage from "../pages/LoadingPage";
import { Session, RealtimeChannel } from "@supabase/supabase-js";

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
  tags: string[];
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
  channel: RealtimeChannel | null; // Add channel to context
}>({
  session: null,
  theme: "system",
  setTheme: () => {},
  batches: [],
  setBatches: () => {},
  boxes: [], // Default empty array for boxes
  setBoxes: () => {}, // Default empty function for setBoxes
  channel: null, // Default null for channel
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

  const channel = useMemo(() => {
    if (session?.user?.id) {
      const userId = session.user.id;
      const channelTopic = `user_${userId}`;
      console.log(`Memoizing Supabase channel for ID: ${channelTopic}`);
      return supabase.channel(channelTopic);
    }
    return null;
  }, [session?.user?.id]);

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

  // Refs for batches and boxes to be used in channel listeners
  const batchesRef = useRef(batches);
  const boxesRef = useRef(boxes);

  useEffect(() => {
    batchesRef.current = batches;
  }, [batches]);

  useEffect(() => {
    boxesRef.current = boxes;
  }, [boxes]);

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

  // Effect to subscribe and unsubscribe the channel, and handle initial data requests
  useEffect(() => {
    if (channel) {
      console.log(`Subscribing to Supabase channel: ${channel.topic}`);
      channel.subscribe();

      const handleRequestInitialData = () => {
        console.log("Received request_initial_data. Broadcasting current state.");
        channel.send({
          type: 'broadcast',
          event: 'batches_update',
          payload: { batches: batchesRef.current },
        });
        channel.send({
          type: 'broadcast',
          event: 'boxes_update',
          payload: { boxes: boxesRef.current },
        });
      };

      channel.on('broadcast', { event: 'request_initial_data' }, handleRequestInitialData);

      return () => {
        console.log(`Unsubscribing from Supabase channel: ${channel.topic}`);
        channel.unsubscribe();
      };
    }
  }, [channel, batchesRef, boxesRef]);

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
        channel, // Provide channel
      }}
    >
      {isLoading ? <LoadingPage /> : children}
    </SessionContext.Provider>
  );
};