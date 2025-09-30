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
        value={startDate.toLocaleDateString('en-CA')}
        onChange={(e) => {
          const [year, month, day] = e.target.value.split('-').map(Number);
          setStartDate(new Date(year, month - 1, day));
        }}
      />
      <label>End Date:</label>
      <input
        type="date"
        value={endDate.toLocaleDateString('en-CA')}
        onChange={(e) => {
          const [year, month, day] = e.target.value.split('-').map(Number);
          setEndDate(new Date(year, month - 1, day));
        }}
      />
    </div>
  );
};

export default DateRange;
