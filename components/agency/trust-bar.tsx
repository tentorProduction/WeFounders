"use client";

import React from "react";
import { Award, Clock, Star, CheckCircle } from "lucide-react";

const STATS = [
  {
    icon: CheckCircle,
    value: "10+",
    label: "Websites Delivered in Nepal",
  },
  {
    icon: Star,
    value: "4.9 ★",
    label: "Average Client Rating",
  },
  {
    icon: Clock,
    value: "2–3 Weeks",
    label: "Average Turnaround Time",
  },
  {
    icon: Award,
    value: "100%",
    label: "Mobile & Speed Optimized",
  },
];

export function AgencyTrustBar() {
  return (
    <div className="border-y border-border bg-card py-6">
      <div className="site-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-primary font-black text-subheading">
                  <Icon className="h-5 w-5 text-accent" />
                  <span className="text-display font-black text-foreground font-mono">{stat.value}</span>
                </div>
                <p className="text-caption text-muted-foreground font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
