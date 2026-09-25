"use client";

import { useEffect, useState } from "react";

function getKathmanduTime() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kathmandu",
  }).format(new Date());
}

export function KathmanduClock() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const update = () => setTime(getKathmanduTime());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return <span className="text-sm font-semibold tabular-nums text-[#F4F4F5]">{time} NPT</span>;
}
