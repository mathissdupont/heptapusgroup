"use client";

import { useState, useCallback } from "react";

interface ImgWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

/**
 * Native <img> wrapper — resim yüklenemezse güzel bir placeholder gösterir.
 * Client component'lerde <img> tag'i kullanan yerler için.
 */
export default function ImgWithFallback({
  fallbackText,
  alt,
  className,
  style,
  ...props
}: ImgWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => setHasError(true), []);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-muted ${className ?? ""}`}
        style={style}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
          <svg
            width="36"
            height="36"
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      {...props}
    />
  );
}
