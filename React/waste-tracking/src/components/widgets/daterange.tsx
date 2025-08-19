import { useState, useEffect } from "react";
import { subDays } from "date-fns";

interface DateRangeProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

const DateRange = ({ onDateRangeChange }: DateRangeProps) => {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());

  useEffect(() => {
    onDateRangeChange(startDate, endDate);
  }, [startDate, endDate, onDateRangeChange]);

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <label>Start Date:</label>
      <input
        type="date"
        value={startDate.toISOString().split("T")[0]}
        onChange={(e) => setStartDate(new Date(e.target.value))}
      />
      <label>End Date:</label>
      <input
        type="date"
        value={endDate.toISOString().split("T")[0]}
        onChange={(e) => setEndDate(new Date(e.target.value))}
      />
    </div>
  );
};

export default DateRange;
