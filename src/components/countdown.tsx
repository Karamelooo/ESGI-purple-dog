"use client";

import { useEffect, useState, useCallback } from "react";

export function Countdown({ targetDate }: { targetDate: Date }) {
  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const difference = target - now;

    if (difference > 0) {
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
    } else {
      return null;
    }
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<string | null>(() =>
    calculateTimeLeft()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const left = calculateTimeLeft();
      if (left) {
        setTimeLeft(left);
      } else {
        setTimeLeft("Expiré");
        clearInterval(timer);
        // Optional: Trigger a page reload or callback when expired
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (!timeLeft) return null;

  return <span className="font-mono font-bold text-red-600">{timeLeft}</span>;
}
