"use client";

import { useEffect, useState } from "react";

function getBatchTime() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date());
}

export function BatchClock() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const update = () => setTime(getBatchTime());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return <span className="text-sm font-semibold tabular-nums text-[#F4F4F5]">{time} UTC</span>;
}

export const KathmanduClock = BatchClock;
