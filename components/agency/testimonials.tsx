"use client";

import React from "react";
import { Star, Quote, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TESTIMONIALS = [
  {
    quote: "Our online cake and pastry orders doubled within 3 weeks of launching. They delivered exactly on time and showed us how to manage everything easily.",
    author: "Aman Shrestha",
    role: "Owner, Himalayan Artisan Bakery",
    location: "Kathmandu, Nepal",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    quote: "Patient appointment inquiries over WhatsApp have gone up significantly. WeFounders understood our clinic needs and delivered a fast site.",
    author: "Dr. Sunita Karki",
    role: "Director, Biratnagar Dental Care",
    location: "Biratnagar, Nepal",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
  {
    quote: "Having eSewa and Khalti integrated directly on our website helped us collect payments smoothly from clients across Nepal. Highly recommended!",
    author: "Pooja Gurung",
    role: "Founder, Poshak Fashion Studio",
    location: "Lalitpur, Nepal",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  },
];

export function AgencyTestimonials() {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="site-container space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="outline" className="font-mono text-tiny">
            Client Success Stories
          </Badge>
          <h2 className="text-display font-bold tracking-tight text-foreground">
            What Our Clients Say
          </h2>
          <p className="text-body text-muted-foreground">
            Real feedback from business owners in Kathmandu, Biratnagar, and Lalitpur.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={idx}
              className="godly-card deck-card p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(item.rating)].map((_, rIdx) => (
                      <Star key={rIdx} className="h-4 w-4 fill-amber-500" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-primary/20" />
                </div>

                <p className="text-caption text-foreground leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.avatar}
                  alt={item.author}
                  className="h-11 w-11 rounded-full object-cover border border-border shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-caption font-bold text-foreground truncate">
                    {item.author}
                  </h4>
                  <p className="text-tiny text-muted-foreground truncate">
                    {item.role}
                  </p>
                  <p className="text-tiny text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {item.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
