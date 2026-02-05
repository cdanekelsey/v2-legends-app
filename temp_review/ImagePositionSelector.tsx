import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

interface ImagePositionSelectorProps {
  value: string;
  onChange: (position: string) => void;
  imagePreview?: string | null;
}

const ImagePositionSelector = ({ value, onChange, imagePreview }: ImagePositionSelectorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageBounds, setImageBounds] = useState<{
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  } | null>(null);

  // Parse the current position (e.g., "50% 50%" or "center")
  const parsePosition = (pos: string): { x: number; y: number } => {
    if (pos === "center") return { x: 50, y: 50 };
    
    const match = pos.match(/(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
    if (match) {
      return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
    }
    
    // Handle legacy 9-position values
    const positionMap: Record<string, { x: number; y: number }> = {
      "top left": { x: 0, y: 0 },
      "top": { x: 50, y: 0 },
      "top right": { x: 100, y: 0 },
      "left": { x: 0, y: 50 },
      "right": { x: 100, y: 50 },
      "bottom left": { x: 0, y: 100 },
      "bottom": { x: 50, y: 100 },
      "bottom right": { x: 100, y: 100 },
    };
    
    return positionMap[pos] || { x: 50, y: 50 };
  };

  const { x: focalX, y: focalY } = parsePosition(value);

  // Calculate actual rendered image bounds within the container (object-contain)
  const calculateImageBounds = () => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || !img.naturalWidth || !img.naturalHeight) return;

    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    const imgNaturalWidth = img.naturalWidth;
    const imgNaturalHeight = img.naturalHeight;
    
    const containerAspect = containerWidth / containerHeight;
    const imageAspect = imgNaturalWidth / imgNaturalHeight;
    
    let imgRenderWidth: number, imgRenderHeight: number, imgOffsetX: number, imgOffsetY: number;
    
    if (imageAspect > containerAspect) {
      // Image is wider - letterboxed top/bottom
      imgRenderWidth = containerWidth;
      imgRenderHeight = containerWidth / imageAspect;
      imgOffsetX = 0;
      imgOffsetY = (containerHeight - imgRenderHeight) / 2;
    } else {
      // Image is taller - pillarboxed left/right
      imgRenderHeight = containerHeight;
      imgRenderWidth = containerHeight * imageAspect;
      imgOffsetX = (containerWidth - imgRenderWidth) / 2;
      imgOffsetY = 0;
    }
    
    setImageBounds({
      offsetX: imgOffsetX,
      offsetY: imgOffsetY,
      width: imgRenderWidth,
      height: imgRenderHeight,
    });
  };

  // Recalculate bounds when image loads or container resizes
  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      if (img.complete) {
        calculateImageBounds();
      } else {
        img.addEventListener('load', calculateImageBounds);
        return () => img.removeEventListener('load', calculateImageBounds);
      }
    }
  }, [imagePreview]);

  // Handle window resize
  useEffect(() => {
    window.addEventListener('resize', calculateImageBounds);
    return () => window.removeEventListener('resize', calculateImageBounds);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageBounds) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Click position relative to container
    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;
    
    // Translate to image-relative coordinates
    const x = ((clickX - imageBounds.offsetX) / imageBounds.width) * 100;
    const y = ((clickY - imageBounds.offsetY) / imageBounds.height) * 100;
    
    // Clamp to image bounds (0-100)
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    onChange(`${clampedX.toFixed(1)}% ${clampedY.toFixed(1)}%`);
  };

  if (!imagePreview) {
    return (
      <p className="text-sm text-muted-foreground">
        Upload an image to set the focal point
      </p>
    );
  }

  // Calculate marker position relative to the actual image render bounds
  const getMarkerPosition = () => {
    if (!imageBounds) return { left: '50%', top: '50%' };
    
    // focalX/focalY are percentages of the image (0-100)
    // Convert to pixel offset within the container
    const markerLeft = imageBounds.offsetX + (focalX / 100) * imageBounds.width;
    const markerTop = imageBounds.offsetY + (focalY / 100) * imageBounds.height;
    
    return { left: `${markerLeft}px`, top: `${markerTop}px` };
  };

  const markerPosition = getMarkerPosition();

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Focal Point Picker */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">
            Tap/click to set focal point
          </p>
          <div
            ref={containerRef}
            onClick={handleClick}
            className="relative cursor-crosshair overflow-hidden rounded-lg border border-border bg-card"
          >
            <img
              ref={imgRef}
              src={imagePreview}
              alt="Click to set focal point"
              className="w-full h-auto max-h-64 object-contain pointer-events-none"
              draggable={false}
            />
            {/* Focal point marker - positioned relative to actual image bounds */}
            {imageBounds && (
              <div
                className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: markerPosition.left, top: markerPosition.top }}
              >
                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-primary" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-0.5 bg-primary" />
                </div>
                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-primary border-2 border-background" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview (mobile tile simulation) */}
        <div className="w-full lg:w-40">
          <p className="text-sm text-muted-foreground mb-2">Mobile preview</p>
          <div className="relative h-48 w-full lg:w-40 overflow-hidden rounded-lg border border-border bg-card">
            <img
              src={imagePreview}
              alt="Position preview"
              className="h-full w-full object-cover transition-all duration-200"
              style={{ objectPosition: value }}
            />
          </div>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        The focal point stays centered in the card thumbnail on all screen sizes
      </p>
    </div>
  );
};

export default ImagePositionSelector;
