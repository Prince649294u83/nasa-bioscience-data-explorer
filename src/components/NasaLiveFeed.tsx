"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface APODData {
  title: string;
  explanation: string;
  url: string;
  date: string;
  media_type: string;
}

export default function NasaLiveFeed() {
  const [apod, setApod] = useState<APODData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAPOD = async () => {
      try {
        const response = await fetch(
          `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch NASA data");
        }
        
        const data = await response.json();
        setApod(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAPOD();
  }, []);

  if (loading) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
        <p className="text-destructive">Error loading NASA data: {error}</p>
      </Card>
    );
  }

  if (!apod) return null;

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all">
      <h3 className="text-xl font-bold mb-2 text-primary" style={{ fontFamily: "var(--font-space)" }}>
        NASA Astronomy Picture of the Day
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{apod.date}</p>
      {apod.media_type === "image" && (
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
          <Image
            src={apod.url}
            alt={apod.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <h4 className="font-semibold text-lg mb-2">{apod.title}</h4>
      <p className="text-sm text-muted-foreground line-clamp-3">
        {apod.explanation}
      </p>
    </Card>
  );
}