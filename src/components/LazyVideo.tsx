"use client";
import { useState } from "react";
import Image from "next/image";

interface LazyVideoProps {
  videoId: string; // e.g., "dQw4w9WgXcQ"
  title?: string;
  highQuality?: boolean; // optional flag to choose thumbnail quality
}

export default function LazyVideo({ videoId, title = "Video",  highQuality = true, }: LazyVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const thumbnail = highQuality
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  return (
    <div className="info-iframe ratio ratio-16x9 position-relative overflow-hidden rounded-5 shadow-sm">
      {!isPlaying ? (
        <button
          onClick={() => setIsPlaying(true)}
          className="border-0 bg-transparent p-0 w-100 h-100"
          aria-label={`Play ${title}`}
        >
          {/* Thumbnail Image */}
          <Image
            src={thumbnail}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            style={{ objectFit: "cover" }}
             quality={90} // ✅ ensures sharp rendering from Next.js optimization
            priority={false}
          />

          {/* Play Button Overlay */}
          <div className="btn-player position-absolute top-50 start-50 translate-middle bg-white rounded-circle p-4 d-flex align-items-center justify-content-center text-brand-orange fs-1">
            ▶
          </div>
        </button>
      ) : (
        <iframe
          src={videoUrl}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-100 h-100 border-0"
        ></iframe>
      )}
    </div>
  );
}
