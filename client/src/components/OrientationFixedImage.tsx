import { useState, useEffect, forwardRef } from "react";
import exifr from "exifr";

interface OrientationFixedImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  style?: React.CSSProperties;
  loading?: "lazy" | "eager";
  [key: string]: any;
}

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
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Only try to read EXIF data for actual image URLs, not data URLs
    if (src && !src.startsWith("data:") && !src.includes("blob:")) {
      // Read EXIF orientation data
      exifr.orientation(src)
        .then((orientationValue) => {
          if (orientationValue && typeof orientationValue === "number") {
            setOrientation(orientationValue);
          }
        })
        .catch((error) => {
          // Silently fail - EXIF data may have been stripped during server processing
          // The server should handle orientation correction automatically
        });
    }
  }, [src]);

  const transform = getTransformFromOrientation(orientation);
  
  const imageStyle: React.CSSProperties = {
    ...style,
    transform: transform || style.transform,
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoaded(true);
    if (onLoad) {
      onLoad(e);
    }
  };

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