// ./components/Batch.tsx
import { useEffect, useState } from "react";
import { BatchData } from "../context/SessionContext";

const Batch = ({ itemName, imageUrl, startTime, holdMinutes, quantity_type, quantity_amount }: BatchData) => {
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
    <div className="batch-card">
      <div className="batch-left">
        <img src={imageUrl} alt={itemName} className="batch-image" />
        <div className="batch-title">{itemName}</div>
      </div>
      <div className="batch-right">
        <div className="batch-subtext">
          {quantity_amount} {quantity_type}
        </div>
        <div className="batch-timer">{timeLeft}</div>
      </div>
    </div>
  );
};

export default Batch;
