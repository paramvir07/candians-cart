"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QrCode,
  X,
  ScanLine,
  Loader2,
  CameraOff,
  ShieldAlert,
  WifiOff,
} from "lucide-react";

type QrScannerButtonProps = {
  onScan: (value: string) => void;
};

type ErrorKind = "https" | "denied" | "notfound" | "inuse" | "generic";

interface ScannerState {
  phase: "loading" | "scanning" | "error";
  errorKind?: ErrorKind;
  errorDetail?: string; // raw error name for debugging
}

export default function QrScannerButton({ onScan }: QrScannerButtonProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detectorRef = useRef<unknown>(null);

  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ScannerState>({ phase: "loading" });

  // ─── teardown ────────────────────────────────────────────────────────────
  function teardown() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    detectorRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  // ─── scan loop (runs after video is playing) ─────────────────────────────
  function startScanLoop() {
    // Build BarcodeDetector once — Chrome 83+, Edge 83+, Chrome Android, Samsung
    if ("BarcodeDetector" in window) {
      try {
        // @ts-expect-error not in TS lib yet
        detectorRef.current = new window.BarcodeDetector({
          formats: ["qr_code"],
        });
      } catch {
        detectorRef.current = null;
      }
    }

    setState({ phase: "scanning" });

    intervalRef.current = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      if (video.readyState < video.HAVE_ENOUGH_DATA) return;
      if (video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (detectorRef.current) {
        (
          detectorRef.current as {
            detect: (c: HTMLCanvasElement) => Promise<{ rawValue: string }[]>;
          }
        )
          .detect(canvas)
          .then((codes) => {
            if (codes.length > 0) {
              teardown();
              setOpen(false);
              setState({ phase: "loading" });
              onScan(codes[0].rawValue);
            }
          })
          .catch(() => {
            /* ignore per-frame errors */
          });
      }
    }, 300);
  }

  // ─── attach stream to video then kick off scan ────────────────────────────
  function attachStream(stream: MediaStream) {
    streamRef.current = stream;
    const video = videoRef.current;

    if (!video) {
      // Video element not in DOM yet — wait one animation frame and retry once
      requestAnimationFrame(() => {
        const v = videoRef.current;
        if (!v) {
          teardown();
          setState({
            phase: "error",
            errorKind: "generic",
            errorDetail: "no-video-ref",
          });
          return;
        }
        v.srcObject = stream;
        v.onloadedmetadata = () => {
          v.play().catch(() => {});
          startScanLoop();
        };
      });
      return;
    }

    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play().catch(() => {});
      startScanLoop();
    };
  }

  // ─── the main camera request — called DIRECTLY from onClick (sync chain) ──
  // IMPORTANT: getUserMedia must be initiated synchronously within a user
  // gesture on iOS Safari and some Android browsers. Any await/async gap
  // before calling it can silently suppress the permission prompt.
  function requestCamera() {
    teardown();
    setState({ phase: "loading" });
    setOpen(true);

    // 1. HTTPS check — mediaDevices is undefined on HTTP (except localhost)
    if (
      typeof window !== "undefined" &&
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      setState({ phase: "error", errorKind: "https" });
      return;
    }

    // 2. API availability check
    if (!navigator?.mediaDevices?.getUserMedia) {
      setState({
        phase: "error",
        errorKind: "generic",
        errorDetail: "mediaDevices-unavailable",
      });
      return;
    }

    // 3. Use .then()/.catch() — NOT async/await — to stay inside the
    //    synchronous user-gesture activation chain on iOS Safari.
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { ideal: "environment" }, // rear cam preferred
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then((stream) => {
        attachStream(stream);
      })
      .catch((err: unknown) => {
        const name = (err as { name?: string })?.name ?? "unknown";

        // OverconstrainedError on some phones when rear cam constraint fails
        // → retry with no constraints (picks any camera, e.g. PC webcam)
        if (
          name === "OverconstrainedError" ||
          name === "ConstraintNotSatisfiedError"
        ) {
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((stream) => attachStream(stream))
            .catch((err2: unknown) => {
              const name2 = (err2 as { name?: string })?.name ?? "unknown";
              setState({
                phase: "error",
                errorKind: mapError(name2),
                errorDetail: name2,
              });
            });
          return;
        }

        setState({
          phase: "error",
          errorKind: mapError(name),
          errorDetail: name,
        });
      });
  }

  function mapError(name: string): ErrorKind {
    if (name === "NotAllowedError" || name === "PermissionDeniedError")
      return "denied";
    if (name === "NotFoundError" || name === "DevicesNotFoundError")
      return "notfound";
    if (name === "NotReadableError" || name === "TrackStartError")
      return "inuse";
    return "generic";
  }

  function handleClose() {
    teardown();
    setOpen(false);
    setState({ phase: "loading" }); // reset for next open
  }

  // ─── error messages ───────────────────────────────────────────────────────
  const ERROR_CONFIG: Record<
    ErrorKind,
    { icon: React.ReactNode; title: string; body: string; hint?: string }
  > = {
    https: {
      icon: <WifiOff className="w-9 h-9 text-amber-400" />,
      title: "HTTPS Required",
      body: "Camera access only works on secure (HTTPS) connections. Please open this page via HTTPS.",
      hint: undefined,
    },
    denied: {
      icon: <ShieldAlert className="w-9 h-9 text-amber-400" />,
      title: "Permission Denied",
      body: "Camera access was blocked. Enable it in your browser settings, then tap Try Again.",
      hint: "iOS Safari: Settings → Safari → Camera → Allow\nAndroid Chrome: tap the lock icon in the address bar",
    },
    notfound: {
      icon: <CameraOff className="w-9 h-9 text-destructive" />,
      title: "No Camera Found",
      body: "No camera was detected on this device.",
      hint: undefined,
    },
    inuse: {
      icon: <CameraOff className="w-9 h-9 text-destructive" />,
      title: "Camera In Use",
      body: "The camera is already being used by another app or tab. Close it and try again.",
      hint: undefined,
    },
    generic: {
      icon: <CameraOff className="w-9 h-9 text-destructive" />,
      title: "Camera Unavailable",
      body: "Could not start the camera. Make sure no other app is using it.",
      hint: undefined,
    },
  };

  const errCfg = state.errorKind ? ERROR_CONFIG[state.errorKind] : null;

  return (
    <>
      {/* ── Trigger ── */}
      <Button
        variant="secondary"
        size="sm"
        className="shadow-sm gap-1.5 shrink-0"
        type="button"
        onClick={requestCamera}
      >
        <QrCode className="w-4 h-4" />
        <span className="hidden sm:inline">Scan QR</span>
      </Button>

      {/* ── Dialog ── */}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) handleClose();
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm p-0 overflow-hidden rounded-2xl">
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-2 space-y-0">
            <DialogTitle className="text-base flex items-center gap-2 font-semibold">
              <ScanLine className="w-4 h-4 text-primary" />
              Scan Customer QR
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              type="button"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          {/* Camera viewport — always square */}
          <div className="relative bg-zinc-950 aspect-square w-full overflow-hidden">
            {/*
              video attrs:
              - playsInline: REQUIRED for iOS Safari (prevents fullscreen takeover)
              - muted: REQUIRED for autoplay policy
              - autoPlay: belt-and-suspenders alongside .play() in code
            */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />

            {/* Loading */}
            {state.phase === "loading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-white/70 text-sm">Starting camera…</p>
              </div>
            )}

            {/* Scanning overlay */}
            {state.phase === "scanning" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* dim corners, clear centre */}
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 w-52 h-52">
                  {/* corner brackets */}
                  <span className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-primary" />
                  <span className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-primary" />
                  <span className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-primary" />
                  <span className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-primary" />
                  {/* animated scan line */}
                  <div
                    className="absolute inset-x-1 h-0.5 bg-primary/90 rounded-full"
                    style={{
                      boxShadow: "0 0 8px 2px hsl(var(--primary) / 0.5)",
                      animation: "qrscanline 2s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Error overlay */}
            {state.phase === "error" && errCfg && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/92 gap-3 px-6 text-center">
                {errCfg.icon}
                <p className="text-white font-medium text-sm">{errCfg.title}</p>
                <p className="text-white/70 text-xs leading-relaxed">
                  {errCfg.body}
                </p>
                {errCfg.hint && (
                  <p className="text-white/40 text-[11px] whitespace-pre-line">
                    {errCfg.hint}
                  </p>
                )}
                {/* Debug badge — remove in production */}
                {state.errorDetail && (
                  <span className="text-white/30 text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded">
                    {state.errorDetail}
                  </span>
                )}
                {state.errorKind !== "https" &&
                  state.errorKind !== "notfound" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      type="button"
                      className="mt-1"
                      onClick={requestCamera}
                    >
                      Try Again
                    </Button>
                  )}
              </div>
            )}
          </div>

          {/* Hint below camera */}
          {state.phase === "scanning" && (
            <p className="text-xs text-muted-foreground text-center py-3 px-4">
              Align the customer's QR code inside the frame — detects
              automatically.
            </p>
          )}

          {/* Hidden canvas for frame processing */}
          <canvas ref={canvasRef} className="hidden" aria-hidden />
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes qrscanline {
          0%   { top: 2px; }
          50%  { top: calc(100% - 2px); }
          100% { top: 2px; }
        }
      `}</style>
    </>
  );
}
