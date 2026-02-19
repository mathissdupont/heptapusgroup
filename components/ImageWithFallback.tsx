"use client";

import Image, { type ImageProps } from "next/image";
import { useState, useCallback } from "react";

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackText?: string;
}

/**
 * Next/Image wrapper — resim yüklenemezse güzel bir placeholder gösterir.
 * Server'da kaybolmuş dosyalar için kırık ikon yerine temiz bir fallback.
 */
export default function ImageWithFallback({
  fallbackText,
  alt,
  className,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => setHasError(true), []);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-muted ${className ?? ""}`}
        style={{ position: "absolute", inset: 0 }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          {fallbackText && (
            <span className="text-xs font-medium text-center px-2 line-clamp-1">
              {fallbackText}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
