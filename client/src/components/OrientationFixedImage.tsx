import { useState, useEffect, forwardRef, useCallback } from "react";

interface OrientationFixedImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  style?: React.CSSProperties;
  loading?: "lazy" | "eager";
  [key: string]: any;
}

// Cache for EXIF orientation results to avoid re-fetching
const orientationCache = new Map<string, number>();

// Check if URL is from Convex storage (already properly oriented)
const isConvexStorageUrl = (url: string): boolean => {
  return url.includes('convex.cloud') ||
         url.includes('convex.site') ||
         url.includes('confident-ocelot');
};

// Map EXIF orientation values to CSS transforms
const getTransformFromOrientation = (orientation: number): string => {
  switch (orientation) {
    case 1:
      return ""; // Normal, no rotation needed
    case 2:
      return "scaleX(-1)"; // Flip horizontal
    case 3:
      return "rotate(180deg)"; // Rotate 180°
    case 4:
      return "scaleY(-1)"; // Flip vertical
    case 5:
      return "scaleX(-1) rotate(90deg)"; // Flip horizontal + rotate 90° CCW
    case 6:
      return "rotate(90deg)"; // Rotate 90° CW
    case 7:
      return "scaleX(-1) rotate(-90deg)"; // Flip horizontal + rotate 90° CW
    case 8:
      return "rotate(-90deg)"; // Rotate 90° CCW
    default:
      return ""; // Unknown orientation, no rotation
  }
};

const OrientationFixedImage = forwardRef<HTMLImageElement, OrientationFixedImageProps>(({
  src,
  alt,
  className = "",
  onLoad,
  style = {},
  ...props
}, ref) => {
  const [orientation, setOrientation] = useState<number>(1);

  useEffect(() => {
    // Skip EXIF reading for:
    // 1. Data URLs and blob URLs
    // 2. Convex storage URLs (already properly oriented by the server)
    // 3. URLs with compression parameters (already processed)
    if (!src ||
        src.startsWith("data:") ||
        src.includes("blob:") ||
        isConvexStorageUrl(src) ||
        src.includes('compress=')) {
      setOrientation(1);
      return;
    }

    // Check cache first
    if (orientationCache.has(src)) {
      setOrientation(orientationCache.get(src)!);
      return;
    }

    // Only read EXIF for local/non-processed images (lazy load the exifr library)
    let cancelled = false;

    import("exifr").then(({ default: exifr }) => {
      if (cancelled) return;

      exifr.orientation(src)
        .then((orientationValue) => {
          if (cancelled) return;
          const value = (orientationValue && typeof orientationValue === "number") ? orientationValue : 1;
          orientationCache.set(src, value);
          setOrientation(value);
        })
        .catch(() => {
          // Silently fail - EXIF data may have been stripped
          if (!cancelled) {
            orientationCache.set(src, 1);
            setOrientation(1);
          }
        });
    }).catch(() => {
      // Library load failed, use default orientation
      if (!cancelled) {
        setOrientation(1);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  const transform = getTransformFromOrientation(orientation);

  const imageStyle: React.CSSProperties = {
    ...style,
    transform: transform || style.transform,
  };

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (onLoad) {
      onLoad(e);
    }
  }, [onLoad]);

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={imageStyle}
      onLoad={handleLoad}
      {...props}
    />
  );
});

OrientationFixedImage.displayName = "OrientationFixedImage";

export default OrientationFixedImage;
