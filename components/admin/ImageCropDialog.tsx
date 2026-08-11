"use client";

import { Crop, LoaderCircle, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AppImage } from "@/components/shared/AppImage";

const DEFAULT_CROP_ASPECT = 4 / 5;
const DEFAULT_OUTPUT_WIDTH = 1440;
const DEFAULT_OUTPUT_HEIGHT = 1800;

type Size = { width: number; height: number };
type Position = { x: number; y: number };

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function getCropSize(image: Size, zoom: number, cropAspect: number) {
  const imageAspect = image.width / image.height;
  const base = imageAspect > cropAspect
    ? { width: image.height * cropAspect, height: image.height }
    : { width: image.width, height: image.width / cropAspect };
  return { width: base.width / zoom, height: base.height / zoom };
}

function clampPosition(position: Position, image: Size, zoom: number, cropAspect: number) {
  if (!image.width || !image.height) return position;
  const crop = getCropSize(image, zoom, cropAspect);
  const halfX = crop.width / image.width / 2;
  const halfY = crop.height / image.height / 2;
  return {
    x: clamp(position.x, halfX, 1 - halfX),
    y: clamp(position.y, halfY, 1 - halfY),
  };
}

async function createCroppedFile(
  image: HTMLImageElement,
  originalName: string,
  position: Position,
  zoom: number,
  cropAspect: number,
  outputWidth: number,
  outputHeight: number,
) {
  const imageSize = { width: image.naturalWidth, height: image.naturalHeight };
  const crop = getCropSize(imageSize, zoom, cropAspect);
  const sourceX = clamp(position.x * imageSize.width - crop.width / 2, 0, imageSize.width - crop.width);
  const sourceY = clamp(position.y * imageSize.height - crop.height / 2, 0, imageSize.height - crop.height);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The photo editor is not available in this browser.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    sourceX,
    sourceY,
    crop.width,
    crop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error("The cropped photo could not be created.")), "image/webp", 0.84);
  });
  const stem = originalName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-") || "photo";
  return new File([blob], `${stem}-cropped.webp`, { type: "image/webp", lastModified: Date.now() });
}

export function ImageCropDialog({
  source,
  fileName,
  title,
  aspectRatio = DEFAULT_CROP_ASPECT,
  outputWidth = DEFAULT_OUTPUT_WIDTH,
  outputHeight = DEFAULT_OUTPUT_HEIGHT,
  onCancel,
  onComplete,
}: {
  source: string;
  fileName: string;
  title: string;
  aspectRatio?: number;
  outputWidth?: number;
  outputHeight?: number;
  onCancel: () => void;
  onComplete: (file: File) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const dragPointRef = useRef<{ x: number; y: number } | null>(null);
  const [imageSize, setImageSize] = useState<Size>({ width: 0, height: 0 });
  const [frameSize, setFrameSize] = useState<Size>({ width: 0, height: 0 });
  const [position, setPosition] = useState<Position>({ x: 0.5, y: 0.5 });
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      sourceImageRef.current = image;
      setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
      setPosition({ x: 0.5, y: 0.5 });
    };
    image.onerror = () => setError("This photo could not be opened. Try another image.");
    image.src = source;
    return () => {
      sourceImageRef.current = null;
      image.onload = null;
      image.onerror = null;
      image.src = "";
    };
  }, [source]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateSize = () => setFrameSize({ width: viewport.clientWidth, height: viewport.clientHeight });
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !processing) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, processing]);

  const baseScale = imageSize.width && frameSize.width
    ? Math.max(frameSize.width / imageSize.width, frameSize.height / imageSize.height)
    : 0;
  const renderedWidth = imageSize.width * baseScale * zoom;
  const renderedHeight = imageSize.height * baseScale * zoom;
  const imageLeft = frameSize.width / 2 - position.x * renderedWidth;
  const imageTop = frameSize.height / 2 - position.y * renderedHeight;

  const moveBy = (deltaX: number, deltaY: number) => {
    if (!renderedWidth || !renderedHeight) return;
    setPosition((current) => clampPosition({
      x: current.x - deltaX / renderedWidth,
      y: current.y - deltaY / renderedHeight,
    }, imageSize, zoom, aspectRatio));
  };

  const applyCrop = async () => {
    if (!sourceImageRef.current) return;
    setProcessing(true);
    setError("");
    try {
      const file = await createCroppedFile(
        sourceImageRef.current,
        fileName,
        position,
        zoom,
        aspectRatio,
        outputWidth,
        outputHeight,
      );
      onComplete(file);
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "The cropped photo could not be created.");
      setProcessing(false);
    }
  };

  return (
    <div className="crop-dialog-backdrop" role="presentation">
      <section className="crop-dialog" role="dialog" aria-modal="true" aria-labelledby="crop-dialog-title">
        <button className="crop-dialog-close" type="button" aria-label="Close photo editor" disabled={processing} onClick={onCancel}><X /></button>
        <div className="crop-dialog-heading">
          <p className="eyebrow">Photo editor</p>
          <h2 id="crop-dialog-title">Adjust {title.toLowerCase()}</h2>
          <p>Drag the photo to choose the focus, then use the slider to zoom.</p>
        </div>

        <div
          ref={viewportRef}
          className="crop-viewport"
          style={{
            "--crop-aspect": aspectRatio,
            "--crop-mobile-width": `${58 * aspectRatio}svh`,
          } as CSSProperties}
          tabIndex={0}
          aria-label="Crop area. Drag the photo or use the arrow keys to reposition it."
          onKeyDown={(event) => {
            const step = event.shiftKey ? 24 : 8;
            if (event.key === "ArrowLeft") moveBy(step, 0);
            else if (event.key === "ArrowRight") moveBy(-step, 0);
            else if (event.key === "ArrowUp") moveBy(0, step);
            else if (event.key === "ArrowDown") moveBy(0, -step);
            else return;
            event.preventDefault();
          }}
          onPointerDown={(event) => {
            if (!imageSize.width) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            dragPointRef.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerMove={(event) => {
            const previous = dragPointRef.current;
            if (!previous) return;
            moveBy(event.clientX - previous.x, event.clientY - previous.y);
            dragPointRef.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerUp={(event) => {
            dragPointRef.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => { dragPointRef.current = null; }}
        >
          {imageSize.width ? (
            <AppImage
              className="crop-source-image"
              src={source}
              alt=""
              width={imageSize.width}
              height={imageSize.height}
              unoptimized
              draggable={false}
              style={{ left: imageLeft, top: imageTop, width: renderedWidth, height: renderedHeight }}
            />
          ) : (
            <div className="crop-loading"><LoaderCircle className="spin" /><span>Preparing photo...</span></div>
          )}
          <div className="crop-grid" aria-hidden="true" />
        </div>

        <div className="crop-controls">
          <label htmlFor="crop-zoom"><span><Minus size={15} />Zoom<Plus size={15} /></span></label>
          <input
            id="crop-zoom"
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            disabled={!imageSize.width || processing}
            onChange={(event) => {
              const nextZoom = Number(event.target.value);
              setZoom(nextZoom);
              setPosition((current) => clampPosition(current, imageSize, nextZoom, aspectRatio));
            }}
          />
          <button type="button" disabled={processing} onClick={() => { setZoom(1); setPosition({ x: 0.5, y: 0.5 }); }}><RotateCcw size={14} />Reset</button>
        </div>

        {error && <div className="form-alert crop-error" role="alert">{error}</div>}
        <div className="crop-dialog-actions">
          <button className="button outline" type="button" disabled={processing} onClick={onCancel}>Cancel</button>
          <button className="button primary" type="button" disabled={!imageSize.width || processing} onClick={applyCrop}>
            {processing ? <LoaderCircle className="spin" /> : <Crop size={16} />}
            {processing ? "Creating crop..." : "Use this crop"}
          </button>
        </div>
      </section>
    </div>
  );
}
