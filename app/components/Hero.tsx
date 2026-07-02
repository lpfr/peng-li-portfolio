"use client";

import {
  FilesetResolver,
  HandLandmarker,
  type NormalizedLandmark
} from "@mediapipe/tasks-vision";
import { ChangeEvent, useEffect, useRef, useState } from "react";

const HERO_VIDEO_SRC = "/assets/hero/paper-unfold.mp4";
const HAND_MODEL_SRC = "/assets/models/hand_landmarker.task";
const VISION_WASM_PATH = "/mediapipe/wasm";
const DEFAULT_SMOOTHING_STRENGTH = 0.18;
const DEFAULT_FIST_RAW = 0.2;
const DEFAULT_OPEN_RAW = 0.82;
const MIN_CALIBRATION_DISTANCE = 0.04;
const VIDEO_SEEK_EPSILON = 0.006;
const FIRST_DECODED_FRAME_TIME = 0.04;
const MOBILE_FRAME_COUNT = 76;
const VIDEO_DURATION_FALLBACK = 5.07;
const MIN_AUTO_CALIBRATION_RANGE = 0.22;

type CameraStatus = "Caméra éteinte" | "Recherche de la main" | "Main détectée";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mobileFrameRef = useRef<HTMLImageElement>(null);
  const mobileFrameCacheRef = useRef<HTMLImageElement[]>([]);
  const lastMobileFrameRef = useRef(1);
  const mobileFrameModeRef = useRef(false);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoAnimationFrameRef = useRef<number | null>(null);
  const durationRef = useRef(0);
  const smoothingStrengthRef = useRef(DEFAULT_SMOOTHING_STRENGTH);
  const lastWrittenProgressRef = useRef(-1);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const smoothedOpennessRef = useRef(0);
  const fistRawRef = useRef(DEFAULT_FIST_RAW);
  const openRawRef = useRef(DEFAULT_OPEN_RAW);
  const observedMinRawRef = useRef(Number.POSITIVE_INFINITY);
  const observedMaxRawRef = useRef(Number.NEGATIVE_INFINITY);

  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("Caméra éteinte");
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasEnteredExperience, setHasEnteredExperience] = useState(false);
  const [isScrollCueVisible, setIsScrollCueVisible] = useState(true);

  useEffect(() => {
    const video = videoRef.current;

    syncVideoMetadata();
    video?.addEventListener("loadedmetadata", syncVideoMetadata);
    video?.addEventListener("durationchange", syncVideoMetadata);
    video?.addEventListener("canplay", syncVideoMetadata);

    if (window.matchMedia("(max-width: 980px)").matches) {
      mobileFrameModeRef.current = true;
      durationRef.current = VIDEO_DURATION_FALLBACK;
      setIsMetadataLoaded(true);
      startVideoProgressLoop();
      mobileFrameCacheRef.current = Array.from({ length: MOBILE_FRAME_COUNT }, (_, index) => {
        const image = new Image();
        image.src = mobileFramePath(index + 1);
        return image;
      });
    }

    return () => {
      video?.removeEventListener("loadedmetadata", syncVideoMetadata);
      video?.removeEventListener("durationchange", syncVideoMetadata);
      video?.removeEventListener("canplay", syncVideoMetadata);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoAnimationFrameRef.current !== null) {
        cancelAnimationFrame(videoAnimationFrameRef.current);
      }
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      mobileFrameCacheRef.current = [];
    };
  }, []);

  useEffect(() => {
    const updateScrollCue = () => setIsScrollCueVisible(window.scrollY < 80);

    updateScrollCue();
    window.addEventListener("scroll", updateScrollCue, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollCue);
  }, []);

  function syncVideoMetadata() {
    const video = videoRef.current;

    if (!video || !Number.isFinite(video.duration) || durationRef.current) {
      return;
    }

    video.pause();
    video.currentTime = 0;
    durationRef.current = video.duration;
    setIsMetadataLoaded(true);
    drawVideoFrame();
    startVideoProgressLoop();
  }

  function handleSliderChange(event: ChangeEvent<HTMLInputElement>) {
    seekVideoToProgress(Number(event.target.value) / 100);
  }

  function seekVideoToProgress(nextProgress: number) {
    const clampedProgress = clamp(nextProgress);
    targetProgressRef.current = clampedProgress;
    currentProgressRef.current = clampedProgress;
    writeVideoProgress(clampedProgress);
  }

  function setTargetVideoProgress(nextProgress: number) {
    const clampedProgress = clamp(nextProgress);
    targetProgressRef.current = clampedProgress;
  }

  function startVideoProgressLoop() {
    if (videoAnimationFrameRef.current !== null) return;

    const tick = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const progressEase = mobileFrameModeRef.current ? 0.24 : 0.16;
      const next = current + (target - current) * progressEase;
      const snapped = Math.abs(target - next) < 0.004 ? target : next;

      currentProgressRef.current = snapped;
      writeVideoProgress(snapped);

      videoAnimationFrameRef.current = requestAnimationFrame(tick);
    };

    videoAnimationFrameRef.current = requestAnimationFrame(tick);
  }

  function writeVideoProgress(clampedProgress: number) {
    const video = videoRef.current;
    const videoDuration = durationRef.current;

    if (video && videoDuration && !mobileFrameModeRef.current) {
      if (
        Math.abs(clampedProgress - lastWrittenProgressRef.current) > VIDEO_SEEK_EPSILON ||
        clampedProgress < 0.01 ||
        clampedProgress > 0.99
      ) {
        seekAndDrawProgress(clampedProgress, videoDuration);
        lastWrittenProgressRef.current = clampedProgress;
      }
      if (!video.paused) video.pause();
    }

    updateMobileFrame(clampedProgress);

    setProgress(Math.round(clampedProgress * 100));
  }

  function updateMobileFrame(clampedProgress: number) {
    const image = mobileFrameRef.current;
    if (!image) return;

    const frame = Math.round(clamp(clampedProgress) * (MOBILE_FRAME_COUNT - 1)) + 1;
    if (frame === lastMobileFrameRef.current) return;

    lastMobileFrameRef.current = frame;
    image.src = mobileFramePath(frame);
  }

  function seekAndDrawProgress(clampedProgress: number, videoDuration: number) {
    const video = videoRef.current;

    if (!video) return;

    const targetTime = progressToTime(clampedProgress, videoDuration);

    const handleSeeked = () => {
      drawVideoFrame();
    };

    video.addEventListener("seeked", handleSeeked, { once: true });
    video.currentTime = targetTime;
  }

  function drawVideoFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  async function createHandLandmarker() {
    if (handLandmarkerRef.current) {
      return handLandmarkerRef.current;
    }

    const vision = await FilesetResolver.forVisionTasks(VISION_WASM_PATH);
    let handLandmarker: HandLandmarker;
    try {
      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: HAND_MODEL_SRC, delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.35,
        minHandPresenceConfidence: 0.35,
        minTrackingConfidence: 0.35
      });
    } catch {
      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: HAND_MODEL_SRC, delegate: "CPU" },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.35,
        minHandPresenceConfidence: 0.35,
        minTrackingConfidence: 0.35
      });
    }

    handLandmarkerRef.current = handLandmarker;
    return handLandmarker;
  }

  function detectHands() {
    const cameraVideo = cameraVideoRef.current;
    const handLandmarker = handLandmarkerRef.current;

    if (
      !cameraVideo ||
      !handLandmarker ||
      cameraVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      animationFrameRef.current = requestAnimationFrame(detectHands);
      return;
    }

    const result = handLandmarker.detectForVideo(cameraVideo, performance.now());
    const landmarks = result.landmarks[0];

    if (!landmarks) {
      setCameraStatus("Recherche de la main");
      animationFrameRef.current = requestAnimationFrame(detectHands);
      return;
    }

    const raw = calculatePalmOpenness(landmarks);

    if (mobileFrameModeRef.current) {
      observedMinRawRef.current = Math.min(observedMinRawRef.current, raw);
      observedMaxRawRef.current = Math.max(observedMaxRawRef.current, raw);
    }

    const prev = smoothedOpennessRef.current;
    const closingStrength = mobileFrameModeRef.current ? 0.38 : smoothingStrengthRef.current;
    const openingStrength = mobileFrameModeRef.current ? 0.28 : smoothingStrengthRef.current;
    const smoothed = prev + (raw - prev) * (raw < prev ? closingStrength : openingStrength);
    smoothedOpennessRef.current = smoothed;

    const observedRange = observedMaxRawRef.current - observedMinRawRef.current;
    const fistRaw =
      mobileFrameModeRef.current && observedRange >= MIN_AUTO_CALIBRATION_RANGE
        ? observedMinRawRef.current
        : fistRawRef.current;
    const openRaw =
      mobileFrameModeRef.current && observedRange >= MIN_AUTO_CALIBRATION_RANGE
        ? observedMaxRawRef.current
        : openRawRef.current;

    const mappedProgress = mapPalmOpennessToProgress(smoothed, fistRaw, openRaw);

    setCameraStatus("Main détectée");
    setTargetVideoProgress(mappedProgress);

    animationFrameRef.current = requestAnimationFrame(detectHands);
  }

  async function handleEnableHandInteraction() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("Caméra éteinte");
      console.error("Camera is not available in this browser.");
      return;
    }

    try {
      setIsCameraStarting(true);
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false
      });
      const cameraVideo = cameraVideoRef.current;

      cameraStreamRef.current = stream;

      if (!cameraVideo) return;

      cameraVideo.srcObject = stream;
      await cameraVideo.play();
      await createHandLandmarker();

      smoothedOpennessRef.current = 0;
      observedMinRawRef.current = Number.POSITIVE_INFINITY;
      observedMaxRawRef.current = Number.NEGATIVE_INFINITY;
      targetProgressRef.current = 0;
      currentProgressRef.current = 0;
      lastWrittenProgressRef.current = -1;
      seekVideoToProgress(0);
      setCameraStatus("Recherche de la main");

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(detectHands);
      setIsCameraActive(true);
      setHasEnteredExperience(true);
    } catch (error) {
      console.error("Camera permission failed.", error);
      setCameraStatus("Caméra éteinte");
    } finally {
      setIsCameraStarting(false);
    }
  }

  function handleDisableCamera() {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    const cameraVideo = cameraVideoRef.current;
    if (cameraVideo) cameraVideo.srcObject = null;
    setIsCameraActive(false);
    setCameraStatus("Caméra éteinte");
    targetProgressRef.current = 0;
    currentProgressRef.current = 0;
  }

  function handleViewWithoutCamera() {
    handleDisableCamera();
    seekVideoToProgress(0);
    setHasEnteredExperience(true);
    requestAnimationFrame(() => {
      targetProgressRef.current = 1;
    });
  }

  const revealComplete = progress >= 96;

  return (
    <section className="hero" id="top" aria-label="Identité vidéo interactive">
      <nav className="siteNav" aria-label="Navigation principale">
        <a href="#top">Peng Li</a>
        <div>
          <span className="mobileMenuLabel">Menu</span>
          <a href="#work">Projets</a>
          <a href="#process">Processus</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <div
        className={`heroVideoStage${revealComplete ? " isRevealed" : ""}`}
        aria-hidden="true"
      >
        <img
          ref={mobileFrameRef}
          className="heroMobileFrame"
          src={mobileFramePath(1)}
          alt=""
          draggable={false}
        />
        <canvas ref={canvasRef} className="heroCanvas" aria-hidden="true" />
        <video
          ref={videoRef}
          className="heroVideo"
          src={HERO_VIDEO_SRC}
          poster="/assets/hero/paper-unfold-poster.jpg"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={syncVideoMetadata}
          onDurationChange={syncVideoMetadata}
          onCanPlay={() => {
            syncVideoMetadata();
            drawVideoFrame();
          }}
          onLoadedData={drawVideoFrame}
          onError={(event) => {
            console.error("Hero video failed to load.", event);
          }}
        />
      </div>

      <video ref={cameraVideoRef} className="cameraFeed" muted playsInline aria-hidden="true" />

      <div className={`heroIntroOverlay${hasEnteredExperience ? " isHidden" : ""}`}>
        <h1>Portfolio personnel</h1>
        <p className="heroOwner">Peng Li</p>
        <p className="heroDisciplines">IA · Image · Interaction · Web</p>
        <p className="heroMetaphor">
          Un papier froissé,
          <br />
          comme abandonné.
        </p>
        <p className="heroIntroInstruction">
          Ouvre ta main.
          <br />
          Déplie-le.
        </p>
        <div className="heroIntroActions">
          <button
            className="heroIntroPrimary"
            type="button"
            disabled={isCameraStarting}
            onClick={handleEnableHandInteraction}
          >
            {isCameraStarting ? "Démarrage..." : "Activer la caméra"}
          </button>
          <button
            className="heroIntroSecondary"
            type="button"
            disabled={isCameraStarting}
            onClick={handleViewWithoutCamera}
          >
            Voir sans caméra
          </button>
        </div>
        <p className="heroPrivacy">Caméra utilisée uniquement pour détecter la main.</p>
      </div>

      {hasEnteredExperience && isCameraActive && !revealComplete && (
        <p className="heroGesturePrompt">Ouvre ta main pour déplier le papier.</p>
      )}

      {hasEnteredExperience && revealComplete && (
        <p className="heroRevealMessage">
          Pas un déchet.
          <br />
          Encore quelqu’un.
        </p>
      )}

      {hasEnteredExperience && (
        <div
          className={`heroControls${isCameraActive ? " isCameraActive" : ""}`}
          aria-label="Contrôles d’interaction vidéo"
        >
          {isCameraActive && (
            <button className="stopCameraButton" type="button" onClick={handleDisableCamera}>
              Arrêter la caméra
            </button>
          )}

          <div className="subtleSlider">
            <input
              className="scrubber"
              type="range"
              min="0"
              max="100"
              step="1"
              value={progress}
              disabled={!isMetadataLoaded && !durationRef.current}
              onChange={handleSliderChange}
              aria-label="Faire défiler la vidéo du papier"
            />
          </div>

          {isCameraActive && <p className="cameraStatus">{cameraStatus}</p>}
          {!isMetadataLoaded && <p className="cameraStatus">Chargement de la vidéo...</p>}
        </div>
      )}

      <a
        className={`heroScrollCue${isScrollCueVisible ? "" : " isHidden"}${hasEnteredExperience ? " withControls" : ""}`}
        href="#work"
        aria-label="Voir les projets"
      >
        <span className="heroScrollLabel">Voir les projets</span>
        <span className="heroScrollArrow" aria-hidden="true" />
      </a>
    </section>
  );
}

function progressToTime(progress: number, duration: number) {
  const clamped = clamp(progress);
  if (clamped >= 0.995) return Math.max(duration - 0.03, 0);
  if (clamped <= 0.005) return Math.min(FIRST_DECODED_FRAME_TIME, duration);
  return clamped * duration;
}

function mobileFramePath(frame: number) {
  return `/assets/hero/frames/frame-${String(frame).padStart(3, "0")}.webp`;
}

function calculatePalmOpenness(landmarks: NormalizedLandmark[]) {
  const fingerOpenValues = [
    fingerOpenness(landmarks[5], landmarks[6], landmarks[7], landmarks[8]),
    fingerOpenness(landmarks[9], landmarks[10], landmarks[11], landmarks[12]),
    fingerOpenness(landmarks[13], landmarks[14], landmarks[15], landmarks[16]),
    fingerOpenness(landmarks[17], landmarks[18], landmarks[19], landmarks[20])
  ];
  return fingerOpenValues.reduce((total, value) => total + value, 0) / fingerOpenValues.length;
}

function fingerOpenness(
  mcp: NormalizedLandmark,
  pip: NormalizedLandmark,
  dip: NormalizedLandmark,
  tip: NormalizedLandmark
) {
  const curl = fingerCurlOpenness(mcp, pip, dip, tip);
  const extension = fingerExtensionOpenness(mcp, pip, dip, tip);
  return clamp(curl * 0.58 + extension * 0.42);
}

function fingerCurlOpenness(
  mcp: NormalizedLandmark,
  pip: NormalizedLandmark,
  dip: NormalizedLandmark,
  tip: NormalizedLandmark
) {
  const pipAngle = jointAngle(mcp, pip, dip);
  const dipAngle = jointAngle(pip, dip, tip);
  const averageAngle = (pipAngle + dipAngle) / 2;
  return smoothStep(clamp((averageAngle - 72) / (164 - 72)));
}

function fingerExtensionOpenness(
  mcp: NormalizedLandmark,
  pip: NormalizedLandmark,
  dip: NormalizedLandmark,
  tip: NormalizedLandmark
) {
  const directDistance = landmarkDistance(mcp, tip);
  const chainLength =
    landmarkDistance(mcp, pip) + landmarkDistance(pip, dip) + landmarkDistance(dip, tip);
  const extensionRatio = directDistance / Math.max(chainLength, 0.001);
  return smoothStep(clamp((extensionRatio - 0.48) / (0.92 - 0.48)));
}

function mapPalmOpennessToProgress(rawOpenness: number, fistRaw: number, openRaw: number) {
  const range = openRaw - fistRaw;
  if (Math.abs(range) < MIN_CALIBRATION_DISTANCE) {
    return clamp(rawOpenness);
  }
  return clamp((rawOpenness - fistRaw) / range);
}

function jointAngle(a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark) {
  const abx = a.x - b.x,
    aby = a.y - b.y,
    abz = (a.z ?? 0) - (b.z ?? 0);
  const cbx = c.x - b.x,
    cby = c.y - b.y,
    cbz = (c.z ?? 0) - (b.z ?? 0);
  const dot = abx * cbx + aby * cby + abz * cbz;
  const abLength = Math.hypot(abx, aby, abz) || 0.001;
  const cbLength = Math.hypot(cbx, cby, cbz) || 0.001;
  const cosine = clampSigned(dot / (abLength * cbLength));
  return (Math.acos(cosine) * 180) / Math.PI;
}

function landmarkDistance(a: NormalizedLandmark, b: NormalizedLandmark) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
}

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function smoothStep(value: number) {
  return value * value * (3 - 2 * value);
}

function clampSigned(value: number) {
  return Math.min(Math.max(value, -1), 1);
}
