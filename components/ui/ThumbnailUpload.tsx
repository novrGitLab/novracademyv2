"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

interface ThumbnailUploadProps {
  name: string;
  initialValue?: string | null;
  onChange?: (dataUrl: string | null) => void;
}

/**
 * File-picker that downscales the chosen image on a canvas and writes the
 * result into a hidden form field as a base64 data URL (max 640px JPEG),
 * so server-action forms can submit the image without external storage.
 */
export function ThumbnailUpload({ name, initialValue, onChange }: ThumbnailUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialValue ?? null);
  const [processing, setProcessing] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    try {
      const img = await loadImage(file);
      const max = 640;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setPreview(dataUrl);
      onChange?.(dataUrl);
    } catch {
      // Keep the previous preview; the form just won't include a thumbnail
    } finally {
      setProcessing(false);
      e.target.value = "";
    }
  }

  function clear() {
    setPreview(null);
    onChange?.(null);
  }

  return (
    <div>
      <input type="hidden" name={name} value={preview ?? ""} />
      {preview ? (
        <div className="relative mt-1 w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Thumbnail preview" className="h-24 w-40 rounded-card border border-border object-cover" />
          <button
            type="button"
            onClick={clear}
            className="absolute -right-2 -top-2 rounded-full border border-border bg-white p-1 text-text-secondary shadow-card transition hover:text-red"
            title="Remove thumbnail"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-1 flex h-24 w-40 flex-col items-center justify-center gap-1 rounded-card border border-dashed border-border bg-surface text-text-secondary transition hover:border-blue hover:text-blue"
        >
          {processing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
          <span className="text-[12px]">{processing ? "Processing…" : "Upload thumbnail"}</span>
        </button>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}
