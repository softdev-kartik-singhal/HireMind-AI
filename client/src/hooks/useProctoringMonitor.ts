'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ProctoringEventType, ProctoringStatus } from '@/types/proctoring';
import { ProctoringApi } from '@/lib/api-proctoring';

interface UseProctoringOptions {
  interviewId: string;
  enabled?: boolean;
  onSignalDetected?: (type: ProctoringEventType, durationMs?: number) => void;
}

export function useProctoringMonitor({
  interviewId,
  enabled = true,
  onSignalDetected,
}: UseProctoringOptions) {
  const [status, setStatus] = useState<ProctoringStatus>({
    cameraActive: false,
    faceDetected: true,
    multipleFaces: false,
    lookingAway: false,
    tabVisible: true,
    isFullscreen: false,
  });

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Absence & Tab tracking timestamps
  const tabHiddenTimeRef = useRef<number | null>(null);
  const noFaceStartTimeRef = useRef<number | null>(null);
  const lookingAwayStartTimeRef = useRef<number | null>(null);

  // Native FaceDetector instance if supported
  const faceDetectorRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Log integrity signal helper
  const logEvent = useCallback(
    async (eventType: ProctoringEventType, durationMs?: number, metadata?: any) => {
      try {
        await ProctoringApi.recordEvent(interviewId, eventType, durationMs, metadata);
        if (onSignalDetected) {
          onSignalDetected(eventType, durationMs);
        }
      } catch (err) {
        console.warn(`[Proctoring] Failed to log signal ${eventType}:`, err);
      }
    },
    [interviewId, onSignalDetected]
  );

  // 1. Initialize Camera (only requested when enabled is true)
  const initializeCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('[Proctoring] Camera not supported in this browser.');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setHasPermission(true);
      setStatus((prev) => ({ ...prev, cameraActive: true }));

      // Monitor camera track disconnection
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setStatus((prev) => ({ ...prev, cameraActive: false }));
          logEvent('CAMERA_DISCONNECTED', undefined, { reason: 'track_ended' });
        };
      }

      // Check for native Shape Detection API (Chrome / Edge)
      if ('FaceDetector' in window) {
        try {
          faceDetectorRef.current = new (window as any).FaceDetector({
            maxDetectedFaces: 5,
            fastMode: true,
          });
        } catch (_) {
          faceDetectorRef.current = null;
        }
      }
    } catch (err: any) {
      console.warn('[Proctoring] Camera permission denied or device error:', err);
      setHasPermission(false);
      setStatus((prev) => ({ ...prev, cameraActive: false }));
      logEvent('CAMERA_DISCONNECTED', undefined, { error: err.name });
    }
  }, [logEvent]);

  // 2. Computer Vision Frame Analyzer (Samples video every 1.5 seconds)
  const analyzeFrame = useCallback(async () => {
    if (!videoRef.current || !status.cameraActive || videoRef.current.readyState < 2) {
      return;
    }

    const video = videoRef.current;
    let facesCount = 1;
    let lookingAwayDetected = false;

    // Use native FaceDetector if available
    if (faceDetectorRef.current) {
      try {
        const detected = await faceDetectorRef.current.detect(video);
        facesCount = detected.length;

        if (detected.length === 1) {
          const face = detected[0];
          // Gaze / centroid offset: check if face center is significantly away from video center
          const videoCenterX = video.videoWidth / 2;
          const faceCenterX = face.boundingBox.x + face.boundingBox.width / 2;
          const offsetPercent = Math.abs(faceCenterX - videoCenterX) / video.videoWidth;

          if (offsetPercent > 0.38) {
            lookingAwayDetected = true;
          }
        }
      } catch (_) {
        // Fallback to canvas pixel analysis
      }
    } else {
      // Fallback client-side canvas vision analyzer
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = 160;
        canvas.height = 120;
        ctx.drawImage(video, 0, 0, 160, 120);

        const imgData = ctx.getImageData(0, 0, 160, 120);
        const data = imgData.data;

        // Sample skin-luminance and contrast pixels to detect presence & center of mass
        let totalBrightness = 0;
        let weightedX = 0;
        let activePixels = 0;

        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          totalBrightness += luminance;

          // Simple skin/face chromaticity heuristic in normalized space
          if (r > 60 && g > 40 && b > 20 && r > g && r > b) {
            const pixelIndex = i / 4;
            const x = pixelIndex % 160;
            weightedX += x;
            activePixels++;
          }
        }

        const avgBrightness = totalBrightness / (data.length / 16);

        // Blank/black feed check (camera blocked/disconnected)
        if (avgBrightness < 12) {
          facesCount = 0;
        } else if (activePixels < 40) {
          facesCount = 0;
        } else {
          facesCount = 1;
          const centroidX = weightedX / activePixels;
          const offset = Math.abs(centroidX - 80) / 80;
          if (offset > 0.45) {
            lookingAwayDetected = true;
          }
        }
      }
    }

    const now = Date.now();

    // 1. Face Presence / Absence
    if (facesCount === 0) {
      if (!noFaceStartTimeRef.current) {
        noFaceStartTimeRef.current = now;
      }
      // If absent for > 3.5 seconds, record signal
      if (now - noFaceStartTimeRef.current > 3500 && status.faceDetected) {
        setStatus((prev) => ({ ...prev, faceDetected: false, lastEvent: 'NO_FACE_DETECTED' }));
        logEvent('NO_FACE_DETECTED', now - noFaceStartTimeRef.current);
      }
    } else {
      if (noFaceStartTimeRef.current) {
        const duration = now - noFaceStartTimeRef.current;
        if (duration > 3500) {
          logEvent('NO_FACE_DETECTED', duration);
        }
        noFaceStartTimeRef.current = null;
      }
      if (!status.faceDetected) {
        setStatus((prev) => ({ ...prev, faceDetected: true }));
      }
    }

    // 2. Multiple Faces
    if (facesCount > 1) {
      if (!status.multipleFaces) {
        setStatus((prev) => ({ ...prev, multipleFaces: true, lastEvent: 'MULTIPLE_FACES' }));
        logEvent('MULTIPLE_FACES', undefined, { faceCount: facesCount });
      }
    } else {
      if (status.multipleFaces) {
        setStatus((prev) => ({ ...prev, multipleFaces: false }));
      }
    }

    // 3. Significant Looking Away
    if (lookingAwayDetected) {
      if (!lookingAwayStartTimeRef.current) {
        lookingAwayStartTimeRef.current = now;
      }
      if (now - lookingAwayStartTimeRef.current > 4000 && !status.lookingAway) {
        setStatus((prev) => ({ ...prev, lookingAway: true, lastEvent: 'LOOKING_AWAY' }));
        logEvent('LOOKING_AWAY', now - lookingAwayStartTimeRef.current);
      }
    } else {
      if (lookingAwayStartTimeRef.current) {
        const duration = now - lookingAwayStartTimeRef.current;
        if (duration > 4000) {
          logEvent('LOOKING_AWAY', duration);
        }
        lookingAwayStartTimeRef.current = null;
      }
      if (status.lookingAway) {
        setStatus((prev) => ({ ...prev, lookingAway: false }));
      }
    }
  }, [status.cameraActive, status.faceDetected, status.multipleFaces, status.lookingAway, logEvent]);

  // 3. Browser-Level Event Listeners (Tab visibility & Fullscreen)
  useEffect(() => {
    if (!enabled) return;

    // A. Tab Visibility Switch Tracker
    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      const now = Date.now();

      if (isHidden) {
        tabHiddenTimeRef.current = now;
        setStatus((prev) => ({ ...prev, tabVisible: false, lastEvent: 'TAB_HIDDEN' }));
      } else {
        if (tabHiddenTimeRef.current) {
          const duration = now - tabHiddenTimeRef.current;
          // Log if hidden for more than 1.5 seconds
          if (duration > 1500) {
            logEvent('TAB_HIDDEN', duration, { hiddenAt: new Date(tabHiddenTimeRef.current) });
          }
          tabHiddenTimeRef.current = null;
        }
        setStatus((prev) => ({ ...prev, tabVisible: true }));
      }
    };

    // B. Fullscreen Exit Tracker
    const handleFullscreenChange = () => {
      const isFullscreen = Boolean(document.fullscreenElement);
      setStatus((prev) => ({ ...prev, isFullscreen }));

      if (!isFullscreen) {
        logEvent('FULLSCREEN_EXIT', undefined, { timestamp: new Date() });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [enabled, logEvent]);

  // 4. Start Vision Loop
  useEffect(() => {
    if (!enabled) return;

    initializeCamera();

    checkIntervalRef.current = setInterval(() => {
      analyzeFrame();
    }, 1500);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [enabled, initializeCamera, analyzeFrame]);

  // Attach stream to videoRef when available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return {
    status,
    hasPermission,
    videoRef,
    stream,
    initializeCamera,
  };
}
