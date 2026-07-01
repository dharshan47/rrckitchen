"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  placeholderColor?: string;
  onLoad?: () => void;
}

export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  fill,
  className = "",
  priority = false,
  placeholderColor = "#f1f5f9",
  onLoad,
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: "200px",
    enabled: !priority,
  });

  const shouldLoad = priority || isIntersecting;

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsError(true);
  }, []);

  if (isError) {
    return (
      <div
        ref={ref}
        className={`flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 ${className}`}
        style={fill ? { position: "relative" } : { width, height }}
      >
        <span className="text-2xl font-bold text-muted-foreground/30">{alt.charAt(0)}</span>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${className}`}
      style={{
        backgroundColor: placeholderColor,
        position: fill ? "relative" : undefined,
        width: fill ? undefined : width,
        height: fill ? undefined : height,
      }}
    >
      {shouldLoad && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          className={`object-cover transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          sizes={fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
          loading={priority ? "eager" : "lazy"}
        />
      )}
      {!isLoaded && !isError && shouldLoad && (
        <div className="absolute inset-0 animate-pulse bg-slate-200" />
      )}
    </div>
  );
}
