"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, ImageUp, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import { btn, meta } from "@/lib/ui";

type Phase = "idle" | "starting" | "live" | "captured" | "saving" | "done";

// Live verification selfie: opens the front camera in the page, shows a face guide, captures a frame.
// If the camera can't open (blocked, no camera, in-app browsers), a fallback lets people take or pick a
// selfie with the device's own camera app; it's marked "upload" so the admin can tell the difference.
// `onCapture` receives the JPEG; it uploads it and resolves to an error message, or null when saved.
export function SelfieCamera({
  done,
  onCapture,
  error: outerError,
}: {
  done: boolean;
  onCapture: (jpeg: Blob, source: "live" | "upload") => Promise<string | null>;
  error?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>(done ? "done" : "idle");
  const [shot, setShot] = useState<{ url: string; blob: Blob; source: "live" | "upload" } | null>(null);
  const [error, setError] = useState("");
  // Offer the fallback once the live camera has failed.
  const [cameraFailed, setCameraFailed] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function stop() {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }

  useEffect(() => stop, []);

  // Attach the stream as soon as the <video> is on screen (no animation-frame wait, so it also
  // works when the tab isn't actively painting).
  useEffect(() => {
    if (phase === "live" && video.current && stream.current && video.current.srcObject !== stream.current) {
      video.current.srcObject = stream.current;
      video.current.play().catch(() => {});
    }
  }, [phase]);

  async function open() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraFailed(true);
      return setError("This browser can't open the camera here. Use the button below, or open the site in Chrome or Safari.");
    }
    setPhase("starting");
    try {
      // Some in-app browsers never answer the camera request: give up after 10 seconds.
      const s = await Promise.race([
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false,
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(Object.assign(new Error("timeout"), { name: "TimeoutError" })), 10000)),
      ]);
      stream.current = s;
      setPhase("live");
    } catch (err) {
      setPhase("idle");
      setCameraFailed(true);
      const name = (err as { name?: string }).name;
      setError(
        name === "NotAllowedError"
          ? "Camera access is blocked here. Allow the camera for this site, or use the button below."
          : name === "NotFoundError"
            ? "We couldn't find a camera on this device. Use the button below instead."
            : name === "TimeoutError"
              ? "The camera didn't respond. Use the button below, or open the site in Chrome or Safari."
              : "The camera couldn't start. Close other apps using it, or use the button below.",
      );
    }
  }

  function capture() {
    const v = video.current;
    if (!v || !v.videoWidth) return setError("The camera is still starting. Try again in a second.");
    // Square crop from the centre of the frame, saved un-mirrored.
    const side = Math.min(v.videoWidth, v.videoHeight);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = Math.min(side, 960);
    canvas
      .getContext("2d")!
      .drawImage(v, (v.videoWidth - side) / 2, (v.videoHeight - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return setError("Couldn't capture the photo. Try again.");
        stop();
        setShot({ url: URL.createObjectURL(blob), blob, source: "live" });
        setPhase("captured");
      },
      "image/jpeg",
      0.88,
    );
  }

  async function confirm() {
    if (!shot) return;
    setPhase("saving");
    const err = await onCapture(shot.blob, shot.source);
    if (err) {
      setError(err);
      setPhase("captured");
    } else setPhase("done");
  }

  function retake() {
    if (shot) URL.revokeObjectURL(shot.url);
    setShot(null);
    if (shot?.source === "upload" || cameraFailed) return fileInput.current?.click();
    open();
  }

  // Fallback: the device's camera app (phones) or a photo (computers), re-encoded to a square JPEG.
  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) return setError("Please use a photo.");
    try {
      const bitmap = await createImageBitmap(file);
      const side = Math.min(bitmap.width, bitmap.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = Math.min(side, 960);
      canvas
        .getContext("2d")!
        .drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88));
      if (!blob) throw new Error("encode");
      setShot({ url: URL.createObjectURL(blob), blob, source: "upload" });
      setPhase("captured");
    } catch {
      setError("We couldn't read that photo. Try another one.");
    }
  }

  const shownError = error || outerError;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative mx-auto aspect-square w-full max-w-72 overflow-hidden rounded-card bg-sunk">
        {phase === "live" || phase === "starting" ? (
          <>
            {/* Mirrored like a mirror, which is what people expect from a front camera. */}
            <video ref={video} playsInline muted className="size-full -scale-x-100 object-cover" aria-label="Camera preview" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
              <div className="h-[72%] w-[56%] rounded-[50%] border-2 border-dashed border-bone/90 shadow-[0_0_0_999px_rgba(0,0,0,0.35)]" />
            </div>
            {phase === "starting" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-bone" />
              </div>
            )}
          </>
        ) : shot && phase !== "done" ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an optimisable asset
          <img src={shot.url} alt="Your verification selfie" className={`size-full object-cover ${shot.source === "live" ? "-scale-x-100" : ""}`} />
        ) : phase === "done" ? (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-success">
            <ShieldCheck size={40} />
            <span className="text-label">Selfie saved</span>
          </div>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 p-6 text-center text-ink-2">
            <Camera size={36} />
            <span className="text-label text-ink">Take a live selfie</span>
            <span className={meta}>Face the camera in good light, no sunglasses or filters.</span>
          </div>
        )}
      </div>

      {phase === "idle" && (
        <button type="button" onClick={open} className={btn.secondary}>
          <Camera size={18} /> Open camera
        </button>
      )}
      {phase === "live" && (
        <button type="button" onClick={capture} className={btn.secondary}>
          <span className="size-4 rounded-full bg-coral" aria-hidden /> Take photo
        </button>
      )}
      {(phase === "captured" || phase === "saving") && (
        <div className="flex gap-2">
          <button type="button" onClick={retake} disabled={phase === "saving"} className={btn.secondary}>
            <RotateCcw size={16} /> Retake
          </button>
          <button type="button" onClick={confirm} disabled={phase === "saving"} className={btn.secondary}>
            {phase === "saving" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Use this photo
          </button>
        </div>
      )}
      {phase === "done" && (
        <button type="button" onClick={retake} className={`${btn.ghost} self-center`}>
          <RotateCcw size={14} /> Retake selfie
        </button>
      )}
      {shownError && <p className="font-mono text-meta text-danger">{shownError}</p>}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {cameraFailed && phase === "idle" && (
        <button type="button" onClick={() => fileInput.current?.click()} className={btn.secondary}>
          <ImageUp size={18} /> Take or upload a selfie instead
        </button>
      )}
    </div>
  );
}
