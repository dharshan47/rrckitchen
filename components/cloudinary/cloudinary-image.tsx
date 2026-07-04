"use client"

import { CldImage } from "next-cloudinary"
import type { CldImageProps } from "next-cloudinary"

interface CloudinaryImageProps {
  publicId: string
  alt: string
  width?: number
  height?: number
  crop?: CldImageProps["crop"]
  className?: string
}

export function CloudinaryImage({
  publicId,
  alt,
  width = 300,
  height = 300,
  crop = "fill",
  className,
}: CloudinaryImageProps) {
  return (
    <CldImage
      src={publicId}
      width={width}
      height={height}
      crop={crop}
      alt={alt}
      className={className}
    />
  )
}
