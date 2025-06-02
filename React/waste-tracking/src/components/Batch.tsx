// ./components/Batch.tsx
import { useEffect, useState } from "react";

interface BatchProps {
  itemName: string;
  imageUrl: string;
  startTime: Date;
  holdMinutes: number;
}

const Batch = ({ itemName, imageUrl, startTime, holdMinutes }: BatchProps) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endTime = new Date(startTime.getTime() + holdMinutes * 60000);
      const diffMs = endTime.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft("EXPIRED");
      } else {
        const minutes = Math.floor(diffMs / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [startTime, holdMinutes]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#2a2a2a",
        border: "1px solid #3ecf8e",
        borderRadius: "8px",
        padding: "0.5em 1em",
        marginBottom: "1em",
        gap: "1em",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      <img
        src={imageUrl}
        alt={itemName}
        style={{ width: 48, height: 48, borderRadius: "50%" }}
      />
      <div style={{ flexGrow: 1 }}>{itemName}</div>
      <div style={{ fontWeight: "bold", color: "#3ecf8e" }}>{timeLeft}</div>
    </div>
  );
};

export default Batch;
